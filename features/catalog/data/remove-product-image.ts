import { createClient } from "@/lib/supabase/client";

export async function removeProductImage(storeId: string, modelId: string, storagePath: string) {
  const client = createClient();
  const { data, error } = await client.rpc("remove_product_image", { p_store_id: storeId, p_model_id: modelId, p_storage_path: storagePath });
  if (error) throw new Error(error.message);
  if (!data) return;
  const { error: storageError } = await client.storage.from("product-images").remove([storagePath]);
  if (storageError) throw new Error(storageError.message);
}
