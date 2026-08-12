import { createClient } from "@/lib/supabase/client";
import type { ArchiveProductModelCommand } from "@/lib/contracts/catalog";

export type SetProductModelArchivedInput = ArchiveProductModelCommand;

export async function setProductModelArchived({ storeId, modelId, archived }: SetProductModelArchivedInput) {
  const { error } = await createClient().rpc("set_product_model_archived", {
    p_store_id: storeId,
    p_model_id: modelId,
    p_archived: archived,
  });

  if (error) throw error;
}
