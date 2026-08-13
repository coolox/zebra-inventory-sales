import { createClient } from "@/lib/supabase/client";
import { toReportPeriodQuery, type ReportPeriod } from "../model/period";

export type ReportingDimension = "seller" | "supplier" | "brand" | "model" | "category";
export type ReportingBreakdown = { key: string; label: string; revenueEur: number; costEur: number; marginEur: number; units: number };

type Row = { dimension_key: string; dimension_label: string; revenue_eur: number | string; cost_eur: number | string; margin_eur: number | string; units: number | string };

export async function loadBreakdowns(storeId: string, period: ReportPeriod, dimension: ReportingDimension): Promise<ReportingBreakdown[]> {
  const range = toReportPeriodQuery(period);
  const { data, error } = await createClient().rpc("get_reporting_breakdown", { p_store_id: storeId, p_from: range.from, p_to: range.to, p_dimension: dimension });
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => ({ key: row.dimension_key, label: row.dimension_label, revenueEur: Number(row.revenue_eur), costEur: Number(row.cost_eur), marginEur: Number(row.margin_eur), units: Number(row.units) }));
}
