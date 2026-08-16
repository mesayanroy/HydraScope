"use client";

import { GroundedAiExplanation } from "@/ai";
import { FullAnalysisResult } from "@/analysis";

type AiExplanationPanelProps = {
  analysis: FullAnalysisResult | null;
  aiExplanation: GroundedAiExplanation | null;
};

export function AiExplanationPanel({ analysis, aiExplanation }: AiExplanationPanelProps) {
  if (!analysis) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-500 space-y-2">
        <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
          <span className="h-2 w-2 rounded-full bg-purple-400" />
          <span className="font-bold uppercase tracking-wider text-purple-300">Why is this dangerous?</span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          Select or analyze a package to generate deterministic security findings and AI explanation insights.
        </p>
      </div>
    );
  }

  const isVuln = analysis.vulnerabilities.status === "VULNERABLE";
  const mainAdv = analysis.vulnerabilities.advisories[0];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs space-y-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <h3 className="font-bold uppercase tracking-wider text-purple-300 text-xs">
            Why is this dangerous?
          </h3>
        </div>
        <span className="text-[10px] text-zinc-500 border border-zinc-800 rounded px-1.5 py-0.5">
          EVIDENCE-GROUNDED AI
        </span>
      </div>

      {/* Primary Security Finding */}
      <div
        className={`p-3 rounded border text-xs leading-relaxed ${
          isVuln
            ? "border-rose-900/80 bg-rose-950/20 text-rose-200"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
        }`}
      >
        <span className="font-bold text-zinc-100 block mb-1">
          {analysis.packageName}@{analysis.version}
        </span>
        {aiExplanation?.summary ||
          (isVuln
            ? `Critical vulnerability ${mainAdv?.advisoryId || ""} (${mainAdv?.severity || ""}) detected in graph.`
            : "No active critical vulnerabilities recorded in graph for this version.")}
      </div>

      {/* Attack Paths Walkthrough */}
      {aiExplanation && aiExplanation.attackPathWalkthrough.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
            Transitive Attack Vector
          </span>
          <div className="space-y-1.5">
            {aiExplanation.attackPathWalkthrough.map((path, idx) => (
              <div
                key={idx}
                className="p-2 rounded border border-zinc-800 bg-zinc-900/70 text-[11px] text-zinc-300 font-mono break-all"
              >
                {path}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temporal Active Exposure Timeline */}
      {aiExplanation?.exposureExplanation && (
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
            Exposure Assessment
          </span>
          <p className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-800">
            {aiExplanation.exposureExplanation}
          </p>
        </div>
      )}

      {/* Recommended Remediation Steps */}
      {aiExplanation && aiExplanation.investigationSteps.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-zinc-800">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
            Actionable Remediation
          </span>
          <ul className="space-y-1 text-[11px] text-zinc-300">
            {aiExplanation.investigationSteps.map((step, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-emerald-400 select-none">›</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-[10px] text-zinc-500 pt-1 text-right">
        Determined from {analysis.evidence.length} graph evidence nodes
      </div>
    </div>
  );
}
