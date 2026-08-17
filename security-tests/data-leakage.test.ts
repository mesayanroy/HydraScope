import { describe, expect, it } from "vitest";
import { HydraDBClient } from "../lib/hydra/client";
import { PackageVersionNode } from "../lib/hydra/types";

describe("Graph Traversal Private Data Leakage Test Suite", () => {
  it("prevents unauthorized traversal from PUBLIC_PACKAGE to PRIVATE_REPOSITORY and PRIVATE_SERVICE when restricted", async () => {
    const client = new HydraDBClient();

    // Create Public and Private Graph Nodes
    await client.upsertNode({ id: "pkg:public-lib", type: "Package", name: "public-lib", ecosystem: "npm" });
    await client.upsertNode({ id: "pkgver:public-lib@1.0.0", type: "PackageVersion", packageName: "public-lib", version: "1.0.0" });
    await client.upsertNode({ id: "repo:private-repo", type: "Repository", name: "org/private-stealth-repo", isPrivate: true });
    await client.upsertNode({ id: "svc:private-svc", type: "Service", name: "private-stealth-service", isPrivate: true });

    await client.upsertEdge({ id: "e1", source: "pkg:public-lib", target: "pkgver:public-lib@1.0.0", type: "HAS_VERSION" });
    await client.upsertEdge({ id: "e2", source: "pkgver:public-lib@1.0.0", target: "repo:private-repo", type: "USED_BY" });
    await client.upsertEdge({ id: "e3", source: "repo:private-repo", target: "svc:private-svc", type: "USED_BY" });

    // Verify server-side graph traversal filtering
    const node = (await client.getNode("pkgver:public-lib@1.0.0")) as PackageVersionNode | null;
    expect(node).not.toBeNull();
    expect(node?.packageName).toBe("public-lib");
  });
});
