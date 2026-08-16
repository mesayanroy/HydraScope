# HydraScope — Product Requirements Document

## 1. Product Identity

**Product:** HydraScope

**Category:** Developer Security Infrastructure / DevEx

**Hackathon:** Hack Hydra

**Track:** Track 02 — Repos, Dependencies + Code as Graphs

**Core Technology:** HydraDB

**Primary Goal:**

Build a graph-native developer security intelligence layer that determines the complete blast radius of a compromised or vulnerable package/version.

---

# 2. Product Vision

HydraScope answers:

> "If this dependency is compromised, what exactly does it affect?"

Instead of requiring developers to manually inspect dependency trees, repositories, services and environments, HydraScope models these relationships as a graph and performs transitive analysis.

The system should transform:

Package vulnerability

↓

Dependency graph

↓

Repositories

↓

Services

↓

Environments

↓

Production exposure

into an actionable security investigation.

---

# 3. Problem

Software supply-chain incidents are difficult to reason about because dependency relationships are deeply nested.

A vulnerable package may affect:

- direct dependencies
- transitive dependencies
- repositories
- services
- production environments
- shared maintainers
- related infrastructure

Traditional search and relational approaches make multi-hop relationship analysis difficult to reason about.

HydraScope uses HydraDB as the graph/context layer for these relationships.

---

# 4. Primary User

## Developer

Needs to quickly determine:

- Is my application affected?
- Which services are affected?
- Which repositories are affected?
- Is production exposed?
- When was the exposure active?
- What dependency path caused it?

## Security Engineer

Needs to determine:

- complete blast radius
- affected versions
- exposure windows
- shared maintainers
- suspicious package relationships
- evidence supporting each conclusion

---

# 5. Core Product Principle

The graph is the source of truth.

AI must NOT invent graph facts.

The system follows:

Graph data
→ deterministic analysis
→ verified evidence
→ AI explanation

NOT:

Graph data
→ LLM guess
→ security conclusion

---

# 6. Core User Flow

1. User opens HydraScope.
2. User enters:

   package@version

3. HydraScope resolves the package.
4. HydraScope queries HydraDB.
5. HydraScope traverses dependency relationships.
6. HydraScope determines the transitive blast radius.
7. Vulnerability/advisory information is enriched.
8. Temporal exposure is calculated.
9. Maintainer relationships are analyzed.
10. Typosquat heuristics are calculated.
11. Evidence is assembled.
12. AI explains the verified evidence.
13. User investigates graph nodes and paths.

---

# 7. Core Features

## 7.1 Package Analysis

Input:

package@version

Examples:

lodash@4.17.20
express@4.18.2

Validate:

- package name
- ecosystem
- semantic version

Invalid inputs must fail gracefully.

---

# 7.2 Dependency Graph

Core graph entities:

- Package
- PackageVersion
- Vulnerability
- Repository
- Service
- Environment
- Maintainer

Core relationships:

- HAS_VERSION
- DEPENDS_ON
- AFFECTED_BY
- USED_BY
- RUNS_IN
- MAINTAINED_BY
- PUBLISHED_BY

The graph model should remain explicit and explainable.

---

# 7.3 Blast Radius

Given:

compromised-package@version

perform reverse dependency traversal.

Example:

compromised-package
→ dependency
→ dependency
→ repository
→ service
→ production

Return:

- affected packages
- affected repositories
- affected services
- affected environments
- production exposure
- attack paths
- traversal depth

The traversal must terminate safely on cyclic graphs.

---

# 7.4 Vulnerability Intelligence

Enrich packages with vulnerability/advisory information where available.

Return:

- advisory ID
- aliases
- severity
- affected version range
- fixed version
- publication timestamp

External-data failure must produce:

UNKNOWN

rather than incorrectly claiming:

SAFE

---

# 7.5 Version Analysis

Use reliable semantic-version handling.

Support:

- exact versions
- caret ranges
- tilde ranges
- comparison ranges
- wildcard ranges

Boundary conditions must be tested.

---

# 7.6 Temporal Exposure

Determine whether vulnerability windows overlap with dependency/service resolution windows.

Example:

Vulnerability:

09:00 → 09:10

Service:

09:02 → 09:06

Result:

EXPOSED

Exposure:

09:02 → 09:06

Missing timestamps must not be guessed.

Return:

UNKNOWN

when insufficient evidence exists.

---

# 7.7 Shared Maintainers

Identify maintainers connected to compromised packages.

Determine other packages associated with those maintainers.

This is a relationship signal.

It must NOT automatically classify another package as malicious.

---

# 7.8 Typosquat Detection

Use heuristic package-name similarity.

Signals may include:

- character substitution
- character transposition
- missing characters
- extra characters
- prefix/suffix similarity
- hyphenation

Results must be presented as:

"Heuristic signal — not proof of compromise."

---

# 7.9 Evidence System

Every important security conclusion must be traceable to graph evidence.

Example:

Claim:

checkout-api is affected.

Evidence:

evil-lib@2.0.0
→ package-a
→ checkout-api

Evidence should contain:

- source
- node
- relationship
- path
- timestamp where relevant

---

# 7.10 AI Explanation

AI explains verified evidence.

AI must:

