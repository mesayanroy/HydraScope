"use client";

import { useCallback, useEffect, useState } from "react";
import { ExplanationResult } from "@/ai";
import { FullAnalysisResult } from "@/analysis";
import { AiExplanationPanel } from "@/components/analysis/AiExplanationPanel";
import { CommandSearchBar } from "@/components/analysis/CommandSearchBar";
import { InvestigationTabs } from "@/components/analysis/InvestigationTabs";
import { MetricStrip } from "@/components/analysis/MetricStrip";
import { DependencyGraph } from "@/components/graph/DependencyGraph";
import { AppShell } from "@/components/layout/AppShell";
import { Network, FileText, Brain, LayoutGrid } from "lucide-react";

type MobileTab = "all" | "graph" | "tabs" | "ai";

export default function AnalyzerPage() {
  const [ecosystem, setEcosystem] = useState<"npm" | "pypi">("npm");
  const [queryInput, setQueryInput] = useState<string>("evil-lib@2.0.0");
  const [searchState, setSearchState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<ExplanationResult | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("all");

  const handleSearch = useCallback(
    async (targetQuery?: string) => {
      const rawQuery = targetQuery !== undefined ? targetQuery : queryInput;
      const query = rawQuery.trim();
      if (!query) return;

      let pkgName = "";
      let ver = "";

      if (query.startsWith("@")) {
        const lastIdx = query.lastIndexOf("@");
        pkgName = query.substring(0, lastIdx);
        ver = query.substring(lastIdx + 1);
      } else if (query.includes("@")) {
        const parts = query.split("@");
        pkgName = parts[0];
        ver = parts[1];
      } else {
        pkgName = query;
        ver = ecosystem === "pypi" ? "2.28.1" : "2.0.0";
      }

      setSearchState("loading");
      setErrorMsg(null);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package: pkgName, version: ver }),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.message || data.error || "package not found");
          setSearchState("error");
          setAnalysisResult(null);
          setAiExplanation(null);
        } else {
          setAnalysisResult(data.analysis);
          setAiExplanation(data.aiExplanation);
          setSearchState("success");
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "HYDRA DB UNAVAILABLE");
        setSearchState("error");
        setAnalysisResult(null);
        setAiExplanation(null);
      }
    },
    [queryInput, ecosystem],
  );

  // Auto-load demo query on launch
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      setSearchState("loading");
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ package: "evil-lib", version: "2.0.0" }),
        });
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setAnalysisResult(data.analysis);
            setAiExplanation(data.aiExplanation);
            setSearchState("success");
          } else {
            setErrorMsg(data.message || data.error);
            setSearchState("error");
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : "HYDRA DB UNAVAILABLE");
          setSearchState("error");
        }
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut Ctrl/Cmd + Enter to execute search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSearch]);

  return (
    <AppShell ecosystem={ecosystem} onEcosystemChange={setEcosystem}>
      {/* 1. LARGE PACKAGE SEARCH INPUT & EXAMPLE CHIPS */}
      <section>
        <CommandSearchBar
          queryInput={queryInput}
          setQueryInput={setQueryInput}
          onSearch={handleSearch}
          searchState={searchState}
          activePackageName={analysisResult?.packageName}
          activeVersion={analysisResult?.version}
          errorMessage={errorMsg}
          ecosystem={ecosystem}
        />
      </section>

      {/* ERROR BANNER FOR FAILED SEARCHES */}
      {searchState === "error" && errorMsg && (
        <section className="rounded-lg border border-rose-800/80 bg-rose-950/40 p-4 font-mono text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold uppercase text-rose-400">Error:</span>
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => handleSearch()}
            className="px-3 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 font-mono text-[11px] font-bold"
          >
            RETRY
          </button>
        </section>
      )}

      {/* MOBILE NATIVE APP VIEW SEGMENTED CONTROLLER */}
      <section className="lg:hidden flex items-center justify-between p-1 rounded-lg border border-zinc-800 bg-zinc-900 font-mono text-xs">
        <button
          onClick={() => setMobileTab("all")}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded transition-colors ${
            mobileTab === "all" ? "bg-zinc-800 text-emerald-400 font-bold" : "text-zinc-400"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>ALL</span>
        </button>
        <button
          onClick={() => setMobileTab("graph")}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded transition-colors ${
            mobileTab === "graph" ? "bg-zinc-800 text-emerald-400 font-bold" : "text-zinc-400"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>GRAPH</span>
        </button>
        <button
          onClick={() => setMobileTab("tabs")}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded transition-colors ${
            mobileTab === "tabs" ? "bg-zinc-800 text-emerald-400 font-bold" : "text-zinc-400"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>TABS</span>
        </button>
        <button
          onClick={() => setMobileTab("ai")}
          className={`flex-1 flex items-center justify-center space-x-1 py-1.5 rounded transition-colors ${
            mobileTab === "ai" ? "bg-zinc-800 text-rose-400 font-bold" : "text-zinc-400"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>AI</span>
        </button>
      </section>

      {/* 2. STAT ROW (REPOS | SERVICES | PRODUCTION | ATTACK PATHS) */}
      {(mobileTab === "all" || mobileTab === "graph") && (
        <section>
          <MetricStrip
            blastRadius={analysisResult?.blastRadius || null}
            vulnerabilityStatus={analysisResult?.vulnerabilities.status || "UNKNOWN"}
          />
        </section>
      )}

      {/* 3. MAIN GRAPH (React Flow Canvas) */}
      {(mobileTab === "all" || mobileTab === "graph") && (
        <section className="w-full h-[400px] sm:h-[560px] flex flex-col">
          <DependencyGraph analysisResult={analysisResult} />
        </section>
      )}

      {/* 4. BELOW GRAPH: COMPACT TABS + RIGHT-SIDE AI EXPLANATION PANEL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Columns: Compact Tabs (EXPOSURE, MAINTAINERS, TYPOSQUATS, EVIDENCE) */}
        {(mobileTab === "all" || mobileTab === "tabs") && (
          <div className="lg:col-span-7">
            <InvestigationTabs analysis={analysisResult} />
          </div>
        )}

        {/* Right 5 Columns: Compact AI Explanation Panel ("Why is this dangerous?") */}
        {(mobileTab === "all" || mobileTab === "ai") && (
          <div className="lg:col-span-5">
            <AiExplanationPanel analysis={analysisResult} aiExplanation={aiExplanation} />
          </div>
        )}
      </section>
    </AppShell>
  );
}
