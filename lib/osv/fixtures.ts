import { NormalizedVulnerability } from "./types";

export const LOCAL_ADVISORY_FIXTURES: Record<string, NormalizedVulnerability[]> = {
  "npm:evil-lib@2.0.0": [
    {
      id: "GHSA-evil-2026-9999",
      aliases: ["CVE-2026-9999"],
      summary: "Remote code execution and sensitive token exfiltration backdoor embedded in postinstall script",
      details: "Malicious payload hidden in postinstall script executes arbitrary commands and exfiltrates environment secrets during installation.",
      severity: "CRITICAL",
      cvssScore: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      affectedRanges: [">=2.0.0 <2.0.1"],
      introducedVersion: "2.0.0",
      fixedVersion: "2.0.1",
      publishedAt: "2026-08-16T09:00:00.000Z",
      modifiedAt: "2026-08-16T09:00:00.000Z",
      references: [
        { type: "ADVISORY", url: "https://github.com/advisories/GHSA-evil-2026-9999" },
        { type: "WEB", url: "https://nvd.nist.gov/vuln/detail/CVE-2026-9999" },
      ],
      source: "LOCAL_FIXTURE",
    },
  ],
  "npm:lodash@4.17.20": [
    {
      id: "GHSA-35jh-r3h4-6jhm",
      aliases: ["CVE-2021-23337"],
      summary: "Command Injection in lodash.template",
      details: "lodash prior to 4.17.21 is vulnerable to Command Injection via template function.",
      severity: "HIGH",
      cvssScore: "CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H",
      affectedRanges: ["<4.17.21"],
      introducedVersion: "0",
      fixedVersion: "4.17.21",
      publishedAt: "2021-02-15T00:00:00Z",
      modifiedAt: "2021-02-15T00:00:00Z",
      references: [
        { type: "ADVISORY", url: "https://github.com/advisories/GHSA-35jh-r3h4-6jhm" },
      ],
      source: "LOCAL_FIXTURE",
    },
  ],
  "npm:express@4.18.2": [
    {
      id: "GHSA-rnqm-fqg3-622v",
      aliases: ["CVE-2024-43796"],
      summary: "Express res.sendFile vulnerability in response header handling",
      details: "Express.js before 4.19.2 contains a path traversal exposure in res.sendFile when absolute paths are passed.",
      severity: "MEDIUM",
      cvssScore: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
      affectedRanges: ["<4.19.2"],
      introducedVersion: "0",
      fixedVersion: "4.19.2",
      publishedAt: "2024-09-10T00:00:00Z",
      modifiedAt: "2024-09-10T00:00:00Z",
      references: [
        { type: "ADVISORY", url: "https://github.com/advisories/GHSA-rnqm-fqg3-622v" },
      ],
      source: "LOCAL_FIXTURE",
    },
  ],
};
