import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { demoPaymentRates } from "../model/payments";
import { SaleFlow } from "./sale-flow";
import type { Product } from "@/lib/types";

const product: Product = {
  id: "variant-1", code: "TR07", barcode: "869000700001", name: "Dress", brand: "Zebra", category: "Dresses", gender: "women", color: "Black", size: "L", cost: 40, currency: "EUR", stock: 3, supplier: "Factory", store: "clothing", updated: "Today",
};

function renderFlow(onComplete = vi.fn(), locale: "en" | "tr" = "en", products: Product[] = [product]) {
  render(<SaleFlow products={products} sellerName="Elif" locale={locale} paymentRates={demoPaymentRates} onCancel={vi.fn()} onComplete={onComplete} />);
  return onComplete;
}

async function chooseVariant(user: ReturnType<typeof userEvent.setup>, pricingMode: "per_item" | "sale_total" = "per_item") {
  if (!screen.queryByLabelText(/Product code|Ürün kodu/)) {
    await user.click(screen.getByRole("button", { name: pricingMode === "per_item" ? /Per-item price|Ürün başına fiyat/ : /Total sale price|Toplam satış fiyatı/ }));
  }
  await user.type(screen.getByLabelText(/Product code|Ürün kodu/), "TR07");
  await user.click(screen.getByRole("button", { name: "Black" }));
  await user.click(screen.getByRole("button", { name: /L\s*\d/ }));
}

async function chooseProduct(user: ReturnType<typeof userEvent.setup>, price = "100") {
  await chooseVariant(user);
  await user.type(screen.getByLabelText(/Actual sale price|Gerçek satış fiyatı/), price);
}

async function addProduct(user: ReturnType<typeof userEvent.setup>, price = "100") {
  await chooseProduct(user, price);
  await user.click(screen.getByRole("button", { name: /Add another item|Başka ürün ekle/ }));
}

