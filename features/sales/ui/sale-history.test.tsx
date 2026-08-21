import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SaleHistoryLine, SaleHistoryRecord } from "../model/sale-history";
import { SaleHistory } from "./sale-history";

const line: SaleHistoryLine = {
  id: "sale-1:line-1",
  saleId: "sale-1",
  sourceSaleLineId: "line-1",
  productId: "variant-1",
  sellerId: "seller-1",
  seller: "Elif Demir",
  store: "clothing",
  product: "Silk Midi Dress",
  code: "KM-9902",
  size: "M",
  quantity: 1,
  revenueEur: 100,
  marginEur: 50,
  dayOffset: 0,
  time: "12:30",
  status: "confirmed",
  paymentSnapshot: "€100.00",
};

const record: SaleHistoryRecord = {
  id: "sale-1",
  saleId: "sale-1",
  sellerId: "seller-1",
  seller: "Elif Demir",
  store: "clothing",
  quantity: 1,
  revenueEur: 100,
  marginEur: 50,
  dayOffset: 0,
  time: "12:30",
  status: "confirmed",
  paymentSnapshot: "€100.00",
  ticketTotalSnapshot: "€100.00",
  lines: [line],
};

describe("SaleHistory", () => {
  it("renders a localized empty state", () => {
    render(<SaleHistory locale="tr" records={[]} />);
    expect(screen.getByText("Bu filtre için satış kaydı yok.")).toBeInTheDocument();
  });

  it("opens a ticket detail dialog with persisted sale snapshots", async () => {
    const user = userEvent.setup();
    render(<SaleHistory locale="en" records={[record]} />);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress/ }));
    const dialog = screen.getByRole("dialog", { name: "Sale details" });
    expect(dialog).toHaveTextContent("Elif Demir");
    expect(dialog).toHaveTextContent("€100.00");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Sale details" })).not.toBeInTheDocument();
  });

  it("renders one €150 ticket with two exact line totals", async () => {
    const user = userEvent.setup();
    const secondLine: SaleHistoryLine = {
      ...line,
      id: "sale-1:line-2",
      sourceSaleLineId: "line-2",
      productId: "variant-2",
      product: "Structured Dress",
      code: "TTR",
      size: "L",
      revenueEur: 100,
      marginEur: 45,
      paymentSnapshot: "€150.00",
    };
    const ticket: SaleHistoryRecord = {
      ...record,
      quantity: 2,
      revenueEur: 150,
      marginEur: 65,
      paymentSnapshot: "€150.00",
      ticketTotalSnapshot: "€150.00",
      lines: [{ ...line, revenueEur: 50, marginEur: 20, paymentSnapshot: "€150.00" }, secondLine],
    };

    render(<SaleHistory locale="en" records={[ticket]} />);

    expect(screen.getAllByRole("button", { name: /Silk Midi Dress \+ Structured Dress/ })).toHaveLength(1);
    expect(screen.getAllByText("€150.00")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress \+ Structured Dress/ }));
    const dialog = screen.getByRole("dialog", { name: "Sale details" });
    expect(within(dialog).getByText("€50.00")).toBeInTheDocument();
    expect(within(dialog).getByText("€100.00")).toBeInTheDocument();
    expect(within(dialog).getAllByText("€150.00")).toHaveLength(2);
  });

  it("shows cancellation once for a permitted confirmed ticket and requires a reason", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn().mockResolvedValue(undefined);
    render(<SaleHistory locale="en" records={[record]} canCancel onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress/ }));
    await user.click(screen.getByRole("button", { name: "Cancel sale" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel sale" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel sale" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a cancellation reason.");
    await user.type(screen.getByLabelText("Cancellation reason"), "Customer returned it");
    await user.click(within(dialog).getByRole("button", { name: "Cancel sale" }));
    expect(onCancel).toHaveBeenCalledWith("sale-1", "Customer returned it");
  });

  it("does not show cancellation for an already cancelled ticket or without permission", async () => {
    const user = userEvent.setup();
    render(<SaleHistory locale="en" records={[{ ...record, status: "cancelled", lines: [{ ...line, status: "cancelled" }] }]} canCancel onCancel={async () => undefined} />);
    await user.click(screen.getByRole("button", { name: /Silk Midi Dress/ }));
    expect(screen.queryByRole("button", { name: "Cancel sale" })).not.toBeInTheDocument();
  });

  it("shows exchange details on the exact line and prevents a second mutation", async () => {
    const user = userEvent.setup();
    const exchange = {
      id: "exchange",
      saleId: "sale-1",
      sourceSaleLineId: "line-1",
      sourceProductId: "variant-1",
      replacementProductId: "variant-2",
      replacementProduct: "Structured Jacket",
      replacementCode: "TR-07",
      replacementSize: "L",
      sellerId: "seller-1",
      seller: "Elif Demir",
      store: "clothing" as const,
      quantity: 1,
      topUpEur: 20,
      marginDeltaEur: 5,
      reason: "Different size",
      paymentSnapshot: "20.00 EUR",
      dayOffset: 0,
      time: "13:00",
    };
    const exchanged = {
      ...record,
      ticketTotalSnapshot: "€120.00",
      lines: [{ ...line, exchange }],
    };
    render(<SaleHistory locale="en" records={[exchanged]} canCancel canExchange onCancel={async () => undefined} onExchange={async () => undefined} products={[]} paymentRates={{ EUR: 1, USD: 1, TRY: 1, RUB: 1, GBP: 1 }} />);
    await user.click(screen.getByRole("button", { name: /Structured Jacket/ }));
    expect(screen.getByRole("dialog", { name: "Sale details" })).toHaveTextContent("Exchange top-up€20.00 · 20.00 EUR");
    expect(screen.queryByRole("button", { name: "Exchange item" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel sale" })).not.toBeInTheDocument();
  });

  it("lets Owner filter sellers but locks Seller to their own scope", async () => {
    const user = userEvent.setup();
    const second = {
      ...record,
      id: "sale-2",
      saleId: "sale-2",
      sellerId: "seller-2",
      seller: "Mert Kaya",
      lines: [{ ...line, id: "sale-2:line-2", saleId: "sale-2", sellerId: "seller-2", seller: "Mert Kaya", product: "Wool Jacket" }],
    };
    render(<SaleHistory locale="en" records={[record, second]} />);
    await user.selectOptions(screen.getByLabelText("Seller"), "seller-2");
    expect(screen.getByRole("button", { name: /Wool Jacket/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Silk Midi Dress/ })).not.toBeInTheDocument();
  });

  it("does not render Seller selector and retains only their tickets", () => {
    const second = {
      ...record,
      id: "sale-2",
      saleId: "sale-2",
      sellerId: "seller-2",
      seller: "Mert Kaya",
      lines: [{ ...line, id: "sale-2:line-2", saleId: "sale-2", sellerId: "seller-2", seller: "Mert Kaya", product: "Wool Jacket" }],
    };
    render(<SaleHistory locale="en" records={[record, second]} sellerScope="seller-1" />);
    expect(screen.queryByLabelText("Seller")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Silk Midi Dress/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Wool Jacket/ })).not.toBeInTheDocument();
  });
});
