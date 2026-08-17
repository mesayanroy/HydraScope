# HydraScope Performance & Evaluation Benchmark Report

## Measured Track 02 Performance Metrics

- **Overall Precision**: 96%
- **Overall Recall**: 100%
- **P50 Execution Latency**: 418.10 ms
- **P95 Execution Latency**: 828.37 ms
- **Average HydraDB Queries per Query**: 49.0
- **Average External API Calls per Query**: 0.5

---

## Detailed Benchmark Results Table

```
==========================================================================================
                       HYDRASCOPE TRACK 02 EVALUATION HARNESS                             
==========================================================================================

┌─────────┬────────────────┬─────────────────────────┬────┬────┬────┬───────────┬────────┬──────────────┬─────────────────┬───────────────┐
│ (index) │ Incident ID    │ Package@Version         │ TP │ FP │ FN │ Precision │ Recall │ Latency (ms) │ HydraDB Queries │ Ext API Calls │
├─────────┼────────────────┼─────────────────────────┼────┼────┼────┼───────────┼────────┼──────────────┼─────────────────┼───────────────┤
│ 0       │ 'INCIDENT-001' │ 'evil-lib@2.0.0'        │ 9  │ 0  │ 0  │ 1.00      │ 1.00   │ 8.62         │ 73              │ 1             │
│ 1       │ 'INCIDENT-002' │ 'auth-middleware@1.4.0' │ 7  │ 1  │ 0  │ 0.88      │ 1.00   │ 828.37       │ 58              │ 0             │
│ 2       │ 'INCIDENT-003' │ 'payment-sdk@3.1.0'     │ 4  │ 0  │ 0  │ 1.00      │ 1.00   │ 638.83       │ 46              │ 0             │
│ 3       │ 'INCIDENT-004' │ 'lodash@4.17.20'        │ 1  │ 0  │ 0  │ 1.00      │ 1.00   │ 0.56         │ 40              │ 1             │
│ 4       │ 'INCIDENT-005' │ 'express@4.18.2'        │ 1  │ 0  │ 0  │ 1.00      │ 1.00   │ 0.34         │ 40              │ 1             │
│ 5       │ 'INCIDENT-006' │ 'react@18.2.0'          │ 1  │ 0  │ 0  │ 1.00      │ 1.00   │ 418.10       │ 37              │ 0             │
└─────────┴────────────────┴─────────────────────────┴────┴────┴────┴───────────┴────────┴──────────────┴─────────────────┴───────────────┘
```
