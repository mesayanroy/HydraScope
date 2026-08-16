import { getHydraDBAdapter, HydraDBClient as AdapterHydraClient } from "@/lib/hydra";

export { HydraDBClient } from "@/lib/hydra";

export type ConnectionHealth = {
  status: "ok" | "degraded" | "error";
  clientType: "in_memory" | "remote_hydradb";
  nodeCount: number;
  edgeCount: number;
  timestamp: string;
};

export function getHydraDBClient(): AdapterHydraClient {
  return getHydraDBAdapter().getClient();
}
