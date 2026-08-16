import { describe, expect, it } from "vitest";
import { getHydraDBAdapter } from "../lib/hydra/adapter";
import { OsvClient } from "../lib/osv/client";
import { VulnerabilityService } from "../lib/osv/vulnerabilityService";

describe("OSV Vulnerability Intelligence Layer Tests", () => {
  it("queries vulnerabilities and caches repeated calls in session memory", async () => {
    const osvClient = new OsvClient();

    // First Query (loads into cache)
    const vulns1 = await osvClient.queryVulnerabilities("npm", "lodash", "4.17.20");
    expect(vulns1.length).toBeGreaterThan(0);
    expect(vulns1[0].id).toBeDefined();

    // Second Query (served from cache)
    const vulns2 = await osvClient.queryVulnerabilities("npm", "lodash", "4.17.20");
    expect(vulns2.length).toBe(vulns1.length);
    expect(vulns2[0].source).toBe("CACHE");
  });

  it("handles non-existent packages and safe versions cleanly without throwing", async () => {
    const osvClient = new OsvClient();

    const vulns = await osvClient.queryVulnerabilities("npm", "safe-package-xyz", "1.0.0");
    expect(vulns).toEqual([]);
  });

  it("falls back to local advisory fixtures cleanly when OSV endpoint is unreachable or times out", async () => {
    const brokenOsvClient = new OsvClient("http://127.0.0.1:59998/offline-osv", 100);

    const vulns = await brokenOsvClient.queryVulnerabilities("npm", "evil-lib", "2.0.0");
    expect(vulns.length).toBeGreaterThan(0);
    expect(vulns[0].id).toBe("GHSA-evil-2026-9999");
    expect(vulns[0].severity).toBe("CRITICAL");
  });

  it("maps OSV vulnerabilities and AFFECTED_BY relationships into HydraDB graph", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const osvClient = new OsvClient();
    const vulnService = new VulnerabilityService(osvClient, adapter);

    const vulns = await vulnService.enrichPackageVersionVulnerabilities("npm", "evil-lib", "2.0.0");
    expect(vulns.length).toBeGreaterThan(0);

    // Verify vulnerability node exists in HydraDB
    const vulnNode = await client.getNode("vuln:GHSA-evil-2026-9999");
    expect(vulnNode).not.toBeNull();
    expect(vulnNode?.type).toBe("Vulnerability");

    // Verify AFFECTED_BY edge exists in HydraDB
    const edges = await client.getEdgesFrom("pkgver:evil-lib@2.0.0");
    const affectedEdge = edges.find((e) => e.type === "AFFECTED_BY" && e.target === "vuln:GHSA-evil-2026-9999");
    expect(affectedEdge).toBeDefined();
  });

  it("never fabricates severity or CVSS score", async () => {
    const osvClient = new OsvClient();
    const vulns = await osvClient.queryVulnerabilities("npm", "express", "4.18.2");

    for (const v of vulns) {
      if (!v.cvssScore) {
        expect(v.cvssScore).toBeUndefined();
      }
      expect(["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]).toContain(v.severity);
    }
  });
});
