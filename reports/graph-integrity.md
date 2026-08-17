# HydraScope Graph Integrity Report

## Graph Topology Referential Integrity

- **Node Types Validated**: `Package`, `PackageVersion`, `Vulnerability`, `Repository`, `Service`, `Environment`, `Maintainer`.
- **Edge Relationships Validated**: `DEPENDS_ON`, `USED_BY`, `RUNS_IN`, `MAINTAINED_BY`, `PUBLISHED_BY`, `AFFECTED_BY`.
- **Orphan Edge Count**: 0
- **Broken Node Reference Count**: 0
- **Duplicate Edge Count**: 0

---

## Referential Rules Verified

1. Every `PackageVersion` references an existing `Package` node.
2. Every `DEPENDS_ON` edge connects a valid `PackageVersion` to another `PackageVersion`.
3. Every `AFFECTED_BY` edge connects a `PackageVersion` to a valid `Vulnerability` node.
4. Every `USED_BY` edge connects a `PackageVersion` to a `Repository`, or a `Repository` to a `Service`.
5. Every `RUNS_IN` edge connects a `Service` to an `Environment`.
6. Every `MAINTAINED_BY` / `PUBLISHED_BY` edge connects to a valid `Maintainer` node.
7. Node IDs are stable and version identities remain constant across traversals.
