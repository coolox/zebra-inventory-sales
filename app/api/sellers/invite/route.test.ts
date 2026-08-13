import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { resetRateLimits } from "@/lib/rate-limit/sliding-window";
import { POST } from "./route";

const request = (body: string) => new NextRequest("http://localhost/api/sellers/invite", { method: "POST", headers: { "x-forwarded-for": "198.51.100.10", "content-type": "application/json" }, body });

describe("seller invite API validation", () => {
  beforeEach(resetRateLimits);

  it("rejects malformed JSON before any privileged action", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Invalid request body.", code: "invalid_json" });
  });

  it("rejects null, arrays and malformed external payloads with one safe domain error", async () => {
    for (const body of ["null", "[]", JSON.stringify({ storeId: "not-a-uuid" })]) {
      const response = await POST(request(body));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Request data is invalid.", code: "invalid_request" });
    }
  });

  it("rate limits invite attempts before parsing the next body", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) expect((await POST(request("null"))).status).toBe(400);
    const response = await POST(request("null"));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(await response.json()).toEqual({ error: "Too many requests. Try again later.", code: "rate_limited" });
  });
});
