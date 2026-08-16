import { FullAnalysisResult } from "../analysis";
import { sanitizeUntrustedMetadata } from "./promptDefense";

export type ExplanationSection = {
  title: string;
  content: string;
};

export type ExplanationResult = {
  whatHappened: string;
  whatIsAffected: string;
  whyIsItAffected: string;
  highestRiskPath: string;
  whatToInvestigateFirst: string[];
  footerLabel: string;
  isAiGenerated: boolean;
  modelUsed?: string;
};

export class ExplanationService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor(apiKey?: string, apiEndpoint = "https://api.openai.com/v1/chat/completions") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || "";
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Generates a concise, technical, evidence-grounded explanation.
   * If OPENAI_API_KEY is missing or fails, returns deterministic template explanation.
   */
  public async generateExplanation(analysis: FullAnalysisResult): Promise<ExplanationResult> {
    const sanitizedAnalysis = this.sanitizeAnalysisData(analysis);

    // If OPENAI_API_KEY is present, attempt LLM call
    if (this.apiKey) {
      try {
        const llmResult = await this.callOpenAiLlm(sanitizedAnalysis);
        if (llmResult) {
          return llmResult;
        }
      } catch {
        // Fallback to deterministic template on API failure
      }
    }

    return this.generateDeterministicExplanation(sanitizedAnalysis);
  }

  private sanitizeAnalysisData(analysis: FullAnalysisResult): FullAnalysisResult {
    return {
      ...analysis,
      packageName: sanitizeUntrustedMetadata(analysis.packageName),
      version: sanitizeUntrustedMetadata(analysis.version),
    };
  }

  private async callOpenAiLlm(analysis: FullAnalysisResult): Promise<ExplanationResult | null> {
    const prompt = `You are a principal security engineer analyzing a supply-chain incident for HydraScope.
Analyze the following VERIFIED EVIDENCE JSON from HydraDB.

STRICT GROUNDING RULES:
1. NEVER invent or hallucinate package versions, CVEs, repositories, services, timestamps, or relationships.
2. Rely ONLY on the facts present in the evidence payload below.
3. Keep the response concise, technical, and evidence-driven.

EVIDENCE PAYLOAD:
${JSON.stringify(analysis, null, 2)}

Respond with a JSON object matching this schema exactly:
{
  "whatHappened": "...",
  "whatIsAffected": "...",
  "whyIsItAffected": "...",
  "highestRiskPath": "...",
  "whatToInvestigateFirst": ["...", "..."]
}`;

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a security intelligence assistant. Output valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const contentStr = data.choices?.[0]?.message?.content;
    if (!contentStr) return null;

    const parsed = JSON.parse(contentStr);
    return {
      whatHappened: parsed.whatHappened || "Incident detected in dependency graph.",
      whatIsAffected: parsed.whatIsAffected || "Downstream assets impacted.",
      whyIsItAffected: parsed.whyIsItAffected || "Transitive dependency propagation.",
      highestRiskPath: parsed.highestRiskPath || "Target package -> production service.",
      whatToInvestigateFirst: parsed.whatToInvestigateFirst || ["Upgrade package version."],
      footerLabel: "Generated from HydraDB evidence",
      isAiGenerated: true,
      modelUsed: "gpt-4o-mini",
    };
  }

  public generateDeterministicExplanation(analysis: FullAnalysisResult): ExplanationResult {
    const { packageName, version, vulnerabilities, blastRadius, temporalExposure, maintainers, typosquats } =
      analysis;

    const mainAdv = vulnerabilities.advisories[0];

    // 1. What happened?
    let whatHappened = `Analysis of ${packageName}@${version}: `;
    if (vulnerabilities.status === "VULNERABLE" && mainAdv) {
      whatHappened += `Package is affected by advisory ${mainAdv.advisoryId} (${mainAdv.severity} severity). ${mainAdv.summary}`;
    } else if (vulnerabilities.status === "SAFE") {
      whatHappened += `No active advisories recorded for this version in the graph.`;
    } else {
      whatHappened += `Advisory status is UNKNOWN (advisory feed unavailable).`;
    }

    // 2. What is affected?
    let whatIsAffected = "No downstream assets affected.";
    if (blastRadius) {
      const repoCount = blastRadius.affectedRepositories.length;
      const svcCount = blastRadius.affectedServices.length;
      const prodCount = blastRadius.affectedProductionAssets.length;
      whatIsAffected = `${repoCount} repository/repositories and ${svcCount} service(s) affected across ${blastRadius.attackPaths.length} attack path(s). `;
      if (blastRadius.isProductionExposed) {
        whatIsAffected += `PRODUCTION EXPOSURE CONFIRMED (${prodCount} production asset(s) impacted).`;
      } else {
        whatIsAffected += `Production environment is not exposed.`;
      }
    }

    // 3. Why is it affected?
    let whyIsItAffected = `Transitive reverse dependency propagation from ${packageName}@${version}. `;
    if (temporalExposure.overallStatus === "EXPOSED") {
      whyIsItAffected += `Service resolution active window overlapped with the vulnerability publication window.`;
    } else if (temporalExposure.overallStatus === "NOT_EXPOSED") {
      whyIsItAffected += `Active exposure is negated because service deployment windows closed prior to vulnerability publication.`;
    } else {
      whyIsItAffected += `Timestamp evidence is incomplete.`;
    }

    // 4. Highest risk path
    let highestRiskPath = "No propagation path detected.";
    if (blastRadius && blastRadius.attackPaths.length > 0) {
      // Find production path first, otherwise first available path
      const prodPath = blastRadius.attackPaths.find((p) =>
        p.some((s) => s.nodeType === "Environment" && s.nodeName.toLowerCase().includes("prod")),
      );
      const selectedPath = prodPath || blastRadius.attackPaths[0];
      highestRiskPath = selectedPath.map((step) => `${step.nodeName} (${step.nodeType})`).join(" ➔ ");
    }

    // 5. What should the developer investigate first?
    const whatToInvestigateFirst: string[] = [];
    if (mainAdv?.fixedVersion) {
      whatToInvestigateFirst.push(`1. Immediately upgrade ${packageName} to fixed version v${mainAdv.fixedVersion}.`);
    } else {
      whatToInvestigateFirst.push(`1. Isolate ${packageName} and evaluate patch / override strategies.`);
    }

    if (blastRadius?.isProductionExposed) {
      whatToInvestigateFirst.push(
        "2. Rotate all environment secrets and API keys accessible to affected production services.",
      );
      whatToInvestigateFirst.push(
        "3. Audit egress network logs for unexpected outbound connections during the active exposure window.",
      );
    }

    if (maintainers.maintainers.length > 0) {
      whatToInvestigateFirst.push(
        `4. Inspect co-maintained packages linked to maintainer @${maintainers.maintainers[0].username}: ${maintainers.maintainers[0].associatedPackages.map((p) => p.packageName).join(", ")}.`,
      );
    }

    if (typosquats.candidates.length > 0) {
      whatToInvestigateFirst.push(
        `5. Audit lockfiles for suspicious typosquat candidate: '${typosquats.candidates[0].package}'.`,
      );
    }

    return {
      whatHappened,
      whatIsAffected,
      whyIsItAffected,
      highestRiskPath,
      whatToInvestigateFirst,
      footerLabel: "Generated from HydraDB evidence",
      isAiGenerated: false,
    };
  }
}

// Global Singleton Instance
let globalExplanationService: ExplanationService | null = null;

export function getExplanationService(): ExplanationService {
  if (!globalExplanationService) {
    globalExplanationService = new ExplanationService();
  }
  return globalExplanationService;
}
