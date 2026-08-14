import { redactError, redactObservabilityValue } from "./redact";

type ClientFailure = {
  operation: string;
  error: unknown;
  correlationId?: string;
  context?: Record<string, unknown>;
};

function enabled() {
  return process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === "true";
}

/** Fire-and-forget reporting: business flows must never fail because monitoring does. */
export function reportClientFailure({ operation, error, correlationId, context }: ClientFailure) {
  if (!enabled() || typeof window === "undefined" || typeof fetch !== "function") return;
  const body = JSON.stringify({
    operation: operation.replace(/[^a-z0-9._-]/gi, "").slice(0, 80) || "unknown",
    correlationId: correlationId?.replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 128),
    error: redactError(error),
    context: context ? redactObservabilityValue(context) : undefined,
  });
  void fetch("/api/observability", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}
