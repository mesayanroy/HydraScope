import { GraphEdge, GraphNode, HydraGraphData } from "./types";

export function createDeterministicFixtures(): HydraGraphData {
  const nodes: GraphNode[] = [
    // --- compromised package: evil-lib ---
    {
      id: "pkg:evil-lib",
      type: "Package",
      name: "evil-lib",
      ecosystem: "npm",
      description: "Utility library for cryptographic and string operations",
    },
    {
      id: "pkgver:evil-lib@2.0.0",
      type: "PackageVersion",
      packageName: "evil-lib",
      version: "2.0.0",
      publishedAt: "2026-08-16T08:30:00.000Z",
      readme: "Official evil-lib release v2.0.0 with new optimized encoders.",
    },
    {
      id: "pkgver:evil-lib@1.9.0",
      type: "PackageVersion",
      packageName: "evil-lib",
      version: "1.9.0",
      publishedAt: "2026-05-10T10:00:00.000Z",
    },
    {
      id: "pkgver:evil-lib@2.0.1",
      type: "PackageVersion",
      packageName: "evil-lib",
      version: "2.0.1",
      publishedAt: "2026-08-16T10:00:00.000Z",
    },
    {
      id: "vuln:GHSA-evil-2026-9999",
      type: "Vulnerability",
      advisoryId: "GHSA-evil-2026-9999",
      aliases: ["CVE-2026-9999"],
      severity: "CRITICAL",
      affectedRange: ">=2.0.0 <2.0.1",
      fixedVersion: "2.0.1",
      publishedAt: "2026-08-16T09:00:00.000Z",
      summary: "Remote code execution and sensitive token exfiltration backdoor embedded in postinstall script",
    },

    // --- Downstream dependencies ---
    {
      id: "pkg:auth-middleware",
      type: "Package",
      name: "auth-middleware",
      ecosystem: "npm",
      description: "Express authentication middleware",
    },
    {
      id: "pkgver:auth-middleware@1.4.0",
      type: "PackageVersion",
      packageName: "auth-middleware",
      version: "1.4.0",
      publishedAt: "2026-08-16T08:45:00.000Z",
    },
    {
      id: "pkg:payment-sdk",
      type: "Package",
      name: "payment-sdk",
      ecosystem: "npm",
      description: "SDK for payment processing integration",
    },
    {
      id: "pkgver:payment-sdk@3.1.0",
      type: "PackageVersion",
      packageName: "payment-sdk",
      version: "3.1.0",
      publishedAt: "2026-08-16T08:50:00.000Z",
    },

    // --- Repositories ---
    {
      id: "repo:checkout-repo",
      type: "Repository",
      name: "org/checkout-service",
      isPrivate: true,
      url: "https://github.com/org/checkout-service",
    },
    {
      id: "repo:auth-service-repo",
      type: "Repository",
      name: "org/auth-service",
      isPrivate: true,
      url: "https://github.com/org/auth-service",
    },

    // --- Services ---
    {
      id: "svc:checkout-api",
      type: "Service",
      name: "checkout-api",
      isPrivate: true,
      activeFrom: "2026-08-16T09:02:00.000Z",
      activeTo: "2026-08-16T09:06:00.000Z",
    },
    {
      id: "svc:auth-api",
      type: "Service",
      name: "auth-api",
      isPrivate: true,
      activeFrom: "2026-08-16T08:00:00.000Z",
      activeTo: undefined,
    },

    // --- Environments ---
    {
      id: "env:prod-us-east-1",
      type: "Environment",
      name: "production-us-east-1",
      isProduction: true,
    },
    {
      id: "env:staging-eu-west-1",
      type: "Environment",
      name: "staging-eu-west-1",
      isProduction: false,
    },

    // --- Maintainers ---
    {
      id: "maint:evil-actor",
      type: "Maintainer",
      username: "evil-actor",
      name: "Threat Actor Account",
      email: "actor@untrusted-domain.net",
    },
    {
      id: "pkg:crypto-helper-utils",
      type: "Package",
      name: "crypto-helper-utils",
      ecosystem: "npm",
      description: "Shared crypto utilities package",
    },
    {
      id: "pkgver:crypto-helper-utils@1.0.1",
      type: "PackageVersion",
      packageName: "crypto-helper-utils",
      version: "1.0.1",
      publishedAt: "2026-08-15T12:00:00.000Z",
    },

    // --- Typosquat / Suspicious Packages ---
    {
      id: "pkg:evillib",
      type: "Package",
      name: "evillib",
      ecosystem: "npm",
      description: "Typosquat candidate for evil-lib",
    },
    {
      id: "pkg:evil_lib",
      type: "Package",
      name: "evil_lib",
      ecosystem: "npm",
      description: "Typosquat candidate for evil-lib",
    },

    // --- Standard Packages ---
    {
      id: "pkg:lodash",
      type: "Package",
      name: "lodash",
      ecosystem: "npm",
    },
    {
      id: "pkgver:lodash@4.17.20",
      type: "PackageVersion",
      packageName: "lodash",
      version: "4.17.20",
    },
    {
      id: "pkg:express",
      type: "Package",
      name: "express",
      ecosystem: "npm",
    },
    {
      id: "pkgver:express@4.18.2",
      type: "PackageVersion",
      packageName: "express",
      version: "4.18.2",
    },
    {
      id: "pkg:react",
      type: "Package",
      name: "react",
      ecosystem: "npm",
    },
    {
      id: "pkgver:react@18.2.0",
      type: "PackageVersion",
      packageName: "react",
      version: "18.2.0",
    },
    {
      id: "pkg:requests",
      type: "Package",
      name: "requests",
      ecosystem: "pypi",
    },
    {
      id: "pkgver:requests@2.28.1",
      type: "PackageVersion",
      packageName: "requests",
      version: "2.28.1",
    },
  ];

  const edges: GraphEdge[] = [
    // Version relationships
    { id: "e:evil-lib:v2.0.0", source: "pkg:evil-lib", target: "pkgver:evil-lib@2.0.0", type: "HAS_VERSION" },
    { id: "e:evil-lib:v1.9.0", source: "pkg:evil-lib", target: "pkgver:evil-lib@1.9.0", type: "HAS_VERSION" },
    { id: "e:evil-lib:v2.0.1", source: "pkg:evil-lib", target: "pkgver:evil-lib@2.0.1", type: "HAS_VERSION" },
    { id: "e:lodash:v4.17.20", source: "pkg:lodash", target: "pkgver:lodash@4.17.20", type: "HAS_VERSION" },
    { id: "e:express:v4.18.2", source: "pkg:express", target: "pkgver:express@4.18.2", type: "HAS_VERSION" },
    { id: "e:react:v18.2.0", source: "pkg:react", target: "pkgver:react@18.2.0", type: "HAS_VERSION" },
    { id: "e:requests:v2.28.1", source: "pkg:requests", target: "pkgver:requests@2.28.1", type: "HAS_VERSION" },

    // Vulnerability mapping
    { id: "e:vuln:evil-lib@2.0.0", source: "pkgver:evil-lib@2.0.0", target: "vuln:GHSA-evil-2026-9999", type: "AFFECTED_BY" },

    // Dependency chain: auth-middleware@1.4.0 -> evil-lib@2.0.0, payment-sdk@3.1.0 -> auth-middleware@1.4.0
    { id: "e:dep:auth-middleware->evil-lib", source: "pkgver:auth-middleware@1.4.0", target: "pkgver:evil-lib@2.0.0", type: "DEPENDS_ON" },
    { id: "e:dep:payment-sdk->auth-middleware", source: "pkgver:payment-sdk@3.1.0", target: "pkgver:auth-middleware@1.4.0", type: "DEPENDS_ON" },

    // Usage: payment-sdk -> checkout-repo, auth-middleware -> auth-service-repo
    { id: "e:use:payment-sdk->checkout-repo", source: "pkgver:payment-sdk@3.1.0", target: "repo:checkout-repo", type: "USED_BY" },
    { id: "e:use:auth-middleware->auth-service-repo", source: "pkgver:auth-middleware@1.4.0", target: "repo:auth-service-repo", type: "USED_BY" },

    // Repo -> Service
    { id: "e:use:checkout-repo->checkout-api", source: "repo:checkout-repo", target: "svc:checkout-api", type: "USED_BY" },
    { id: "e:use:auth-service-repo->auth-api", source: "repo:auth-service-repo", target: "svc:auth-api", type: "USED_BY" },

    // Service -> Environment
    { id: "e:run:checkout-api->prod", source: "svc:checkout-api", target: "env:prod-us-east-1", type: "RUNS_IN" },
    { id: "e:run:auth-api->staging", source: "svc:auth-api", target: "env:staging-eu-west-1", type: "RUNS_IN" },

    // Maintainer links
    { id: "e:maint:evil-lib->evil-actor", source: "pkg:evil-lib", target: "maint:evil-actor", type: "MAINTAINED_BY" },
    { id: "e:pub:evil-lib@2.0.0->evil-actor", source: "pkgver:evil-lib@2.0.0", target: "maint:evil-actor", type: "PUBLISHED_BY" },
    { id: "e:maint:crypto-helper-utils->evil-actor", source: "pkg:crypto-helper-utils", target: "maint:evil-actor", type: "MAINTAINED_BY" },
  ];

  return { nodes, edges };
}
