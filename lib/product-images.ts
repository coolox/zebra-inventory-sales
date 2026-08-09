import { createClient } from "@/lib/supabase/client";

const bucket = "product-images";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 8 * 1024 * 1024;

function extensionFor(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  return "webp";
}

export async function uploadProductImages({ storeId, modelId, files }: { storeId: string; modelId: string; files: File[] }) {
  if (!files.length) return;
  for (const file of files) {
    if (!allowedTypes.has(file.type)) throw new Error("Use JPEG, PNG or WebP photos only.");
    if (file.size > maxBytes) throw new Error("Each photo must be 8 MB or smaller.");
  }

  const client = createClient();
  const uploadedPaths: string[] = [];
  try {
    for (const file of files) {
      const path = `${storeId}/${modelId}/${crypto.randomUUID()}.${extensionFor(file)}`;
      const { error: uploadError } = await client.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      const { error: recordError } = await client.rpc("add_product_image", { p_model_id: modelId, p_storage_path: path });
      if (recordError) throw recordError;
    }
  } catch (error) {
    if (uploadedPaths.length) await client.storage.from(bucket).remove(uploadedPaths);
    throw new Error(error instanceof Error ? error.message : "Photos could not be uploaded.");
  }
}
