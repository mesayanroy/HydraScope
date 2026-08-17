import { describe, expect, it } from "vitest";
import { EvidenceItem, runFullAnalysis } from "../analysis";
import { getHydraDBAdapter } from "../lib/hydra/adapter";

export function verifyClaimAgainstEvidence(claim: string, evidenceList: EvidenceItem[]): boolean {
  return evidenceList.some((item) => item.claim.toLowerCase().includes(claim.toLowerCase()));
}

describe("Evidence Traceability & Claim Integrity Test", () => {
  it("assembles traceable evidence items and verifies UI security claims against evidence", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const analysis = await runFullAnalysis(client, "evil-lib", "2.0.0");
    expect(analysis.evidence.length).toBeGreaterThan(0);

    // Verify every evidence item contains mandatory fields
    expect(
      analysis.evidence.every((e) => Boolean(e.evidenceId && e.source && e.claim && e.pathString && e.nodeId)),
    ).toBe(true);

    // 1. Claim: "checkout-api is affected"
    expect(verifyClaimAgainstEvidence("checkout-api", analysis.evidence)).toBe(true);

    // 2. Claim: "evil-actor"
    expect(verifyClaimAgainstEvidence("evil-actor", analysis.evidence)).toBe(true);

    // 3. Claim: "non-existent-fake-service" should return false
    expect(verifyClaimAgainstEvidence("non-existent-fake-service", analysis.evidence)).toBe(false);
  });
});
