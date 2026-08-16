import { describe, expect, it } from "vitest";
import { matchesSemVerRange, parseSemVer } from "@/analysis/semver";

describe("Semver Parser & Evaluator", () => {
  it("parses valid semver strings", () => {
    expect(parseSemVer("2.0.0")).toEqual({ major: 2, minor: 0, patch: 0, prerelease: undefined });
    expect(parseSemVer("4.17.20")).toEqual({ major: 4, minor: 17, patch: 20, prerelease: undefined });
  });

  it("evaluates caret, tilde, wildcard, and comparison ranges", () => {
    expect(matchesSemVerRange("2.0.0", "2.0.0")).toBe(true);
    expect(matchesSemVerRange("2.0.0", ">=2.0.0 <2.0.1")).toBe(true);
    expect(matchesSemVerRange("2.0.1", ">=2.0.0 <2.0.1")).toBe(false);

    expect(matchesSemVerRange("4.17.20", "^4.17.0")).toBe(true);
    expect(matchesSemVerRange("5.0.0", "^4.17.0")).toBe(false);

    expect(matchesSemVerRange("4.17.20", "~4.17.0")).toBe(true);
    expect(matchesSemVerRange("4.18.0", "~4.17.0")).toBe(false);

    expect(matchesSemVerRange("1.2.3", "*")).toBe(true);
  });
});
