import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signOut } })),
}));

import { POST } from "./route";

describe("logout API", () => {
  beforeEach(() => signOut.mockReset());

  it("clears the server session without caching the response", async () => {
    signOut.mockResolvedValue({ error: null });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true });
  });

  it("returns a stable unavailable error when auth logout fails", async () => {
    signOut.mockResolvedValue({ error: new Error("auth unavailable") });

    const response = await POST();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "This service is temporarily unavailable.",
      code: "unavailable",
    });
  });
});
