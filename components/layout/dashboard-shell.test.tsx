import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardShell } from "./dashboard-shell";
describe("DashboardShell", () => it("renders desktop and mobile navigation hosts", () => { render(<DashboardShell nav={<nav>Navigation</nav>} mobileOpen onMobileClose={vi.fn()}><main>Workspace</main></DashboardShell>); expect(screen.getAllByText("Navigation")).toHaveLength(2); expect(screen.getByText("Workspace")).toBeInTheDocument(); }));
