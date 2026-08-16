export type SemVer = {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
};

export function parseSemVer(versionStr: string): SemVer | null {
  const clean = versionStr.trim().replace(/^v/i, "");
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
}

export function compareSemVer(v1: SemVer, v2: SemVer): number {
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  if (v1.patch !== v2.patch) return v1.patch - v2.patch;
  if (!v1.prerelease && v2.prerelease) return 1;
  if (v1.prerelease && !v2.prerelease) return -1;
  if (v1.prerelease && v2.prerelease) return v1.prerelease.localeCompare(v2.prerelease);
  return 0;
}

export function matchesSemVerRange(versionStr: string, rangeStr: string): boolean {
  const v = parseSemVer(versionStr);
  if (!v) return false;

  const range = rangeStr.trim();
  if (range === "*" || range === "x" || range === "") return true;

  // Single exact match
  const exactVer = parseSemVer(range);
  if (exactVer) {
    return compareSemVer(v, exactVer) === 0;
  }

  // Handle caret ^
  if (range.startsWith("^")) {
    const base = parseSemVer(range.slice(1));
    if (!base) return false;
    if (base.major === 0) {
      if (base.minor === 0) {
        return compareSemVer(v, base) === 0;
      }
      return v.major === 0 && v.minor === base.minor && compareSemVer(v, base) >= 0;
    }
    return v.major === base.major && compareSemVer(v, base) >= 0;
  }

  // Handle tilde ~
  if (range.startsWith("~")) {
    const base = parseSemVer(range.slice(1));
    if (!base) return false;
    return v.major === base.major && v.minor === base.minor && compareSemVer(v, base) >= 0;
  }

  // Handle composite range like ">=2.0.0 <2.0.1" or ">=1.0.0"
  const parts = range.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.every((p) => matchesSemVerRange(versionStr, p));
  }

  // Comparison operators
  const compMatch = range.match(/^(>=|<=|>|<|=)\s*(.+)$/);
  if (compMatch) {
    const op = compMatch[1];
    const target = parseSemVer(compMatch[2]);
    if (!target) return false;
    const cmp = compareSemVer(v, target);
    switch (op) {
      case ">=":
        return cmp >= 0;
      case "<=":
        return cmp <= 0;
      case ">":
        return cmp > 0;
      case "<":
        return cmp < 0;
      case "=":
        return cmp === 0;
    }
  }

  return false;
}
