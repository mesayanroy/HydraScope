import { describe, expect, it } from "vitest";
import { calculateBlastRadius } from "@/analysis/blastRadius";
import { getHydraDBClient } from "@/server/hydradb/client";

describe("Blast Radius Engine", () => {
  it("calculates transitive blast radius for evil-lib@2.0.0", async () => {
    const client = getHydraDBClient();
    await client.restoreFixtures();

    const result = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(result).not.toBeNull();
    expect(result?.packageName).toBe("evil-lib");
    expect(result?.version).toBe("2.0.0");
    expect(result?.isProductionExposed).toBe(true);
    expect(result?.affectedRepositories.length).toBeGreaterThan(0);
    expect(result?.affectedServices.length).toBeGreaterThan(0);
    expect(result?.affectedEnvironments.length).toBeGreaterThan(0);
    expect(result?.attackPaths.length).toBeGreaterThan(0);
  });

  it("handles cyclic graphs safely without infinite loops", async () => {
    const client = getHydraDBClient();
    await client.restoreFixtures();

    // Create cyclic dependency: A -> B -> A
    await client.addEdge({
      id: "edge:cyclic:evil-lib@2.0.0:depends_on:payment-sdk@3.1.0",
      source: "pkgver:evil-lib@2.0.0",
      target: "pkgver:payment-sdk@3.1.0",
      type: "DEPENDS_ON",
    });

    const result = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(result).not.toBeNull();
    expect(result?.maxDepthReached).toBeLessThanOrEqual(20);
  });
});
