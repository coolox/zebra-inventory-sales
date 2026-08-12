import { createClient } from "@/lib/supabase/client";

export type SetProductModelArchivedInput = {
  storeId: string;
  modelId: string;
  archived: boolean;
};

export async function setProductModelArchived({ storeId, modelId, archived }: SetProductModelArchivedInput) {
  const { error } = await createClient().rpc("set_product_model_archived", {
    p_store_id: storeId,
    p_model_id: modelId,
    p_archived: archived,
  });

  if (error) throw error;
}
