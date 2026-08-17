import { describe, expect, it } from "vitest";
import { HydraDBClient } from "../lib/hydra/client";

describe("Graph Tenant Authorization Boundary Test Suite", () => {
  it("enforces tenant boundary separation between TENANT_A and TENANT_B graph nodes", async () => {
    const client = new HydraDBClient();

    // Create TENANT_A graph nodes
    await client.upsertNode({ id: "tenantA:pkg@1.0.0", type: "PackageVersion", packageName: "tenantA-pkg", version: "1.0.0" });
    await client.upsertNode({ id: "tenantA:repo", type: "Repository", name: "org-a/private-repo", isPrivate: true });
    await client.upsertEdge({ id: "e-tenantA", source: "tenantA:pkg@1.0.0", target: "tenantA:repo", type: "USED_BY" });

    // Create TENANT_B graph nodes
    await client.upsertNode({ id: "tenantB:pkg@1.0.0", type: "PackageVersion", packageName: "tenantB-pkg", version: "1.0.0" });
    await client.upsertNode({ id: "tenantB:repo", type: "Repository", name: "org-b/private-repo", isPrivate: true });
    await client.upsertEdge({ id: "e-tenantB", source: "tenantB:pkg@1.0.0", target: "tenantB:repo", type: "USED_BY" });

    // Query edges for TENANT_A node
    const tenantAEdges = await client.getEdgesFrom("tenantA:pkg@1.0.0");
    expect(tenantAEdges.some((e) => e.target.startsWith("tenantA:"))).toBe(true);
    expect(tenantAEdges.some((e) => e.target.startsWith("tenantB:"))).toBe(false);

    // Query edges for TENANT_B node
    const tenantBEdges = await client.getEdgesFrom("tenantB:pkg@1.0.0");
    expect(tenantBEdges.some((e) => e.target.startsWith("tenantB:"))).toBe(true);
    expect(tenantBEdges.some((e) => e.target.startsWith("tenantA:"))).toBe(false);
  });
});
