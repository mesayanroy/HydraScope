import { AppShell } from "@/components/layout/AppShell";

const plannedCapabilities = [
  "package/version ingestion",
  "dependency graph",
  "reverse dependency traversal",
  "transitive blast-radius analysis",
  "vulnerability/advisory enrichment",
  "version-range analysis",
  "temporal exposure analysis",
  "shared maintainer analysis",
  "typosquat heuristics",
  "graph evidence",
  "AI explanation grounded strictly in graph evidence",
  "HydraDB integration",
  "performance/evaluation benchmarking",
  "security testing",
];

export default function Home() {
  return (
    <AppShell title="HydraScope" subtitle="Graph-native developer security intelligence">
      <section className="space-y-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Initial foundation for Hydra Track 02 — Repos, Dependencies + Code as Graphs.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {plannedCapabilities.map((capability) => (
            <li
              key={capability}
              className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {capability}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
