import { describe, expect, it } from "vitest";
import { calculateBlastRadius } from "@/analysis/blastRadius";
import { getHydraDBClient } from "@/server/hydradb/client";
import { GraphEdge } from "@/server/hydradb/schema";

describe("HydraDB Dependency Requirement Test (PRD Section 14)", () => {
  it("proves HydraDB graph relationships materially dictate blast radius conclusions", async () => {
    const client = getHydraDBClient();
    await client.restoreFixtures();

    // 1. Initial State: Analysis includes checkout-api & production environment
    const initialResult = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(initialResult).not.toBeNull();
    expect(initialResult!.isProductionExposed).toBe(true);
    expect(initialResult!.affectedServices.some((s) => s.name === "checkout-api")).toBe(true);

    // 2. Remove Graph Relationship Edge
    const targetEdgeId = "e:dep:auth-middleware->evil-lib";
    const edgeRemoved = await client.removeEdge(targetEdgeId);
    expect(edgeRemoved).toBe(true);

    // 3. Re-Analyze: Result MUST change because graph relationship was removed
    const modifiedResult = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(modifiedResult).not.toBeNull();
    expect(modifiedResult!.isProductionExposed).toBe(false);
    expect(modifiedResult!.affectedServices.some((s) => s.name === "checkout-api")).toBe(false);

    // 4. Restore Graph Relationship Edge
    const restoredEdge: GraphEdge = {
      id: targetEdgeId,
      source: "pkgver:auth-middleware@1.4.0",
      target: "pkgver:evil-lib@2.0.0",
      type: "DEPENDS_ON",
    };
    await client.addEdge(restoredEdge);

    // 5. Re-Analyze: Result MUST be restored back to original
    const restoredResult = await calculateBlastRadius(client, "evil-lib", "2.0.0");
    expect(restoredResult).not.toBeNull();
    expect(restoredResult!.isProductionExposed).toBe(true);
    expect(restoredResult!.affectedServices.some((s) => s.name === "checkout-api")).toBe(true);
  });
});
