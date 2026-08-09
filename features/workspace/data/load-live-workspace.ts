import { loadLiveCatalog } from "@/features/catalog/data/load-live-catalog";
import { createClient } from "@/lib/supabase/client";
import type { Activity, Product, Sale, Seller } from "@/lib/types";
import type { WorkspaceData } from "../model/workspace-data";

type SaleLineRow = {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  unit_price_eur: number;
  unit_cost_eur: number;
  currency: Product["currency"];
};

type SaleRow = {
  id: string;
  seller_id: string;
  sold_at: string;
  sale_lines: SaleLineRow[] | null;
};

type VariantRow = { id: string; product_model_id: string; size: string };
type ModelRow = { id: string; model_code: string; name: string };
type ProfileRow = { id: string; full_name: string; phone: string | null };
type MembershipRow = { user_id: string };

const dayMs = 24 * 60 * 60 * 1000;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ZR";
}

function dayOffset(soldAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(soldAt).getTime()) / dayMs));
}

async function loadLiveSales(storeId: string): Promise<{ sales: Sale[]; activities: Activity[] }> {
  const client = createClient();
  const { data, error } = await client
    .from("sales")
    .select("id, seller_id, sold_at, sale_lines(id, variant_id, quantity, unit_price, unit_price_eur, unit_cost_eur, currency)")
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
    client.from("profiles").select("id, full_name, phone").in("id", sellerIds),
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

  const sales = saleRows.flatMap((sale) => (sale.sale_lines ?? []).map((line): Sale => {
    const variant = variantsById.get(line.variant_id);
    const model = variant ? modelsById.get(variant.product_model_id) : undefined;
    const seller = profilesById.get(sale.seller_id)?.full_name || "Zebra team member";
    const revenueEur = Number(line.unit_price_eur) * line.quantity;
    const marginEur = (Number(line.unit_price_eur) - Number(line.unit_cost_eur)) * line.quantity;

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
      dayOffset: dayOffset(sale.sold_at),
      time: new Date(sale.sold_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }),
    };
  }));

  const activities = saleRows.slice(0, 8).map((sale): Activity => {
    const lines = sale.sale_lines ?? [];
    const units = lines.reduce((sum, line) => sum + line.quantity, 0);
    const amount = lines.reduce((sum, line) => sum + Number(line.unit_price_eur) * line.quantity, 0);
    const originalAmounts = new Map<Product["currency"], number>();
    lines.forEach((line) => originalAmounts.set(line.currency, (originalAmounts.get(line.currency) ?? 0) + Number(line.unit_price) * line.quantity));
    const originalTotal = [...originalAmounts.entries()].map(([currency, value]) => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(value)).join(" + ");
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

async function loadLiveSellers(storeId: string): Promise<Seller[]> {
  const client = createClient();
  const { data: membershipData, error: membershipError } = await client
    .from("store_memberships")
    .select("user_id")
    .eq("store_id", storeId)
    .eq("role", "seller")
    .eq("status", "active");
  if (membershipError) throw membershipError;

  const userIds = ((membershipData ?? []) as MembershipRow[]).map((membership) => membership.user_id);
  if (!userIds.length) return [];

  const { data: profileData, error: profileError } = await client
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", userIds);
  if (profileError) throw profileError;

  return ((profileData ?? []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    name: profile.full_name || "Zebra seller",
    initials: initials(profile.full_name),
    store: "clothing",
    status: "offline",
    email: "—",
    phone: profile.phone || "—",
  }));
}

export async function loadLiveWorkspace(storeId: string): Promise<WorkspaceData> {
  const [products, salesData, sellers] = await Promise.all([
    loadLiveCatalog(storeId),
    loadLiveSales(storeId),
    loadLiveSellers(storeId),
  ]);

  return {
    products,
    sales: salesData.sales,
    sellers,
    activities: salesData.activities,
  };
}
