import { describe, expect, it } from "vitest";
import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, rateLimitKey, resetRateLimits } from "./sliding-window";

describe("checkRateLimit", () => {
  beforeEach(resetRateLimits);
  it("blocks after the limit and resets after its window", () => { expect(checkRateLimit("test", 2, 1000, 0).allowed).toBe(true); expect(checkRateLimit("test", 2, 1000, 1).allowed).toBe(true); expect(checkRateLimit("test", 2, 1000, 2).allowed).toBe(false); expect(checkRateLimit("test", 2, 1000, 1001).allowed).toBe(true); });
  it("keeps rate-limit scope separate and prefers the platform forwarded address", () => {
    const request = new Request("https://zebra.test", { headers: { "x-forwarded-for": "fallback", "x-vercel-forwarded-for": "platform" } });
    expect(rateLimitKey(request, "invite")).toBe("invite:platform");
    expect(rateLimitKey(request, "status")).toBe("status:platform");
  });
});
