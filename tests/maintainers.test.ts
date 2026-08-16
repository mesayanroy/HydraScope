import { describe, expect, it } from "vitest";
import { analyzeMaintainers } from "../analysis/maintainers";
import { getHydraDBAdapter } from "../lib/hydra/adapter";

describe("Shared Maintainer Graph Analysis Engine", () => {
  it("resolves shared maintainer nodes, associated packages, repositories, and summary labels", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const result = await analyzeMaintainers(client, "evil-lib", "2.0.0");
    expect(result.maintainers.length).toBeGreaterThan(0);

    const m = result.maintainers[0];
    expect(m.username).toBe("evil-actor");
    expect(m.summaryLabel).toContain("share maintainer evil-actor");
    expect(m.riskRelationship).toBeDefined();
    expect(m.associatedPackages.some((p) => p.packageName.includes("crypto-helper-utils"))).toBe(true);
    expect(result.disclaimer).toContain("Relationship signal only");
  });
});
