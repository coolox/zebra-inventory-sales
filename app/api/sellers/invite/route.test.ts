import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimits } from "@/lib/rate-limit/sliding-window";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  captureServerError: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.createAdminClient }));
vi.mock("@/lib/observability/server", () => ({ captureServerError: mocks.captureServerError }));

import { POST } from "./route";

const request = (body: string) => new NextRequest("http://localhost/api/sellers/invite", { method: "POST", headers: { "x-forwarded-for": "198.51.100.10", "content-type": "application/json" }, body });
const validInvite = { storeId: "11111111-1111-4111-8111-111111111111", idempotencyKey: "11111111-1111-4111-8111-111111111112", fullName: "Doğan Yılmaz", email: "seller@example.test", phone: "+90 555 000 00 00" };

describe("seller invite API validation", () => {
  beforeEach(() => {
    resetRateLimits();
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "owner-1" } }, error: null }) },
      from: () => {
        const query = { eq: () => query, maybeSingle: vi.fn().mockResolvedValue({ data: { id: "membership-1" } }) };
        return { select: () => query };
      },
    });
    mocks.createAdminClient.mockReset();
    mocks.captureServerError.mockReset();
  });

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

  it("keeps the configuration failure generic while recording a redacted diagnostic stage", async () => {
    mocks.createAdminClient.mockImplementation(() => { throw new Error("missing server credential"); });

    const response = await POST(request(JSON.stringify(validInvite)));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "This service is temporarily unavailable.", code: "unavailable" });
    expect(mocks.captureServerError).toHaveBeenCalledWith(expect.objectContaining({
      operation: "seller.invite.configuration",
      context: { stage: "admin_client" },
    }));
  });
});
