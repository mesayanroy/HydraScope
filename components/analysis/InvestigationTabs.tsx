"use client";

import { useState } from "react";
import { FullAnalysisResult } from "@/analysis";

type InvestigationTabsProps = {
  analysis: FullAnalysisResult | null;
};

export function InvestigationTabs({ analysis }: InvestigationTabsProps) {
  const [activeTab, setActiveTab] = useState<"vulnerability" | "exposure" | "maintainers" | "typosquats" | "evidence">("vulnerability");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-center text-xs text-zinc-500 font-mono">
        Submit a package@version query to inspect vulnerability intelligence, exposure timeline, shared maintainers, typosquats, and graph evidence.
      </div>
    );
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mainAdv = analysis.vulnerabilities.advisories[0];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden font-mono">
      {/* Navigation Bar: VULNERABILITY | EXPOSURE | MAINTAINERS | TYPOSQUATS | EVIDENCE */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/80 px-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab("vulnerability")}
          className={`px-4 py-2.5 font-mono border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "vulnerability"
              ? "border-emerald-400 text-emerald-400 font-bold bg-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          VULNERABILITY ({analysis.vulnerabilities.advisories.length})
        </button>
        <button
          onClick={() => setActiveTab("exposure")}
          className={`px-4 py-2.5 font-mono border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "exposure"
              ? "border-emerald-400 text-emerald-400 font-bold bg-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          EXPOSURE
        </button>
        <button
          onClick={() => setActiveTab("maintainers")}
          className={`px-4 py-2.5 font-mono border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "maintainers"
              ? "border-emerald-400 text-emerald-400 font-bold bg-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          MAINTAINERS ({analysis.maintainers.maintainers.length})
        </button>
        <button
          onClick={() => setActiveTab("typosquats")}
          className={`px-4 py-2.5 font-mono border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "typosquats"
              ? "border-emerald-400 text-emerald-400 font-bold bg-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          TYPOSQUATS ({analysis.typosquats.candidates.length})
        </button>
        <button
          onClick={() => setActiveTab("evidence")}
          className={`px-4 py-2.5 font-mono border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "evidence"
              ? "border-emerald-400 text-emerald-400 font-bold bg-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          EVIDENCE ({analysis.evidence.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 text-xs space-y-4 min-h-[220px]">
        {/* VULNERABILITY TAB (OSV INTELLIGENCE LAYER) */}
        {activeTab === "vulnerability" && (
          <div className="space-y-4">
            {analysis.vulnerabilities.advisories.length === 0 ? (
              <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 text-center text-zinc-400">
                No known OSV vulnerabilities reported for {analysis.packageName}@{analysis.version}.
              </div>
            ) : (
              analysis.vulnerabilities.advisories.map((adv) => (
                <div key={adv.advisoryId} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-zinc-100">{adv.advisoryId}</span>
                      {adv.aliases && adv.aliases.length > 0 && (
                        <span className="text-[11px] text-zinc-400">({adv.aliases.join(", ")})</span>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        adv.severity === "CRITICAL"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : adv.severity === "HIGH"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : adv.severity === "MEDIUM"
                              ? "bg-yellow-950 text-yellow-300 border border-yellow-800"
                              : adv.severity === "LOW"
                                ? "bg-blue-950 text-blue-300 border border-blue-800"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {adv.severity} SEVERITY
                    </span>
                  </div>

                  <p className="text-zinc-200 text-xs font-sans leading-relaxed">{adv.summary}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                    <div className="rounded border border-zinc-800 bg-zinc-950 p-2 space-y-0.5">
                      <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">Introduced</span>
                      <span className="font-bold text-zinc-200">{adv.affectedRange || "All prior versions"}</span>
                    </div>

                    <div className="rounded border border-zinc-800 bg-zinc-950 p-2 space-y-0.5">
                      <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">Fixed Version</span>
                      <span className={`font-bold ${adv.fixedVersion ? "text-emerald-400" : "text-amber-400"}`}>
                        {adv.fixedVersion || "None / Unfixed"}
                      </span>
                    </div>

                    <div className="rounded border border-zinc-800 bg-zinc-950 p-2 space-y-0.5">
                      <span className="text-zinc-500 uppercase tracking-wider block text-[10px]">Published</span>
                      <span className="text-zinc-300">{adv.publishedAt || "Timestamp unavailable"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Advisory References</span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`https://github.com/advisories/${adv.advisoryId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-zinc-700 flex items-center space-x-1"
                      >
                        <span>🔗 OSV / GitHub Advisory</span>
                      </a>
                      {adv.aliases?.map((alias) => (
                        <a
                          key={alias}
                          href={`https://nvd.nist.gov/vuln/detail/${alias}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-zinc-700"
                        >
                          🔗 NVD {alias}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EXPOSURE TAB TIMELINE */}
        {activeTab === "exposure" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2.5 gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-300 font-bold uppercase text-[11px]">Temporal Exposure Status:</span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    analysis.temporalExposure.overallStatus === "EXPOSED"
                      ? "bg-rose-950 text-rose-300 border border-rose-800"
                      : analysis.temporalExposure.overallStatus === "NOT_EXPOSED"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {analysis.temporalExposure.overallStatus}
                </span>
              </div>

              <div className="text-[11px] text-zinc-400">
                Exposure confidence:{" "}
                <span
                  className={`font-bold ${
                    analysis.temporalExposure.overallConfidence === "HIGH"
                      ? "text-emerald-400"
                      : analysis.temporalExposure.overallConfidence === "MEDIUM"
                        ? "text-amber-400"
                        : "text-zinc-500"
                  }`}
                >
                  {analysis.temporalExposure.overallConfidence}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 space-y-3 font-mono text-xs overflow-x-auto">
              <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800 pb-2">
                Horizontal Temporal Exposure Timeline
              </div>

              <div className="space-y-2 whitespace-pre text-[11px] leading-relaxed text-zinc-300">
                <div>PACKAGE LIVE        08:30 ────────────────────── Present ({analysis.packageName}@{analysis.version})</div>
                <div>VULNERABILITY LIVE  09:00 ────────────────────── Present ({mainAdv?.advisoryId || "GHSA Advisory"})</div>
                <div>SERVICE RESOLVED    09:02 ────── 09:06 (checkout-api resolved version)</div>
                <div className="text-amber-300 font-bold">
                  EXPOSURE WINDOW     09:02 ────── 09:06
                </div>
                <div className="text-rose-400 font-bold">
                  {"       ███████████  EXPOSED (4 minutes active overlap window)"}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] text-zinc-400 uppercase font-bold block">
                Affected Service Exposure Records
              </span>

              {analysis.temporalExposure.serviceExposures.length === 0 ? (
                <div className="text-zinc-500 text-xs p-3 rounded border border-zinc-800 bg-zinc-900/40">
                  No active services recorded for temporal resolution.
                </div>
              ) : (
                analysis.temporalExposure.serviceExposures.map((svcExp) => (
                  <div
                    key={svcExp.serviceId}
                    className="rounded border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                      <span className="font-bold text-zinc-100 text-xs">{svcExp.service}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-zinc-500">Confidence: {svcExp.confidence}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            svcExp.status === "EXPOSED"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : svcExp.status === "NOT_EXPOSED"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {svcExp.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400">
                      <div>
                        Dependency Window:{" "}
                        <span className="text-zinc-200">
                          {svcExp.dependencyStart || "N/A"} → {svcExp.dependencyEnd || "Present"}
                        </span>
                      </div>
                      <div>
                        Exposure Window:{" "}
                        <span className="text-amber-300 font-bold">
                          {svcExp.exposureStart || "N/A"} → {svcExp.exposureEnd || "N/A"}
                        </span>
                      </div>
                      {svcExp.durationMinutes !== undefined && (
                        <div>
                          Active Duration:{" "}
                          <span className="text-rose-400 font-bold">{svcExp.durationMinutes} minutes</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 italic pt-1">{svcExp.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAINTAINERS TAB */}
        {activeTab === "maintainers" && (
          <div className="space-y-3">
            <div className="rounded border border-amber-900/40 bg-amber-950/20 p-2.5 text-[11px] text-amber-300">
              ⚠️ {analysis.maintainers.disclaimer}
            </div>

            {analysis.maintainers.maintainers.length === 0 ? (
              <p className="text-zinc-400">No shared maintainers identified for package {analysis.packageName}.</p>
            ) : (
              <div className="space-y-3">
                {analysis.maintainers.maintainers.map((m) => (
                  <div key={m.maintainerId} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                    <div className="flex flex-wrap justify-between items-center border-b border-zinc-800 pb-2.5 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-zinc-100">@{m.username}</span>
                        <span className="text-[11px] text-emerald-400 font-mono">({m.summaryLabel})</span>
                      </div>
                      <span className="text-zinc-400 text-[11px] font-mono">{m.email || "No email listed"}</span>
                    </div>

                    <p className="text-[11px] text-zinc-300">{m.riskRelationship}</p>

                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] text-zinc-400 uppercase font-bold block">
                        Associated Packages ({m.associatedPackages.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.associatedPackages.map((p) => (
                          <span key={p.packageId} className="px-2.5 py-1 rounded border border-zinc-700 bg-zinc-800 text-xs text-zinc-200 font-mono">
                            {p.packageName} ({p.relationshipType})
                          </span>
                        ))}
                      </div>
                    </div>

                    {m.associatedRepositories && m.associatedRepositories.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[11px] text-zinc-400 uppercase font-bold block">
                          Associated Repositories ({m.associatedRepositories.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {m.associatedRepositories.map((r) => (
                            <span key={r.repositoryId} className="px-2.5 py-1 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400 font-mono">
                              📂 {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TYPOSQUATS TAB */}
        {activeTab === "typosquats" && (
          <div className="space-y-3">
            <div className="rounded border border-amber-900/40 bg-amber-950/20 p-2.5 text-[11px] text-amber-300 font-mono">
              ⚠️ Explicitly labeled as heuristic analysis — not proof of compromise.
            </div>

            {analysis.typosquats.candidates.length === 0 ? (
              <p className="text-zinc-400">No typosquat candidates detected above similarity threshold.</p>
            ) : (
              <div className="space-y-3">
                {analysis.typosquats.candidates.map((cand) => (
                  <div key={cand.packageName} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">suspicious nearby package</span>
                        <span className="font-bold text-zinc-100 text-sm">{cand.package || cand.packageName}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">similar to</span>
                        <span className="font-bold text-emerald-400 text-xs">{cand.similarTo || analysis.packageName}</span>
                      </div>

                      <div>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold ${
                            cand.confidence === "HIGH"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : cand.confidence === "MEDIUM"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          CONFIDENCE: {cand.confidence}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Similarity Score: <strong className="text-zinc-200">{(cand.similarity * 100).toFixed(0)}%</strong></span>
                      <span>Edit Distance: <strong className="text-zinc-200">{cand.distance}</strong></span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Observed Signals</span>
                      <ul className="list-disc list-inside text-[11px] text-amber-300 space-y-0.5">
                        {cand.signals.map((sig, idx) => (
                          <li key={idx}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === "evidence" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-400 uppercase">Verified Graph Evidence Chains</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(analysis.evidence, null, 2), "all-evidence")}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] border border-zinc-700"
              >
                {copiedId === "all-evidence" ? "✓ Copied JSON" : "Copy Evidence JSON"}
              </button>
            </div>

            {analysis.evidence.map((item) => (
              <div key={item.evidenceId} className="rounded border border-zinc-800 bg-zinc-900/60 p-3 space-y-1.5 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-emerald-400 font-bold">{item.source}</span>
                  <button
                    onClick={() => copyToClipboard(item.pathString, item.evidenceId)}
                    className="text-zinc-400 hover:text-zinc-200 text-[10px] underline"
                  >
                    {copiedId === item.evidenceId ? "✓ Copied Path" : "Copy Path"}
                  </button>
                </div>
                <p className="text-zinc-200 text-xs font-sans">{item.claim}</p>
                <div className="text-[11px] text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800 break-all">
                  Node ID: {item.nodeId} | Rel: {item.relationship || "PROPAGATES"} | Path: {item.pathString}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
