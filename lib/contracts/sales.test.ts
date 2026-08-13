import { describe, expect, it } from "vitest";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { paymentToleranceEur, toCancelSaleCommand, toConfirmSaleCommand, toExchangeSaleCommand } from "./sales";

describe("sale contract", () => {
  it("preserves repeated variant lines, native payments and idempotency", () => {
    const product = createInitialWorkspaceData().products[0];
    const command = toConfirmSaleCommand({ storeId: "store-1", pricingMode: "per_item", products: [{ ...product, variantId: "variant-1" }], idempotencyKey: "key-1", lines: [{ productId: product.id, quantity: 1, price: 100, currency: "EUR" }, { productId: product.id, quantity: 1, price: 110, currency: "USD" }], payments: [{ id: "a", method: "cash", amount: 100, currency: "EUR" }, { id: "b", method: "card", amount: 110, currency: "USD" }] });
    expect(command).toMatchObject({ idempotencyKey: "key-1", lines: [{ variantId: "variant-1", currency: "EUR" }, { variantId: "variant-1", currency: "USD" }], payments: [{ currency: "EUR" }, { currency: "USD" }] });
    expect(paymentToleranceEur).toBe(0.01);
  });

  it("rejects a draft whose product has no persisted variant identity", () => {
    const product = createInitialWorkspaceData().products[0];
    expect(() => toConfirmSaleCommand({ storeId: "store-1", pricingMode: "per_item", products: [product], idempotencyKey: "key-1", lines: [{ productId: product.id, quantity: 1, price: 1, currency: "EUR" }], payments: [] })).toThrow("unavailable");
  });
});

it("requires a non-blank cancellation reason", () => {
  expect(() => toCancelSaleCommand({ storeId: "store", saleId: "sale", reason: "  " })).toThrow("Sale and cancellation reason are required.");
  expect(toCancelSaleCommand({ storeId: "store", saleId: "sale", reason: "  Wrong size  " })).toEqual({ storeId: "store", saleId: "sale", reason: "Wrong size" });
});

it("keeps native exchange top-up payments and trims the required reason", () => {
  expect(toExchangeSaleCommand({ storeId: "store", sourceSaleLineId: "line", replacementVariantId: "variant", quantity: 1, replacementUnitPrice: 120, replacementCurrency: "USD", payments: [{ method: "card", amount: 20, currency: "USD" }], reason: "  Size exchange  ", idempotencyKey: "exchange-key" })).toMatchObject({ reason: "Size exchange", payments: [{ currency: "USD", amount: 20 }] });
  expect(() => toExchangeSaleCommand({ storeId: "store", sourceSaleLineId: "line", replacementVariantId: "variant", quantity: 0, replacementUnitPrice: 120, replacementCurrency: "EUR", payments: [], reason: "", idempotencyKey: "exchange-key" })).toThrow("source line");
});
