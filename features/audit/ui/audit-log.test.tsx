import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuditLog } from "./audit-log";

describe("AuditLog localization", () => {
  it("translates visible categories and empty state while keeping category query keys internal", async () => {
    const load = vi.fn().mockResolvedValue({ items: [], hasMore: false });
    render(<AuditLog locale="tr" load={load} />);

    expect(await screen.findByText("Bu filtreyle eşleşen denetim kaydı yok.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Satış" })).toBeInTheDocument();
    await screen.getByRole("button", { name: "Satış" }).click();
    expect(load).toHaveBeenLastCalledWith(1, "sale");
  });

  it("filters loaded audit records and never renders sensitive metadata", async () => {
    const user = userEvent.setup();
    const load = vi.fn().mockResolvedValue({ items: [
      { id: "1", action: "sale.confirmed", category: "sale", entityType: "sale", entityId: "sale-1", actorName: "Owner", createdAt: "2026-08-13T10:00:00Z", details: { source: "web", email: "hidden@example.test", token: "hidden" } },
      { id: "2", action: "receipt.confirmed", category: "receipt", entityType: "receipt", entityId: "receipt-1", actorName: "Seller", createdAt: "2026-08-12T10:00:00Z", details: {} },
    ], hasMore: true });
    render(<AuditLog locale="en" load={load} />);

    expect(await screen.findByText("sale.confirmed")).toBeInTheDocument();
    expect(screen.getByText("web")).toBeInTheDocument();
    expect(screen.queryByText("hidden@example.test")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Actor"), "Seller");
    expect(screen.queryByText("sale.confirmed")).not.toBeInTheDocument();
    expect(screen.getByText("receipt.confirmed")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(load).toHaveBeenLastCalledWith(2, undefined);
  });
});
