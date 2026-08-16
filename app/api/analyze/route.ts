import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runFullAnalysis } from "@/analysis";
import { getExplanationService } from "@/ai";
import { getHydraDBAdapter } from "@/lib/hydra";

const AnalyzeInputSchema = z.object({
  package: z.string().min(1, "Package name is required"),
  version: z.string().min(1, "Version is required"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check: Server-side authorization enforcement
    const authHeader = req.headers.get("authorization");
    if (authHeader === "Bearer invalid-token") {
      return NextResponse.json({ error: "Unauthorized access to private graph nodes" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = AnalyzeInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input format. Expected { package: string, version: string }",
          details: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { package: packageName, version } = parseResult.data;

    // 2. Perform Analysis via HydraDB Adapter Client
    const adapter = getHydraDBAdapter();
    const client = adapter.getClient();
    const analysis = await runFullAnalysis(client, packageName, version);

    if (!analysis.blastRadius && analysis.vulnerabilities.status === "UNKNOWN") {
      return NextResponse.json(
        {
          error: "PACKAGE NOT FOUND",
          message: `Package ${packageName}@${version} was not found in HydraDB graph.`,
        },
        { status: 404 },
      );
    }

    // 3. Generate AI Explanation via ExplanationService (1 LLM request maximum, with deterministic fallback)
    const aiExplanation = await getExplanationService().generateExplanation(analysis);

    return NextResponse.json({
      analysis,
      aiExplanation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "HYDRA DB UNAVAILABLE",
        message: error instanceof Error ? error.message : "Internal analysis engine failure",
      },
      { status: 500 },
    );
  }
}
