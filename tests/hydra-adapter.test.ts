import { describe, expect, it } from "vitest";
import { getHydraDBAdapter, HydraDBAdapter } from "../lib/hydra/adapter";
import { HydraDBClient } from "../lib/hydra/client";

describe("HydraDB Adapter Unit & Integration Tests", () => {
  it("healthCheck returns CONNECTED with valid node and edge counts", async () => {
    const adapter = getHydraDBAdapter();
    const health = await adapter.healthCheck();
    expect(health.status).toBe("CONNECTED");
    expect(health.nodeCount).toBeGreaterThan(0);
    expect(health.edgeCount).toBeGreaterThan(0);
  });

  it("handles OFFLINE status gracefully when live endpoint fails", async () => {
    const brokenClient = new HydraDBClient({
      endpoint: "http://127.0.0.1:59999", // non-existent offline port
      apiKey: "test-key",
    });
    const adapter = new HydraDBAdapter(brokenClient);
    const health = await adapter.healthCheck();
    expect(health.status).toBe("OFFLINE");
  });

  it("upserts Package, PackageVersion, Vulnerability, Repository, Service, Environment, and Maintainer nodes", async () => {
    const adapter = getHydraDBAdapter();

    await adapter.upsertPackage({
      id: "pkg:test-lib",
      type: "Package",
      name: "test-lib",
      ecosystem: "npm",
    });

    const pkg = await adapter.getPackage("test-lib");
    expect(pkg).not.toBeNull();
    expect(pkg?.name).toBe("test-lib");

    await adapter.upsertPackageVersion({
      id: "pkgver:test-lib@1.0.0",
      type: "PackageVersion",
      packageName: "test-lib",
      version: "1.0.0",
    });

    await adapter.upsertVulnerability({
      id: "vuln:GHSA-test-1234",
      type: "Vulnerability",
      advisoryId: "GHSA-test-1234",
      aliases: ["CVE-2026-1234"],
      severity: "HIGH",
      affectedRange: ">=1.0.0",
      fixedVersion: "1.0.1",
      summary: "Test security advisory",
    });

    await adapter.upsertRepository({
      id: "repo:test-repo",
      type: "Repository",
      name: "org/test-repo",
      isPrivate: true,
    });

    await adapter.upsertService({
      id: "svc:test-api",
      type: "Service",
      name: "test-api",
      isPrivate: true,
    });

    await adapter.upsertEnvironment({
      id: "env:test-prod",
      type: "Environment",
      name: "production-test",
      isProduction: true,
    });

    await adapter.upsertMaintainer({
      id: "maint:test-user",
      type: "Maintainer",
      username: "test-user",
    });
  });

  it("creates relationships and queries dependencies, reverse dependencies, blast radius, maintainer neighborhood, and evidence", async () => {
    const adapter = getHydraDBAdapter();

    const edge = await adapter.createRelationship(
      "pkgver:auth-middleware@1.4.0",
      "pkgver:evil-lib@2.0.0",
      "DEPENDS_ON",
    );
    expect(edge.id).toBeDefined();

    const deps = await adapter.getDependencies("auth-middleware", "1.4.0");
    expect(deps.some((d) => d.id === "pkgver:evil-lib@2.0.0")).toBe(true);

    const revDeps = await adapter.getReverseDependencies("pkgver:evil-lib@2.0.0");
    expect(revDeps.some((r) => r.id === "pkgver:auth-middleware@1.4.0")).toBe(true);

    const blast = await adapter.getBlastRadius("evil-lib", "2.0.0");
    expect(blast).not.toBeNull();
    expect(blast?.isProductionExposed).toBe(true);

    const maintainers = await adapter.getMaintainerNeighborhood("evil-lib");
    expect(maintainers.length).toBeGreaterThan(0);

    const evidence = await adapter.getEvidence("evil-lib", "2.0.0");
    expect(evidence.length).toBeGreaterThan(0);
  });
});