describe("SaleFlow", () => {
  it("starts with Price type and places per-item Mixed payment before the price", async () => {
    const user = userEvent.setup();
    renderFlow();

    expect(screen.getByText(/Price type/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Product code")).not.toBeInTheDocument();
    await chooseVariant(user);

    const mixedPayment = screen.getByLabelText("Mixed payment");
    const actualPrice = screen.getByLabelText(/Actual sale price/);
    expect(mixedPayment.compareDocumentPosition(actualPrice) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("finds a model by its barcode and keeps the color and size picker", async () => {
    const user = userEvent.setup();
    renderFlow();
    await user.click(screen.getByRole("button", { name: /Per-item price/ }));
    await user.type(screen.getByLabelText(/Product code or barcode/), "869000700001");

    expect(screen.getByText("Dress")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Black" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Black" }));
    expect(screen.getByRole("button", { name: /L\s*3/ })).toBeInTheDocument();
  });

  it("derives a single item EUR price from mixed payment lines", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow();
    await chooseVariant(user);

    expect(screen.getByLabelText(/Actual sale price/)).toHaveValue(null);
    await user.click(screen.getByLabelText("Mixed payment"));

    expect(screen.getByText("Add payment")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Remove payment" })).toHaveLength(2);
    expect(screen.queryByLabelText(/Actual sale price/)).not.toBeInTheDocument();
    expect(screen.queryByText("Enter the item price to check the payment total.")).not.toBeInTheDocument();
    expect(screen.getByText("Each payment amount must be greater than zero.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Amount 1"), "50");
    await user.type(screen.getByLabelText("Amount 2"), "50");
    await user.selectOptions(screen.getAllByLabelText("Currency")[1], "USD");

    expect(screen.getByText("Payment is balanced")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sell 1 item" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Sell 1 item" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([{ productId: "variant-1", quantity: 1, price: 96.5, currency: "EUR" }]);
    expect(onComplete.mock.calls[0][1]).toMatchObject([
      { method: "cash", amount: 50, currency: "EUR" },
      { method: "card", amount: 50, currency: "USD" },
    ]);
  });

  it("submits a normal sale directly with its selected payment method", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow();
    await chooseProduct(user);

    expect(screen.getByRole("button", { name: "Sell 1 item" })).toBeEnabled();
    expect(screen.queryByText("Add payment")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Payment method"), "card");
    await user.click(screen.getByRole("button", { name: "Sell 1 item" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([{ productId: "variant-1", quantity: 1, price: 100, currency: "EUR" }]);
    expect(onComplete.mock.calls[0][1]).toEqual([{ id: "single-payment", method: "card", amount: 100, currency: "EUR" }]);
  });

  it("supports a mixed total price for multiple items without item prices", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow();
    await chooseVariant(user, "sale_total");
    expect(screen.queryByLabelText(/Actual sale price/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add another item/ })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: /Add another item/ }));
    await chooseVariant(user);

    expect(screen.queryByText("Add payment")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Mixed payment"));
    expect(screen.queryByLabelText(/Actual sale price/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Payment method")).not.toBeInTheDocument();
    expect(screen.getByText("Add payment")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Remove payment" })).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: /Add payment/ }));
    expect(screen.getAllByRole("button", { name: "Remove payment" })).toHaveLength(3);
    await user.click(screen.getAllByRole("button", { name: "Remove payment" })[2]);
    await user.type(screen.getByLabelText("Amount 1"), "50");
    await user.type(screen.getByLabelText("Amount 2"), "50");
    await user.selectOptions(screen.getAllByLabelText("Currency")[1], "USD");

    await waitFor(() => expect(screen.getByText("Payment is balanced")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Sell 2 items" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Sell 2 items" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { productId: "variant-1", quantity: 1, price: null, currency: null },
      { productId: "variant-1", quantity: 1, price: null, currency: null },
    ]);
    expect(onComplete.mock.calls[0][1]).toMatchObject([
      { method: "cash", amount: 50, currency: "EUR" },
      { method: "card", amount: 50, currency: "USD" },
    ]);
    expect(onComplete.mock.calls[0][2]).toBe("sale_total");
  });

  it("supports one total sale price with a single payment", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow();
    await chooseVariant(user, "sale_total");
    await user.type(screen.getByLabelText("Total sale price"), "120");
    await user.selectOptions(screen.getByLabelText("Payment method"), "card");

    expect(screen.getByRole("button", { name: "Sell 1 item" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Sell 1 item" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0]).toEqual([
      [{ productId: "variant-1", quantity: 1, price: null, currency: null }],
      [{ id: "single-payment", method: "card", amount: 120, currency: "EUR" }],
      "sale_total",
    ]);
  });

  it("counts a fully completed next picker line immediately in the sale", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow();
    await addProduct(user);
    await chooseProduct(user, "120");

    expect(screen.getByLabelText("Mixed payment")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sell 2 items" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Sell 2 items" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([
      { productId: "variant-1", quantity: 1, price: 100, currency: "EUR" },
      { productId: "variant-1", quantity: 1, price: 120, currency: "EUR" },
    ]);
  });

  it("does not include an unfinished next picker line", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow();
    await addProduct(user);
    await user.type(screen.getByLabelText(/Product code/), "TR07");
    await user.click(screen.getByRole("button", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: /L\s*3/ }));

    expect(screen.getByRole("button", { name: "Sell 1 item" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Sell 1 item" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([{ productId: "variant-1", quantity: 1, price: 100, currency: "EUR" }]);
  });

  it("does not count a completed duplicate picker line when its only unit is already reserved", async () => {
    const user = userEvent.setup();
    const onComplete = renderFlow(vi.fn(), "en", [{ ...product, stock: 1 }]);
    await addProduct(user);
    await chooseProduct(user);

    expect(screen.getByText("This size is already in the sale and no more units are available.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sell 1 item" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Sell 1 item" }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toEqual([{ productId: "variant-1", quantity: 1, price: 100, currency: "EUR" }]);
  });

  it("renders Turkish flow labels and prevents an empty sale submission", async () => {
    const user = userEvent.setup();
    renderFlow(vi.fn(), "tr");
    expect(screen.getByText("Satışı yapan Elif")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sat" })).toBeDisabled();
    await chooseProduct(user);
    expect(screen.getByLabelText("Ödeme yöntemi")).toBeInTheDocument();
    expect(screen.getByLabelText("Karma ödeme")).toBeInTheDocument();
  });
});
