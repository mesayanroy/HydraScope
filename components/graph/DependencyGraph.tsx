"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { FullAnalysisResult } from "@/analysis";
import { MinimalGraphNode, MinimalNodeData } from "./MinimalGraphNode";

type DependencyGraphProps = {
  analysisResult: FullAnalysisResult | null;
  onSelectNode?: (nodeId: string, nodeType: string, label: string) => void;
};

type NodeDetail = {
  id: string;
  name: string;
  type: string;
  category: string;
  version?: string;
  relationships: string;
  source: string;
  timestamps: string;
  reasonWhyNode: string;
};

const nodeTypes = {
  minimal: MinimalGraphNode,
};

function DependencyGraphContent({ analysisResult, onSelectNode }: DependencyGraphProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [hoveredNode, setHoveredNode] = useState<{ id: string; label: string; type: string } | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);

  // Compute graph nodes & edges from analysis result
  const initialGraphData = useMemo(() => {
    if (!analysisResult || !analysisResult.blastRadius) {
      // Default demo graph for initial load
      const defaultNodes: Node<MinimalNodeData>[] = [
        {
          id: "pkg:evil-lib",
          type: "minimal",
          position: { x: 40, y: 160 },
          data: { category: "PACKAGE", title: "evil-lib", subtitle: "Target Package", isTarget: true },
        },
        {
          id: "pkgver:evil-lib@2.0.0",
          type: "minimal",
          position: { x: 230, y: 160 },
          data: { category: "VERSION", title: "2.0.0", subtitle: "evil-lib@2.0.0", isCritical: true },
        },
        {
          id: "vuln:GHSA-evil-2026-9999",
          type: "minimal",
          position: { x: 230, y: 40 },
          data: { category: "VULNERABILITY", title: "GHSA-evil-2026-9999", subtitle: "CRITICAL RCE", isCritical: true },
        },
        {
          id: "pkgver:auth-middleware@1.4.0",
          type: "minimal",
          position: { x: 430, y: 160 },
          data: { category: "VERSION", title: "auth-middleware", subtitle: "v1.4.0" },
        },
        {
          id: "repo:checkout-repo",
          type: "minimal",
          position: { x: 630, y: 160 },
          data: { category: "REPOSITORY", title: "org/checkout-service", subtitle: "Private Repo" },
        },
        {
          id: "svc:checkout-api",
          type: "minimal",
          position: { x: 830, y: 160 },
          data: { category: "SERVICE", title: "checkout-api", subtitle: "4 min active exposure", isCritical: true },
        },
        {
          id: "env:prod-us-east-1",
          type: "minimal",
          position: { x: 1030, y: 160 },
          data: { category: "ENVIRONMENT", title: "prod-us-east-1", subtitle: "Production (Exposed)", isCritical: true },
        },
      ];

      const defaultEdges: Edge[] = [
        { id: "e1", source: "pkg:evil-lib", target: "pkgver:evil-lib@2.0.0", label: "HAS_VERSION", style: { stroke: "#3f3f46", strokeWidth: 1 } },
        { id: "e2", source: "pkgver:evil-lib@2.0.0", target: "vuln:GHSA-evil-2026-9999", label: "AFFECTED_BY", animated: true, style: { stroke: "#f43f5e", strokeWidth: 1.2 } },
        { id: "e3", source: "pkgver:auth-middleware@1.4.0", target: "pkgver:evil-lib@2.0.0", label: "DEPENDS_ON", style: { stroke: "#3f3f46", strokeWidth: 1 } },
        { id: "e4", source: "pkgver:auth-middleware@1.4.0", target: "repo:checkout-repo", label: "USED_BY", style: { stroke: "#3f3f46", strokeWidth: 1 } },
        { id: "e5", source: "repo:checkout-repo", target: "svc:checkout-api", label: "USED_BY", style: { stroke: "#3f3f46", strokeWidth: 1 } },
        { id: "e6", source: "svc:checkout-api", target: "env:prod-us-east-1", label: "RUNS_IN", animated: true, style: { stroke: "#f43f5e", strokeWidth: 1.2 } },
      ];

      return { nodes: defaultNodes, edges: defaultEdges };
    }

    // Dynamic graph construction from FullAnalysisResult
    const dynamicNodes: Node<MinimalNodeData>[] = [];
    const dynamicEdges: Edge[] = [];
    const addedNodeIds = new Set<string>();

    const targetPkgId = `pkg:${analysisResult.packageName}`;
    const targetVerId = `pkgver:${analysisResult.packageName}@${analysisResult.version}`;

    // Target Package
    dynamicNodes.push({
      id: targetPkgId,
      type: "minimal",
      position: { x: 40, y: 180 },
      data: { category: "PACKAGE", title: analysisResult.packageName, subtitle: "Target Package", isTarget: true },
    });
    addedNodeIds.add(targetPkgId);

    // Target Version
    const isVuln = analysisResult.vulnerabilities.status === "VULNERABLE";
    dynamicNodes.push({
      id: targetVerId,
      type: "minimal",
      position: { x: 240, y: 180 },
      data: {
        category: "VERSION",
        title: analysisResult.version,
        subtitle: `${analysisResult.packageName}@${analysisResult.version}`,
        isCritical: isVuln,
      },
    });
    addedNodeIds.add(targetVerId);

    dynamicEdges.push({
      id: `e-hasver`,
      source: targetPkgId,
      target: targetVerId,
      label: "HAS_VERSION",
      style: { stroke: "#3f3f46", strokeWidth: 1 },
    });

    // Vulnerability Nodes
    if (analysisResult.vulnerabilities.advisories.length > 0) {
      analysisResult.vulnerabilities.advisories.forEach((v, idx) => {
        const vId = `vuln:${v.advisoryId}`;
        dynamicNodes.push({
          id: vId,
          type: "minimal",
          position: { x: 240, y: 40 + idx * 75 },
          data: {
            category: "VULNERABILITY",
            title: v.advisoryId,
            subtitle: `${v.severity} Severity`,
            isCritical: true,
          },
        });
        addedNodeIds.add(vId);

        dynamicEdges.push({
          id: `edge-${targetVerId}-${vId}`,
          source: targetVerId,
          target: vId,
          label: "AFFECTED_BY",
          animated: true,
          style: { stroke: "#f43f5e", strokeWidth: 1.2 },
        });
      });
    }

    // Process Attack Paths for Blast Radius
    if (analysisResult.blastRadius) {
      const colBaseX = 440;
      analysisResult.blastRadius.attackPaths.forEach((path) => {
        path.forEach((step, stepIdx) => {
          if (stepIdx === 0) return; // Skip target
          const posX = colBaseX + (stepIdx - 1) * 200;
          const posY = 180 + ((dynamicNodes.length * 37) % 260) - 130;

          if (!addedNodeIds.has(step.nodeId)) {
            let cat: MinimalNodeData["category"] = "VERSION";
            let isCrit = false;

            if (step.nodeType === "Repository") cat = "REPOSITORY";
            else if (step.nodeType === "Service") {
              cat = "SERVICE";
              isCrit = analysisResult.blastRadius?.isProductionExposed || false;
            } else if (step.nodeType === "Environment") {
              cat = "ENVIRONMENT";
              isCrit = step.nodeName.toLowerCase().includes("prod");
            } else if (step.nodeType === "Maintainer") cat = "MAINTAINER";

            dynamicNodes.push({
              id: step.nodeId,
              type: "minimal",
              position: { x: posX, y: posY },
              data: {
                category: cat,
                title: step.nodeName,
                subtitle: step.nodeType,
                isCritical: isCrit,
              },
            });
            addedNodeIds.add(step.nodeId);
          }

          const prevStep = path[stepIdx - 1];
          const edgeId = `edge-${prevStep.nodeId}-${step.nodeId}`;
          if (!dynamicEdges.some((e) => e.id === edgeId)) {
            const isProdPath = step.nodeType === "Environment" && step.nodeName.toLowerCase().includes("prod");
            dynamicEdges.push({
              id: edgeId,
              source: prevStep.nodeId,
              target: step.nodeId,
              label: step.relationship || "PROPAGATES",
              animated: isProdPath,
              style: {
                stroke: isProdPath ? "#f43f5e" : "#3f3f46",
                strokeWidth: isProdPath ? 1.2 : 1,
              },
            });
          }
        });
      });
    }

    return { nodes: dynamicNodes, edges: dynamicEdges };
  }, [analysisResult]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraphData.edges);

  useEffect(() => {
    setNodes(initialGraphData.nodes);
    setEdges(initialGraphData.edges);
  }, [initialGraphData, setNodes, setEdges]);

  const handleReset = useCallback(() => {
    fitView({ padding: 0.2, duration: 400 });
  }, [fitView]);

  return (
    <div className="relative flex-1 min-h-[500px] sm:min-h-[560px] w-full rounded border border-zinc-800 bg-zinc-950 overflow-hidden font-mono select-none">
      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={(_, node) =>
          setHoveredNode({ id: node.id, label: String(node.data.title), type: node.data.category })
        }
        onNodeMouseLeave={() => setHoveredNode(null)}
        onNodeClick={(_, node) => {
          const category = String(node.data.category);
          const name = String(node.data.title);
          let reasonWhyNode = "Graph node included in supply chain reverse dependency traversal.";
          let relationships = "DEPENDS_ON / USED_BY";
          let source = "HydraDB Graph Store";
          let timestamps = "2026-08-16T09:00:00.000Z";

          if (category === "PACKAGE") {
            reasonWhyNode = "Target package analyzed for downstream transitive blast radius exposure.";
            relationships = "HAS_VERSION (outgoing)";
          } else if (category === "VERSION") {
            reasonWhyNode = "Vulnerable package version triggering downstream reverse dependency propagation.";
            relationships = "DEPENDS_ON (incoming), AFFECTED_BY (outgoing)";
          } else if (category === "VULNERABILITY") {
            reasonWhyNode = "Advisory mapped directly to package version in HydraDB graph.";
            relationships = "AFFECTED_BY (incoming)";
            source = "OSV Advisory Intelligence Feed";
          } else if (category === "REPOSITORY") {
            reasonWhyNode = "Repository declaring target package version in its dependency manifest.";
            relationships = "USED_BY (incoming from package, outgoing to service)";
          } else if (category === "SERVICE") {
            reasonWhyNode = "Application service built from repository; exposed during deployment window.";
            relationships = "USED_BY (incoming), RUNS_IN (outgoing)";
            timestamps = "Active 09:02 to 09:06 (4 min window)";
          } else if (category === "ENVIRONMENT") {
            reasonWhyNode = "Production cloud environment hosting live active instances of affected service.";
            relationships = "RUNS_IN (incoming)";
          } else if (category === "MAINTAINER") {
            reasonWhyNode = "Publisher/Maintainer associated with package nodes across HydraDB.";
            relationships = "MAINTAINED_BY / PUBLISHED_BY";
          }

          setSelectedNode({
            id: node.id,
            name,
            type: String(node.data.subtitle || node.data.category),
            category,
            version: category === "VERSION" ? name : undefined,
            relationships,
            source,
            timestamps,
            reasonWhyNode,
          });

          if (onSelectNode) {
            onSelectNode(node.id, category, name);
          }
        }}
        fitView
      >
        {/* Subtle dot grid pattern */}
        <Background variant={BackgroundVariant.Dots} color="#27272a" gap={18} size={1} />
      </ReactFlow>

      {/* Graph Toolbar Controls */}
      <div className="absolute top-3 left-3 flex items-center space-x-1.5 rounded border border-zinc-800 bg-zinc-900/90 p-1 backdrop-blur text-xs z-10">
        <button
          onClick={() => zoomIn({ duration: 300 })}
          title="Zoom In"
          className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
        >
          +
        </button>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          title="Zoom Out"
          className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
        >
          -
        </button>
        <button
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
          title="Fit View"
          className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 font-bold"
        >
          FIT
        </button>
        <button
          onClick={handleReset}
          title="Reset Graph View"
          className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
        >
          RESET
        </button>
      </div>

      {/* Hover Status Bar */}
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900/90 text-[11px] text-zinc-300 backdrop-blur z-10">
          <span className="text-emerald-400 font-bold">{hoveredNode.type}:</span> {hoveredNode.label}
        </div>
      )}

      {/* Node Detail Drawer Overlay */}
      {selectedNode && (
        <div className="absolute right-3 top-3 w-80 rounded border border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur shadow-2xl space-y-3 z-20 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-rose-400">
              WHY THIS NODE?
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-400 hover:text-zinc-100 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-900/60 p-2 rounded border border-zinc-800">
            {selectedNode.reasonWhyNode}
          </p>

          <div className="space-y-1.5 text-[11px] border-t border-zinc-800/80 pt-2 text-zinc-400">
            <div>Type: <span className="text-zinc-200 font-bold">{selectedNode.type}</span></div>
            <div>Name: <span className="text-zinc-200 font-bold">{selectedNode.name}</span></div>
            {selectedNode.version && (
              <div>Version: <span className="text-emerald-400 font-bold">{selectedNode.version}</span></div>
            )}
            <div>Relationships: <span className="text-amber-300">{selectedNode.relationships}</span></div>
            <div>Source: <span className="text-zinc-300">{selectedNode.source}</span></div>
            <div>Timestamps: <span className="text-zinc-400">{selectedNode.timestamps}</span></div>
            <div className="text-[10px] text-zinc-500 pt-1 break-all">ID: {selectedNode.id}</div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
            <button
              onClick={() => fitView({ nodes: [{ id: selectedNode.id }], duration: 500, maxZoom: 1.5 })}
              className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold"
            >
              Focus Node
            </button>
            <span className="text-[10px] text-zinc-500">Click canvas to dismiss</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function DependencyGraph(props: DependencyGraphProps) {
  return (
    <ReactFlowProvider>
      <DependencyGraphContent {...props} />
    </ReactFlowProvider>
  );
}
