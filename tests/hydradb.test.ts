import { describe, expect, it } from "vitest";
import { getHydraDBClient } from "@/server/hydradb/client";

describe("HydraDB Client", () => {
  it("checks connection health", async () => {
    const client = getHydraDBClient();
    const health = await client.checkHealth();
    expect(["CONNECTED", "ok"]).toContain(health.status);
    expect(health.nodeCount).toBeGreaterThan(0);
    expect(health.edgeCount).toBeGreaterThan(0);
  });

  it("finds packages and package versions", async () => {
    const client = getHydraDBClient();
    const pkg = await client.findPackage("evil-lib");
    expect(pkg).not.toBeNull();
    expect(pkg?.type).toBe("Package");

    const pkgVer = await client.findPackageVersion("evil-lib", "2.0.0");
    expect(pkgVer).not.toBeNull();
    expect(pkgVer?.type).toBe("PackageVersion");
  });
});
