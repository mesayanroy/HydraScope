"use client";

import React from "react";
import { BentoGrid, BentoCard } from "../magicui/bento-grid";
import {
  GitFork,
  ShieldCheck,
  Clock,
  Users,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { HighlighterText } from "../magicui/highlighter";

export function LandingBentoSection() {
  const bentoFeatures = [
    {
      Icon: GitFork,
      name: "Transitive Graph Traversal",
      description:
        "Recursively propagates through multi-hop DEPENDS_ON, USED_BY, and RUNS_IN edges in HydraDB to discover affected repositories, services, and cloud environments.",
      badge: "TRACK 02 CORE",
      cta: "Explore Graph Traversal",
    },
    {
      Icon: ShieldCheck,
      name: "OSV Intelligence Enrichment",
      description:
        "Integrates OSV API advisories directly into the graph schema, mapping vulnerability aliases, severity levels, affected semver ranges, and fixed versions.",
      badge: "REAL-TIME OSV",
      cta: "View Advisory Schema",
    },
    {
      Icon: Clock,
      name: "Temporal Exposure Analysis",
      description:
        "Evaluates precise timestamp interval overlaps between service deployment windows and advisory publication dates to isolate true exposure vs safe deployments.",
      badge: "TEMPORAL ENGINE",
      cta: "Calculate Intervals",
    },
    {
      Icon: Users,
      name: "Shared Maintainer Subgraph",
      description:
        "Traverses MAINTAINED_BY and PUBLISHED_BY relationships to identify co-maintained packages across shared maintainer handles, exposing lateral supply-chain risks.",
      badge: "SUBGRAPH TRAVERSAL",
      cta: "Analyze Maintainers",
    },
    {
      Icon: AlertTriangle,
      name: "Typosquat & Risk Heuristics",
      description:
        "Calculates Damerau-Levenshtein edit distances, prefix/suffix manipulations, and maintainer overlap to surface potential typosquatting candidates with clear disclaimers.",
      badge: "HEURISTIC RISK",
      cta: "View Risk Signals",
    },
    {
      Icon: Brain,
      name: "Evidence-Grounded AI Engine",
      description:
        "Feeds verified HydraDB evidence JSON arrays directly to LLMs with zero-hallucination constraints, guaranteeing 100% evidence-backed security explanations.",
      badge: "ZERO-HALLUCINATION",
      cta: "Inspect Grounding",
    },
  ];

  return (
    <section id="bento" className="w-full py-20 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h3 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
            Graph-native security primitives for <HighlighterText>software supply chains</HighlighterText>.
          </h3>
          <p className="text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Conventional vulnerability scanners work on isolated package files. HydraScope models software supply chains as connected property graphs in HydraDB.
          </p>
        </div>

        {/* Bento Grid */}
        <BentoGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bentoFeatures.map((feat, idx) => (
            <BentoCard key={idx} {...feat} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
