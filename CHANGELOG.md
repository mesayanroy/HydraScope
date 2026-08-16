# Changelog

## 2026-08-17

### Added
- Complete HydraDB graph client with server-side API credential handling, connection health checks, and mutation support (`server/hydradb/client.ts`).
- Graph schema definitions for `Package`, `PackageVersion`, `Vulnerability`, `Repository`, `Service`, `Environment`, and `Maintainer` nodes (`server/hydradb/schema.ts`).
- Ground truth security fixtures featuring `evil-lib@2.0.0` backdoor scenario, multi-tier microservices, production exposure, maintainers, and typosquats (`server/hydradb/fixtures.ts`).
- Reverse dependency traversal engine for transitive blast radius calculation with cyclic graph protection (`analysis/blastRadius.ts`).
- Semver evaluation module supporting exact versions, caret (`^`), tilde (`~`), comparison, and wildcard ranges (`analysis/semver.ts`).
- Temporal exposure engine calculating active deployment window overlaps (`analysis/temporal.ts`).
- Shared maintainer risk module mapping maintainers to associated published packages (`analysis/maintainers.ts`).
- Typosquat heuristic detection using Damerau-Levenshtein similarity (`analysis/typosquats.ts`).
- Traceable evidence assembly engine generating verifiable security claims (`analysis/evidence.ts`).
- Grounded AI explanation generator with prompt injection defenses for untrusted metadata (`ai/generator.ts`, `ai/promptDefense.ts`).
- Server API route `/api/analyze` with strict Zod payload validation and server-side auth enforcement (`app/api/analyze/route.ts`).
- Prepared complete Hack Hydra submission documentation in `README.md` featuring problem statement, solution overview, dedicated **Why HydraDB?** graph integration architecture, feature list, ASCII architecture diagram, setup instructions, `.env.example` schema, demo link placeholder, evaluation metrics table, honest limitations, tech stack, and MIT license.
- Created `LICENSE` file containing standard MIT license text.
- Verified zero secret key leaks across all client components and environment configurations.
- Audited git status and confirmed clean workspace state ready for submission.
- HydraDB dependency proof test verifying graph edge removal changes analysis output and restoring edge restores output (`tests/hydradb-dependency.test.ts`).
- Performance benchmarking evaluation suite for precision, recall, P50/P95/P99 latency, and traversal metrics (`evaluation/benchmark.test.ts`).

## 2026-08-16

### Added
- Initial HydraScope application shell.
- HydraDB integration layer.
- Graph visualization.

### Changed
- None.

### Fixed
- None.

### Security
- Added server-side HydraDB credential handling.

### Tests
- Added graph connectivity tests.