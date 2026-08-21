import { NextRequest, NextResponse } from "next/server";
import { toCsv } from "@/features/reports/export/csv";
import { createClient } from "@/lib/supabase/server";

const dimensions = new Set(["seller", "supplier", "brand", "model", "category"]);
const validDate = (value: string | null) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams; const storeId = query.get("storeId"); const from = query.get("from"); const to = query.get("to"); const report = query.get("report") ?? "summary"; const dimension = query.get("dimension") ?? "seller";
  if (!storeId || !validDate(from) || !validDate(to) || from! > to! || !["summary", "breakdown", "inventory", "cash"].includes(report) || (report === "breakdown" && !dimensions.has(dimension))) return NextResponse.json({ error: "Invalid export filter" }, { status: 400 });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: membership } = await supabase.from("store_memberships").select("role").eq("store_id", storeId).eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (membership?.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rpc = report === "summary" ? "get_reporting_metrics" : report === "breakdown" ? "get_reporting_breakdown" : report === "inventory" ? "get_inventory_report" : "owner_cash_report";
  const args = report === "breakdown" ? { p_store_id: storeId, p_from: from, p_to: to, p_dimension: dimension } : { p_store_id: storeId, p_from: from, p_to: to };
  const { data, error } = await supabase.rpc(rpc, args);
  if (error) return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
  const rows = data ?? [];
  const headers = report === "summary" ? ["revenue_eur", "cost_eur", "margin_eur", "sale_count", "units", "average_ticket_eur"] : report === "breakdown" ? ["dimension_key", "dimension_label", "revenue_eur", "cost_eur", "margin_eur", "units"] : report === "inventory" ? ["model_code", "model_name", "color", "size", "balance", "sold_units", "sell_through", "turnover", "low_stock_threshold", "is_low_stock"] : ["payment_method", "currency", "payment_count", "amount"];
  const csv = toCsv(headers, rows.map((row: Record<string, unknown>) => headers.map((header) => row[header])));
  return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="zebra-${report}-${from}-${to}.csv"` } });
}
