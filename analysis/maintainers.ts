import { HydraDBClient } from "../lib/hydra/client";
import { MaintainerNode, RepositoryNode } from "../lib/hydra/types";

export type SharedMaintainerRisk = {
  maintainerId: string;
  username: string;
  name?: string;
  email?: string;
  summaryLabel: string;
  riskRelationship: string;
  associatedPackages: Array<{
    packageId: string;
    packageName: string;
    relationshipType: "MAINTAINED_BY" | "PUBLISHED_BY";
  }>;
  associatedRepositories: Array<{
    repositoryId: string;
    name: string;
  }>;
};

export type MaintainerAnalysisResult = {
  targetPackageName: string;
  maintainers: SharedMaintainerRisk[];
  disclaimer: string;
};

export async function analyzeMaintainers(
  client: HydraDBClient,
  packageName: string,
  version?: string,
): Promise<MaintainerAnalysisResult> {
  const pkgNode = await client.findPackage(packageName);
  const pkgVerNode = version ? await client.findPackageVersion(packageName, version) : null;

  const maintainerIds = new Set<string>();

  // Check Maintainers linked to Package via MAINTAINED_BY
  if (pkgNode) {
    const edges = await client.getEdgesFrom(pkgNode.id);
    for (const edge of edges.filter((e) => e.type === "MAINTAINED_BY")) {
      maintainerIds.add(edge.target);
    }
  }

  // Check Maintainers linked to PackageVersion via PUBLISHED_BY
  if (pkgVerNode) {
    const edges = await client.getEdgesFrom(pkgVerNode.id);
    for (const edge of edges.filter((e) => e.type === "PUBLISHED_BY")) {
      maintainerIds.add(edge.target);
    }
  }

  const resultMaintainers: SharedMaintainerRisk[] = [];

  for (const mId of maintainerIds) {
    const mNode = (await client.getNode(mId)) as MaintainerNode | null;
    if (!mNode || mNode.type !== "Maintainer") continue;

    // Find incoming edges to this maintainer from other packages
    const incoming = await client.getEdgesTo(mId);
    const associatedPackagesMap = new Map<
      string,
      { packageId: string; packageName: string; relationshipType: "MAINTAINED_BY" | "PUBLISHED_BY" }
    >();
    const associatedReposMap = new Map<string, { repositoryId: string; name: string }>();

    for (const edge of incoming) {
      if (edge.type === "MAINTAINED_BY" || edge.type === "PUBLISHED_BY") {
        const sourceNode = await client.getNode(edge.source);
        if (sourceNode) {
          if (sourceNode.type === "Package") {
            associatedPackagesMap.set(sourceNode.id, {
              packageId: sourceNode.id,
              packageName: sourceNode.name,
              relationshipType: edge.type,
            });
          } else if (sourceNode.type === "PackageVersion") {
            associatedPackagesMap.set(sourceNode.id, {
              packageId: sourceNode.id,
              packageName: `${sourceNode.packageName}@${sourceNode.version}`,
              relationshipType: edge.type,
            });
          }

          // Check if associated package is used by any repositories
          const pkgEdges = await client.getEdgesFrom(sourceNode.id);
          for (const pEdge of pkgEdges.filter((e) => e.type === "USED_BY")) {
            const repoNode = (await client.getNode(pEdge.target)) as RepositoryNode | null;
            if (repoNode && repoNode.type === "Repository") {
              associatedReposMap.set(repoNode.id, {
                repositoryId: repoNode.id,
                name: repoNode.name,
              });
            }
          }
        }
      }
    }

    const pkgCount = associatedPackagesMap.size;
    const summaryLabel = `${pkgCount} package${pkgCount === 1 ? "" : "s"} share maintainer ${mNode.username}`;
    const riskRelationship = `Shared maintainer @${mNode.username} maintains or published ${pkgCount} package(s) across the dependency graph.`;

    resultMaintainers.push({
      maintainerId: mNode.id,
      username: mNode.username,
      name: mNode.name,
      email: mNode.email,
      summaryLabel,
      riskRelationship,
      associatedPackages: Array.from(associatedPackagesMap.values()),
      associatedRepositories: Array.from(associatedReposMap.values()),
    });
  }

  return {
    targetPackageName: packageName,
    maintainers: resultMaintainers,
    disclaimer:
      "Relationship signal only. Association with a shared maintainer does NOT classify other packages as malicious.",
  };
}
