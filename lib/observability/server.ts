import { redactError, redactObservabilityValue } from "./redact";

type ServerCapture = {
  operation: string;
  error: unknown;
  request?: Request;
  correlationId?: string;
  context?: Record<string, unknown>;
};

function enabled() {
  return process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "true";
}

function safeId(value: string | null | undefined) {
  return value?.replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 128) || `obs-${Date.now()}`;
}

/**
 * Emits only structured, redacted metadata. Vercel captures stderr in its log
 * stream; when disabled this is intentionally a no-op.
 */
export function captureServerError({ operation, error, request, correlationId, context }: ServerCapture) {
  if (!enabled()) return;
  const requestId = request?.headers.get("x-vercel-id") || request?.headers.get("x-request-id");
  const path = request ? new URL(request.url).pathname : undefined;
  console.error(JSON.stringify({
    event: "zebra.observability.error",
    level: "error",
    source: "server",
    environment: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_APP_MODE || "unknown",
    operation: operation.replace(/[^a-z0-9._-]/gi, "").slice(0, 80) || "unknown",
    correlationId: safeId(correlationId || requestId),
    request: path ? { path } : undefined,
    error: redactError(error),
    context: context ? redactObservabilityValue(context) : undefined,
  }));
}
