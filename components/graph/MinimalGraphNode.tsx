"use client";

import { Handle, NodeProps, Position } from "reactflow";

export type MinimalNodeData = {
  category: "PACKAGE" | "VERSION" | "VULNERABILITY" | "REPOSITORY" | "SERVICE" | "ENVIRONMENT" | "MAINTAINER";
  title: string;
  subtitle?: string;
  isCritical?: boolean;
  isTarget?: boolean;
};

export function MinimalGraphNode({ data }: NodeProps<MinimalNodeData>) {
  const { category, title, subtitle, isCritical, isTarget } = data;

  return (
    <div
      className={`min-w-[160px] max-w-[210px] rounded border bg-zinc-950 p-2.5 font-mono text-xs shadow-md transition-all ${
        isCritical
          ? "border-rose-700 text-rose-200 bg-rose-950/20"
          : isTarget
            ? "border-emerald-500 text-emerald-200 bg-emerald-950/20"
            : "border-zinc-800 text-zinc-300 hover:border-zinc-700"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-600 !w-2 !h-2" />

      {/* Header: Category & Red Critical Dot */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1 mb-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
        <span>{category}</span>
        {isCritical && (
          <span className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] text-rose-400 font-bold">ALERT</span>
          </span>
        )}
      </div>

      {/* Body: Title & Subtitle */}
      <div className="font-bold text-zinc-100 truncate text-[11px]" title={title}>
        {title}
      </div>

      {subtitle && (
        <div className="text-[10px] text-zinc-400 truncate mt-0.5" title={subtitle}>
          {subtitle}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-zinc-600 !w-2 !h-2" />
    </div>
  );
}
