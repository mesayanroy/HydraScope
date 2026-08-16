import { BlastRadiusResult } from "./blastRadius";
import { MaintainerAnalysisResult } from "./maintainers";
import { TemporalAnalysisResult } from "./temporal";
import { VulnerabilityAnalysisResult } from "./vulnerability";

export type EvidenceItem = {
  evidenceId: string;
  source: string;
  claim: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  relationship?: string;
  pathString: string;
  timestamp?: string;
};

export function assembleEvidence(
  packageName: string,
  version: string,
  blastRadius: BlastRadiusResult | null,
  vulnAnalysis: VulnerabilityAnalysisResult,
  temporalAnalysis: TemporalAnalysisResult,
  maintainerAnalysis: MaintainerAnalysisResult,
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  // Vulnerability Evidence
  if (vulnAnalysis.status === "VULNERABLE") {
    for (const advisory of vulnAnalysis.advisories) {
      evidence.push({
        evidenceId: `ev:vuln:${advisory.advisoryId}`,
        source: "HydraDB Vulnerability Graph",
        claim: `Package ${packageName}@${version} is affected by ${advisory.advisoryId} (${advisory.severity})`,
        nodeId: `vuln:${advisory.advisoryId}`,
        nodeName: advisory.advisoryId,
        nodeType: "Vulnerability",
        relationship: "AFFECTED_BY",
        pathString: `${packageName}@${version} -> AFFECTED_BY -> ${advisory.advisoryId}`,
        timestamp: advisory.publishedAt,
      });
    }
  }

  // Blast Radius Attack Path Evidence
  if (blastRadius && blastRadius.attackPaths.length > 0) {
    let pathIdx = 1;
    for (const path of blastRadius.attackPaths) {
      const pathStr = path.map((step) => step.nodeName).join(" -> ");
      const lastStep = path[path.length - 1];

      evidence.push({
        evidenceId: `ev:path:${pathIdx++}`,
        source: "HydraDB Reverse Traversal",
        claim: `Target entity '${lastStep.nodeName}' (${lastStep.nodeType}) is reachable from ${packageName}@${version}`,
        nodeId: lastStep.nodeId,
        nodeName: lastStep.nodeName,
        nodeType: lastStep.nodeType,
        relationship: lastStep.relationship,
        pathString: pathStr,
      });
    }
  }

  // Temporal Exposure Evidence
  for (const svcExposure of temporalAnalysis.serviceExposures) {
    if (svcExposure.status === "EXPOSED") {
      evidence.push({
        evidenceId: `ev:temporal:${svcExposure.serviceId}`,
        source: "HydraDB Temporal Engine",
        claim: `Service '${svcExposure.serviceName}' exposure window (${svcExposure.overlapStart} to ${svcExposure.overlapEnd}) overlaps with vulnerability release`,
        nodeId: svcExposure.serviceId,
        nodeName: svcExposure.serviceName,
        nodeType: "Service",
        relationship: "RUNS_IN",
        pathString: `${packageName}@${version} -> ... -> ${svcExposure.serviceName} (${svcExposure.durationMinutes} min active exposure)`,
        timestamp: svcExposure.overlapStart,
      });
    }
  }

  // Maintainer Evidence
  for (const maint of maintainerAnalysis.maintainers) {
    for (const assocPkg of maint.associatedPackages) {
      evidence.push({
        evidenceId: `ev:maint:${maint.maintainerId}:${assocPkg.packageId}`,
        source: "HydraDB Maintainer Relationship Graph",
        claim: `Maintainer '${maint.username}' is connected to target package and also associated with package '${assocPkg.packageName}'`,
        nodeId: maint.maintainerId,
        nodeName: maint.username,
        nodeType: "Maintainer",
        relationship: assocPkg.relationshipType,
        pathString: `${packageName}@${version} -> ${assocPkg.relationshipType} -> Maintainer(${maint.username}) -> ${assocPkg.packageName}`,
      });
    }
  }

  return evidence;
}
