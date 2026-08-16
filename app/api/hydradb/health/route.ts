import { NextResponse } from "next/server";
import { getHydraDBAdapter } from "@/lib/hydra";

export async function GET() {
  try {
    const adapter = getHydraDBAdapter();
    const health = await adapter.healthCheck();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: "OFFLINE",
        mode: "LIVE",
        nodeCount: 0,
        edgeCount: 0,
        message: error instanceof Error ? error.message : "HydraDB connection failure",
      },
      { status: 503 },
    );
  }
}
