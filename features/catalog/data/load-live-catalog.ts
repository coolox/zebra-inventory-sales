import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { toCatalogVariants } from "@/lib/contracts/catalog";

type ModelRow = {
  id: string;
  model_code: string;
  name: string;
  brand: string;
  category: string;
  gender: Product["gender"];
  is_active: boolean;
  low_stock_threshold: number | null;
  current_purchase_cost: number | null;
  current_purchase_currency: Product["currency"] | null;
  barcode: string | null;
  suppliers: { name: string } | { name: string }[] | null;
};

type VariantRow = { id: string; product_model_id: string; color: string; size: string; barcode: string | null };
type MovementRow = { variant_id: string; quantity: number };
type ReceiptLineRow = { variant_id: string; unit_cost: number; currency: Product["currency"] };
type ImageRow = { product_model_id: string; storage_path: string; position: number };

export async function loadLiveCatalog(storeId: string): Promise<Product[]> {
  const client = createClient();
  const { data: modelData, error: modelsError } = await client
    .from("product_models")
    .select("id, model_code, barcode, name, brand, category, gender, is_active, low_stock_threshold, current_purchase_cost, current_purchase_currency, suppliers(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (modelsError) throw modelsError;
  const models = (modelData ?? []) as ModelRow[];
  if (!models.length) return [];

  const modelIds = models.map((model) => model.id);
  const { data: variantData, error: variantsError } = await client
    .from("product_variants")
    .select("id, product_model_id, color, size, barcode")
    .in("product_model_id", modelIds)
    .eq("is_active", true);
  if (variantsError) throw variantsError;
  const variants = (variantData ?? []) as VariantRow[];
  if (!variants.length) return [];

  const variantIds = variants.map((variant) => variant.id);
  const [{ data: movementData, error: movementsError }, { data: lineData, error: linesError }, { data: imageData, error: imagesError }] = await Promise.all([
    client.from("inventory_movements").select("variant_id, quantity").eq("store_id", storeId).in("variant_id", variantIds),
    client.from("purchase_receipt_lines").select("variant_id, unit_cost, currency").in("variant_id", variantIds).order("created_at", { ascending: false }),
    client.from("product_images").select("product_model_id, storage_path, position").in("product_model_id", modelIds).order("position", { ascending: true }),
  ]);
  if (movementsError) throw movementsError;
  if (linesError) throw linesError;
  if (imagesError) throw imagesError;

  const stockByVariant = new Map<string, number>();
  ((movementData ?? []) as MovementRow[]).forEach((movement) => {
    stockByVariant.set(movement.variant_id, (stockByVariant.get(movement.variant_id) ?? 0) + movement.quantity);
  });
  const latestCostByVariant = new Map<string, ReceiptLineRow>();
  ((lineData ?? []) as ReceiptLineRow[]).forEach((line) => {
    if (!latestCostByVariant.has(line.variant_id)) latestCostByVariant.set(line.variant_id, line);
  });
  const modelsById = new Map(models.map((model) => [model.id, model]));
  const imagesByModel = new Map<string, string[]>();
  ((imageData ?? []) as ImageRow[]).forEach((image) => {
    imagesByModel.set(image.product_model_id, [...(imagesByModel.get(image.product_model_id) ?? []), image.storage_path]);
  });
  const storageListings = await Promise.all(models.map(async (model) => ({
    modelId: model.id,
    result: await client.storage.from("product-images").list(`${storeId}/${model.id}`, { limit: 100, sortBy: { column: "name", order: "asc" } }),
  })));
  storageListings.forEach(({ modelId, result }) => {
    if (result.error) return;
    const storedPaths = (result.data ?? [])
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
      .map((file) => `${storeId}/${modelId}/${file.name}`);
    const knownPaths = imagesByModel.get(modelId) ?? [];
    imagesByModel.set(modelId, [...knownPaths, ...storedPaths.filter((path) => !knownPaths.includes(path))]);
  });
  const imagePaths = [...new Set([...imagesByModel.values()].flat())];
  const signedUrls = new Map<string, string>();
  if (imagePaths.length) {
    const results = await Promise.all(imagePaths.map(async (path) => ({
      path,
      result: await client.storage.from("product-images").createSignedUrl(path, 60 * 60),
    })));
    results.forEach(({ path, result }) => {
      if (result.error) throw result.error;
      if (result.data?.signedUrl) signedUrls.set(path, result.data.signedUrl);
    });
  }

  return toCatalogVariants(variants.flatMap((variant) => {
    const model = modelsById.get(variant.product_model_id);
    if (!model) return [];
    const latestCost = latestCostByVariant.get(variant.id);
    return [{
      id: variant.id,
      modelId: model.id,
      variantId: variant.id,
      code: model.model_code,
      barcode: model.barcode ?? undefined,
      variantBarcode: variant.barcode ?? undefined,
      isActive: model.is_active,
      lowStockThreshold: model.low_stock_threshold ?? undefined,
      name: model.name,
      brand: model.brand,
      category: model.category,
      gender: model.gender,
      color: variant.color,
      size: variant.size,
      cost: Number(model.current_purchase_cost ?? latestCost?.unit_cost ?? 0),
      currency: model.current_purchase_currency ?? latestCost?.currency ?? "EUR",
      stock: stockByVariant.get(variant.id) ?? 0,
      supplier: (Array.isArray(model.suppliers) ? model.suppliers[0]?.name : model.suppliers?.name) ?? "—",
      photos: (imagesByModel.get(model.id) ?? []).flatMap((path) => signedUrls.get(path) ? [signedUrls.get(path)!] : []),
      photoPaths: imagesByModel.get(model.id) ?? [],
      store: "clothing",
      updated: "Live data",
    }];
  }));
}
