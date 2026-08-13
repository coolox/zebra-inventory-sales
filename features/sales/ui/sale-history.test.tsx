import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SaleHistory } from "./sale-history";

const records = [{ id: "sale-1:line-1", saleId: "sale-1", productId: "variant-1", sellerId: "seller-1", seller: "Elif Demir", store: "clothing" as const, product: "Silk Midi Dress", code: "KM-9902", size: "M", quantity: 1, revenueEur: 100, marginEur: 50, dayOffset: 0, time: "12:30", status: "confirmed" as const, paymentSnapshot: "€100.00" }];

describe("SaleHistory", () => {
  it("renders a localized empty state", () => {
    render(<SaleHistory locale="tr" records={[]} />);
    expect(screen.getByText("Bu filtre için satış kaydı yok.")).toBeInTheDocument();
  });

  it("opens a detail dialog with persisted sale snapshots", async () => {
    const user = userEvent.setup();
    render(<SaleHistory locale="en" records={records} />);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress/ }));
    const dialog = screen.getByRole("dialog", { name: "Sale details" });
    expect(dialog).toHaveTextContent("Elif Demir");
    expect(dialog).toHaveTextContent("€100.00");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Sale details" })).not.toBeInTheDocument();
  });

  it("shows cancellation only for permitted confirmed sales and requires a reason", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(<SaleHistory locale="en" records={records} canCancel onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress/ }));
    await user.click(screen.getByRole("button", { name: "Cancel sale" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel sale" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel sale" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a cancellation reason.");
    await user.type(screen.getByLabelText("Cancellation reason"), "Customer returned it");
    await user.click(within(dialog).getByRole("button", { name: "Cancel sale" }));
    expect(onCancel).toHaveBeenCalledWith("sale-1", "Customer returned it");
  });

  it("does not show cancellation for an already cancelled sale or without permission", async () => {
    const user = userEvent.setup();
    render(<SaleHistory locale="en" records={[{ ...records[0], status: "cancelled" }]} canCancel onCancel={async () => undefined} />);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress/ }));
    expect(screen.queryByRole("button", { name: "Cancel sale" })).not.toBeInTheDocument();
  });

  it("shows exchange details and prevents a second mutation of the same line", async () => {
    const user = userEvent.setup();
    const exchange = { id: "exchange", saleId: "sale-1", sourceSaleLineId: "line-1", sourceProductId: "variant-1", replacementProductId: "variant-2", replacementProduct: "Structured Jacket", replacementCode: "TR-07", replacementSize: "L", sellerId: "seller-1", seller: "Elif Demir", store: "clothing" as const, quantity: 1, topUpEur: 20, marginDeltaEur: 5, reason: "Different size", paymentSnapshot: "20.00 EUR", dayOffset: 0, time: "13:00" };
    render(<SaleHistory locale="en" records={[{ ...records[0], paymentSnapshot: "€120.00", exchange }]} canCancel canExchange onCancel={async () => undefined} onExchange={async () => undefined} products={[]} paymentRates={{ EUR: 1, USD: 1, TRY: 1, RUB: 1, GBP: 1 }} />);
    await user.click(screen.getByRole("button", { name: /Structured Jacket/ }));
    expect(screen.getByRole("dialog", { name: "Sale details" })).toHaveTextContent("Exchange top-up€20.00 · 20.00 EUR");
    expect(screen.queryByRole("button", { name: "Exchange item" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel sale" })).not.toBeInTheDocument();
  });

  it("lets Owner filter sellers but locks Seller to their own scope", async () => {
    const user = userEvent.setup();
    const twoSellers = [...records, { ...records[0], id: "sale-2:line-2", saleId: "sale-2", sellerId: "seller-2", seller: "Mert Kaya", product: "Wool Jacket" }];
    render(<SaleHistory locale="en" records={twoSellers} />);
    await user.selectOptions(screen.getByLabelText("Seller"), "seller-2");
    expect(screen.getByRole("button", { name: /Wool Jacket/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Silk Midi Dress/ })).not.toBeInTheDocument();
  });

  it("does not render Seller selector and retains only their records", () => {
    const twoSellers = [...records, { ...records[0], id: "sale-2:line-2", saleId: "sale-2", sellerId: "seller-2", seller: "Mert Kaya", product: "Wool Jacket" }];
    render(<SaleHistory locale="en" records={twoSellers} sellerScope="seller-1" />);
    expect(screen.queryByLabelText("Seller")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Silk Midi Dress/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Wool Jacket/ })).not.toBeInTheDocument();
  });
});
