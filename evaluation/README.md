# HydraScope Evaluation Harness (Track 02)

Deterministic evaluation harness measuring graph traversal precision, recall, execution latencies, and resource consumption query counts across benchmark incident test cases.

---

## Benchmark Metrics Evaluated

1. **Precision**: `TP / (TP + FP)` — Ratio of correctly identified affected graph nodes to total predicted nodes.
2. **Recall**: `TP / (TP + FN)` — Ratio of correctly identified affected graph nodes to ground truth nodes.
3. **Latency**: Measured execution duration in milliseconds:
   - **P50 Latency**: 50th percentile execution time.
   - **P95 Latency**: 95th percentile execution time.
4. **Cost & Query Resource Metrics**:
   - **HydraDB Graph Queries**: Number of graph traversal REST/in-memory queries per query execution.
   - **External API Calls**: Number of external OSV/LLM API calls per query execution.
   - *Note*: Monetary cost is reported via verified query counts rather than fabricated dollar figures.

---

## Directory Structure

- `ground-truth.example.json`: Deterministic benchmark fixture containing incident test cases and ground-truth affected node sets.
- `evaluate.ts`: Executable evaluation runner calculating TP/FP/FN, precision, recall, latencies, and query counts.
- `benchmark.test.ts`: Vitest automated evaluation test suite.

---

## Running the Evaluation Harness

Run the evaluation harness using `pnpm evaluate` or `npm run evaluate`:

```bash
npm run evaluate
# or
pnpm evaluate
```

### Sample Output Table

```
==========================================================================================
                       HYDRASCOPE TRACK 02 EVALUATION HARNESS                             
==========================================================================================

┌─────────┬───────────────┬──────────────────────┬────┬────┬────┬───────────┬────────┬──────────────┬─────────────────┬───────────────┐
│ (index) │  Incident ID  │   Package@Version    │ TP │ FP │ FN │ Precision │ Recall │ Latency (ms) │ HydraDB Queries │ Ext API Calls │
├─────────┼───────────────┼──────────────────────┼────┼────┼────┼───────────┼────────┼──────────────┼─────────────────┼───────────────┤
│    0    │ 'INCIDENT-001'│  'evil-lib@2.0.0'    │ 9  │ 0  │ 0  │     1     │   1    │    12.45     │        1        │       1       │
│    1    │ 'INCIDENT-002'│'auth-middleware@1.4.0│ 7  │ 0  │ 0  │     1     │   1    │     8.12     │        1        │       1       │
│    2    │ 'INCIDENT-003'│  'payment-sdk@3.1.0' │ 4  │ 0  │ 0  │     1     │   1    │     6.54     │        1        │       1       │
│    3    │ 'INCIDENT-004'│   'lodash@4.17.20'   │ 1  │ 0  │ 0  │     1     │   1    │    45.10     │        1        │       1       │
│    4    │ 'INCIDENT-005'│   'express@4.18.2'   │ 1  │ 0  │ 0  │     1     │   1    │     4.20     │        1        │       1       │
│    5    │ 'INCIDENT-006'│    'react@18.2.0'    │ 1  │ 0  │ 0  │     1     │   1    │     3.80     │        1        │       1       │
└─────────┴───────────────┴──────────────────────┴────┴────┴────┴───────────┴────────┴──────────────┴─────────────────┴───────────────┘

------------------------------------------------------------------------------------------
AGGREGATE BENCHMARK METRICS SUMMARY:
- Overall Precision: 100%
- Overall Recall:    100%
- P50 Latency:       7.33 ms
- P95 Latency:       45.10 ms
- Avg HydraDB Queries per Query: 1.0
- Avg External API Calls per Query: 1.0
------------------------------------------------------------------------------------------
```
