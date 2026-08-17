"use client";

import React from "react";
import Link from "next/link";
import { HydraLogo } from "../ui/HydraLogo";
import { ShieldCheck, GitBranch, Terminal, ExternalLink } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-zinc-200 dark:border-zinc-800">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <HydraLogo size={36} showText textClassName="text-xl font-black tracking-tight" />
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Graph-native supply-chain attack-path intelligence powered by HydraDB. Reconstructing transitive reverse dependencies, temporal exposure windows, and maintainer subgraphs.
            </p>
            <div className="flex items-center space-x-3 text-xs font-mono text-zinc-500">
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                <span>HYDRADB ● LIVE</span>
              </span>
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <GitBranch className="w-3.5 h-3.5 text-rose-500" />
                <span>TRACK 02 VALIDATED</span>
              </span>
            </div>
          </div>

          {/* Core Features Navigation */}
          <div className="md:col-span-3 space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Graph Analytics
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/analyzer" className="hover:text-rose-500 transition-colors">
                  Transitive Blast Radius
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="hover:text-rose-500 transition-colors">
                  Temporal Exposure Engine
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="hover:text-rose-500 transition-colors">
                  Shared Maintainer Subgraph
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="hover:text-rose-500 transition-colors">
                  Typosquatting Risk Heuristics
                </Link>
              </li>
              <li>
                <Link href="/analyzer" className="hover:text-rose-500 transition-colors">
                  OSV Intelligence Layer
                </Link>
              </li>
            </ul>
          </div>

          {/* Submission & Hackathon Resources */}
          <div className="md:col-span-4 space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Hack Hydra Submission
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <a
                  href="https://github.com/mesayanroy/HydraScope"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 hover:text-rose-500 transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://hydrascope.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 hover:text-rose-500 transition-colors"
                >
                  <span>Hosted Demo Deployment</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/analyzer" className="hover:text-rose-500 transition-colors">
                  Track 02 Evaluation Harness
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Accreditation Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>© 2026 HydraScope. Open source under MIT License.</p>
          <div className="flex items-center space-x-4">
            <span>Powered by HydraDB</span>
            <span>•</span>
            <span>Hack Hydra Track 02</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
