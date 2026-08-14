import { describe, expect, it } from "vitest";
import { redactError, redactObservabilityValue } from "./redact";

describe("observability redaction", () => {
  it("removes PII, credentials and secret-shaped query values", () => {
    const value = redactObservabilityValue({
      email: "owner@zebra.store",
      authorization: "Bearer eyJ.super-secret.token",
      nested: { message: "failed for seller@zebra.store at https://zebra.test/?token=abc123" },
      phone: "+90 555 555 55 55",
    }) as Record<string, unknown>;

    expect(value).toEqual({
      email: "[redacted]",
      authorization: "[redacted]",
      nested: { message: "failed for [redacted-email] at https://zebra.test/?token=[redacted]" },
      phone: "[redacted]",
    });
  });

  it("keeps only a safe, bounded error shape", () => {
    expect(redactError(new Error("Magic link for owner@zebra.store failed with Bearer abc"))).toEqual({
      name: "Error",
      message: "Magic link for [redacted-email] failed with Bearer [redacted]",
    });
  });
});
