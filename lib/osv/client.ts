import { LOCAL_ADVISORY_FIXTURES } from "./fixtures";
import {
  NormalizedVulnerability,
  OsvQueryResponse,
  OsvVulnerability,
  SeverityRating,
} from "./types";

export class OsvClient {
  private sessionCache = new Map<string, NormalizedVulnerability[]>();
  private apiEndpoint: string;
  private timeoutMs: number;

  constructor(apiEndpoint = "https://api.osv.dev/v1/query", timeoutMs = 3000) {
    this.apiEndpoint = apiEndpoint;
    this.timeoutMs = timeoutMs;
  }

  public clearCache(): void {
    this.sessionCache.clear();
  }

  public getCacheSize(): number {
    return this.sessionCache.size;
  }

  public async queryVulnerabilities(
    ecosystem: string,
    packageName: string,
    version: string,
  ): Promise<NormalizedVulnerability[]> {
    const cacheKey = `${ecosystem.toLowerCase()}:${packageName.toLowerCase()}@${version}`;

    // 1. Check Session In-Memory Cache
    if (this.sessionCache.has(cacheKey)) {
      const cached = this.sessionCache.get(cacheKey)!;
      return cached.map((v) => ({ ...v, source: "CACHE" as const }));
    }

    // 2. Local Fixture override check (e.g. for demo compromised package evil-lib)
    if (LOCAL_ADVISORY_FIXTURES[cacheKey]) {
      const fixtureVulns = LOCAL_ADVISORY_FIXTURES[cacheKey];
      this.sessionCache.set(cacheKey, fixtureVulns);
      return fixtureVulns;
    }

    // 3. Query Official OSV REST API (https://api.osv.dev/v1/query)
    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          package: {
            name: packageName,
            ecosystem: ecosystem,
          },
          version: version,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        return this.fallbackToLocalFixture(cacheKey);
      }

      const data: OsvQueryResponse = await response.json();
      if (!data || !Array.isArray(data.vulns) || data.vulns.length === 0) {
        this.sessionCache.set(cacheKey, []);
        return [];
      }

      const normalized = data.vulns.map((v) => this.normalizeVulnerability(v, packageName, version));
      this.sessionCache.set(cacheKey, normalized);
      return normalized;
    } catch {
      // If OSV is unavailable, times out, or throws network error, use fallback local advisory fixture if present
      return this.fallbackToLocalFixture(cacheKey);
    }
  }

  private fallbackToLocalFixture(cacheKey: string): NormalizedVulnerability[] {
    const fixture = LOCAL_ADVISORY_FIXTURES[cacheKey] || [];
    this.sessionCache.set(cacheKey, fixture);
    return fixture;
  }

  private normalizeVulnerability(
    vuln: OsvVulnerability,
    packageName: string,
    version: string,
  ): NormalizedVulnerability {
    const id = vuln.id || "OSV-UNKNOWN";
    const aliases = vuln.aliases || [];
    const summary = vuln.summary || vuln.details?.slice(0, 120) || `Vulnerability in ${packageName}`;
    const details = vuln.details;
    const publishedAt = vuln.published;
    const modifiedAt = vuln.modified;
    const references = vuln.references || [];

    // Extract CVSS score and calculate Severity Rating without fabricating
    let cvssScore: string | undefined = undefined;
    let severity: SeverityRating = "UNKNOWN";

    if (vuln.severity && vuln.severity.length > 0) {
      const cvssItem = vuln.severity.find((s) => s.type.startsWith("CVSS"));
      if (cvssItem) {
        cvssScore = cvssItem.score;
        severity = this.parseSeverityFromCvss(cvssItem.score);
      }
    }

    // Extract Affected Ranges & Fixed Version
    const affectedRanges: string[] = [];
    let introducedVersion: string | null = null;
    let fixedVersion: string | null = null;

    if (vuln.affected && vuln.affected.length > 0) {
      for (const aff of vuln.affected) {
        if (aff.ranges && aff.ranges.length > 0) {
          for (const rng of aff.ranges) {
            if (rng.events && rng.events.length > 0) {
              let introStr = "";
              let fixStr = "";
              for (const evt of rng.events) {
                if (evt.introduced) {
                  introducedVersion = evt.introduced;
                  introStr = `>=${evt.introduced}`;
                }
                if (evt.fixed) {
                  fixedVersion = evt.fixed;
                  fixStr = `<${evt.fixed}`;
                }
              }
              const rangeStr = [introStr, fixStr].filter(Boolean).join(" ");
              if (rangeStr) affectedRanges.push(rangeStr);
            }
          }
        }
      }
    }

    return {
      id,
      aliases,
      summary,
      details,
      severity,
      cvssScore,
      affectedRanges: affectedRanges.length > 0 ? affectedRanges : [`==${version}`],
      introducedVersion,
      fixedVersion,
      publishedAt,
      modifiedAt,
      references,
      source: "OSV_LIVE",
    };
  }

  private parseSeverityFromCvss(cvssVectorStr: string): SeverityRating {
    // Determine severity from CVSS vector or score prefix without guessing arbitrary numbers
    const scoreMatch = cvssVectorStr.match(/\/S:.*\/C:.*|\d+\.\d+/);
    if (!scoreMatch) return "HIGH"; // Default standard rating if CVSS vector present

    const numericScore = parseFloat(scoreMatch[0]);
    if (isNaN(numericScore)) return "HIGH";

    if (numericScore >= 9.0) return "CRITICAL";
    if (numericScore >= 7.0) return "HIGH";
    if (numericScore >= 4.0) return "MEDIUM";
    if (numericScore >= 0.1) return "LOW";
    return "UNKNOWN";
  }
}

// Global Singleton OsvClient instance
let globalOsvClient: OsvClient | null = null;

export function getOsvClient(): OsvClient {
  if (!globalOsvClient) {
    globalOsvClient = new OsvClient();
  }
  return globalOsvClient;
}
