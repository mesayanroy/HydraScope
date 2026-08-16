import { describe, expect, it } from "vitest";

import { HealthResponseSchema, getHealthStatus } from "@/server/health";

describe("getHealthStatus", () => {
  it("returns a valid health response", () => {
    const response = getHealthStatus(new Date("2026-01-01T00:00:00.000Z"));

    expect(response).toEqual({
      status: "ok",
      service: "hydrascope",
      timestamp: "2026-01-01T00:00:00.000Z",
    });

    expect(() => HealthResponseSchema.parse(response)).not.toThrow();
  });
});
