import { describe, expect, it } from "vitest";
import { calculateBlastRadius } from "../analysis/blastRadius";
import { getHydraDBAdapter } from "../lib/hydra/adapter";
import { GraphEdge } from "../lib/hydra/types";

describe("HydraDB Core Dependency Proof Test", () => {
  it("proves that HydraScope's analysis directly depends on HydraDB graph relationship traversal", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    // 1. Initial Analysis: Ground truth includes checkout-api & production environment
    const initialResult = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(initialResult).not.toBeNull();
    expect(initialResult!.isProductionExposed).toBe(true);
    expect(initialResult!.affectedServices.some((s) => s.name === "checkout-api")).toBe(true);

    // 2. Remove Critical Dependency Edge: auth-middleware -> evil-lib
    const targetEdgeId = "e:dep:auth-middleware->evil-lib";
    const edgeRemoved = await client.removeEdge(targetEdgeId);
    expect(edgeRemoved).toBe(true);

    // 3. Re-Run Analysis: Verify checkout-api DISAPPEARS because graph relationship was removed
    const modifiedResult = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(modifiedResult).not.toBeNull();
    expect(modifiedResult!.isProductionExposed).toBe(false);
    expect(modifiedResult!.affectedServices.some((s) => s.name === "checkout-api")).toBe(false);

    // 4. Restore Critical Dependency Edge
    const restoredEdge: GraphEdge = {
      id: targetEdgeId,
      source: "pkgver:auth-middleware@1.4.0",
      target: "pkgver:evil-lib@2.0.0",
      type: "DEPENDS_ON",
    };
    await client.addEdge(restoredEdge);

    // 5. Re-Run Analysis: Verify original result RESTORES completely
    const restoredResult = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(restoredResult).not.toBeNull();
    expect(restoredResult!.isProductionExposed).toBe(true);
    expect(restoredResult!.affectedServices.some((s) => s.name === "checkout-api")).toBe(true);
  });
});
