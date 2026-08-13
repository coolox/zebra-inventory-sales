import { describe, expect, it } from "vitest";
import { selectChartData, selectMetrics } from "./metrics";

describe("overview metrics", () => {
  const sale = { id: 1, productId: 1, sellerId: 1, seller: "A", store: "clothing" as const, product: "P", code: "P", size: "M", quantity: 2, revenueEur: 20, marginEur: 7, dayOffset: 0, time: "10:00" };
  const product = { id: 1, code: "P", name: "P", brand: "Z", category: "clothing", gender: "unisex" as const, size: "M", color: "Black", cost: 5, currency: "EUR" as const, stock: 2, supplier: "S", store: "clothing" as const, updated: "now" };
  const exchange = { id: "exchange", saleId: "1", sourceSaleLineId: "line", sourceProductId: 1, replacementProductId: 2, replacementProduct: "New P", replacementCode: "N", replacementSize: "L", sellerId: 1, seller: "A", store: "clothing" as const, quantity: 1, topUpEur: 20, marginDeltaEur: 8, reason: "Size", dayOffset: 0, time: "12:00" };
  it("calculates metrics without substituting mock values", () => {
    expect(selectMetrics([sale], [product])).toMatchObject({ revenue: 20, margin: 7, units: 2, low: 1, count: 2 });
    expect(selectMetrics([], [])).toMatchObject({ revenue: 0, units: 0 });
  });
  it("builds a deterministic chart", () => expect(selectChartData([sale], "clothing").at(-1)).toEqual({ label: "Today", value: 20 }));
  it("adds exchange top-up without increasing sold units", () => {
    expect(selectMetrics([sale], [product], [exchange])).toMatchObject({ revenue: 40, margin: 15, count: 2 });
    expect(selectChartData([sale], "clothing", undefined, [exchange]).at(-1)).toEqual({ label: "Today", value: 40 });
  });
});
