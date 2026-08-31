import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PwaServiceWorker } from "./pwa-service-worker";

describe("PwaServiceWorker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("registers the root-scoped install worker in production", async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { register } });
    vi.stubEnv("NODE_ENV", "production");

    render(<PwaServiceWorker />);

    await vi.waitFor(() => expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" }));
  });
});
