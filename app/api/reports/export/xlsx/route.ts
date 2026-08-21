import { NextRequest, NextResponse } from "next/server";
import { createOwnerReportXlsx } from "@/features/reports/export/xlsx";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const dimensions = new Set(["seller", "supplier", "brand", "model", "category"]);
const validDate = (value: string | null) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
const asNumber = (value: unknown) => Number(value ?? 0);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams; const storeId = query.get("storeId"); const from = query.get("from"); const to = query.get("to"); const dimension = query.get("dimension") ?? "seller";
  if (!storeId || !validDate(from) || !validDate(to) || from! > to! || !dimensions.has(dimension)) return NextResponse.json({ error: "Invalid export filter" }, { status: 400 });
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: membership } = await supabase.from("store_memberships").select("role, stores(name)").eq("store_id", storeId).eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (membership?.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [metricsResult, breakdownResult, cashResult] = await Promise.all([
    supabase.rpc("get_reporting_metrics", { p_store_id: storeId, p_from: from, p_to: to }),
    supabase.rpc("get_reporting_breakdown", { p_store_id: storeId, p_from: from, p_to: to, p_dimension: dimension }),
    supabase.rpc("owner_cash_report", { p_store_id: storeId, p_from: from, p_to: to }),
  ]);
  if (metricsResult.error || breakdownResult.error || cashResult.error || !(metricsResult.data ?? [])[0]) return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
  const metrics = (metricsResult.data ?? [])[0] as Record<string, unknown>;
  const store = (membership as { stores?: { name?: string } | null }).stores;
  const workbook = await createOwnerReportXlsx({
    storeName: store?.name ?? "Zebra Retail", from: from!, to: to!, generatedAt: new Date(), dimension,
    metrics: { revenueEur: asNumber(metrics.revenue_eur), costEur: asNumber(metrics.cost_eur), marginEur: asNumber(metrics.margin_eur), saleCount: asNumber(metrics.sale_count), units: asNumber(metrics.units), averageTicketEur: asNumber(metrics.average_ticket_eur) },
    breakdowns: (breakdownResult.data ?? []).map((row: Record<string, unknown>) => ({ key: String(row.dimension_key), label: String(row.dimension_label), revenueEur: asNumber(row.revenue_eur), costEur: asNumber(row.cost_eur), marginEur: asNumber(row.margin_eur), units: asNumber(row.units) })),
    cashRows: (cashResult.data ?? []).map((row: Record<string, unknown>) => ({ method: String(row.payment_method), currency: String(row.currency), count: asNumber(row.payment_count), amount: asNumber(row.amount) })),
  });
  return new NextResponse(workbook.buffer.slice(workbook.byteOffset, workbook.byteOffset + workbook.byteLength) as ArrayBuffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="zebra-owner-report-${from}-${to}.xlsx"` } });
}
