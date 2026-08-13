import { describe, expect, it } from "vitest";
import type { Activity, Product, Sale } from "@/lib/types";
import { demoReportData } from "./demo-report";

const product: Product = { id: 1, code: "DR-01", name: "Dress", brand: "Zebra", category: "Dresses", gender: "women", size: "M", color: "Black", cost: 60, currency: "EUR", stock: 3, supplier: "Milan", store: "clothing", updated: "now" };
const sale: Sale = { id: "sale-1:line-1", productId: 1, sellerId: 7, seller: "Elif", store: "clothing", product: "Dress", code: "DR-01", size: "M", quantity: 1, revenueEur: 100, marginEur: 40, dayOffset: 0, time: "10:00", status: "confirmed" };
const period = { preset: "today" as const, from: "2026-08-13", to: "2026-08-13" };
const now = new Date("2026-08-13T12:00:00.000Z");

describe("demoReportData", () => {
  it("reflects confirmed demo sales and exchange top-ups", () => {
    const activities: Activity[] = [{ id: "exchange-1", type: "stock", title: "Exchange", meta: "", amount: 20, dayOffset: 0 }];
    const data = demoReportData({ sales: [sale, { ...sale, id: "cancelled", revenueEur: 50, status: "cancelled" }], products: [product], activities, period, dimension: "seller", now });
    expect(data.metrics).toMatchObject({ revenueEur: 120, costEur: 60, marginEur: 60, saleCount: 1, units: 1, averageTicketEur: 120 });
    expect(data.breakdowns).toEqual([expect.objectContaining({ label: "Elif", revenueEur: 100, units: 1 })]);
    expect(data.inventory[0]).toMatchObject({ soldUnits: 1, balance: 3 });
  });

  it("obeys the selected report period", () => {
    const data = demoReportData({ sales: [{ ...sale, dayOffset: 1 }], products: [product], activities: [], period, dimension: "model", now });
    expect(data.metrics.revenueEur).toBe(0);
    expect(data.breakdowns).toEqual([]);
  });
});
