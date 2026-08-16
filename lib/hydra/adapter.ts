import { calculateBlastRadius, BlastRadiusResult } from "../../analysis/blastRadius";
import { assembleEvidence, EvidenceItem } from "../../analysis/evidence";
import { analyzeMaintainers, SharedMaintainerRisk } from "../../analysis/maintainers";
import { analyzeTemporalExposureForServices } from "../../analysis/temporal";
import { analyzeVulnerabilities } from "../../analysis/vulnerability";
import { HydraDBClient, HydraHealthStatus } from "./client";
import {
  EnvironmentNode,
  GraphEdge,
  GraphNode,
  MaintainerNode,
  PackageNode,
  PackageVersionNode,
  RelationshipType,
  RepositoryNode,
  ServiceNode,
  VulnerabilityNode,
} from "./types";

export class HydraDBAdapter {
  private client: HydraDBClient;

  constructor(client?: HydraDBClient) {
    this.client = client || new HydraDBClient();
  }

  public getClient(): HydraDBClient {
    return this.client;
  }

  /**
   * Check connection health of HydraDB.
   * Returns CONNECTED or OFFLINE.
   */
  public async healthCheck(): Promise<HydraHealthStatus> {
    return this.client.healthCheck();
  }

  /**
   * Upsert a Package entity node into HydraDB.
   */
  public async upsertPackage(pkg: PackageNode): Promise<void> {
    await this.client.upsertNode(pkg);
  }

  /**
   * Upsert a PackageVersion entity node into HydraDB.
   */
  public async upsertPackageVersion(pkgVer: PackageVersionNode): Promise<void> {
    await this.client.upsertNode(pkgVer);
  }

  /**
   * Upsert a Vulnerability entity node into HydraDB.
   */
  public async upsertVulnerability(vuln: VulnerabilityNode): Promise<void> {
    await this.client.upsertNode(vuln);
  }

  /**
   * Upsert a Repository entity node into HydraDB.
   */
  public async upsertRepository(repo: RepositoryNode): Promise<void> {
    await this.client.upsertNode(repo);
  }

  /**
   * Upsert a Service entity node into HydraDB.
   */
  public async upsertService(svc: ServiceNode): Promise<void> {
    await this.client.upsertNode(svc);
  }

  /**
   * Upsert an Environment entity node into HydraDB.
   */
  public async upsertEnvironment(env: EnvironmentNode): Promise<void> {
    await this.client.upsertNode(env);
  }

  /**
   * Upsert a Maintainer entity node into HydraDB.
   */
  public async upsertMaintainer(maint: MaintainerNode): Promise<void> {
    await this.client.upsertNode(maint);
  }

  /**
   * Create a directed relationship edge between two graph nodes in HydraDB.
   */
  public async createRelationship(
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    metadata?: Record<string, unknown>,
  ): Promise<GraphEdge> {
    const edge: GraphEdge = {
      id: `edge:${sourceId}:${type.toLowerCase()}:${targetId}`,
      source: sourceId,
      target: targetId,
      type,
      metadata,
    };
    await this.client.upsertEdge(edge);
    return edge;
  }

  /**
   * Fetch a Package by name from HydraDB.
   */
  public async getPackage(packageName: string): Promise<PackageNode | null> {
    const allNodes = await this.client.getAllNodes();
    const pkgNode = allNodes.find(
      (n) => n.type === "Package" && n.name.toLowerCase() === packageName.toLowerCase(),
    );
    return (pkgNode as PackageNode) || null;
  }

  /**
   * Fetch outgoing direct dependencies for a package@version from HydraDB.
   */
  public async getDependencies(packageName: string, version: string): Promise<GraphNode[]> {
    const targetVerId = `pkgver:${packageName.toLowerCase()}@${version}`;
    const edges = await this.client.getEdgesFrom(targetVerId);
    const depEdges = edges.filter((e) => e.type === "DEPENDS_ON");

    const result: GraphNode[] = [];
    for (const edge of depEdges) {
      const node = await this.client.getNode(edge.target);
      if (node) result.push(node);
    }
    return result;
  }

  /**
   * Fetch incoming reverse dependencies for a node from HydraDB.
   */
  public async getReverseDependencies(nodeId: string): Promise<GraphNode[]> {
    const edges = await this.client.getEdgesTo(nodeId);
    const revEdges = edges.filter((e) => e.type === "DEPENDS_ON" || e.type === "USED_BY");

    const result: GraphNode[] = [];
    for (const edge of revEdges) {
      const node = await this.client.getNode(edge.source);
      if (node) result.push(node);
    }
    return result;
  }

  /**
   * Calculate complete transitive blast radius for package@version from HydraDB.
   */
  public async getBlastRadius(
    packageName: string,
    version: string,
    maxDepth: number = 20,
  ): Promise<BlastRadiusResult | null> {
    return calculateBlastRadius(this.client, packageName, version, maxDepth);
  }

  /**
   * Get shared maintainers and associated packages neighborhood from HydraDB.
   */
  public async getMaintainerNeighborhood(packageName: string): Promise<SharedMaintainerRisk[]> {
    const res = await analyzeMaintainers(this.client, packageName);
    return res.maintainers;
  }

  /**
   * Assemble traceable graph evidence from HydraDB for package@version.
   */
  public async getEvidence(packageName: string, version: string): Promise<EvidenceItem[]> {
    const blastRadius = await this.getBlastRadius(packageName, version);
    const vulns = await analyzeVulnerabilities(this.client, packageName, version);
    const mainVuln = vulns.advisories[0];
    const temporal = analyzeTemporalExposureForServices(
      mainVuln?.publishedAt,
      blastRadius?.affectedServices || [],
    );
    const maintainers = await analyzeMaintainers(this.client, packageName, version);

    return assembleEvidence(packageName, version, blastRadius, vulns, temporal, maintainers);
  }
}

// Global Singleton Adapter Instance
let globalAdapterInstance: HydraDBAdapter | null = null;

export function getHydraDBAdapter(): HydraDBAdapter {
  if (!globalAdapterInstance) {
    globalAdapterInstance = new HydraDBAdapter();
  }
  return globalAdapterInstance;
}
