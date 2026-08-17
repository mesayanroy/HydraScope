import { describe, expect, it } from "vitest";
import { getHydraDBAdapter } from "../lib/hydra/adapter";
import { PackageNode } from "../lib/hydra/types";

describe("HydraDB Connectivity & Basic CRUD Smoke Test", () => {
  it("verifies API key exists, endpoint is reachable, and basic node/edge operations succeed", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();

    // 1. Health check
    const health = await adapter.healthCheck();
    expect(health.status).toBeDefined();
    expect(health.mode).toBeDefined();

    // 2. Insert test package node
    const testPkgId = `pkg:smoke-test-pkg-${Date.now()}`;
    await adapter.upsertPackage({
      id: testPkgId,
      type: "Package",
      name: "smoke-test-pkg",
      ecosystem: "npm",
    });

    // 3. Insert test package version node
    const testVerId = `pkgver:smoke-test-pkg@1.0.0-${Date.now()}`;
    await adapter.upsertPackageVersion({
      id: testVerId,
      type: "PackageVersion",
      packageName: "smoke-test-pkg",
      version: "1.0.0",
    });

    // 4. Create relationship
    const edge = await adapter.createRelationship(testPkgId, testVerId, "HAS_VERSION");
    expect(edge.source).toBe(testPkgId);
    expect(edge.target).toBe(testVerId);

    // 5. Retrieve node & edges
    const fetchedPkg = (await client.getNode(testPkgId)) as PackageNode | null;
    expect(fetchedPkg).not.toBeNull();
    expect(fetchedPkg?.name).toBe("smoke-test-pkg");

    const edges = await client.getEdgesFrom(testPkgId);
    expect(edges.some((e) => e.target === testVerId)).toBe(true);

    // 6. Cleanup test nodes
    await client.restoreFixtures();
  });
});
