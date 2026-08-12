import { describe, expect, it } from "vitest";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { paymentToleranceEur, toConfirmSaleCommand } from "./sales";

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
