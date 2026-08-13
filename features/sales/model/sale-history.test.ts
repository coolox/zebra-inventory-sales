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

  it("attaches an exchange and includes its top-up in the original ticket", () => {
    const exchange = { id: "exchange", saleId: "sale-1", sourceSaleLineId: "line-1", sourceProductId: 1, replacementProductId: 2, replacementProduct: "New dress", replacementCode: "NEW", replacementSize: "L", sellerId: "seller", seller: "Elif Demir", store: "clothing" as const, quantity: 1, topUpEur: 20, marginDeltaEur: 5, reason: "Size", dayOffset: 0, time: "12:00" };
    const record = toSaleHistory([{ ...sales[0], id: "sale-1:line-1", revenueEur: 100 }], "clothing", undefined, [exchange])[0];
    expect(record).toMatchObject({ paymentSnapshot: "€120.00", exchange: { replacementProduct: "New dress", topUpEur: 20 } });
  });
});
