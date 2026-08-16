"use client";

import { ExplanationResult, getExplanationService } from "@/ai";
import { FullAnalysisResult } from "@/analysis";

type AiExplanationPanelProps = {
  analysis: FullAnalysisResult | null;
  aiExplanation?: ExplanationResult | null;
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
          Submit a package@version query to generate evidence-grounded security explanation insights.
        </p>
      </div>
    );
  }

  // Fallback to deterministic ExplanationService if props is empty
  const explanation: ExplanationResult =
    aiExplanation || getExplanationService().generateDeterministicExplanation(analysis);

  const isVuln = analysis.vulnerabilities.status === "VULNERABLE";

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs space-y-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          <h3 className="font-bold uppercase tracking-wider text-purple-300 text-xs">
            Why is this dangerous?
          </h3>
        </div>
        <span className="text-[10px] text-zinc-400 border border-zinc-800 rounded px-1.5 py-0.5">
          {explanation.isAiGenerated ? "AI GENERATED" : "HYDRA EVIDENCE"}
        </span>
      </div>

      {/* 1. What happened? */}
      <div
        className={`p-3 rounded border text-xs leading-relaxed ${
          isVuln
            ? "border-rose-900/80 bg-rose-950/20 text-rose-200"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
        }`}
      >
        <span className="font-bold text-zinc-100 uppercase text-[10px] tracking-wider block mb-1">
          1. What happened?
        </span>
        <p className="text-[11px] leading-relaxed">{explanation.whatHappened}</p>
      </div>

      {/* 2. What is affected? */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
          2. What is affected?
        </span>
        <p className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded border border-zinc-800 leading-relaxed">
          {explanation.whatIsAffected}
        </p>
      </div>

      {/* 3. Why is it affected? */}
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
          3. Why is it affected?
        </span>
        <p className="text-[11px] text-zinc-300 bg-zinc-900/60 p-2.5 rounded border border-zinc-800 leading-relaxed">
          {explanation.whyIsItAffected}
        </p>
      </div>

      {/* 4. What is the highest-risk path? */}
      <div className="space-y-1">
        <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">
          4. What is the highest-risk path?
        </span>
        <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/80 text-[11px] text-zinc-200 font-mono break-all leading-relaxed">
          {explanation.highestRiskPath}
        </div>
      </div>

      {/* 5. What should the developer investigate first? */}
      <div className="space-y-1.5 pt-1 border-t border-zinc-800">
        <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
          5. What should the developer investigate first?
        </span>
        <ul className="space-y-1.5 text-[11px] text-zinc-300">
          {explanation.whatToInvestigateFirst.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-1.5 bg-zinc-900/40 p-1.5 rounded border border-zinc-800/80">
              <span className="text-emerald-400 font-bold select-none">›</span>
              <span className="leading-normal">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Label */}
      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-900 text-right font-mono italic">
        {explanation.footerLabel}
      </div>
    </div>
  );
}
