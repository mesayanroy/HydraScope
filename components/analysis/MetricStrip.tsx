import { BlastRadiusResult } from "@/analysis/blastRadius";

type MetricStripProps = {
  blastRadius: BlastRadiusResult | null;
  vulnerabilityStatus: "VULNERABLE" | "SAFE" | "UNKNOWN";
};

export function MetricStrip({ blastRadius, vulnerabilityStatus }: MetricStripProps) {
  const repoCount = blastRadius?.affectedRepositories.length || 0;
  const serviceCount = blastRadius?.affectedServices.length || 0;
  const prodAssetCount = blastRadius?.affectedProductionAssets.length || 0;
  const pathCount = blastRadius?.attackPaths.length || 0;
  const isProdExposed = blastRadius?.isProductionExposed || false;
  const maxHops = blastRadius?.maxDepthReached || 0;
  const traversalMs = blastRadius?.traversalTimeMs || 0;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 flex items-center justify-between font-mono text-xs overflow-x-auto space-x-4">
      <div className="flex items-center space-x-6 sm:space-x-10 min-w-max">
        {/* Affected Repos */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-zinc-100">{repoCount}</span>
          <span className="text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
            REPOS
          </span>
        </div>

        {/* Affected Services */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-zinc-100">{serviceCount}</span>
          <span className="text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
            SERVICES
          </span>
        </div>

        {/* Production Exposure */}
        <div className="flex items-baseline space-x-2">
          <span
            className={`text-xl sm:text-2xl font-bold ${
              isProdExposed ? "text-rose-400" : "text-zinc-100"
            }`}
          >
            {prodAssetCount}
          </span>
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase ${
              isProdExposed ? "text-rose-400 font-bold" : "text-zinc-400"
            }`}
          >
            PROD {isProdExposed ? "(EXPOSED)" : ""}
          </span>
        </div>

        {/* Attack Paths */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-amber-400">{pathCount}</span>
          <span className="text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
            PATHS
          </span>
        </div>
      </div>

      {/* Technical Status Line: "HydraDB → reverse dependency traversal → N hops" */}
      <div className="hidden md:flex items-center space-x-3 text-[11px] text-zinc-400 shrink-0">
        <span className="text-emerald-400 font-semibold">
          HydraDB → reverse dependency traversal → {maxHops} hops ({traversalMs} ms)
        </span>
        <span>•</span>
        <span
          className={`px-2 py-0.5 rounded font-bold ${
            vulnerabilityStatus === "VULNERABLE"
              ? "bg-rose-950 text-rose-300 border border-rose-800"
              : vulnerabilityStatus === "SAFE"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {vulnerabilityStatus}
        </span>
      </div>
    </div>
  );
}
