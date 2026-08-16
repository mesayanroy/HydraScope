import { FullAnalysisResult } from "../analysis";
import { sanitizeUntrustedMetadata } from "./promptDefense";

export type GroundedAiExplanation = {
  summary: string;
  attackPathWalkthrough: string[];
  exposureExplanation: string;
  investigationSteps: string[];
  uncertainties: string[];
  evidenceNodeIds: string[];
};

export function generateGroundedExplanation(analysis: FullAnalysisResult): GroundedAiExplanation {
  const { packageName, version, vulnerabilities, blastRadius, temporalExposure, maintainers, typosquats, evidence } =
    analysis;

  // PRD Rule: If evidence is missing / insufficient
  if (!blastRadius && vulnerabilities.status === "UNKNOWN") {
    return {
      summary: "I don't have enough evidence to determine that.",
      attackPathWalkthrough: [],
      exposureExplanation: "No exposure timeline can be calculated due to missing evidence.",
      investigationSteps: [
        "Verify package existence and version tag.",
        "Check HydraDB connectivity and advisory feeds.",
      ],
      uncertainties: ["Advisory data unavailable or package not found in graph."],
      evidenceNodeIds: [],
    };
  }

  const evidenceNodeIds = evidence.map((e) => e.nodeId);
  const attackPathWalkthrough: string[] = [];
  const investigationSteps: string[] = [];
  const uncertainties: string[] = [];

  // 1. Summary
  let summary = `Analysis of **${packageName}@${version}**: `;
  if (vulnerabilities.status === "VULNERABLE") {
    const mainAdv = vulnerabilities.advisories[0];
    summary += `Package is affected by critical advisory **${mainAdv.advisoryId}** (${mainAdv.severity} severity). `;
  } else if (vulnerabilities.status === "SAFE") {
    summary += `No known active advisories recorded in graph for this version. `;
  } else {
    summary += `Vulnerability status is UNKNOWN (advisory feed unavailable). `;
  }

  if (blastRadius) {
    summary += `Blast radius impacts ${blastRadius.affectedPackages.length} downstream packages, ${blastRadius.affectedRepositories.length} repositories, and ${blastRadius.affectedServices.length} services. `;
    if (blastRadius.isProductionExposed) {
      summary += `🚨 **PRODUCTION IS EXPOSED.**`;
    } else {
      summary += `Production environment is not directly exposed.`;
    }
  }

  // 2. Attack Path Walkthrough
  if (blastRadius && blastRadius.attackPaths.length > 0) {
    for (let i = 0; i < Math.min(3, blastRadius.attackPaths.length); i++) {
      const path = blastRadius.attackPaths[i];
      const sanitizedPathStr = path.map((step) => sanitizeUntrustedMetadata(step.nodeName)).join(" ➔ ");
      attackPathWalkthrough.push(`Path ${i + 1}: ${sanitizedPathStr}`);
    }
  }

  // 3. Exposure Explanation
  let exposureExplanation = "";
  if (temporalExposure.overallStatus === "EXPOSED") {
    const exposedSvc = temporalExposure.serviceExposures.find((s) => s.status === "EXPOSED");
    exposureExplanation = `Service '${exposedSvc?.serviceName || "active service"}' was active during the vulnerability window (${exposedSvc?.durationMinutes || 0} minutes active exposure window).`;
  } else if (temporalExposure.overallStatus === "NOT_EXPOSED") {
    exposureExplanation = "Service resolution windows closed prior to vulnerability publication; active exposure is negated.";
  } else {
    exposureExplanation = "Insufficient timestamp evidence to verify active exposure duration.";
    uncertainties.push("Missing exact deployment or vulnerability publication timestamps.");
  }

  // 4. Actionable Steps
  if (vulnerabilities.status === "VULNERABLE" && vulnerabilities.advisories[0]?.fixedVersion) {
    investigationSteps.push(`Upgrade ${packageName} to fixed version v${vulnerabilities.advisories[0].fixedVersion}.`);
  }
  if (blastRadius?.isProductionExposed) {
    investigationSteps.push("Revoke and rotate environment secrets accessed by affected services (e.g. checkout-api).");
    investigationSteps.push("Audit application logs for unexpected outbound connections during exposure windows.");
  }
  if (maintainers.maintainers.length > 0) {
    investigationSteps.push(
      `Review maintainer '${maintainers.maintainers[0].username}' associated packages: ${maintainers.maintainers[0].associatedPackages.map((p) => p.packageName).join(", ")}.`,
    );
  }
  if (typosquats.candidates.length > 0) {
    investigationSteps.push(
      `Audit lockfiles for potential typosquat candidates: ${typosquats.candidates.map((c) => c.packageName).join(", ")}.`,
    );
  }

  return {
    summary,
    attackPathWalkthrough,
    exposureExplanation,
    investigationSteps,
    uncertainties,
    evidenceNodeIds,
  };
}
