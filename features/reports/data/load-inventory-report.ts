import { createClient } from "@/lib/supabase/client";
import { toReportPeriodQuery, type ReportPeriod } from "../model/period";

export type InventoryReportRow = { modelId: string; modelCode: string; modelName: string; variantId: string; color: string; size: string; balance: number; soldUnits: number; sellThrough: number; turnover: number; lowStockThreshold: number; isLowStock: boolean };
type Row = { model_id: string; model_code: string; model_name: string; variant_id: string; color: string; size: string; balance: number | string; sold_units: number | string; sell_through: number | string; turnover: number | string; low_stock_threshold: number | string; is_low_stock: boolean };

export async function loadInventoryReport(storeId: string, period: ReportPeriod): Promise<InventoryReportRow[]> {
  const range = toReportPeriodQuery(period);
  const { data, error } = await createClient().rpc("get_inventory_report", { p_store_id: storeId, p_from: range.from, p_to: range.to });
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => ({ modelId: row.model_id, modelCode: row.model_code, modelName: row.model_name, variantId: row.variant_id, color: row.color, size: row.size, balance: Number(row.balance), soldUnits: Number(row.sold_units), sellThrough: Number(row.sell_through), turnover: Number(row.turnover), lowStockThreshold: Number(row.low_stock_threshold), isLowStock: row.is_low_stock }));
}
