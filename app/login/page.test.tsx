import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/workspace/model/app-mode", () => ({ isLiveMode: false }));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, "", "/login"); });
  it("renders English and persists a Turkish language selection", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: "Sign in securely" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "TR" }));
    expect(screen.getByRole("heading", { name: "Güvenli giriş" })).toBeInTheDocument();
    expect(window.localStorage.getItem("zebra-locale")).toBe("tr");
  });
});
