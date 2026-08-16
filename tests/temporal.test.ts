import { describe, expect, it } from "vitest";
import { TemporalExposureService } from "../analysis/temporal";

describe("Temporal Exposure Engine & Service Tests", () => {
  const service = new TemporalExposureService();

  it("1. Full Overlap: calculates exact exposure interval when dependency active during entire vulnerability window", () => {
    const result = service.calculateServiceExposure({
      serviceId: "svc:checkout-api",
      serviceName: "checkout-api",
      packageVersion: "evil-lib@2.0.0",
      vulnerabilityStart: "2026-08-16T09:00:00.000Z",
      vulnerabilityEnd: "2026-08-16T10:00:00.000Z",
      dependencyStart: "2026-08-16T09:10:00.000Z",
      dependencyEnd: "2026-08-16T09:50:00.000Z",
    });

    expect(result.status).toBe("EXPOSED");
    expect(result.isExposed).toBe(true);
    expect(result.exposureStart).toBe("2026-08-16T09:10:00.000Z");
    expect(result.exposureEnd).toBe("2026-08-16T09:50:00.000Z");
    expect(result.durationMinutes).toBe(40);
    expect(result.confidence).toBe("HIGH");
  });

  it("2. Partial Overlap: calculates exact overlap window when dependency is active for 4 minutes", () => {
    const result = service.calculateServiceExposure({
      serviceId: "svc:checkout-api",
      serviceName: "checkout-api",
      packageVersion: "evil-lib@2.0.0",
      vulnerabilityStart: "2026-08-16T09:00:00.000Z",
      vulnerabilityEnd: undefined,
      dependencyStart: "2026-08-16T09:02:00.000Z",
      dependencyEnd: "2026-08-16T09:06:00.000Z",
    });

    expect(result.status).toBe("EXPOSED");
    expect(result.durationMinutes).toBe(4);
    expect(result.intersectionStart).toBe("2026-08-16T09:02:00.000Z");
    expect(result.intersectionEnd).toBe("2026-08-16T09:06:00.000Z");
  });

  it("3. No Overlap: returns NOT_EXPOSED when dependency active window closed prior to vulnerability publication", () => {
    const result = service.calculateServiceExposure({
      serviceId: "svc:auth-api",
      serviceName: "auth-api",
      packageVersion: "evil-lib@2.0.0",
      vulnerabilityStart: "2026-08-16T09:00:00.000Z",
      vulnerabilityEnd: "2026-08-16T10:00:00.000Z",
      dependencyStart: "2026-08-16T07:00:00.000Z",
      dependencyEnd: "2026-08-16T08:30:00.000Z",
    });

    expect(result.status).toBe("NOT_EXPOSED");
    expect(result.isExposed).toBe(false);
    expect(result.confidence).toBe("HIGH");
  });

  it("4. Missing Timestamps: returns UNKNOWN status and confidence without fabricating data", () => {
    const result = service.calculateServiceExposure({
      serviceId: "svc:unknown-service",
      serviceName: "unknown-service",
      packageVersion: "evil-lib@2.0.0",
      vulnerabilityStart: undefined,
      dependencyStart: "2026-08-16T09:02:00.000Z",
    });

    expect(result.status).toBe("UNKNOWN");
    expect(result.confidence).toBe("UNKNOWN");
    expect(result.isExposed).toBe(false);
  });

  it("5. Vulnerability With No End: evaluates ongoing vulnerability correctly", () => {
    const result = service.calculateServiceExposure({
      serviceId: "svc:auth-api",
      serviceName: "auth-api",
      packageVersion: "evil-lib@2.0.0",
      vulnerabilityStart: "2026-08-16T09:00:00.000Z",
      vulnerabilityEnd: undefined,
      dependencyStart: "2026-08-16T09:05:00.000Z",
      dependencyEnd: undefined,
    });

    expect(result.status).toBe("EXPOSED");
    expect(result.isExposed).toBe(true);
    expect(result.exposureEnd).toBe("Ongoing");
    expect(result.confidence).toBe("MEDIUM");
  });
});
