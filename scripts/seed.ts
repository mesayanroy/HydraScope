import { createDeterministicFixtures } from "../lib/hydra/fixtures";
import { getHydraDBAdapter } from "../lib/hydra/adapter";

async function main() {
  console.log("🌱 [HydraScope] Seeding deterministic supply-chain incident graph fixtures into HydraDB...");

  const adapter = getHydraDBAdapter();
  const fixtures = createDeterministicFixtures();

  let nodeCount = 0;
  let edgeCount = 0;

  for (const node of fixtures.nodes) {
    if (node.type === "Package") {
      await adapter.upsertPackage(node);
    } else if (node.type === "PackageVersion") {
      await adapter.upsertPackageVersion(node);
    } else if (node.type === "Vulnerability") {
      await adapter.upsertVulnerability(node);
    } else if (node.type === "Repository") {
      await adapter.upsertRepository(node);
    } else if (node.type === "Service") {
      await adapter.upsertService(node);
    } else if (node.type === "Environment") {
      await adapter.upsertEnvironment(node);
    } else if (node.type === "Maintainer") {
      await adapter.upsertMaintainer(node);
    }
    nodeCount++;
  }

  for (const edge of fixtures.edges) {
    await adapter.createRelationship(edge.source, edge.target, edge.type, edge.metadata);
    edgeCount++;
  }

  const health = await adapter.healthCheck();
  console.log(`✅ [HydraScope] Seeding complete! Seeded ${nodeCount} nodes and ${edgeCount} relationships.`);
  console.log(`📡 [HydraDB] Connection Status: ${health.status} (${health.mode} mode)`);
}

main().catch((err) => {
  console.error("❌ [HydraScope] Seeding failed:", err);
  process.exit(1);
});
