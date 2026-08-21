import { businessDayOffset } from "@/lib/business-date";
import { createClient } from "@/lib/supabase/client";
import type { Product, SaleExchange } from "@/lib/types";

type ExchangeRow = { id: string; source_sale_line_id: string; replacement_variant_id: string; quantity: number; top_up_eur: number | string; reason: string; exchanged_by: string; exchanged_at: string; sale_exchange_payments: Array<{ amount: number | string; currency: Product["currency"] }> | null };
type SourceLine = { id: string; sale_id: string; variant_id: string; unit_cost_eur: number | string };
type Variant = { id: string; product_model_id: string; size: string };
type Model = { id: string; model_code: string; name: string };
type Profile = { id: string; full_name: string };
type CostRow = { variant_id: string; unit_cost_eur: number | string };

export async function loadLiveExchanges(storeId: string): Promise<SaleExchange[]> {
  const client = createClient();
  const { data, error } = await client
    .from("sale_exchanges")
    .select("id, source_sale_line_id, replacement_variant_id, quantity, top_up_eur, reason, exchanged_by, exchanged_at, sale_exchange_payments(amount, currency)")
    .eq("store_id", storeId)
    .order("exchanged_at", { ascending: false });
  if (error) throw error;
  const exchanges = (data ?? []) as ExchangeRow[];
  if (!exchanges.length) return [];

  const sourceLineIds = exchanges.map((exchange) => exchange.source_sale_line_id);
  const variantIds = [...new Set(exchanges.flatMap((exchange) => [exchange.replacement_variant_id]))];
  const [{ data: sourceData, error: sourceError }, { data: replacementData, error: replacementError }, { data: profileData, error: profileError }] = await Promise.all([
    client.from("sale_lines").select("id, sale_id, variant_id, unit_cost_eur").in("id", sourceLineIds),
    client.from("product_variants").select("id, product_model_id, size").in("id", variantIds),
    client.from("profiles").select("id, full_name").in("id", [...new Set(exchanges.map((exchange) => exchange.exchanged_by))]),
  ]);
  if (sourceError) throw sourceError;
  if (replacementError) throw replacementError;
  if (profileError) throw profileError;

  const sourceLines = (sourceData ?? []) as SourceLine[];
  const replacementVariants = (replacementData ?? []) as Variant[];
  const sourceVariantIds = sourceLines.map((line) => line.variant_id);
  const allVariants = [...replacementVariants];
  if (sourceVariantIds.length) {
    const { data: sourceVariantData, error: sourceVariantError } = await client.from("product_variants").select("id, product_model_id, size").in("id", sourceVariantIds);
    if (sourceVariantError) throw sourceVariantError;
    allVariants.push(...((sourceVariantData ?? []) as Variant[]));
  }
  const modelIds = [...new Set(allVariants.map((variant) => variant.product_model_id))];
  const [{ data: modelData, error: modelError }, { data: costData, error: costError }] = await Promise.all([
    client.from("product_models").select("id, model_code, name").in("id", modelIds),
    client.from("purchase_receipt_lines").select("variant_id, unit_cost_eur").in("variant_id", variantIds).order("created_at", { ascending: false }),
  ]);
  if (modelError) throw modelError;
  if (costError) throw costError;

  const sourceById = new Map(sourceLines.map((line) => [line.id, line]));
  const variantsById = new Map(allVariants.map((variant) => [variant.id, variant]));
  const modelsById = new Map(((modelData ?? []) as Model[]).map((model) => [model.id, model]));
  const profilesById = new Map(((profileData ?? []) as Profile[]).map((profile) => [profile.id, profile]));
  const newestCostByVariant = new Map<string, number>();
  ((costData ?? []) as CostRow[]).forEach((row) => { if (!newestCostByVariant.has(row.variant_id)) newestCostByVariant.set(row.variant_id, Number(row.unit_cost_eur)); });

  return exchanges.flatMap((exchange): SaleExchange[] => {
    const source = sourceById.get(exchange.source_sale_line_id);
    const replacement = variantsById.get(exchange.replacement_variant_id);
    const model = replacement ? modelsById.get(replacement.product_model_id) : undefined;
    if (!source || !replacement || !model) return [];
    const topUpEur = Number(exchange.top_up_eur);
    const sourceCostEur = Number(source.unit_cost_eur) * exchange.quantity;
    const replacementCostEur = (newestCostByVariant.get(replacement.id) ?? 0) * exchange.quantity;
    const paymentSnapshot = (exchange.sale_exchange_payments ?? []).map((payment) => new Intl.NumberFormat("en", { style: "currency", currency: payment.currency, maximumFractionDigits: 2 }).format(Number(payment.amount))).join(" + ");
    return [{
      id: exchange.id, saleId: source.sale_id, sourceSaleLineId: source.id, sourceProductId: source.variant_id,
      replacementProductId: replacement.id, replacementProduct: model.name, replacementCode: model.model_code,
      replacementSize: replacement.size, sellerId: exchange.exchanged_by, seller: profilesById.get(exchange.exchanged_by)?.full_name || "Zebra team member",
      store: "clothing", quantity: exchange.quantity, topUpEur, marginDeltaEur: Math.round((topUpEur + sourceCostEur - replacementCostEur) * 100) / 100,
      reason: exchange.reason, paymentSnapshot: paymentSnapshot || undefined, dayOffset: businessDayOffset(exchange.exchanged_at),
      time: new Date(exchange.exchanged_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }),
    }];
  });
}
