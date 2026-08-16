import { GraphEdge, GraphNode, HydraGraphData } from "./schema";

export function createInitialFixtures(): HydraGraphData {
  const nodes: GraphNode[] = [
    // --- evil-lib ---
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
    // Downstream packages
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
    // Repositories
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
    // Services
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
    // Environments
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
    // Maintainers
    {
      id: "maint:evil-actor",
      type: "Maintainer",
      username: "evil-actor",
      name: "Threat Actor",
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

    // --- lodash ---
    {
      id: "pkg:lodash",
      type: "Package",
      name: "lodash",
      ecosystem: "npm",
      description: "Lodash modular utilities",
    },
    {
      id: "pkgver:lodash@4.17.20",
      type: "PackageVersion",
      packageName: "lodash",
      version: "4.17.20",
      publishedAt: "2020-10-01T00:00:00.000Z",
    },
    {
      id: "vuln:GHSA-35jh-r3h4-6jhm",
      type: "Vulnerability",
      advisoryId: "GHSA-35jh-r3h4-6jhm",
      aliases: ["CVE-2021-23337"],
      severity: "HIGH",
      affectedRange: "<4.17.21",
      fixedVersion: "4.17.21",
      publishedAt: "2021-02-15T00:00:00.000Z",
      summary: "Command injection vulnerability in lodash template function",
    },

    // --- express ---
    {
      id: "pkg:express",
      type: "Package",
      name: "express",
      ecosystem: "npm",
      description: "Fast, unopinionated, minimalist web framework for node",
    },
    {
      id: "pkgver:express@4.18.2",
      type: "PackageVersion",
      packageName: "express",
      version: "4.18.2",
      publishedAt: "2022-10-08T00:00:00.000Z",
    },

    // --- react ---
    {
      id: "pkg:react",
      type: "Package",
      name: "react",
      ecosystem: "npm",
      description: "React is a JavaScript library for building user interfaces",
    },
    {
      id: "pkgver:react@18.2.0",
      type: "PackageVersion",
      packageName: "react",
      version: "18.2.0",
      publishedAt: "2022-06-14T00:00:00.000Z",
    },

    // --- requests (PyPI) ---
    {
      id: "pkg:requests",
      type: "Package",
      name: "requests",
      ecosystem: "pypi",
      description: "Python HTTP for Humans",
    },
    {
      id: "pkgver:requests@2.28.1",
      type: "PackageVersion",
      packageName: "requests",
      version: "2.28.1",
      publishedAt: "2022-06-29T00:00:00.000Z",
    },

    // --- Typosquat Packages ---
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
  ];

  const edges: GraphEdge[] = [
    // evil-lib versions
    {
      id: "edge:evil-lib:has_version:2.0.0",
      source: "pkg:evil-lib",
      target: "pkgver:evil-lib@2.0.0",
      type: "HAS_VERSION",
    },
    {
      id: "edge:evil-lib:has_version:1.9.0",
      source: "pkg:evil-lib",
      target: "pkgver:evil-lib@1.9.0",
      type: "HAS_VERSION",
    },
    // Vulnerability mapping
    {
      id: "edge:evil-lib@2.0.0:affected_by:GHSA-evil-2026-9999",
      source: "pkgver:evil-lib@2.0.0",
      target: "vuln:GHSA-evil-2026-9999",
      type: "AFFECTED_BY",
    },
    // Downstream dependencies
    {
      id: "edge:auth-middleware@1.4.0:depends_on:evil-lib@2.0.0",
      source: "pkgver:auth-middleware@1.4.0",
      target: "pkgver:evil-lib@2.0.0",
      type: "DEPENDS_ON",
    },
    {
      id: "edge:payment-sdk@3.1.0:depends_on:auth-middleware@1.4.0",
      source: "pkgver:payment-sdk@3.1.0",
      target: "pkgver:auth-middleware@1.4.0",
      type: "DEPENDS_ON",
    },
    // Repositories using packages
    {
      id: "edge:payment-sdk@3.1.0:used_by:checkout-repo",
      source: "pkgver:payment-sdk@3.1.0",
      target: "repo:checkout-repo",
      type: "USED_BY",
    },
    {
      id: "edge:auth-middleware@1.4.0:used_by:auth-service-repo",
      source: "pkgver:auth-middleware@1.4.0",
      target: "repo:auth-service-repo",
      type: "USED_BY",
    },
    // Repo -> Service -> Environment
    {
      id: "edge:checkout-repo:used_by:checkout-api",
      source: "repo:checkout-repo",
      target: "svc:checkout-api",
      type: "USED_BY",
    },
    {
      id: "edge:auth-service-repo:used_by:auth-api",
      source: "repo:auth-service-repo",
      target: "svc:auth-api",
      type: "USED_BY",
    },
    {
      id: "edge:checkout-api:runs_in:prod-us-east-1",
      source: "svc:checkout-api",
      target: "env:prod-us-east-1",
      type: "RUNS_IN",
    },
    {
      id: "edge:auth-api:runs_in:staging-eu-west-1",
      source: "svc:auth-api",
      target: "env:staging-eu-west-1",
      type: "RUNS_IN",
    },
    // Maintainer links
    {
      id: "edge:evil-lib:maintained_by:evil-actor",
      source: "pkg:evil-lib",
      target: "maint:evil-actor",
      type: "MAINTAINED_BY",
    },
    {
      id: "edge:evil-lib@2.0.0:published_by:evil-actor",
      source: "pkgver:evil-lib@2.0.0",
      target: "maint:evil-actor",
      type: "PUBLISHED_BY",
    },
    {
      id: "edge:crypto-helper-utils:maintained_by:evil-actor",
      source: "pkg:crypto-helper-utils",
      target: "maint:evil-actor",
      type: "MAINTAINED_BY",
    },
    {
      id: "edge:crypto-helper-utils:has_version:1.0.1",
      source: "pkg:crypto-helper-utils",
      target: "pkgver:crypto-helper-utils@1.0.1",
      type: "HAS_VERSION",
    },

    // lodash edges
    {
      id: "edge:lodash:has_version:4.17.20",
      source: "pkg:lodash",
      target: "pkgver:lodash@4.17.20",
      type: "HAS_VERSION",
    },
    {
      id: "edge:lodash@4.17.20:affected_by:GHSA-35jh-r3h4-6jhm",
      source: "pkgver:lodash@4.17.20",
      target: "vuln:GHSA-35jh-r3h4-6jhm",
      type: "AFFECTED_BY",
    },
    {
      id: "edge:lodash@4.17.20:used_by:auth-service-repo",
      source: "pkgver:lodash@4.17.20",
      target: "repo:auth-service-repo",
      type: "USED_BY",
    },

    // express edges
    {
      id: "edge:express:has_version:4.18.2",
      source: "pkg:express",
      target: "pkgver:express@4.18.2",
      type: "HAS_VERSION",
    },

    // react edges
    {
      id: "edge:react:has_version:18.2.0",
      source: "pkg:react",
      target: "pkgver:react@18.2.0",
      type: "HAS_VERSION",
    },
    {
      id: "edge:react@18.2.0:used_by:checkout-repo",
      source: "pkgver:react@18.2.0",
      target: "repo:checkout-repo",
      type: "USED_BY",
    },

    // requests edges
    {
      id: "edge:requests:has_version:2.28.1",
      source: "pkg:requests",
      target: "pkgver:requests@2.28.1",
      type: "HAS_VERSION",
    },
  ];

  return { nodes, edges };
}
