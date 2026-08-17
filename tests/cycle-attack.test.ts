import { describe, expect, it } from "vitest";
import { calculateBlastRadius } from "../analysis/blastRadius";
import { HydraDBClient } from "../lib/hydra/client";

describe("Dependency Cycle Attack & Traversal Termination Test", () => {
  it("handles cyclical graphs gracefully without infinite loops, duplicate nodes, or stack overflow", async () => {
    const client = new HydraDBClient();

    // Construct a cyclic test graph:
    // PkgComp (compromised) <- PkgA <- PkgB <- PkgC <- PkgA (Cycle A->B->C->A)
    const pkgCompId = "pkgver:compromised-lib@1.0.0";
    const pkgAId = "pkgver:pkg-a@1.0.0";
    const pkgBId = "pkgver:pkg-b@1.0.0";
    const pkgCId = "pkgver:pkg-c@1.0.0";
    const repoId = "repo:checkout-repo";
    const svcId = "svc:checkout-api";

    await client.upsertNode({ id: "pkg:compromised-lib", type: "Package", name: "compromised-lib", ecosystem: "npm" });
    await client.upsertNode({ id: pkgCompId, type: "PackageVersion", packageName: "compromised-lib", version: "1.0.0" });
    await client.upsertNode({ id: pkgAId, type: "PackageVersion", packageName: "pkg-a", version: "1.0.0" });
    await client.upsertNode({ id: pkgBId, type: "PackageVersion", packageName: "pkg-b", version: "1.0.0" });
    await client.upsertNode({ id: pkgCId, type: "PackageVersion", packageName: "pkg-c", version: "1.0.0" });
    await client.upsertNode({ id: repoId, type: "Repository", name: "org/checkout-repo", isPrivate: true });
    await client.upsertNode({ id: svcId, type: "Service", name: "checkout-api", isPrivate: true });

    await client.upsertEdge({ id: "e0", source: "pkg:compromised-lib", target: pkgCompId, type: "HAS_VERSION" });
    await client.upsertEdge({ id: "e1", source: pkgAId, target: pkgCompId, type: "DEPENDS_ON" });
    await client.upsertEdge({ id: "e2", source: pkgBId, target: pkgAId, type: "DEPENDS_ON" });
    await client.upsertEdge({ id: "e3", source: pkgCId, target: pkgBId, type: "DEPENDS_ON" });
    await client.upsertEdge({ id: "e4", source: pkgAId, target: pkgCId, type: "DEPENDS_ON" }); // CYCLE!
    await client.upsertEdge({ id: "e5", source: pkgCId, target: repoId, type: "USED_BY" });
    await client.upsertEdge({ id: "e6", source: repoId, target: svcId, type: "USED_BY" });

    // Test depths 3, 5, 10
    for (const maxDepth of [3, 5, 10]) {
      const startTime = performance.now();
      const result = await calculateBlastRadius(client, "compromised-lib", "1.0.0", maxDepth);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(1000); // Must complete within 1 second
      expect(result).not.toBeNull();
      if (result) {
        expect(result.affectedPackages.length).toBeGreaterThan(0);
        expect(result.attackPaths.length).toBeGreaterThan(0);

        // Verify no duplicate node IDs in result arrays
        const uniquePkgIds = new Set(result.affectedPackages.map((p) => p.id));
        expect(uniquePkgIds.size).toBe(result.affectedPackages.length);
      }
    }
  });
});
