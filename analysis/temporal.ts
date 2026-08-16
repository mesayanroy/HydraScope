export type ExposureStatus = "EXPOSED" | "NOT_EXPOSED" | "UNKNOWN";
export type ExposureConfidence = "HIGH" | "MEDIUM" | "UNKNOWN";

export type ServiceExposureResult = {
  service: string;
  serviceName: string;
  serviceId: string;
  packageVersion: string;
  vulnerabilityStart?: string;
  vulnerabilityEnd?: string;
  dependencyStart?: string;
  dependencyEnd?: string;
  serviceActiveFrom?: string;
  serviceActiveTo?: string;
  exposureStart?: string;
  exposureEnd?: string;
  intersectionStart?: string;
  intersectionEnd?: string;
  overlapStart?: string;
  overlapEnd?: string;
  durationMinutes?: number;
  isExposed: boolean;
  status: ExposureStatus;
  confidence: ExposureConfidence;
  reason: string;
};

export type TemporalAnalysisResult = {
  overallStatus: ExposureStatus;
  overallConfidence: ExposureConfidence;
  serviceExposures: ServiceExposureResult[];
};

export class TemporalExposureService {
  /**
   * Evaluates whether a service/repository was exposed during the vulnerability window.
   * Core rule: Exposure exists when dependency interval intersects vulnerability interval.
   */
  public calculateServiceExposure(input: {
    serviceId: string;
    serviceName: string;
    packageVersion: string;
    vulnerabilityStart?: string;
    vulnerabilityEnd?: string;
    dependencyStart?: string;
    dependencyEnd?: string;
  }): ServiceExposureResult {
    const {
      serviceId,
      serviceName,
      packageVersion,
      vulnerabilityStart,
      vulnerabilityEnd,
      dependencyStart,
      dependencyEnd,
    } = input;

    // Rule: Missing start timestamps must NOT be guessed. Return UNKNOWN when evidence is missing.
    if (!vulnerabilityStart || !dependencyStart) {
      return {
        service: serviceName,
        serviceName,
        serviceId,
        packageVersion,
        vulnerabilityStart,
        vulnerabilityEnd,
        dependencyStart,
        dependencyEnd,
        serviceActiveFrom: dependencyStart,
        serviceActiveTo: dependencyEnd,
        isExposed: false,
        status: "UNKNOWN",
        confidence: "UNKNOWN",
        reason: "Insufficient timestamp evidence (missing vulnerability publication or dependency start time).",
      };
    }

    const vStartMs = new Date(vulnerabilityStart).getTime();
    const vEndMs = vulnerabilityEnd ? new Date(vulnerabilityEnd).getTime() : Infinity;
    const dStartMs = new Date(dependencyStart).getTime();
    const dEndMs = dependencyEnd ? new Date(dependencyEnd).getTime() : Infinity;

    if (isNaN(vStartMs) || (vulnerabilityEnd && isNaN(vEndMs)) || isNaN(dStartMs) || (dependencyEnd && isNaN(dEndMs))) {
      return {
        service: serviceName,
        serviceName,
        serviceId,
        packageVersion,
        vulnerabilityStart,
        vulnerabilityEnd,
        dependencyStart,
        dependencyEnd,
        serviceActiveFrom: dependencyStart,
        serviceActiveTo: dependencyEnd,
        isExposed: false,
        status: "UNKNOWN",
        confidence: "UNKNOWN",
        reason: "Malformed or unparseable ISO timestamp format.",
      };
    }

    // Interval Intersection Logic:
    // Intersection Start = max(vulnerabilityStart, dependencyStart)
    // Intersection End = min(vulnerabilityEnd || Infinity, dependencyEnd || Infinity)
    const intStartMs = Math.max(vStartMs, dStartMs);
    const intEndMs = Math.min(vEndMs, dEndMs);

    const isExposed = intStartMs < intEndMs;

    if (!isExposed) {
      return {
        service: serviceName,
        serviceName,
        serviceId,
        packageVersion,
        vulnerabilityStart,
        vulnerabilityEnd,
        dependencyStart,
        dependencyEnd,
        serviceActiveFrom: dependencyStart,
        serviceActiveTo: dependencyEnd,
        isExposed: false,
        status: "NOT_EXPOSED",
        confidence: "HIGH",
        reason: "Dependency active interval does not intersect vulnerability active interval.",
      };
    }

    const exposureStart = new Date(intStartMs).toISOString();
    const exposureEnd = intEndMs === Infinity ? "Ongoing" : new Date(intEndMs).toISOString();

    const nowMs = Date.now();
    const activeEndMs = intEndMs === Infinity ? nowMs : intEndMs;
    const durationMs = Math.max(0, activeEndMs - intStartMs);
    const durationMinutes = Math.round(durationMs / 60000);

    // Confidence Calculation:
    // If both endpoints are explicitly bounded -> HIGH
    // If ongoing vulnerability or active deployment -> MEDIUM
    let confidence: ExposureConfidence = "HIGH";
    if (!vulnerabilityEnd || !dependencyEnd) {
      confidence = "MEDIUM";
    }

    return {
      service: serviceName,
      serviceName,
      serviceId,
      packageVersion,
      vulnerabilityStart,
      vulnerabilityEnd,
      dependencyStart,
      dependencyEnd,
      serviceActiveFrom: dependencyStart,
      serviceActiveTo: dependencyEnd,
      exposureStart,
      exposureEnd,
      intersectionStart: exposureStart,
      intersectionEnd: exposureEnd,
      overlapStart: exposureStart,
      overlapEnd: exposureEnd,
      durationMinutes,
      isExposed: true,
      status: "EXPOSED",
      confidence,
      reason: `Dependency active window intersects vulnerability active window (${durationMinutes} minute exposure).`,
    };
  }

