import { describe, expect, it } from "vitest";
import { calculateBlastRadius } from "../analysis/blastRadius";
import { getHydraDBAdapter } from "../lib/hydra/adapter";
import { HydraDBClient } from "../lib/hydra/client";

describe("Transitive Reverse Dependency Blast Radius Engine", () => {
  it("1. Simple Dependency: correctly identifies direct 1-hop dependent package", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const result = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(result).not.toBeNull();
    expect(result?.packageName).toBe("evil-lib");
    expect(result?.version).toBe("2.0.0");
    expect(result?.affectedPackages.some((p) => p.name === "auth-middleware")).toBe(true);
  });

  it("2. Multi-hop Dependency: propagates through auth-middleware -> payment-sdk -> checkout-repo -> checkout-api -> prod", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const result = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(result).not.toBeNull();
    expect(result?.maxDepthReached).toBeGreaterThanOrEqual(4);
    expect(result?.affectedRepositories.some((r) => r.name === "org/checkout-service")).toBe(true);
    expect(result?.affectedServices.some((s) => s.name === "checkout-api")).toBe(true);
    expect(result?.affectedEnvironments.some((e) => e.name === "production-us-east-1")).toBe(true);
  });

  it("3. Cycle Detection: prevents infinite loops when cyclic dependency graph is present", async () => {
    const client = new HydraDBClient();
    await client.upsertNode({
      id: "pkgver:node-a@1.0.0",
      type: "PackageVersion",
      packageName: "node-a",
      version: "1.0.0",
    });
    await client.upsertNode({
      id: "pkgver:node-b@1.0.0",
      type: "PackageVersion",
      packageName: "node-b",
      version: "1.0.0",
    });

    // Cyclic DEPENDS_ON relationship: node-a <-> node-b
    await client.upsertEdge({
      id: "e:cycle-1",
      source: "pkgver:node-b@1.0.0",
      target: "pkgver:node-a@1.0.0",
      type: "DEPENDS_ON",
    });
    await client.upsertEdge({
      id: "e:cycle-2",
      source: "pkgver:node-a@1.0.0",
      target: "pkgver:node-b@1.0.0",
      type: "DEPENDS_ON",
    });

    const result = await calculateBlastRadius(client, "node-a", "1.0.0");
    expect(result).not.toBeNull();
    expect(result?.attackPaths).toBeDefined();
    // Traversal must complete without overflowing memory or hanging
  });

  it("4. Duplicate Path Prevention: deduplicates redundant attack path trajectories", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const result = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(result).not.toBeNull();

    const pathStrings = result!.attackPaths.map((p) => p.map((s) => s.nodeId).join("->"));
    const uniquePathStrings = new Set(pathStrings);
    expect(pathStrings.length).toEqual(uniquePathStrings.size);
  });

  it("5. Missing Node Handling: returns null gracefully for non-existent package/version", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();

    const result = await calculateBlastRadius(client, "nonexistent-package", "9.9.9");
    expect(result).toBeNull();
  });

  it("6. Production Exposure: correctly classifies and flags production environment exposure", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const result = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(result).not.toBeNull();
    expect(result?.isProductionExposed).toBe(true);
    expect(result?.affectedProductionAssets.length).toBeGreaterThan(0);
    expect(result?.affectedProductionAssets.some((a) => a.name === "production-us-east-1")).toBe(true);
  });
});
