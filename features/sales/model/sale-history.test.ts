import { describe, expect, it } from "vitest";
import { paginateSaleHistory, toSaleHistory } from "./sale-history";

const sales = Array.from({ length: 12 }, (_, index) => ({ id: `sale-${index}`, productId: index, sellerId: index % 2 ? "seller" : "other", seller: "Elif Demir", store: "clothing" as const, product: "Dress", code: "KM-9902", size: "M", quantity: 1, revenueEur: 100 + index, marginEur: 50, dayOffset: index, time: "10:00" }));

describe("sale history", () => {
  it("keeps the persisted EUR snapshot and scopes records by seller", () => {
    const items = toSaleHistory(sales, "clothing", "seller");
    expect(items).toHaveLength(6);
    expect(items[0]).toMatchObject({ status: "confirmed", revenueEur: 101, paymentSnapshot: "€101.00" });
  });

  it("paginates without changing the history snapshot", () => {
    const items = toSaleHistory(sales, "clothing");
    const page = paginateSaleHistory(items, 2, 5);
    expect(page).toMatchObject({ page: 2, pageCount: 3 });
    expect(page.items).toHaveLength(5);
  });
});
