const sensitiveKey = /authorization|cookie|email|password|phone|secret|token|api.?key|service.?role/i;
const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const bearer = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const querySecret = /([?&](?:access_token|token|code|key|secret|password)=)[^&#\s]+/gi;

function redactString(value: string) {
  return value
    .replace(bearer, "Bearer [redacted]")
    .replace(querySecret, "$1[redacted]")
    .replace(email, "[redacted-email]")
    .slice(0, 500);
}

/** Converts arbitrary error context into bounded, log-safe primitives. */
export function redactObservabilityValue(value: unknown, depth = 0): unknown {
  if (depth > 3) return "[truncated]";
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => redactObservabilityValue(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).slice(0, 20).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? "[redacted]" : redactObservabilityValue(item, depth + 1),
      ]),
    );
  }
  return String(value).slice(0, 500);
}

export function redactError(error: unknown) {
  if (error instanceof Error) return { name: error.name || "Error", message: redactString(error.message) };
  if (typeof error === "object" && error) {
    const source = error as Record<string, unknown>;
    return {
      name: typeof source.name === "string" ? redactString(source.name) : "Error",
      message: typeof source.message === "string" ? redactString(source.message) : "Unknown error",
    };
  }
  return { name: "Error", message: redactString(String(error)) };
}
