import { HydraDBClient } from "../lib/hydra/client";
import { BlastRadiusResult, calculateBlastRadius } from "./blastRadius";
export type { EvidenceItem };
import { EvidenceItem, assembleEvidence } from "./evidence";
import { MaintainerAnalysisResult, analyzeMaintainers } from "./maintainers";
import { TemporalAnalysisResult, analyzeTemporalExposureForServices } from "./temporal";
import { TyposquatAnalysisResult, detectTyposquats } from "./typosquats";
import { VulnerabilityAnalysisResult, analyzeVulnerabilities } from "./vulnerability";

export type FullAnalysisResult = {
  packageName: string;
  version: string;
  timestamp: string;
  vulnerabilities: VulnerabilityAnalysisResult;
  blastRadius: BlastRadiusResult | null;
  temporalExposure: TemporalAnalysisResult;
  maintainers: MaintainerAnalysisResult;
  typosquats: TyposquatAnalysisResult;
  evidence: EvidenceItem[];
  hydraDbQueryCount: number;
};

export async function runFullAnalysis(
  client: HydraDBClient,
  packageName: string,
  version: string,
): Promise<FullAnalysisResult> {
  client.resetQueryCount();

  const vulnerabilities = await analyzeVulnerabilities(client, packageName, version);
  const blastRadius = await calculateBlastRadius(client, packageName, version);

  const mainVuln = vulnerabilities.advisories[0];
  const temporalExposure = analyzeTemporalExposureForServices(
    mainVuln?.publishedAt,
    blastRadius?.affectedServices || [],
  );

  const maintainers = await analyzeMaintainers(client, packageName, version);
  const typosquats = await detectTyposquats(client, packageName);

  const evidence = assembleEvidence(
    packageName,
    version,
    blastRadius,
    vulnerabilities,
    temporalExposure,
    maintainers,
  );

  return {
    packageName,
    version,
    timestamp: new Date().toISOString(),
    vulnerabilities,
    blastRadius,
    temporalExposure,
    maintainers,
    typosquats,
    evidence,
    hydraDbQueryCount: client.getQueryCount(),
  };
}
