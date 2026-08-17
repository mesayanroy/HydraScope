"use client";

import React, { useState, ReactNode } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, ShieldAlert, CheckCircle2 } from "lucide-react";

interface FileTreeItemProps {
  name: string;
  isFolder?: boolean;
  isOpenInitial?: boolean;
  isVulnerable?: boolean;
  isAffected?: boolean;
  children?: ReactNode;
  version?: string;
}

export function FileTree({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`font-mono text-xs select-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 shadow-inner ${className}`}>
      <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
        <span>LOCKFILE & GRAPH DEPENDENCY TREE</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function TreeItem({
  name,
  isFolder = false,
  isOpenInitial = true,
  isVulnerable = false,
  isAffected = false,
  version,
  children,
}: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(isOpenInitial);

  return (
    <div className="pl-3">
      <div
        onClick={() => isFolder && setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 py-1 px-2 rounded cursor-pointer transition-colors ${
          isVulnerable
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20"
            : isAffected
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
              : "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {isFolder ? (
          <>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
            {isOpen ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />}
          </>
        ) : (
          <FileText className="w-4 h-4 text-zinc-400" />
        )}

        <span className="truncate">{name}</span>

        {version && <span className="text-[10px] opacity-75 font-mono">@{version}</span>}

        {isVulnerable && (
          <span className="ml-auto flex items-center space-x-1 text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3" />
            <span>VULNERABLE</span>
          </span>
        )}

        {isAffected && !isVulnerable && (
          <span className="ml-auto text-[10px] text-amber-500 font-mono">EXPOSED</span>
        )}
      </div>

      {isFolder && isOpen && children && <div className="ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-1">{children}</div>}
    </div>
  );
}
