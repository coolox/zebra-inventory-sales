import { createClient } from "@/lib/supabase/client";

export type SellerSalesSummaryKey =
  | "store_today"
  | "store_week"
  | "personal_today"
  | "personal_week"
  | "personal_month"
  | "personal_year"
  | "personal_all_time";

export type SellerSalesSummary = Record<SellerSalesSummaryKey, { revenueEur: number; units: number }>;

type SummaryRow = { summary_key: SellerSalesSummaryKey; revenue_eur: number | string; units: number | string };

const keys: SellerSalesSummaryKey[] = ["store_today", "store_week", "personal_today", "personal_week", "personal_month", "personal_year", "personal_all_time"];

/** Reads the server-authorized Store and current Seller aggregates. */
export async function loadSellerSalesSummary(storeId: string): Promise<SellerSalesSummary> {
  const { data, error } = await createClient().rpc("get_seller_sales_summary", { p_store_id: storeId });
  if (error) throw error;
  const rows = data as SummaryRow[] | null;
  if (!rows) throw new Error("Seller sales summary was unavailable.");

  const summaries = new Map(rows.map((row) => [row.summary_key, { revenueEur: Number(row.revenue_eur), units: Number(row.units) }]));
  if (keys.some((key) => !summaries.has(key))) throw new Error("Seller sales summary was incomplete.");
  return Object.fromEntries(keys.map((key) => [key, summaries.get(key)!])) as SellerSalesSummary;
}
