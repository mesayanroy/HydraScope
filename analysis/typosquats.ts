import { HydraDBClient } from "../lib/hydra/client";

export function damerauLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
      }
    }
  }
  return d[m][n];
}

export type TyposquatCandidate = {
  package: string;
  packageName: string;
  similarTo: string;
  distance: number;
  similarity: number;
  similarityScore: number;
  signals: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type TyposquatAnalysisResult = {
  targetPackageName: string;
  candidates: TyposquatCandidate[];
  disclaimer: string;
};

export async function detectTyposquats(
  client: HydraDBClient,
  targetPackageName: string,
): Promise<TyposquatAnalysisResult> {
  const targetLower = targetPackageName.toLowerCase();
  const allNodes = await client.getAllNodes();
  const packageNodes = allNodes.filter((n) => n.type === "Package" && n.name.toLowerCase() !== targetLower);

  const candidates: TyposquatCandidate[] = [];

  for (const node of packageNodes) {
    if (node.type !== "Package") continue;
    const candName = node.name.toLowerCase();
    const dist = damerauLevenshteinDistance(targetLower, candName);

    const maxLen = Math.max(targetLower.length, candName.length);
    const similarity = maxLen === 0 ? 1 : Number((1 - dist / maxLen).toFixed(2));

    const signals: string[] = [];

    // Heuristic 1: Edit Distance
    if (dist === 1) {
      signals.push("Single character edit distance (possible typo/substitution)");
    } else if (dist === 2) {
      signals.push("Double character edit distance");
    }

    // Heuristic 2: Punctuation / Hyphenation / Underscore Manipulation
    const normTarget = targetLower.replace(/[-_]/g, "");
    const normCand = candName.replace(/[-_]/g, "");
    if (normTarget === normCand) {
      signals.push("Identical string ignoring hyphenation/underscores");
    }

    // Heuristic 3: Homoglyph / Character Substitutions (e.g. l/1, o/0, i/1)
    const homoglyphCand = candName.replace(/1/g, "l").replace(/0/g, "o").replace(/3/g, "e");
    const homoglyphTarget = targetLower.replace(/1/g, "l").replace(/0/g, "o").replace(/3/g, "e");
    if (homoglyphCand === homoglyphTarget && targetLower !== candName) {
      signals.push("Character homoglyph substitution detected (1/l, 0/o, 3/e)");
    }

    // Heuristic 4: Prefix / Suffix Manipulation
    if (candName.startsWith(targetLower) || targetLower.startsWith(candName)) {
      signals.push("Prefix / suffix manipulation match");
    }

    // Heuristic 5: Graph Relationship Check (Maintainer)
    const candEdges = await client.getEdgesFrom(node.id);
    const targetPkgNode = await client.findPackage(targetPackageName);
    if (targetPkgNode) {
      const targetEdges = await client.getEdgesFrom(targetPkgNode.id);
      const targetMaintainers = new Set(targetEdges.filter((e) => e.type === "MAINTAINED_BY").map((e) => e.target));
      const candMaintainers = candEdges.filter((e) => e.type === "MAINTAINED_BY").map((e) => e.target);

      if (candMaintainers.some((m) => targetMaintainers.has(m))) {
        signals.push("Shares maintainer with target package");
      }
    }

    if (similarity >= 0.70 || signals.length > 0) {
      let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (dist === 1 || signals.includes("Identical string ignoring hyphenation/underscores")) {
        confidence = "HIGH";
      } else if (similarity >= 0.80 || signals.length >= 2) {
        confidence = "MEDIUM";
      }

      candidates.push({
        package: node.name,
        packageName: node.name,
        similarTo: targetPackageName,
        distance: dist,
        similarity,
        similarityScore: similarity,
        signals,
        confidence,
      });
    }
  }

  // Sort candidates by similarity score descending
  candidates.sort((a, b) => b.similarity - a.similarity);

  return {
    targetPackageName,
    candidates,
    disclaimer: "Heuristic analysis — not proof of compromise.",
  };
}
