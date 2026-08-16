import { BlastRadiusResult } from "@/analysis/blastRadius";

type MetricsOverviewProps = {
  blastRadius: BlastRadiusResult | null;
  vulnerabilityStatus: "VULNERABLE" | "SAFE" | "UNKNOWN";
};

export function MetricsOverview({ blastRadius, vulnerabilityStatus }: MetricsOverviewProps) {
  const affectedRepos = blastRadius?.affectedRepositories.length || 0;
  const affectedServices = blastRadius?.affectedServices.length || 0;
  const affectedEnvs = blastRadius?.affectedEnvironments.length || 0;
  const attackPaths = blastRadius?.attackPaths.length || 0;
  const isProd = blastRadius?.isProductionExposed || false;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Metric 1 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Affected Repositories</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-zinc-100">{affectedRepos}</span>
          <span className="text-xs text-zinc-400 font-sans">git repos</span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Affected Services</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-zinc-100">{affectedServices}</span>
          <span className="text-xs text-zinc-400 font-sans">microservices</span>
        </div>
      </div>

      {/* Metric 3 */}
      <div
        className={`rounded-lg border p-4 flex flex-col justify-between ${
          isProd
            ? "border-rose-800/80 bg-rose-950/20 text-rose-300"
            : "border-zinc-800 bg-zinc-900/60 text-zinc-100"
        }`}
      >
        <span className="text-[11px] uppercase tracking-wider font-mono opacity-80">Production Status</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-lg font-bold font-mono">
            {isProd ? "🚨 EXPOSED" : vulnerabilityStatus === "UNKNOWN" ? "UNKNOWN" : "SECURE"}
          </span>
          <span className="text-xs font-sans opacity-80">{affectedEnvs} envs</span>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Attack Paths</span>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-amber-400">{attackPaths}</span>
          <span className="text-xs text-zinc-400 font-sans">transitive paths</span>
        </div>
      </div>
    </div>
  );
}
