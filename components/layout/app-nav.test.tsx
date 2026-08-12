import { LayoutDashboard } from "lucide-react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppNav } from "./app-nav";

describe("AppNav", () => {
  it("navigates and closes the mobile drawer through explicit callbacks", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onClose = vi.fn();

    render(
      <AppNav
        items={[{ id: "overview", label: "Overview", Icon: LayoutDashboard }]}
        workspaceLabel="Workspace"
        storeLabel="Zebra Boutique"
        storeMeta="Active"
        profile={<span>Owner</span>}
        onNavigate={onNavigate}
        onClose={onClose}
        closeLabel="Close"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Overview" }));
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onNavigate).toHaveBeenCalledWith("overview");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
