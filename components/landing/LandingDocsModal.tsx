"use client";

import React from "react";
import { X, BookOpen, Terminal, Code, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LandingDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingDocsModal({ isOpen, onClose }: LandingDocsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-5 font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              HYDRASCOPE DOCUMENTATION
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
              COMING SOON
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Official API documentation and HydraDB graph schema guides are currently being compiled for the submission release.
          </p>

          {/* Code Snippet Box */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-zinc-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1 border-b border-zinc-800">
              <span>POST /api/analyze</span>
              <span>cURL Query Example</span>
            </div>
            <pre className="text-[11px] font-mono overflow-x-auto text-rose-400">
{`curl -X POST https://hydrascope.vercel.app/api/analyze \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <HYDRA_API_KEY>" \\
  -d '{"package": "evil-lib", "version": "2.0.0"}'`}
            </pre>
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-wide">
              Key Graph Schema Specification:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-600 dark:text-zinc-400">
              <li><strong className="text-zinc-900 dark:text-zinc-200">PackageVersion</strong>: `packageName`, `version`, `publishedAt`</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">DEPENDS_ON</strong>: Lockfile dependency edge connecting version nodes</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">USED_BY</strong>: Usage edge connecting versions to repositories & services</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">RUNS_IN</strong>: Deployment edge connecting services to cloud environments</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-3 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors"
          >
            Close Preview
          </button>

          <Link
            href="/analyzer"
            onClick={onClose}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>OPEN LIVE DASHBOARD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
