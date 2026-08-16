import { z } from "zod";

export const NodeTypeSchema = z.enum([
  "Package",
  "PackageVersion",
  "Vulnerability",
  "Repository",
  "Service",
  "Environment",
  "Maintainer",
]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const RelationshipTypeSchema = z.enum([
  "HAS_VERSION",
  "DEPENDS_ON",
  "AFFECTED_BY",
  "USED_BY",
  "RUNS_IN",
  "MAINTAINED_BY",
  "PUBLISHED_BY",
]);
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

export const PackageNodeSchema = z.object({
  id: z.string(),
  type: z.literal("Package"),
  name: z.string(),
  ecosystem: z.string().default("npm"),
  description: z.string().optional(),
});
export type PackageNode = z.infer<typeof PackageNodeSchema>;

export const PackageVersionNodeSchema = z.object({
  id: z.string(),
  type: z.literal("PackageVersion"),
  packageName: z.string(),
  version: z.string(),
  publishedAt: z.string().optional(),
  readme: z.string().optional(),
});
export type PackageVersionNode = z.infer<typeof PackageVersionNodeSchema>;

export const VulnerabilityNodeSchema = z.object({
  id: z.string(),
  type: z.literal("Vulnerability"),
  advisoryId: z.string(),
  aliases: z.array(z.string()),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "UNKNOWN"]),
  affectedRange: z.string(),
  fixedVersion: z.string().nullable(),
  publishedAt: z.string().optional(),
  summary: z.string(),
});
export type VulnerabilityNode = z.infer<typeof VulnerabilityNodeSchema>;

export const RepositoryNodeSchema = z.object({
  id: z.string(),
  type: z.literal("Repository"),
  name: z.string(),
  isPrivate: z.boolean().default(false),
  url: z.string().optional(),
});
export type RepositoryNode = z.infer<typeof RepositoryNodeSchema>;

export const ServiceNodeSchema = z.object({
  id: z.string(),
  type: z.literal("Service"),
  name: z.string(),
  isPrivate: z.boolean().default(false),
  activeFrom: z.string().optional(),
  activeTo: z.string().optional(),
});
export type ServiceNode = z.infer<typeof ServiceNodeSchema>;

export const EnvironmentNodeSchema = z.object({
  id: z.string(),
  type: z.literal("Environment"),
  name: z.string(),
  isProduction: z.boolean(),
});
export type EnvironmentNode = z.infer<typeof EnvironmentNodeSchema>;

export const MaintainerNodeSchema = z.object({
  id: z.string(),
  type: z.literal("Maintainer"),
  username: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
});
export type MaintainerNode = z.infer<typeof MaintainerNodeSchema>;

export const GraphNodeSchema = z.discriminatedUnion("type", [
  PackageNodeSchema,
  PackageVersionNodeSchema,
  VulnerabilityNodeSchema,
  RepositoryNodeSchema,
  ServiceNodeSchema,
  EnvironmentNodeSchema,
  MaintainerNodeSchema,
]);
export type GraphNode = z.infer<typeof GraphNodeSchema>;

export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: RelationshipTypeSchema,
  metadata: z.record(z.unknown()).optional(),
});
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;

export const HydraGraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export type HydraGraphData = z.infer<typeof HydraGraphDataSchema>;
