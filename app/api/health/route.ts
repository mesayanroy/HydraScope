import { NextResponse } from "next/server";

import { getHealthStatus } from "@/server/health";

export async function GET() {
  return NextResponse.json(getHealthStatus());
}
