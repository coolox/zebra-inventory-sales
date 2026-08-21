import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, rateLimitKey, rateLimitPolicies, resetRateLimits } from "./sliding-window";

describe("checkRateLimit", () => {
  beforeEach(resetRateLimits);
  it("blocks after the limit and resets after its window", () => { expect(checkRateLimit("test", 2, 1000, 0).allowed).toBe(true); expect(checkRateLimit("test", 2, 1000, 1).allowed).toBe(true); expect(checkRateLimit("test", 2, 1000, 2).allowed).toBe(false); expect(checkRateLimit("test", 2, 1000, 1001).allowed).toBe(true); });
  it("keeps rate-limit scope separate and prefers the platform forwarded address", () => {
    const request = new Request("https://zebra.test", { headers: { "x-forwarded-for": "fallback", "x-vercel-forwarded-for": "platform" } });
    expect(rateLimitKey(request, "invite")).toBe("invite:platform");
    expect(rateLimitKey(request, "status")).toBe("status:platform");
  });

  it("keeps pilot normal-flow limits above a single user action", () => {
    expect(rateLimitPolicies.sellerInvite.limit).toBe(5);
    expect(rateLimitPolicies.sellerStatus.limit).toBe(20);
    expect(rateLimitPolicies.session.limit).toBe(60);
    expect(rateLimitPolicies.observability.limit).toBe(30);
    expect(Object.values(rateLimitPolicies).every((policy) => policy.windowMs === 60_000)).toBe(true);
  });
});
