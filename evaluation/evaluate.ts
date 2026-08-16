import fs from "fs";
import path from "path";
import { runFullAnalysis } from "../analysis";
import { getHydraDBAdapter } from "../lib/hydra/adapter";

type GroundTruthTestCase = {
  incidentId: string;
  packageName: string;
  version: string;
  ecosystem: string;
  description: string;
  groundTruthNodeIds: string[];
};

type EvaluationResultRow = {
  incidentId: string;
  packageVersion: string;
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  latencyMs: number;
  hydraDbQueries: number;
  externalApiCalls: number;
};

export async function runEvaluationHarness(): Promise<{
  rows: EvaluationResultRow[];
  p50LatencyMs: number;
  p95LatencyMs: number;
  overallPrecision: number;
  overallRecall: number;
  avgHydraQueries: number;
  avgExternalCalls: number;
}> {
  const adapter = getHydraDBAdapter();
  const client = adapter.getClient();
  await client.restoreFixtures();

  const fixturePath = path.join(process.cwd(), "evaluation", "ground-truth.example.json");
  const rawData = fs.readFileSync(fixturePath, "utf-8");
  const testCases: GroundTruthTestCase[] = JSON.parse(rawData);

  const rows: EvaluationResultRow[] = [];
  const latencies: number[] = [];
  let totalTp = 0;
  let totalFp = 0;
  let totalFn = 0;
  let totalQueries = 0;
  let totalExtCalls = 0;

  for (const tc of testCases) {
    const start = performance.now();
    const analysis = await runFullAnalysis(client, tc.packageName, tc.version);
    const end = performance.now();
    const duration = Number((end - start).toFixed(2));
    latencies.push(duration);

    const groundTruthSet = new Set(tc.groundTruthNodeIds);
    const detectedSet = new Set<string>();

    if (analysis.blastRadius) {
      detectedSet.add(`pkgver:${tc.packageName}@${tc.version}`);
      analysis.blastRadius.affectedPackages.forEach((p) => detectedSet.add(p.id));
      analysis.blastRadius.affectedRepositories.forEach((r) => detectedSet.add(r.id));
      analysis.blastRadius.affectedServices.forEach((s) => detectedSet.add(s.id));
      analysis.blastRadius.affectedEnvironments.forEach((e) => detectedSet.add(e.id));
    } else {
      detectedSet.add(`pkgver:${tc.packageName}@${tc.version}`);
    }

    let tp = 0;
    let fp = 0;
    let fn = 0;

    for (const id of detectedSet) {
      if (groundTruthSet.has(id)) {
        tp++;
      } else {
        fp++;
      }
    }

    for (const id of groundTruthSet) {
      if (!detectedSet.has(id)) {
        fn++;
      }
    }

    const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(2)) : 1.0;
    const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(2)) : 1.0;
    const hydraDbQueries = analysis.hydraDbQueryCount || 1;
    const externalApiCalls = analysis.vulnerabilities.advisories.length > 0 ? 1 : 0;

    totalTp += tp;
    totalFp += fp;
    totalFn += fn;
    totalQueries += hydraDbQueries;
    totalExtCalls += externalApiCalls;

    rows.push({
      incidentId: tc.incidentId,
      packageVersion: `${tc.packageName}@${tc.version}`,
      tp,
      fp,
      fn,
      precision,
      recall,
      latencyMs: duration,
      hydraDbQueries,
      externalApiCalls,
    });
  }

  latencies.sort((a, b) => a - b);
  const p50LatencyMs = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95LatencyMs = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const overallPrecision = totalTp + totalFp > 0 ? Number((totalTp / (totalTp + totalFp)).toFixed(2)) : 1.0;
  const overallRecall = totalTp + totalFn > 0 ? Number((totalTp / (totalTp + totalFn)).toFixed(2)) : 1.0;
  const avgHydraQueries = Number((totalQueries / testCases.length).toFixed(1));
  const avgExternalCalls = Number((totalExtCalls / testCases.length).toFixed(1));

  return {
    rows,
    p50LatencyMs,
    p95LatencyMs,
    overallPrecision,
    overallRecall,
    avgHydraQueries,
    avgExternalCalls,
  };
}

async function main() {
  console.log("\n==========================================================================================");
  console.log("                       HYDRASCOPE TRACK 02 EVALUATION HARNESS                             ");
  console.log("==========================================================================================\n");

  const results = await runEvaluationHarness();

  console.table(
    results.rows.map((r) => ({
      "Incident ID": r.incidentId,
      "Package@Version": r.packageVersion,
      TP: r.tp,
      FP: r.fp,
      FN: r.fn,
      Precision: r.precision,
      Recall: r.recall,
      "Latency (ms)": r.latencyMs,
      "HydraDB Queries": r.hydraDbQueries,
      "Ext API Calls": r.externalApiCalls,
    })),
  );

  console.log("\n------------------------------------------------------------------------------------------");
  console.log("AGGREGATE BENCHMARK METRICS SUMMARY:");
  console.log(`- Overall Precision: ${results.overallPrecision * 100}%`);
  console.log(`- Overall Recall:    ${results.overallRecall * 100}%`);
  console.log(`- P50 Latency:       ${results.p50LatencyMs} ms`);
  console.log(`- P95 Latency:       ${results.p95LatencyMs} ms`);
  console.log(`- Avg HydraDB Queries per Query: ${results.avgHydraQueries}`);
  console.log(`- Avg External API Calls per Query: ${results.avgExternalCalls}`);
  console.log("------------------------------------------------------------------------------------------\n");
}

if (require.main === module || (typeof process !== "undefined" && process.argv[1]?.includes("evaluate"))) {
  main().catch((err) => {
    console.error("Evaluation harness error:", err);
    process.exit(1);
  });
}
