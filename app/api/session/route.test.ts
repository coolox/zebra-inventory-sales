import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { resetRateLimits } from "@/lib/rate-limit/sliding-window";

const getUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}));

import { GET } from "./route";

const request = () => new NextRequest("http://localhost/api/session", {
  headers: { "x-forwarded-for": "192.0.2.44" },
});

describe("session API rate limit", () => {
  beforeEach(() => {
    resetRateLimits();
    getUser.mockResolvedValue({ data: { user: null } });
  });

  it("allows normal anonymous session checks before limiting repeated requests", async () => {
    for (let attempt = 0; attempt < 60; attempt += 1) expect((await GET(request())).status).toBe(401);
    const response = await GET(request());
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeTruthy();
    expect(await response.json()).toEqual({ error: "Too many requests. Try again later.", code: "rate_limited" });
    expect(getUser).toHaveBeenCalledTimes(60);
  });
});
