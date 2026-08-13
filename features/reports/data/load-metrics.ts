import { createClient } from "@/lib/supabase/client";
import { toReportPeriodQuery, type ReportPeriod } from "../model/period";

export type ReportingMetrics = {
  revenueEur: number;
  costEur: number;
  marginEur: number;
  saleCount: number;
  units: number;
  averageTicketEur: number;
};

type ReportingMetricsRow = {
  revenue_eur: number | string;
  cost_eur: number | string;
  margin_eur: number | string;
  sale_count: number | string;
  units: number | string;
  average_ticket_eur: number | string;
};

/** Reads the server-calculated, store-scoped EUR reporting snapshot. */
export async function loadMetrics(storeId: string, period: ReportPeriod): Promise<ReportingMetrics> {
  const range = toReportPeriodQuery(period);
  const { data, error } = await createClient().rpc("get_reporting_metrics", { p_store_id: storeId, p_from: range.from, p_to: range.to });
  if (error) throw error;
  const row = (data as ReportingMetricsRow[] | null)?.[0];
  if (!row) throw new Error("Reporting metrics were unavailable.");
  return {
    revenueEur: Number(row.revenue_eur),
    costEur: Number(row.cost_eur),
    marginEur: Number(row.margin_eur),
    saleCount: Number(row.sale_count),
    units: Number(row.units),
    averageTicketEur: Number(row.average_ticket_eur),
  };
}
