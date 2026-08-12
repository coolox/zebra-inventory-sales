import { createClient } from "@/lib/supabase/client";
import type { Activity, Product, Sale } from "@/lib/types";

type SaleLineRow = {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number | null;
  unit_price_eur: number | null;
  unit_cost_eur: number;
  currency: Product["currency"] | null;
};

type SalePaymentRow = { amount: number; amount_eur: number; currency: Product["currency"] };

type SaleRow = {
  id: string;
  seller_id: string;
  sold_at: string;
  pricing_mode: "per_item" | "sale_total";
  total_amount_eur: number;
  sale_lines: SaleLineRow[] | null;
  sale_payments: SalePaymentRow[] | null;
};

type VariantRow = { id: string; product_model_id: string; size: string };
type ModelRow = { id: string; model_code: string; name: string };
type ProfileRow = { id: string; full_name: string };

const dayMs = 24 * 60 * 60 * 1000;

function dayOffset(soldAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(soldAt).getTime()) / dayMs));
}

export async function loadLiveSales(storeId: string): Promise<{ sales: Sale[]; activities: Activity[] }> {
  const client = createClient();
  const { data, error } = await client
    .from("sales")
    .select("id, seller_id, sold_at, pricing_mode, total_amount_eur, sale_lines(id, variant_id, quantity, unit_price, unit_price_eur, unit_cost_eur, currency), sale_payments(amount, amount_eur, currency)")
    .eq("store_id", storeId)
    .eq("status", "confirmed")
    .order("sold_at", { ascending: false });
  if (error) throw error;

  const saleRows = (data ?? []) as SaleRow[];
  if (!saleRows.length) return { sales: [], activities: [] };

  const saleLines = saleRows.flatMap((sale) => sale.sale_lines ?? []);
  const variantIds = [...new Set(saleLines.map((line) => line.variant_id))];
  const sellerIds = [...new Set(saleRows.map((sale) => sale.seller_id))];

  const [{ data: variantData, error: variantError }, { data: profileData, error: profileError }] = await Promise.all([
    client.from("product_variants").select("id, product_model_id, size").in("id", variantIds),
    client.from("profiles").select("id, full_name").in("id", sellerIds),
  ]);
  if (variantError) throw variantError;
  if (profileError) throw profileError;

  const variants = (variantData ?? []) as VariantRow[];
  const modelIds = [...new Set(variants.map((variant) => variant.product_model_id))];
  const { data: modelData, error: modelError } = await client
    .from("product_models")
    .select("id, model_code, name")
    .in("id", modelIds);
  if (modelError) throw modelError;

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const modelsById = new Map(((modelData ?? []) as ModelRow[]).map((model) => [model.id, model]));
  const profilesById = new Map(((profileData ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));

  const sales = saleRows.flatMap((sale) => {
    const lines = sale.sale_lines ?? [];
    const totalCostEur = lines.reduce((sum, line) => sum + Number(line.unit_cost_eur) * line.quantity, 0);
    let allocatedRevenueEur = 0;
    return lines.map((line, index): Sale => {
      const variant = variantsById.get(line.variant_id);
      const model = variant ? modelsById.get(variant.product_model_id) : undefined;
      const seller = profilesById.get(sale.seller_id)?.full_name || "Zebra team member";
      const costEur = Number(line.unit_cost_eur) * line.quantity;
      const revenueEur = sale.pricing_mode === "sale_total"
        ? index === lines.length - 1
          ? Number(sale.total_amount_eur) - allocatedRevenueEur
          : Math.round((totalCostEur > 0 ? Number(sale.total_amount_eur) * costEur / totalCostEur : Number(sale.total_amount_eur) / lines.length) * 100) / 100
        : Number(line.unit_price_eur) * line.quantity;
      allocatedRevenueEur += revenueEur;
      const marginEur = revenueEur - costEur;

      return {
        id: `${sale.id}:${line.id}`,
        productId: line.variant_id,
        sellerId: sale.seller_id,
        seller,
        store: "clothing",
        product: model?.name ?? "Product",
        code: model?.model_code ?? "—",
        size: variant?.size ?? "—",
        quantity: line.quantity,
        revenueEur,
        marginEur,
        revenueIsAllocated: sale.pricing_mode === "sale_total",
        dayOffset: dayOffset(sale.sold_at),
        time: new Date(sale.sold_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }),
      };
    });
  });

  const activities = saleRows.slice(0, 8).map((sale): Activity => {
    const lines = sale.sale_lines ?? [];
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const amount = Number(sale.total_amount_eur);
    const originalAmounts = new Map<Product["currency"], number>();
    if (sale.sale_payments?.length) {
      sale.sale_payments.forEach((payment) => originalAmounts.set(payment.currency, (originalAmounts.get(payment.currency) ?? 0) + Number(payment.amount)));
    } else {
      lines.forEach((line) => {
        if (line.currency) originalAmounts.set(line.currency, (originalAmounts.get(line.currency) ?? 0) + Number(line.unit_price) * line.quantity);
      });
    }
    const originalTotal = [...originalAmounts.entries()]
      .map(([currency, value]) => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(value))
      .join(" + ");
    const converted = [...originalAmounts.keys()].some((currency) => currency !== "EUR");
    const seller = profilesById.get(sale.seller_id)?.full_name || "Zebra team member";

    return {
      id: sale.id,
      type: "sale",
      title: `Sale · ${units} ${units === 1 ? "item" : "items"}`,
      meta: `${seller} · ${originalTotal} · ${new Date(sale.sold_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Istanbul" })}`,
      amount,
      currency: "EUR",
      converted,
    };
  });

  return { sales, activities };
}
