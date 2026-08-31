import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/logout", () => ({ logoutAndRedirect: vi.fn() }));
import AccessDeniedPage from "./page";

describe("AccessDeniedPage", () => {
  beforeEach(() => { window.localStorage.setItem("zebra-locale", "tr"); });
  it("renders the stored Turkish locale", async () => {
    render(<AccessDeniedPage />);
    expect(await screen.findByRole("heading", { name: "Erişim atanmamış" })).toBeInTheDocument();
  });
});
