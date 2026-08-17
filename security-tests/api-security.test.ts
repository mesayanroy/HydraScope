import { describe, expect, it } from "vitest";
import { POST as analyzeHandler } from "../app/api/analyze/route";
import { NextRequest } from "next/server";

describe("API Security Audit & Boundary Test Suite", () => {
  it("rejects unauthorized token requests with HTTP 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid-token",
      },
      body: JSON.stringify({ package: "evil-lib", version: "2.0.0" }),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized access to private graph nodes");
  });

  it("handles malformed JSON and invalid payload shapes with HTTP 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invalidField: 123 }),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid input format");
  });

  it("handles path traversal and injection strings safely without crashing or exposing secrets", async () => {
    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package: "../../../etc/passwd", version: "1.0.0' OR '1'='1" }),
    });

    const res = await analyzeHandler(req);
    // Should safely return 404 Package Not Found without throwing stack traces or exposing secrets
    expect([404, 400]).toContain(res.status);
    const data = await res.json();
    expect(JSON.stringify(data)).not.toContain("password");
    expect(JSON.stringify(data)).not.toContain("HYDRA_API_KEY");
  });
});
