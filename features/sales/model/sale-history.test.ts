import { describe, expect, it } from "vitest";
import type { Sale } from "@/lib/types";
import { paginateSaleHistory, toSaleHistory } from "./sale-history";

const sales: Sale[] = Array.from({ length: 12 }, (_, index) => ({
  id: `sale-${index}:line-${index}`,
  sourceSaleLineId: `line-${index}`,
  productId: index,
  sellerId: index % 2 ? "seller" : "other",
  seller: "Elif Demir",
  store: "clothing" as const,
  product: "Dress",
  code: "KM-9902",
  size: "M",
  quantity: 1,
  revenueEur: 100 + index,
  marginEur: 50,
  dayOffset: index,
  time: "10:00",
}));

describe("sale history", () => {
  it("keeps one ticket per sale and scopes records by seller", () => {
    const items = toSaleHistory(sales, "clothing", "seller");
    expect(items).toHaveLength(6);
    expect(items[0]).toMatchObject({
      status: "confirmed",
      revenueEur: 101,
      ticketTotalSnapshot: "€101.00",
      quantity: 1,
      lines: [{ sourceSaleLineId: "line-1" }],
    });
  });

  it("groups a two-line sale into one €150 ticket without repeating its total", () => {
    const multiItem: Sale[] = [
      { ...sales[0], id: "ticket:line-1", sourceSaleLineId: "line-1", product: "T-Shirt", code: "AA11", revenueEur: 50, marginEur: 20, paymentSnapshot: "€150.00" },
      { ...sales[0], id: "ticket:line-2", sourceSaleLineId: "line-2", product: "Dress", code: "TTR", revenueEur: 100, marginEur: 45, paymentSnapshot: "€150.00" },
    ];

    const items = toSaleHistory(multiItem, "clothing");

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "ticket",
      saleId: "ticket",
      quantity: 2,
      revenueEur: 150,
      marginEur: 65,
      paymentSnapshot: "€150.00",
      ticketTotalSnapshot: "€150.00",
    });
    expect(items[0].lines.map((line) => ({ product: line.product, revenueEur: line.revenueEur }))).toEqual([
      { product: "T-Shirt", revenueEur: 50 },
      { product: "Dress", revenueEur: 100 },
    ]);
  });

  it("paginates tickets rather than individual sale lines", () => {
    const items = toSaleHistory(sales, "clothing");
    const page = paginateSaleHistory(items, 2, 5);
    expect(page).toMatchObject({ page: 2, pageCount: 3 });
    expect(page.items).toHaveLength(5);
  });

  it("attaches an exchange to its exact line and includes its top-up in the ticket total", () => {
    const exchange = {
      id: "exchange",
      saleId: "sale-1",
      sourceSaleLineId: "line-1",
      sourceProductId: 1,
      replacementProductId: 2,
      replacementProduct: "New dress",
      replacementCode: "NEW",
      replacementSize: "L",
      sellerId: "seller",
      seller: "Elif Demir",
      store: "clothing" as const,
      quantity: 1,
      topUpEur: 20,
      marginDeltaEur: 5,
      reason: "Size",
      dayOffset: 0,
      time: "12:00",
    };
    const record = toSaleHistory([
      { ...sales[0], id: "sale-1:line-1", sourceSaleLineId: "line-1", revenueEur: 100 },
    ], "clothing", undefined, [exchange])[0];

    expect(record).toMatchObject({
      ticketTotalSnapshot: "€120.00",
      lines: [{ exchange: { replacementProduct: "New dress", topUpEur: 20 } }],
    });
  });
});
