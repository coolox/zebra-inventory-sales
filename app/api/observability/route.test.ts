import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { resetRateLimits } from "@/lib/rate-limit/sliding-window";

describe("POST /api/observability", () => {
  beforeEach(() => resetRateLimits());

  it("captures a synthetic client failure without returning its details", async () => {
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const previous = process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
    process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED = "true";
    const response = await POST(new NextRequest("https://zebra.test/api/observability", {
      method: "POST",
      body: JSON.stringify({ operation: "sale.confirm", correlationId: "sale:1", error: { message: "failed for owner@zebra.store" }, context: { email: "owner@zebra.store" } }),
    }));
    if (previous === undefined) delete process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
    else process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED = previous;

    expect(response.status).toBe(204);
    expect(JSON.stringify(output.mock.calls)).not.toContain("owner@zebra.store");
  });

  it("rejects malformed telemetry payloads", async () => {
    const response = await POST(new NextRequest("https://zebra.test/api/observability", { method: "POST", body: "[]" }));
    expect(response.status).toBe(400);
  });
});
