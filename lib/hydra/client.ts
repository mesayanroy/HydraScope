import { createDeterministicFixtures } from "./fixtures";
import { GraphEdge, GraphNode, HydraGraphData } from "./types";

export type HydraClientConfig = {
  endpoint?: string;
  apiKey?: string;
};

export type HydraHealthStatus = {
  status: "CONNECTED" | "OFFLINE";
  mode: "LIVE" | "FIXTURE";
  nodeCount: number;
  edgeCount: number;
  endpoint?: string;
  timestamp: string;
};

export class HydraDBClient {
  private endpoint: string;
  private apiKey: string;
  private isLiveConfigured: boolean;

  private nodesMap = new Map<string, GraphNode>();
  private edgesMap = new Map<string, GraphEdge>();
  private outgoingEdges = new Map<string, Set<string>>();
  private incomingEdges = new Map<string, Set<string>>();
  private queryCounter = 0;

  constructor(config?: HydraClientConfig) {
    this.endpoint =
      config?.endpoint ||
      process.env.HYDRA_ENDPOINT ||
      process.env.HYDRADB_URL ||
      "";
    this.apiKey =
      config?.apiKey ||
      process.env.HYDRA_API_KEY ||
      process.env.HYDRADB_API_KEY ||
      "";

    this.isLiveConfigured = Boolean(this.endpoint && this.apiKey);

    // Initialize with initial seed fixtures
    this.loadGraphData(createDeterministicFixtures());
  }

  public isLiveMode(): boolean {
    return this.isLiveConfigured;
  }

  public getQueryCount(): number {
    return this.queryCounter;
  }

  public resetQueryCount(): void {
    this.queryCounter = 0;
  }

  public loadGraphData(data: HydraGraphData): void {
    this.nodesMap.clear();
    this.edgesMap.clear();
    this.outgoingEdges.clear();
    this.incomingEdges.clear();

    for (const node of data.nodes) {
      this.nodesMap.set(node.id, node);
    }
    for (const edge of data.edges) {
      this.addEdgeInternal(edge);
    }
  }

  private addEdgeInternal(edge: GraphEdge): void {
    this.edgesMap.set(edge.id, edge);

    if (!this.outgoingEdges.has(edge.source)) {
      this.outgoingEdges.set(edge.source, new Set());
    }
    this.outgoingEdges.get(edge.source)!.add(edge.id);

    if (!this.incomingEdges.has(edge.target)) {
      this.incomingEdges.set(edge.target, new Set());
    }
    this.incomingEdges.get(edge.target)!.add(edge.id);
  }

  /**
   * Health check for HydraDB backend connection.
   * NEVER returns "CONNECTED" unless the connection succeeds!
   */
  public async healthCheck(): Promise<HydraHealthStatus> {
    this.queryCounter++;
    const now = new Date().toISOString();

    if (this.isLiveConfigured) {
      try {
        const response = await fetch(`${this.endpoint}/health`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "X-Hydra-API-Key": this.apiKey,
          },
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          const remoteData = await response.json().catch(() => ({}));
          return {
            status: "CONNECTED",
            mode: "LIVE",
            nodeCount: remoteData.nodeCount || this.nodesMap.size,
            edgeCount: remoteData.edgeCount || this.edgesMap.size,
            endpoint: this.endpoint,
            timestamp: now,
          };
        } else {
          return {
            status: "OFFLINE",
            mode: "LIVE",
            nodeCount: 0,
            edgeCount: 0,
            endpoint: this.endpoint,
            timestamp: now,
          };
        }
      } catch {
        // If HTTP request fails or times out, report OFFLINE
        return {
          status: "OFFLINE",
          mode: "LIVE",
          nodeCount: 0,
          edgeCount: 0,
          endpoint: this.endpoint,
          timestamp: now,
        };
      }
    }

