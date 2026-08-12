import { describe, expect, it } from "vitest";
import { createDemoSale } from "./create-demo-sale";
import type { Product, Seller } from "@/lib/types";

const product: Product = {
  id: "variant-1", code: "TR07", name: "Dress", brand: "Zebra", category: "Dresses", gender: "women", color: "Black", size: "L", cost: 40, currency: "EUR", stock: 3, supplier: "Factory", store: "clothing", updated: "Today",
};
const seller: Seller = { id: "seller-1", name: "Elif", initials: "ED", store: "clothing", status: "online", email: "—", phone: "—" };

describe("createDemoSale", () => {
  it("creates multiple sale lines for the same variant in different currencies", () => {
    const result = createDemoSale([
      { productId: "variant-1", quantity: 1, price: 100, currency: "EUR" },
      { productId: "variant-1", quantity: 1, price: 100, currency: "USD" },
    ], [product], seller, "en", new Date("2026-08-09T12:00:00Z"));

    expect(result.sales).toHaveLength(2);
    expect(result.totalEur).toBe(193);
    expect(result.products[0].stock).toBe(1);
  });

  it("does not partially mutate when aggregate demand exceeds stock", () => {
    expect(() => createDemoSale([
      { productId: "variant-1", quantity: 2, price: 100, currency: "EUR" },
      { productId: "variant-1", quantity: 2, price: 100, currency: "USD" },
    ], [product], seller)).toThrow(/sold out/i);
    expect(product.stock).toBe(3);
  });

  it("records one total-price sale without inventing item prices", () => {
    const result = createDemoSale([
      { productId: "variant-1", quantity: 1, price: null, currency: null },
      { productId: "variant-1", quantity: 1, price: null, currency: null },
    ], [product], seller, "en", new Date("2026-08-09T12:00:00Z"), "sale_total", [
      { id: "cash", method: "cash", amount: 50, currency: "EUR" },
      { id: "card", method: "card", amount: 50, currency: "USD" },
    ]);

    expect(result.totalEur).toBe(96.5);
    expect(result.sales.every((sale) => sale.revenueIsAllocated)).toBe(true);
    expect(result.products[0].stock).toBe(1);
  });
});
