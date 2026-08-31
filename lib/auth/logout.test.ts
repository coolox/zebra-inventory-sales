import { describe, expect, it, vi } from "vitest";
import { logoutAndRedirect } from "./logout";

describe("logoutAndRedirect", () => {
  it("clears server and browser sessions before replacing the page", async () => {
    const requestServerLogout = vi.fn().mockResolvedValue(undefined);
    const clearBrowserSession = vi.fn().mockResolvedValue(undefined);
    const navigate = vi.fn();

    await logoutAndRedirect({ requestServerLogout, clearBrowserSession, navigate });

    expect(requestServerLogout).toHaveBeenCalledOnce();
    expect(clearBrowserSession).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  it("still reaches login when both cleanup operations fail", async () => {
    const navigate = vi.fn();

    await logoutAndRedirect({
      requestServerLogout: vi.fn().mockRejectedValue(new Error("server unavailable")),
      clearBrowserSession: vi.fn().mockRejectedValue(new Error("browser cleanup failed")),
      navigate,
    });

    expect(navigate).toHaveBeenCalledWith("/login");
  });

  it("does not wait forever for a stalled auth request", async () => {
    vi.useFakeTimers();
    const navigate = vi.fn();
    const pending = new Promise<void>(() => undefined);
    const logout = logoutAndRedirect({
      requestServerLogout: () => pending,
      clearBrowserSession: () => pending,
      navigate,
      timeoutMs: 50,
    });

    await vi.advanceTimersByTimeAsync(50);
    await logout;

    expect(navigate).toHaveBeenCalledWith("/login");
    vi.useRealTimers();
  });
});
