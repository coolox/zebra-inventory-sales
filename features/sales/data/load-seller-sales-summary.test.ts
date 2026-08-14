import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSellerSalesSummary } from "./load-seller-sales-summary";

const rpc = vi.fn();

vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc }) }));

const rows = [
  ["store_today", "130", "3"], ["store_week", "190", "6"], ["personal_today", "100", "2"],
  ["personal_week", "160", "5"], ["personal_month", "200", "9"], ["personal_year", "230", "14"], ["personal_all_time", "250", "20"],
].map(([summary_key, revenue_eur, units]) => ({ summary_key, revenue_eur, units }));

describe("loadSellerSalesSummary", () => {
  beforeEach(() => rpc.mockReset());

  it("maps only the complete server-authorized summary contract", async () => {
    rpc.mockResolvedValue({ data: rows, error: null });
    await expect(loadSellerSalesSummary("store-1")).resolves.toEqual({
      store_today: { revenueEur: 130, units: 3 }, store_week: { revenueEur: 190, units: 6 }, personal_today: { revenueEur: 100, units: 2 },
      personal_week: { revenueEur: 160, units: 5 }, personal_month: { revenueEur: 200, units: 9 }, personal_year: { revenueEur: 230, units: 14 }, personal_all_time: { revenueEur: 250, units: 20 },
    });
    expect(rpc).toHaveBeenCalledWith("get_seller_sales_summary", { p_store_id: "store-1" });
  });

  it("does not invent values for rejected or incomplete data", async () => {
    const error = new Error("No access");
    rpc.mockResolvedValue({ data: null, error });
    await expect(loadSellerSalesSummary("store-1")).rejects.toBe(error);
    rpc.mockResolvedValue({ data: rows.slice(1), error: null });
    await expect(loadSellerSalesSummary("store-1")).rejects.toThrow("incomplete");
  });
});
