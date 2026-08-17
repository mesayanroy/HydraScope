"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { HydraLogo } from "../ui/HydraLogo";

type AppShellProps = PropsWithChildren<{
  ecosystem: "npm" | "pypi";
  onEcosystemChange: (eco: "npm" | "pypi") => void;
}>;

export function AppShell({ ecosystem, onEcosystemChange, children }: AppShellProps) {
  const [dbStatus, setDbStatus] = useState<"CONNECTED" | "CHECKING" | "OFFLINE">("CHECKING");
  const [clientType, setClientType] = useState<"in_memory" | "remote_hydradb">("in_memory");
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [hydraDbUrl, setHydraDbUrl] = useState<string>("https://hydradb.internal.net");
  const [maxDepth, setMaxDepth] = useState<number>(20);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/hydradb/health");
        if (res.ok) {
          const data = await res.json();
          setDbStatus("CONNECTED");
          setClientType(data.clientType || "in_memory");
          setNodeCount(data.nodeCount || 0);
        } else {
          setDbStatus("OFFLINE");
        }
      } catch {
        setDbStatus("OFFLINE");
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono flex flex-col selection:bg-zinc-800 selection:text-zinc-100">
      {/* TOP BAR HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/95 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        {/* Left Side: Brand Logo & Title */}
        <a href="/" className="flex items-center space-x-3 group">
          <HydraLogo size={28} />
          <div>
            <h1 className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
              HYDRA<span className="text-rose-500 font-bold">SCOPE</span>
            </h1>
            <p className="text-[11px] text-zinc-400 font-sans leading-none">
              graph-native supply chain intelligence
            </p>
          </div>
        </a>

        {/* Right Side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mode Pill */}
          <div className="hidden md:flex items-center space-x-1.5 rounded border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{clientType === "remote_hydradb" ? "LIVE HYDRADB" : "FIXTURE MODE"}</span>
          </div>

          {/* Ecosystem Selector */}
          <div className="flex items-center rounded border border-zinc-800 bg-zinc-900 p-0.5 text-xs">
            <button
              onClick={() => onEcosystemChange("npm")}
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                ecosystem === "npm"
                  ? "bg-zinc-800 text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              npm
            </button>
            <button
              onClick={() => onEcosystemChange("pypi")}
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                ecosystem === "pypi"
                  ? "bg-zinc-800 text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              PyPI
            </button>
          </div>

          {/* HydraDB Connected Status Badge */}
          <div className="flex items-center space-x-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                dbStatus === "CONNECTED"
                  ? "bg-emerald-400 animate-pulse"
                  : dbStatus === "CHECKING"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-500 font-bold"
              }`}
            />
            <span className="text-[11px] text-zinc-300 font-mono tracking-wide hidden sm:inline">
              {dbStatus === "CONNECTED"
                ? `HYDRA DB ● CONNECTED ${nodeCount > 0 ? `(${nodeCount} NODES)` : ""}`
                : dbStatus === "CHECKING"
                  ? "HYDRA DB ● CHECKING..."
                  : "HYDRA DB ○ OFFLINE"}
            </span>
            <span className="text-[11px] text-zinc-300 font-mono tracking-wide sm:hidden">
              {dbStatus === "CONNECTED" ? "● CONNECTED" : "○ OFFLINE"}
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            title="HydraDB Settings"
            className="p-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Settings Configuration Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-100">
                HydraDB Server Configuration
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-zinc-100 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  HydraDB Endpoint URL
                </label>
                <input
                  type="text"
                  value={hydraDbUrl}
                  onChange={(e) => setHydraDbUrl(e.target.value)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-[11px] mb-1">
                  Max Graph Traversal Depth
                </label>
                <input
                  type="number"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3 text-[11px] text-zinc-400">
                HydraDB status: <span className="text-emerald-400 font-bold">{dbStatus}</span> ({nodeCount} nodes indexed, mode: {clientType})
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold font-mono text-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5 flex flex-col">
        {children}
      </main>
    </div>
  );
}
