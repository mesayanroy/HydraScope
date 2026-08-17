"use client";

import React from "react";
import { DottedMap } from "../magicui/dotted-map";
import { HighlighterText } from "../magicui/highlighter";
import { ShieldCheck, Network, Globe } from "lucide-react";

export function LandingGlobalMapSection() {
  return (
    <section id="map" className="w-full py-20 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-rose-500 uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              <span>GLOBAL ATTACK SURFACE MAP</span>
            </div>

            <h3 className="text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
              Trace propagation across <HighlighterText>cloud regions & deployments</HighlighterText>.
            </h3>

            <p className="text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Vulnerabilities don&apos;t stop at repository lockfiles. HydraScope maps graph paths all the way to cloud environments (`prod-us-east-1`, `eu-central-1`) to show where compromised code is executing live.
            </p>

            <div className="space-y-3 pt-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Deterministic reverse path tracing from compromised package version</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Network className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Real-time telemetry & deployment interval intersection engine</span>
              </div>
            </div>
          </div>

          {/* Dotted Map Canvas */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900/90 p-4 shadow-xl overflow-hidden">
              <DottedMap className="w-full h-auto min-h-[340px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