  public analyzeServices(input: {
    packageVersion: string;
    vulnerabilityStart?: string;
    vulnerabilityEnd?: string;
    services: Array<{
      id: string;
      name: string;
      activeFrom?: string;
      activeTo?: string;
    }>;
  }): TemporalAnalysisResult {
    if (input.services.length === 0) {
      return {
        overallStatus: "UNKNOWN",
        overallConfidence: "UNKNOWN",
        serviceExposures: [],
      };
    }

    const serviceExposures = input.services.map((svc) =>
      this.calculateServiceExposure({
        serviceId: svc.id,
        serviceName: svc.name,
        packageVersion: input.packageVersion,
        vulnerabilityStart: input.vulnerabilityStart,
        vulnerabilityEnd: input.vulnerabilityEnd,
        dependencyStart: svc.activeFrom,
        dependencyEnd: svc.activeTo,
      }),
    );

    const hasExposed = serviceExposures.some((s) => s.status === "EXPOSED");
    const hasUnknown = serviceExposures.some((s) => s.status === "UNKNOWN");

    const overallStatus: ExposureStatus = hasExposed ? "EXPOSED" : hasUnknown ? "UNKNOWN" : "NOT_EXPOSED";
    const overallConfidence: ExposureConfidence = hasExposed
      ? serviceExposures.find((s) => s.status === "EXPOSED")?.confidence || "HIGH"
      : "HIGH";

    return {
      overallStatus,
      overallConfidence,
      serviceExposures,
    };
  }
}

// Global Singleton Instance
let globalTemporalService: TemporalExposureService | null = null;

export function getTemporalExposureService(): TemporalExposureService {
  if (!globalTemporalService) {
    globalTemporalService = new TemporalExposureService();
  }
  return globalTemporalService;
}

// Compatibility Wrappers for existing callers
export function calculateTemporalExposure(
  vulnPublishedAt?: string,
  serviceActiveFrom?: string,
  serviceActiveTo?: string,
  serviceId: string = "service",
  serviceName: string = "Service",
) {
  const service = getTemporalExposureService();
  return service.calculateServiceExposure({
    serviceId,
    serviceName,
    packageVersion: "target-package@version",
    vulnerabilityStart: vulnPublishedAt,
    dependencyStart: serviceActiveFrom,
    dependencyEnd: serviceActiveTo,
  });
}

export function analyzeTemporalExposureForServices(
  vulnPublishedAt?: string,
  services: Array<{ id: string; name: string; activeFrom?: string; activeTo?: string }> = [],
): TemporalAnalysisResult {
  const service = getTemporalExposureService();
  return service.analyzeServices({
    packageVersion: "target-package@version",
    vulnerabilityStart: vulnPublishedAt,
    services,
  });
}
