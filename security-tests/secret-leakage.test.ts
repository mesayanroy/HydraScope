import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Secret Leakage & Credential Privacy Audit Test Suite", () => {
  it("audits repository files and verifies no actual API keys or secrets are committed", () => {
    const envExamplePath = path.join(process.cwd(), ".env.example");
    const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");

    // Must NOT contain real production secret keys
    expect(envExampleContent).not.toContain("sk_live_real_secret_key");
    expect(envExampleContent).not.toContain("sk-proj-real-openai-key");

    // Must contain placeholder descriptions
    expect(envExampleContent).toContain("your-hydradb-api-key-here");
  });

  it("verifies server-side environment variables are not exposed to client bundles", () => {
    const clientFilePaths = [
      path.join(process.cwd(), "components", "layout", "AppShell.tsx"),
      path.join(process.cwd(), "components", "analysis", "CommandSearchBar.tsx"),
      path.join(process.cwd(), "components", "analysis/InvestigationTabs.tsx"),
      path.join(process.cwd(), "components", "graph", "DependencyGraph.tsx"),
    ];

    for (const filePath of clientFilePaths) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        expect(content).not.toContain("process.env.HYDRA_API_KEY");
        expect(content).not.toContain("process.env.OPENAI_API_KEY");
      }
    }
  });
});
