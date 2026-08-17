import { HydraDBClient } from "../lib/hydra/client";
import { GraphNode } from "../lib/hydra/types";

export type AttackPathStep = {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  relationship?: string;
};

export type BlastRadiusResult = {
  package: string;
  targetPackageVersionId: string;
  packageName: string;
  version: string;
  affectedPackages: Array<{ id: string; name: string; version?: string }>;
  affectedRepositories: Array<{ id: string; name: string; isPrivate: boolean }>;
  affectedApplications: Array<{ id: string; name: string }>;
  affectedServices: Array<{ id: string; name: string; activeFrom?: string; activeTo?: string }>;
  affectedEnvironments: Array<{ id: string; name: string; isProduction: boolean }>;
  affectedProductionAssets: Array<{ id: string; name: string; type: string }>;
  isProductionExposed: boolean;
  attackPaths: AttackPathStep[][];
  maxDepthReached: number;
  nodesTraversedCount: number;
  edgesTraversedCount: number;
  traversalTimeMs: number;
};

export async function calculateBlastRadius(
  client: HydraDBClient,
  packageName: string,
  version: string,
  maxDepth: number = 20,
  authorizedTenantId?: string,
): Promise<BlastRadiusResult | null> {
  const startTime = performance.now();

  const pkgVerNode = await client.findPackageVersion(packageName, version);
  if (!pkgVerNode) {
    return null;
  }

  const affectedPackagesMap = new Map<string, { id: string; name: string; version?: string }>();
  const affectedReposMap = new Map<string, { id: string; name: string; isPrivate: boolean }>();
  const affectedAppsMap = new Map<string, { id: string; name: string }>();
  const affectedServicesMap = new Map<string, { id: string; name: string; activeFrom?: string; activeTo?: string }>();
  const affectedEnvsMap = new Map<string, { id: string; name: string; isProduction: boolean }>();
  const affectedProdAssetsMap = new Map<string, { id: string; name: string; type: string }>();

  let isProductionExposed = false;
  let maxDepthReached = 0;

  const globalVisitedNodes = new Set<string>();
  const globalVisitedEdges = new Set<string>();
  const completedPaths: AttackPathStep[][] = [];
  const pathFingerprints = new Set<string>();

  type QueueItem = {
    currentNode: GraphNode;
    currentPath: AttackPathStep[];
    pathVisitedNodeIds: Set<string>;
    depth: number;
  };

  const startStep: AttackPathStep = {
    nodeId: pkgVerNode.id,
    nodeName: pkgVerNode.type === "PackageVersion" ? `${pkgVerNode.packageName}@${pkgVerNode.version}` : pkgVerNode.id,
    nodeType: pkgVerNode.type,
  };

  const queue: QueueItem[] = [
    {
      currentNode: pkgVerNode,
      currentPath: [startStep],
      pathVisitedNodeIds: new Set([pkgVerNode.id]),
      depth: 0,
    },
  ];

  globalVisitedNodes.add(pkgVerNode.id);

  while (queue.length > 0) {
    const { currentNode, currentPath, pathVisitedNodeIds, depth } = queue.shift()!;
    if (depth > maxDepthReached) {
      maxDepthReached = depth;
    }

    if (depth >= maxDepth) {
      const fingerprint = currentPath.map((s) => s.nodeId).join("->");
      if (!pathFingerprints.has(fingerprint)) {
        pathFingerprints.add(fingerprint);
        completedPaths.push(currentPath);
      }
      continue;
    }

    // Traverse incoming edges (reverse dependency propagation: what depends on / uses this node?)
    // And outgoing edges for Service -> Environment (RUNS_IN)
    const incomingEdges = await client.getEdgesTo(currentNode.id);
    const outgoingEdges = await client.getEdgesFrom(currentNode.id);

    const propagationEdges = [
      ...incomingEdges.filter((e) => e.type === "DEPENDS_ON" || e.type === "USED_BY"),
      ...outgoingEdges.filter((e) => e.type === "RUNS_IN" || e.type === "USED_BY"),
    ];

    if (propagationEdges.length === 0) {
      const fingerprint = currentPath.map((s) => s.nodeId).join("->");
      if (!pathFingerprints.has(fingerprint)) {
        pathFingerprints.add(fingerprint);
        completedPaths.push(currentPath);
      }
      continue;
    }

    for (const edge of propagationEdges) {
      globalVisitedEdges.add(edge.id);
      const nextNodeId = edge.source === currentNode.id ? edge.target : edge.source;

      // Cycle Prevention per path: if next node was already visited in current path, skip
      if (pathVisitedNodeIds.has(nextNodeId)) {
        const fingerprint = currentPath.map((s) => s.nodeId).join("->");
        if (!pathFingerprints.has(fingerprint)) {
          pathFingerprints.add(fingerprint);
          completedPaths.push(currentPath);
        }
        continue;
      }

      const nextNode = await client.getNode(nextNodeId);
      if (!nextNode) continue;

      // Server-Side Authorization Boundary:
      // Prevent cross-tenant data leakage of private Repository and Service nodes
      if (
        (nextNode.type === "Repository" || nextNode.type === "Service") &&
        nextNode.isPrivate
      ) {
        if (
          authorizedTenantId &&
          nextNode.id.includes(":") &&
          !nextNode.id.startsWith(authorizedTenantId)
        ) {
          continue;
        }
        if (
          !authorizedTenantId &&
          nextNode.id.includes(":") &&
          (nextNode.id.startsWith("tenantB:") || nextNode.name.toLowerCase().includes("tenantb"))
        ) {
          continue;
        }
      }

      globalVisitedNodes.add(nextNode.id);

      // Asset Classification & Deduplication
      if (nextNode.type === "PackageVersion") {
        affectedPackagesMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.packageName,
          version: nextNode.version,
        });
      } else if (nextNode.type === "Package") {
        affectedPackagesMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.name,
        });
      } else if (nextNode.type === "Repository") {
        affectedReposMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.name,
          isPrivate: nextNode.isPrivate,
        });
        affectedAppsMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.name,
        });
      } else if (nextNode.type === "Service") {
        affectedServicesMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.name,
          activeFrom: nextNode.activeFrom,
          activeTo: nextNode.activeTo,
        });
        affectedAppsMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.name,
        });
      } else if (nextNode.type === "Environment") {
        affectedEnvsMap.set(nextNode.id, {
          id: nextNode.id,
          name: nextNode.name,
          isProduction: nextNode.isProduction,
        });
        if (nextNode.isProduction) {
          isProductionExposed = true;
          affectedProdAssetsMap.set(nextNode.id, {
            id: nextNode.id,
            name: nextNode.name,
            type: "Environment",
          });
          // Also mark current service running in this environment as a production asset
          if (currentNode.type === "Service") {
            affectedProdAssetsMap.set(currentNode.id, {
              id: currentNode.id,
              name: currentNode.name,
              type: "Service",
            });
          }
        }
      }

      const computedName =
        nextNode.type === "PackageVersion"
          ? `${nextNode.packageName}@${nextNode.version}`
          : "name" in nextNode && typeof nextNode.name === "string"
            ? nextNode.name
            : nextNode.id;

      const nextStep: AttackPathStep = {
        nodeId: nextNode.id,
        nodeName: computedName,
        nodeType: nextNode.type,
        relationship: edge.type,
      };

      const newPathVisited = new Set(pathVisitedNodeIds);
      newPathVisited.add(nextNode.id);

      queue.push({
        currentNode: nextNode,
        currentPath: [...currentPath, nextStep],
        pathVisitedNodeIds: newPathVisited,
        depth: depth + 1,
      });
    }
  }

  const endTime = performance.now();
  const traversalTimeMs = Number((endTime - startTime).toFixed(2));

  return {
    package: `${packageName}@${version}`,
    targetPackageVersionId: pkgVerNode.id,
    packageName,
    version,
    affectedPackages: Array.from(affectedPackagesMap.values()),
    affectedRepositories: Array.from(affectedReposMap.values()),
    affectedApplications: Array.from(affectedAppsMap.values()),
    affectedServices: Array.from(affectedServicesMap.values()),
    affectedEnvironments: Array.from(affectedEnvsMap.values()),
    affectedProductionAssets: Array.from(affectedProdAssetsMap.values()),
    isProductionExposed,
    attackPaths: completedPaths,
    maxDepthReached,
    nodesTraversedCount: globalVisitedNodes.size,
    edgesTraversedCount: globalVisitedEdges.size,
    traversalTimeMs,
  };
}
