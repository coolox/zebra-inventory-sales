import { NextRequest, NextResponse } from "next/server";
import { createOwnerReportPdf } from "@/features/reports/export/pdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const dimensions = new Set(["seller", "supplier", "brand", "model", "category"]);
const validDate = (value: string | null) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
const asNumber = (value: unknown) => Number(value ?? 0);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const storeId = query.get("storeId"); const from = query.get("from"); const to = query.get("to"); const dimension = query.get("dimension") ?? "seller";
  if (!storeId || !validDate(from) || !validDate(to) || from! > to! || !dimensions.has(dimension)) return NextResponse.json({ error: "Invalid export filter" }, { status: 400 });
  const periodFrom = from!; const periodTo = to!;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: membership } = await supabase.from("store_memberships").select("role, stores(name)").eq("store_id", storeId).eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (membership?.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [metricsResult, breakdownResult, cashResult] = await Promise.all([
    supabase.rpc("get_reporting_metrics", { p_store_id: storeId, p_from: periodFrom, p_to: periodTo }),
    supabase.rpc("get_reporting_breakdown", { p_store_id: storeId, p_from: periodFrom, p_to: periodTo, p_dimension: dimension }),
    supabase.rpc("owner_cash_report", { p_store_id: storeId, p_from: periodFrom, p_to: periodTo }),
  ]);
  if (metricsResult.error || breakdownResult.error || cashResult.error) return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
  const metrics = (metricsResult.data ?? [])[0];
  if (!metrics) return NextResponse.json({ error: "Export unavailable" }, { status: 500 });
  const store = (membership as { stores?: { name?: string } | null }).stores;
  const pdf = await createOwnerReportPdf({
    storeName: store?.name ?? "Zebra Retail",
    from: periodFrom, to: periodTo, generatedAt: new Date(), dimension,
    metrics: { revenueEur: asNumber(metrics.revenue_eur), costEur: asNumber(metrics.cost_eur), marginEur: asNumber(metrics.margin_eur), saleCount: asNumber(metrics.sale_count), units: asNumber(metrics.units), averageTicketEur: asNumber(metrics.average_ticket_eur) },
    breakdowns: (breakdownResult.data ?? []).map((row: Record<string, unknown>) => ({ key: String(row.dimension_key), label: String(row.dimension_label), revenueEur: asNumber(row.revenue_eur), costEur: asNumber(row.cost_eur), marginEur: asNumber(row.margin_eur), units: asNumber(row.units) })),
    cashRows: (cashResult.data ?? []).map((row: Record<string, unknown>) => ({ method: String(row.payment_method), currency: String(row.currency), count: asNumber(row.payment_count), amount: asNumber(row.amount) })),
  });
  return new NextResponse(pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="zebra-owner-report-${periodFrom}-${periodTo}.pdf"` } });
}
