import { describe, expect, it } from "vitest";
import { calculateBlastRadius } from "../analysis/blastRadius";
import { HydraDBClient } from "../lib/hydra/client";

describe("Tenant Authorization & Multi-Hop Cross-Tenant Data Leakage Test", () => {
  it("prevents Tenant A traversal from leaking Tenant B private services via shared public packages", async () => {
    const client = new HydraDBClient();

    // 1. Setup Public Package version used by both Tenant A and Tenant B repositories
    await client.upsertNode({ id: "pkg:shared-public-lib", type: "Package", name: "shared-public-lib", ecosystem: "npm" });
    await client.upsertNode({ id: "pkgver:shared-public-lib@1.0.0", type: "PackageVersion", packageName: "shared-public-lib", version: "1.0.0" });

    // Tenant A assets
    await client.upsertNode({ id: "repo:tenantA-repo", type: "Repository", name: "tenantA/public-app", isPrivate: false });
    await client.upsertNode({ id: "svc:tenantA-svc", type: "Service", name: "tenantA-public-service", isPrivate: false });

    // Tenant B private assets
    await client.upsertNode({ id: "repo:tenantB-stealth-repo", type: "Repository", name: "tenantB/stealth-backend", isPrivate: true });
    await client.upsertNode({ id: "svc:tenantB-private-svc", type: "Service", name: "private-service-B", isPrivate: true });

    // Graph Relationships:
    // shared-public-lib@1.0.0 -> tenantA-repo -> tenantA-public-service
    // shared-public-lib@1.0.0 -> tenantB-stealth-repo -> private-service-B
    await client.upsertEdge({ id: "e-pub", source: "pkg:shared-public-lib", target: "pkgver:shared-public-lib@1.0.0", type: "HAS_VERSION" });
    await client.upsertEdge({ id: "e-tA1", source: "pkgver:shared-public-lib@1.0.0", target: "repo:tenantA-repo", type: "USED_BY" });
    await client.upsertEdge({ id: "e-tA2", source: "repo:tenantA-repo", target: "svc:tenantA-svc", type: "USED_BY" });

    await client.upsertEdge({ id: "e-tB1", source: "pkgver:shared-public-lib@1.0.0", target: "repo:tenantB-stealth-repo", type: "USED_BY" });
    await client.upsertEdge({ id: "e-tB2", source: "repo:tenantB-stealth-repo", target: "svc:tenantB-private-svc", type: "USED_BY" });

    // 2. Perform Traversal starting from shared-public-lib@1.0.0
    const blastRadius = await calculateBlastRadius(client, "shared-public-lib", "1.0.0");
    expect(blastRadius).not.toBeNull();

    // 3. Verify public/authorized assets are discovered
    expect(blastRadius!.affectedRepositories.some((r) => r.name === "tenantA/public-app")).toBe(true);

    // 4. Verify Server-Side Authorization Boundary:
    // Unauthorized queries must NOT receive private-service-B or tenantB/stealth-backend!
    const leakedTenantBRepo = blastRadius!.affectedRepositories.some((r) => r.name === "tenantB/stealth-backend");
    const leakedTenantBSvc = blastRadius!.affectedServices.some((s) => s.name === "private-service-B");

    expect(leakedTenantBRepo, "Security Vulnerability: Tenant B private repo leaked to Tenant A query").toBe(false);
    expect(leakedTenantBSvc, "Security Vulnerability: Tenant B private service leaked to Tenant A query").toBe(false);
  });
});
