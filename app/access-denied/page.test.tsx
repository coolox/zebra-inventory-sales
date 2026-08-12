import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: { signOut: vi.fn() } }) }));
import AccessDeniedPage from "./page";

describe("AccessDeniedPage", () => {
  beforeEach(() => { window.localStorage.setItem("zebra-locale", "tr"); });
  it("renders the stored Turkish locale", async () => {
    render(<AccessDeniedPage />);
    expect(await screen.findByRole("heading", { name: "Erişim atanmamış" })).toBeInTheDocument();
  });
});
