import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExchangeFlow } from "./exchange-flow";

const source = { id: "sale:line", saleId: "sale", sourceSaleLineId: "line", productId: "old", sellerId: "seller", seller: "Elif", store: "clothing" as const, product: "Old dress", code: "OLD", size: "M", quantity: 1, revenueEur: 100, marginEur: 40, dayOffset: 0, time: "12:00", status: "confirmed" as const, paymentSnapshot: "€100" };
const product = { id: "new", store: "clothing" as const, stock: 2, name: "New dress", code: "NEW", color: "Blue", size: "L" } as never;
const rates = { EUR: 1, USD: 1, TRY: 0.03, RUB: 0.01, GBP: 1.2 };

async function fillBase(user: ReturnType<typeof userEvent.setup>, price: string) {
  await user.type(screen.getByLabelText(/Product code or barcode/), "NEW");
  await user.click(screen.getByRole("button", { name: "Blue" }));
  await user.click(screen.getByRole("button", { name: /L 2/ }));
  await user.type(screen.getByLabelText(/Replacement price/), price);
  await user.type(screen.getByLabelText("Exchange reason"), "Size change");
}

describe("ExchangeFlow", () => {
  it("shows the required top-up for an expensive replacement", async () => {
    const user = userEvent.setup(); const onComplete = vi.fn().mockResolvedValue(undefined);
    render(<ExchangeFlow locale="en" source={source} products={[product]} rates={rates} onComplete={onComplete} />);
    await fillBase(user, "130");
    expect(screen.getByText("Customer top-up: €30.00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm exchange" }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ topUpEur: 30 }));
  });

  it("shows a currency-specific payment amount for each FX rate", async () => {
    const user = userEvent.setup();
    render(<ExchangeFlow locale="en" source={source} products={[product]} rates={rates} onComplete={async () => undefined} />);
    await fillBase(user, "130");
    expect(screen.getByText("Payment amount: 30.00 EUR")).toBeInTheDocument();
  });

  it("explains that equal price creates no refund", async () => {
    const user = userEvent.setup();
    render(<ExchangeFlow locale="en" source={source} products={[product]} rates={rates} onComplete={async () => undefined} />);
    await fillBase(user, "100");
    expect(screen.getByText(/No refund or credit/)).toBeInTheDocument();
  });

  it("explains that cheaper price creates no refund", async () => {
    const user = userEvent.setup();
    render(<ExchangeFlow locale="en" source={source} products={[product]} rates={rates} onComplete={async () => undefined} />);
    await fillBase(user, "70");
    expect(screen.getByText(/No refund or credit/)).toBeInTheDocument();
  });
});
