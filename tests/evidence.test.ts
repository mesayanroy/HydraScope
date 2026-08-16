import { describe, expect, it } from "vitest";
import { runFullAnalysis } from "@/analysis";
import { getHydraDBClient } from "@/server/hydradb/client";

describe("Evidence System", () => {
  it("assembles traceable evidence items for evil-lib@2.0.0", async () => {
    const client = getHydraDBClient();
    await client.restoreFixtures();

    const analysis = await runFullAnalysis(client, "evil-lib", "2.0.0");
    expect(analysis.evidence.length).toBeGreaterThan(0);
    expect(analysis.evidence.every((e) => Boolean(e.evidenceId && e.source && e.claim && e.pathString))).toBe(true);
  });
});
