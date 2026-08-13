import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DashboardShell } from "./dashboard-shell";
describe("DashboardShell", () => {
  it("renders desktop and mobile navigation hosts", () => { render(<DashboardShell nav={<nav>Navigation</nav>} mobileOpen onMobileClose={vi.fn()}><main>Workspace</main></DashboardShell>); expect(screen.getAllByText("Navigation")).toHaveLength(2); expect(screen.getByText("Workspace")).toBeInTheDocument(); });
  it("exposes and traps the mobile drawer as a dialog", async () => {
    const user = userEvent.setup();
    const trigger = document.createElement("button");
    trigger.textContent = "Open navigation";
    document.body.append(trigger);
    trigger.focus();
    render(<DashboardShell nav={<><button type="button">Close navigation</button><button type="button">Overview</button></>} mobileOpen onMobileClose={vi.fn()} mobileNavLabel="Workspace navigation"><main>Workspace</main></DashboardShell>);
    const dialog = screen.getByRole("dialog", { name: "Workspace navigation" });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Close navigation" })).toHaveFocus());
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(within(dialog).getByRole("button", { name: "Overview" })).toHaveFocus();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    trigger.remove();
  });
});
