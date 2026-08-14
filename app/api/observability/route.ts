import { NextRequest, NextResponse } from "next/server";
import { domainError } from "@/lib/http/errors";
import { captureServerError } from "@/lib/observability/server";
import { checkRateLimit, rateLimitKey, rateLimitPolicies } from "@/lib/rate-limit/sliding-window";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  const policy = rateLimitPolicies.observability;
  const limit = checkRateLimit(rateLimitKey(request, "observability"), policy.limit, policy.windowMs);
  if (!limit.allowed) return domainError("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  if (Number(request.headers.get("content-length") || 0) > 8_192) return domainError("invalid_request", 400);

  let payload: unknown;
  try { payload = await request.json(); } catch { return domainError("invalid_json", 400); }
  if (!isRecord(payload) || typeof payload.operation !== "string" || !isRecord(payload.error)) return domainError("invalid_request", 400);

  captureServerError({
    operation: payload.operation,
    correlationId: typeof payload.correlationId === "string" ? payload.correlationId : undefined,
    error: payload.error,
    request,
    context: isRecord(payload.context) ? payload.context : undefined,
  });
  return new NextResponse(null, { status: 204 });
}
