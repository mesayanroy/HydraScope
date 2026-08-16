import { describe, expect, it } from "vitest";
import { damerauLevenshteinDistance, detectTyposquats } from "../analysis/typosquats";
import { getHydraDBAdapter } from "../lib/hydra/adapter";

describe("Typosquat Heuristic Engine Tests", () => {
  it("calculates Damerau-Levenshtein distance correctly for transpositions and substitutions", () => {
    expect(damerauLevenshteinDistance("evil-lib", "evillib")).toBe(1);
    expect(damerauLevenshteinDistance("evil-lib", "evil_lib")).toBe(1);
    expect(damerauLevenshteinDistance("lodash", "lodash")).toBe(0);
  });

  it("detects candidate typosquat packages, similarity, signals, and confidence without ML model dependencies", async () => {
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    await client.restoreFixtures();

    const result = await detectTyposquats(client, "evil-lib");
    expect(result.candidates.length).toBeGreaterThan(0);

    const cand = result.candidates.find((c) => c.package === "evillib" || c.packageName === "evillib");
    expect(cand).toBeDefined();
    expect(cand?.similarTo).toBe("evil-lib");
    expect(cand?.similarity).toBeGreaterThan(0.7);
    expect(cand?.signals.length).toBeGreaterThan(0);
    expect(cand?.confidence).toBe("HIGH");

    expect(result.disclaimer).toContain("Heuristic analysis");
  });
});
