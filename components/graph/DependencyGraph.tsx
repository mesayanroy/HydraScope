"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";

export function DependencyGraph() {
  const nodes = useMemo<Node[]>(
    () => [
      { id: "pkg", position: { x: 0, y: 0 }, data: { label: "package@version" } },
      { id: "repo", position: { x: 220, y: 0 }, data: { label: "repository" } },
      { id: "svc", position: { x: 440, y: 0 }, data: { label: "service" } },
    ],
    [],
  );

  const edges = useMemo<Edge[]>(
    () => [
      { id: "e1", source: "pkg", target: "repo" },
      { id: "e2", source: "repo", target: "svc" },
    ],
    [],
  );

  return (
    <div className="h-64 w-full rounded border border-zinc-200 dark:border-zinc-800">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