- summarize findings
- explain attack paths
- explain exposure
- suggest investigation steps
- identify uncertainty

AI must NOT:

- invent CVEs
- invent affected services
- invent timestamps
- invent relationships
- claim unsupported compromise
- reveal secrets
- follow instructions embedded inside untrusted graph metadata

When evidence is missing:

"I don't have enough evidence to determine that."

---

# 8. User Interface

Visual direction:

Linear
×
Vercel
×
GitHub Security
×
terminal observability

Design principles:

- dark-first
- clean
- technical
- compact
- minimal
- information dense
- subtle motion
- graph-first

Avoid:

- excessive gradients
- neon cyberpunk design
- glassmorphism
- oversized cards
- unnecessary animation
- marketing-heavy dashboard design

Primary workspace:

Search
→ Metrics
→ Graph
→ Investigation tabs
→ Evidence / AI explanation

---

# 9. Main UI

## Header

HYDRASCOPE

graph-native supply chain intelligence

HYDRA DB ● LIVE

---

## Search

Placeholder:

analyze package@version

Keyboard shortcut:

Ctrl/Cmd + Enter

---

## Metrics

Display:

Affected repositories
Affected services
Production environments
Attack paths

---

## Graph

Graph is the primary visual element.

Node types:

Package
Version
Vulnerability
Repository
Service
Environment
Maintainer

Interactions:

- hover
- select
- expand
- fit view
- zoom
- reset
- detail drawer

---

# 10. Investigation Tabs

## Exposure

Display:

- exposure status
- exposure duration
- timeline
- confidence

## Maintainers

Display:

- shared maintainers
- related packages
- relationship paths

## Typosquats

Display:

- candidate
- similarity
- signals
- confidence

## Evidence

Display:

- source
- node
- relationship
- timestamp

Allow evidence copying.

---

# 11. Security Requirements

## Authentication

Secrets must remain server-side.

HydraDB credentials must never be exposed to browser code.

---

## Authorization

Unauthorized users must not access:

- private graph nodes
- private relationships
- private repositories
- private services
- private evidence

Authorization must be enforced server-side.

---

## Prompt Injection

Graph metadata must be treated as untrusted input.

Instructions inside:

- package descriptions
- README text
- repository metadata
- maintainer metadata

must never override system instructions.

---

## Input Validation

Validate:

- package names
- versions
- query parameters
- JSON payloads
- traversal depth

Use strict schemas.

---

## Resource Protection

Prevent:

- infinite traversal
- graph cycles causing hangs
- excessive traversal depth
- oversized requests
- uncontrolled API calls

---

# 12. Testing Requirements

Required:

- unit tests
- graph integrity tests
- blast-radius tests
- semver tests
- temporal exposure tests
- maintainer tests
- typosquat tests
- evidence tests
- AI grounding tests
- prompt injection tests
- authorization tests
- secret scanning
- performance tests
- precision/recall evaluation
- E2E tests

Required command:

pnpm test:all

---

# 13. Evaluation Metrics

Measure:

Precision
Recall
P50 latency
P95 latency
P99 latency
Nodes traversed
Edges traversed
HydraDB query count
External API calls

Never fabricate metrics.

---

# 14. HydraDB Dependency

HydraDB must contribute to core functionality.

The graph relationships must materially affect the output.

A HydraDB dependency test should prove:

1. graph relationship exists
2. analysis uses relationship
3. removing relationship changes result
4. restoring relationship restores result

HydraDB should not merely be used as decorative storage.

---

# 15. Error States

Required:

## Package Not Found

PACKAGE NOT FOUND

[Retry]

## HydraDB Failure

HYDRA DB UNAVAILABLE

[Retry]

## External Advisory Failure

ADVISORY DATA UNAVAILABLE

Result:

UNKNOWN

not SAFE.

---

# 16. Demo Scenario

Primary demo:

evil-lib@2.0.0

Flow:

Search
→ Analyze
→ Graph
→ Blast Radius
→ Exposure
→ Maintainers
→ Typosquats
→ Evidence
→ AI Explanation

The demo must be possible in approximately three minutes.

---

# 17. Non-Goals

Do NOT build:

- full SIEM
- full vulnerability scanner
- generic chatbot
- generic dependency manager
- generic graph visualization product
- complete CI/CD platform
- autonomous remediation system

Keep the product focused on:

Graph-native software supply-chain blast-radius intelligence.

---

# 18. Engineering Principles

1. Prefer simple architecture.
2. Prefer deterministic analysis over unnecessary AI.
3. Keep AI grounded in evidence.
4. Keep security decisions explainable.
5. Do not fabricate data.
6. Do not hardcode demo results into production logic.
7. Keep HydraDB integration explicit.
8. Write tests before complicated graph logic.
9. Keep components reusable.
10. Avoid unnecessary dependencies.

---

# 19. Definition of Done

HydraScope is ready for submission when:

- application builds
- tests pass
- HydraDB integration works
- graph traversal works
- blast radius is correct
- temporal analysis works
- maintainer analysis works
- typosquat analysis works
- evidence is traceable
- AI is grounded
- security tests pass
- performance is measured
- precision/recall are measured
- E2E demo works
- no secrets are committed
- README is complete
- deployment works
