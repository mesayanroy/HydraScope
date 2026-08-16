import { z } from "zod";

export const SeverityRatingSchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]);
export type SeverityRating = z.infer<typeof SeverityRatingSchema>;

export const OsvReferenceSchema = z.object({
  type: z.string(),
  url: z.string(),
});
export type OsvReference = z.infer<typeof OsvReferenceSchema>;

export const OsvEventSchema = z.object({
  introduced: z.string().optional(),
  fixed: z.string().optional(),
  last_affected: z.string().optional(),
  limit: z.string().optional(),
});
export type OsvEvent = z.infer<typeof OsvEventSchema>;

export const OsvRangeSchema = z.object({
  type: z.string(),
  events: z.array(OsvEventSchema).optional(),
});
export type OsvRange = z.infer<typeof OsvRangeSchema>;

export const OsvAffectedSchema = z.object({
  package: z
    .object({
      name: z.string().optional(),
      ecosystem: z.string().optional(),
      purl: z.string().optional(),
    })
    .optional(),
  ranges: z.array(OsvRangeSchema).optional(),
  versions: z.array(z.string()).optional(),
});
export type OsvAffected = z.infer<typeof OsvAffectedSchema>;

export const OsvSeverityItemSchema = z.object({
  type: z.string(),
  score: z.string(),
});
export type OsvSeverityItem = z.infer<typeof OsvSeverityItemSchema>;

export const OsvVulnerabilitySchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  details: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  published: z.string().optional(),
  modified: z.string().optional(),
  severity: z.array(OsvSeverityItemSchema).optional(),
  affected: z.array(OsvAffectedSchema).optional(),
  references: z.array(OsvReferenceSchema).optional(),
});
export type OsvVulnerability = z.infer<typeof OsvVulnerabilitySchema>;

export const OsvQueryResponseSchema = z.object({
  vulns: z.array(OsvVulnerabilitySchema).optional(),
});
export type OsvQueryResponse = z.infer<typeof OsvQueryResponseSchema>;

export const NormalizedVulnerabilitySchema = z.object({
  id: z.string(),
  aliases: z.array(z.string()),
  summary: z.string(),
  details: z.string().optional(),
  severity: SeverityRatingSchema,
  cvssScore: z.string().optional(),
  affectedRanges: z.array(z.string()),
  introducedVersion: z.string().nullable(),
  fixedVersion: z.string().nullable(),
  publishedAt: z.string().optional(),
  modifiedAt: z.string().optional(),
  references: z.array(OsvReferenceSchema),
  source: z.enum(["OSV_LIVE", "LOCAL_FIXTURE", "CACHE"]),
});
export type NormalizedVulnerability = z.infer<typeof NormalizedVulnerabilitySchema>;
