import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("hydrascope"),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export function getHealthStatus(now: Date = new Date()): HealthResponse {
  return HealthResponseSchema.parse({
    status: "ok",
    service: "hydrascope",
    timestamp: now.toISOString(),
  });
}