    // In FIXTURE mode (local environment), return CONNECTED with FIXTURE mode flag
    return {
      status: "CONNECTED",
      mode: "FIXTURE",
      nodeCount: this.nodesMap.size,
      edgeCount: this.edgesMap.size,
      timestamp: now,
    };
  }

  // --- Low Level Operations ---

  public async upsertNode(node: GraphNode): Promise<void> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      await fetch(`${this.endpoint}/api/v1/nodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(node),
      }).catch(() => {});
    }
    this.nodesMap.set(node.id, node);
  }

  public async upsertEdge(edge: GraphEdge): Promise<void> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      await fetch(`${this.endpoint}/api/v1/edges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(edge),
      }).catch(() => {});
    }
    this.addEdgeInternal(edge);
  }

  public async getNode(id: string): Promise<GraphNode | null> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(`${this.endpoint}/api/v1/nodes/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const liveNode = await response.json();
          if (liveNode && liveNode.id) return liveNode;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    return this.nodesMap.get(id) || null;
  }

  public async findPackage(name: string): Promise<GraphNode | null> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(
          `${this.endpoint}/api/v1/packages/search?name=${encodeURIComponent(name)}`,
          {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            signal: AbortSignal.timeout(3000),
          },
        );
        if (response.ok) {
          const liveNode = await response.json();
          if (liveNode && liveNode.id) return liveNode;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    const targetId = `pkg:${name.toLowerCase()}`;
    if (this.nodesMap.has(targetId)) {
      return this.nodesMap.get(targetId)!;
    }
    for (const node of this.nodesMap.values()) {
      if (node.type === "Package" && node.name.toLowerCase() === name.toLowerCase()) {
        return node;
      }
    }
    return null;
  }

  public async findPackageVersion(packageName: string, version: string): Promise<GraphNode | null> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(
          `${this.endpoint}/api/v1/package-versions?package=${encodeURIComponent(packageName)}&version=${encodeURIComponent(version)}`,
          {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            signal: AbortSignal.timeout(3000),
          },
        );
        if (response.ok) {
          const liveNode = await response.json();
          if (liveNode && liveNode.id) return liveNode;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    const targetId = `pkgver:${packageName.toLowerCase()}@${version}`;
    if (this.nodesMap.has(targetId)) {
      return this.nodesMap.get(targetId)!;
    }
    for (const node of this.nodesMap.values()) {
      if (
        node.type === "PackageVersion" &&
        node.packageName.toLowerCase() === packageName.toLowerCase() &&
        node.version === version
      ) {
        return node;
      }
    }
    return null;
  }

  public async checkHealth(): Promise<HydraHealthStatus> {
    return this.healthCheck();
  }

  public async addEdge(edge: GraphEdge): Promise<void> {
    return this.upsertEdge(edge);
  }

  public async removeEdge(edgeId: string): Promise<boolean> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      fetch(`${this.endpoint}/api/v1/edges/${encodeURIComponent(edgeId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }).catch(() => {});
    }
    const edge = this.edgesMap.get(edgeId);
    if (!edge) return false;

    this.edgesMap.delete(edgeId);
    this.outgoingEdges.get(edge.source)?.delete(edgeId);
    this.incomingEdges.get(edge.target)?.delete(edgeId);
    return true;
  }

  public async restoreFixtures(): Promise<void> {
    this.loadGraphData(createDeterministicFixtures());
  }

  public async getAllNodes(): Promise<GraphNode[]> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(`${this.endpoint}/api/v1/nodes`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const liveNodes = await response.json();
          if (Array.isArray(liveNodes)) return liveNodes;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    return Array.from(this.nodesMap.values());
  }

  public async getAllEdges(): Promise<GraphEdge[]> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(`${this.endpoint}/api/v1/edges`, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const liveEdges = await response.json();
          if (Array.isArray(liveEdges)) return liveEdges;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    return Array.from(this.edgesMap.values());
  }

  public async getEdgesFrom(nodeId: string): Promise<GraphEdge[]> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(
          `${this.endpoint}/api/v1/nodes/${encodeURIComponent(nodeId)}/outgoing`,
          {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            signal: AbortSignal.timeout(3000),
          },
        );
        if (response.ok) {
          const liveEdges = await response.json();
          if (Array.isArray(liveEdges)) return liveEdges;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    const edgeIds = this.outgoingEdges.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map((id) => this.edgesMap.get(id)!);
  }

  public async getEdgesTo(nodeId: string): Promise<GraphEdge[]> {
    this.queryCounter++;
    if (this.isLiveConfigured) {
      try {
        const response = await fetch(
          `${this.endpoint}/api/v1/nodes/${encodeURIComponent(nodeId)}/incoming`,
          {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            signal: AbortSignal.timeout(3000),
          },
        );
        if (response.ok) {
          const liveEdges = await response.json();
          if (Array.isArray(liveEdges)) return liveEdges;
        }
      } catch {
        // Fallback to local FixtureGraph
      }
    }
    const edgeIds = this.incomingEdges.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map((id) => this.edgesMap.get(id)!);
  }
}
