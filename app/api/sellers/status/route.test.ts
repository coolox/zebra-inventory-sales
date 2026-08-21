import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { resetRateLimits } from "@/lib/rate-limit/sliding-window";
import { POST } from "./route";

const request = (body: string) => new NextRequest("http://localhost/api/sellers/status", { method: "POST", headers: { "x-forwarded-for": "203.0.113.8", "content-type": "application/json" }, body });

describe("seller status API validation", () => {
  beforeEach(resetRateLimits);

  it("rejects malformed status changes before the membership query", async () => {
    const response = await POST(request(JSON.stringify({ storeId: "11111111-1111-4111-8111-111111111111", sellerId: "22222222-2222-4222-8222-222222222222", status: "invited" })));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Request data is invalid.", code: "invalid_request" });
  });

  it("rate limits Seller administration before parsing the next body", async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) expect((await POST(request("null"))).status).toBe(400);
    const response = await POST(request("null"));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(await response.json()).toEqual({ error: "Too many requests. Try again later.", code: "rate_limited" });
  });
});
