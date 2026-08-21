import { render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByAltText("Zebra Boutique")).toHaveAttribute("src", expect.stringContaining("zebra-192.png"));
    expect(screen.getByText("Zebra Boutique")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in securely" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "TR" }));
    expect(screen.getByRole("heading", { name: "Güvenli giriş" })).toBeInTheDocument();
    expect(window.localStorage.getItem("zebra-locale")).toBe("tr");
  });

  it("shows a localized recovery action for an expired or reused link", async () => {
    window.history.replaceState({}, "", "/login?error=invalid_link&locale=tr");
    render(<LoginPage />);
    await waitFor(() => expect(screen.getByText("Bu giriş bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı isteyin.")).toBeInTheDocument());
  });
});
