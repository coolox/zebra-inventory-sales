import { afterEach, describe, expect, it, vi } from "vitest";
import { captureServerError } from "./server";

const originalEnabled = process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
const originalEnvironment = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalEnabled === undefined) delete process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
  else process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED = originalEnabled;
  if (originalEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalEnvironment;
  vi.restoreAllMocks();
});

describe("captureServerError", () => {
  it("is a no-op without configuration", () => {
    delete process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    captureServerError({ operation: "sale.confirm", error: new Error("should not emit") });
    expect(output).not.toHaveBeenCalled();
  });

  it("emits a redacted correlated server event when enabled", () => {
    process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED = "true";
    process.env.VERCEL_ENV = "preview";
    const output = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const request = new Request("https://zebra.test/api/observability?token=hidden", { headers: { "x-vercel-id": "req:123" } });

    captureServerError({ operation: "auth.magic_link", error: new Error("owner@zebra.store Bearer abc"), request, context: { email: "owner@zebra.store" } });

    const event = JSON.parse(String(output.mock.calls[0][0]));
    expect(event).toMatchObject({ environment: "preview", operation: "auth.magic_link", correlationId: "req:123", request: { path: "/api/observability" } });
    expect(JSON.stringify(event)).not.toContain("owner@zebra.store");
    expect(JSON.stringify(event)).not.toContain("Bearer abc");
  });
});
