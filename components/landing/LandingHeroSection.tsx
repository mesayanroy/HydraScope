"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Terminal, ShieldAlert, Cpu, Sparkles } from "lucide-react";
import { HighlighterText } from "../magicui/highlighter";
import { FileTree, TreeItem } from "../magicui/file-tree";

interface LandingHeroSectionProps {
  onOpenDocsModal: () => void;
}

export function LandingHeroSection({ onOpenDocsModal }: LandingHeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-12 pb-20 border-b border-zinc-200 dark:border-zinc-800">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hackathon Track Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HYDRADB POWERED • TRACK 02 SUPPLY-CHAIN INTELLIGENCE</span>
            </div>

            {/* Main Headline with Highlighter Text */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
              Detect <HighlighterText>transitive blast radius</HighlighterText> with graph-native intelligence.
            </h1>

            {/* Paragraph Description */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed max-w-2xl">
              When a dependency is compromised, standard scanners fail to show which live production microservices consume it. HydraScope executes recursive reverse dependency traversals over <strong className="text-zinc-900 dark:text-zinc-200">HydraDB</strong> property graphs to pinpoint exposed assets, temporal infection windows, and maintainer risks.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/analyzer"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>LAUNCH DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={onOpenDocsModal}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-semibold text-sm transition-colors"
              >
                <BookOpen className="w-4 h-4 text-zinc-500" />
                <span>DOCS (COMING SOON)</span>
              </button>
            </div>

            {/* Quick Stat Tags */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-4 text-xs font-mono text-zinc-500">
              <div>
                <span className="block font-bold text-zinc-900 dark:text-zinc-100 text-base">96%</span>
                <span>Evaluation Precision</span>
              </div>
              <div>
                <span className="block font-bold text-zinc-900 dark:text-zinc-100 text-base">100%</span>
                <span>Incident Recall</span>
              </div>
              <div>
                <span className="block font-bold text-zinc-900 dark:text-zinc-100 text-base">418ms</span>
                <span>P50 Traversal Latency</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Dependency File Tree Preview */}
          <div className="lg:col-span-5" id="tree">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 opacity-20 blur group-hover:opacity-30 transition-opacity" />
              <div className="relative">
                <FileTree className="bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 shadow-xl">
                  <TreeItem name="my-cloud-platform" isFolder isOpenInitial>
                    <TreeItem name="package.json" />
                    <TreeItem name="pnpm-lock.yaml" />
                    <TreeItem name="services" isFolder isOpenInitial>
                      <TreeItem name="checkout-api" isFolder isOpenInitial isAffected>
                        <TreeItem name="src/server.ts" />
                        <TreeItem name="node_modules" isFolder isOpenInitial>
                          <TreeItem name="auth-middleware" version="1.4.0" isAffected>
                            <TreeItem name="node_modules" isFolder isOpenInitial>
                              <TreeItem
                                name="evil-lib"
                                version="2.0.0"
                                isVulnerable
                              />
                            </TreeItem>
                          </TreeItem>
                        </TreeItem>
                      </TreeItem>
                    </TreeItem>
                  </TreeItem>
                </FileTree>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
