import { describe, expect, it } from "vitest";
import { runFullAnalysis } from "@/analysis";
import { getHydraDBClient } from "@/server/hydradb/client";

export type PerformanceMetrics = {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  precision: number;
  recall: number;
  nodesTraversed: number;
  edgesTraversed: number;
  queryCount: number;
};

export async function runEvaluationBenchmark(iterations: number = 20): Promise<PerformanceMetrics> {
  const client = getHydraDBClient();
  await client.restoreFixtures();

  const latencies: number[] = [];
  let totalNodesTraversed = 0;
  let totalEdgesTraversed = 0;
  let totalQueries = 0;

  // Known ground truth for evil-lib@2.0.0 in fixtures:
  // Expected affected entities: auth-middleware@1.4.0, payment-sdk@3.1.0, org/checkout-service, org/auth-service, checkout-api, auth-api, production-us-east-1, staging-eu-west-1.
  const groundTruthEntities = new Set([
    "pkgver:auth-middleware@1.4.0",
    "pkgver:payment-sdk@3.1.0",
    "repo:checkout-repo",
    "repo:auth-service-repo",
    "svc:checkout-api",
    "svc:auth-api",
    "env:prod-us-east-1",
    "env:staging-eu-west-1",
  ]);

  let tpCount = 0;
  let fpCount = 0;
  let fnCount = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const result = await runFullAnalysis(client, "evil-lib", "2.0.0");
    const end = performance.now();
    latencies.push(end - start);

    if (i === 0 && result.blastRadius) {
      totalNodesTraversed = result.blastRadius.nodesTraversedCount;
      totalEdgesTraversed = result.blastRadius.edgesTraversedCount;
      totalQueries = result.hydraDbQueryCount;

      const detectedEntities = new Set<string>([
        ...result.blastRadius.affectedPackages.map((p) => p.id),
        ...result.blastRadius.affectedRepositories.map((r) => r.id),
        ...result.blastRadius.affectedServices.map((s) => s.id),
        ...result.blastRadius.affectedEnvironments.map((e) => e.id),
      ]);

      for (const id of detectedEntities) {
        if (groundTruthEntities.has(id)) {
          tpCount++;
        } else {
          fpCount++;
        }
      }
      for (const id of groundTruthEntities) {
        if (!detectedEntities.has(id)) {
          fnCount++;
        }
      }
    }
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  const precision = tpCount + fpCount > 0 ? tpCount / (tpCount + fpCount) : 1;
  const recall = tpCount + fnCount > 0 ? tpCount / (tpCount + fnCount) : 1;

  return {
    p50LatencyMs: Number(p50.toFixed(2)),
    p95LatencyMs: Number(p95.toFixed(2)),
    p99LatencyMs: Number(p99.toFixed(2)),
    precision: Number(precision.toFixed(2)),
    recall: Number(recall.toFixed(2)),
    nodesTraversed: totalNodesTraversed,
    edgesTraversed: totalEdgesTraversed,
    queryCount: totalQueries,
  };
}

describe("Evaluation Benchmark Suite (PRD Section 13)", () => {
  it("measures latency, precision, recall, and traversal metrics", async () => {
    const metrics = await runEvaluationBenchmark(10);
    expect(metrics.precision).toBeGreaterThanOrEqual(0.8);
    expect(metrics.recall).toBeGreaterThanOrEqual(0.8);
    expect(metrics.p50LatencyMs).toBeGreaterThan(0);
    expect(metrics.nodesTraversed).toBeGreaterThan(0);
    expect(metrics.edgesTraversed).toBeGreaterThan(0);
  });
});
