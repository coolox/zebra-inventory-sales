type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export const rateLimitPolicies = {
  sellerInvite: { limit: 5, windowMs: 60_000 },
  sellerStatus: { limit: 20, windowMs: 60_000 },
  session: { limit: 60, windowMs: 60_000 },
} as const;

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return { allowed: true, retryAfterSeconds: 0 }; }
  if (current.count >= limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitKey(request: Request, scope: string) {
  const address = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${scope}:${address}`;
}

/** Test-only reset; keys are never logged or returned to callers. */
export function resetRateLimits() { buckets.clear(); }
