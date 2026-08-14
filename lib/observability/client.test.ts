import { afterEach, describe, expect, it, vi } from "vitest";
import { reportClientFailure } from "./client";

const originalEnabled = process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;

afterEach(() => {
  if (originalEnabled === undefined) delete process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
  else process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED = originalEnabled;
  vi.unstubAllGlobals();
});

describe("reportClientFailure", () => {
  it("does nothing when monitoring is not configured", () => {
    delete process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED;
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    reportClientFailure({ operation: "sale.confirm", error: new Error("ignored") });
    expect(request).not.toHaveBeenCalled();
  });

  it("sends a redacted synthetic client failure without blocking the caller", () => {
    process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED = "true";
    const request = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal("fetch", request);

    reportClientFailure({ operation: "sale.confirm", correlationId: "sale:1", error: new Error("owner@zebra.store failed") });

    expect(request).toHaveBeenCalledWith("/api/observability", expect.objectContaining({ method: "POST", keepalive: true }));
    expect(String(request.mock.calls[0][1].body)).not.toContain("owner@zebra.store");
  });
});
