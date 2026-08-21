import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const remove = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ rpc, storage: { from: () => ({ remove }) } }) }));

import { removeProductImage } from "./remove-product-image";

describe("removeProductImage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("removes the private object only after the Owner-scoped RPC authorizes cleanup", async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    remove.mockResolvedValue({ error: null });
    await removeProductImage("store", "model", "store/model/photo.png");
    expect(rpc).toHaveBeenCalledWith("remove_product_image", { p_store_id: "store", p_model_id: "model", p_storage_path: "store/model/photo.png" });
    expect(remove).toHaveBeenCalledWith(["store/model/photo.png"]);
  });

  it("does not delete Storage when the server rejects the request", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "Only an Owner can delete product photos" } });
    await expect(removeProductImage("store", "model", "store/model/photo.png")).rejects.toThrow("Only an Owner can delete product photos");
    expect(remove).not.toHaveBeenCalled();
  });
});
