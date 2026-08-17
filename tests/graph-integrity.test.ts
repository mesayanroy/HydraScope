import { describe, expect, it } from "vitest";
import { getHydraDBAdapter } from "../lib/hydra/adapter";

describe("HydraDB Graph Integrity & Referential Consistency Test", () => {
  it("verifies graph referential integrity, edge validity, and node stability", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const allNodes = await client.getAllNodes();
    const allEdges = await client.getAllEdges();
    const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

    expect(allNodes.length).toBeGreaterThan(0);
    expect(allEdges.length).toBeGreaterThan(0);

    // 1. Verify every edge source and target exists in nodeMap
    for (const edge of allEdges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      expect(sourceNode, `Orphan edge ${edge.id}: source node ${edge.source} does not exist`).toBeDefined();
      expect(targetNode, `Orphan edge ${edge.id}: target node ${edge.target} does not exist`).toBeDefined();
    }

    // 2. Verify DEPENDS_ON edges connect PackageVersion -> PackageVersion
    const dependsOnEdges = allEdges.filter((e) => e.type === "DEPENDS_ON");
    for (const edge of dependsOnEdges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      expect(sourceNode?.type).toBe("PackageVersion");
      expect(targetNode?.type).toBe("PackageVersion");
    }

    // 3. Verify AFFECTED_BY edges connect PackageVersion -> Vulnerability
    const affectedByEdges = allEdges.filter((e) => e.type === "AFFECTED_BY");
    for (const edge of affectedByEdges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      expect(sourceNode?.type).toBe("PackageVersion");
      expect(targetNode?.type).toBe("Vulnerability");
    }

    // 4. Verify USED_BY edges connect PackageVersion -> Repository OR Repository -> Service
    const usedByEdges = allEdges.filter((e) => e.type === "USED_BY");
    for (const edge of usedByEdges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      const isValidPair =
        (sourceNode?.type === "PackageVersion" && targetNode?.type === "Repository") ||
        (sourceNode?.type === "Repository" && targetNode?.type === "Service");
      expect(isValidPair).toBe(true);
    }

    // 5. Verify RUNS_IN edges connect Service -> Environment
    const runsInEdges = allEdges.filter((e) => e.type === "RUNS_IN");
    for (const edge of runsInEdges) {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      expect(sourceNode?.type).toBe("Service");
      expect(targetNode?.type).toBe("Environment");
    }

    // 6. Verify MAINTAINED_BY / PUBLISHED_BY edges connect to Maintainer
    const maintainerEdges = allEdges.filter((e) => e.type === "MAINTAINED_BY" || e.type === "PUBLISHED_BY");
    for (const edge of maintainerEdges) {
      const targetNode = nodeMap.get(edge.target);
      expect(targetNode?.type).toBe("Maintainer");
    }

    // 7. Check no duplicate edges with identical source, target, and type
    const edgeKeySet = new Set<string>();
    for (const edge of allEdges) {
      const key = `${edge.source}->${edge.target}:${edge.type}`;
      expect(edgeKeySet.has(key), `Duplicate edge detected: ${key}`).toBe(false);
      edgeKeySet.add(key);
    }
  });
});
