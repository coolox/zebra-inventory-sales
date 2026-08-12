import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadProductImages } from "./product-images";

const storageMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: storageMocks.createClient,
}));

describe("uploadProductImages", () => {
  beforeEach(() => {
    storageMocks.upload.mockReset().mockResolvedValue({ error: null });
    storageMocks.remove.mockReset().mockResolvedValue({ error: null });
    storageMocks.rpc.mockReset().mockResolvedValue({ error: null });
    storageMocks.from.mockReset().mockReturnValue({ upload: storageMocks.upload, remove: storageMocks.remove });
    storageMocks.createClient.mockReset().mockReturnValue({
      storage: { from: storageMocks.from },
      rpc: storageMocks.rpc,
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("uploads JPEG, PNG and WebP files and records their generated paths", async () => {
    const randomUUID = vi.fn()
      .mockReturnValueOnce("photo-jpeg")
      .mockReturnValueOnce("photo-png")
      .mockReturnValueOnce("photo-webp");
    vi.stubGlobal("crypto", { randomUUID });
    const files = [
      new File(["jpeg"], "front.jpeg", { type: "image/jpeg" }),
      new File(["png"], "angle.png", { type: "image/png" }),
      new File(["webp"], "detail.webp", { type: "image/webp" }),
    ];

    await uploadProductImages({ storeId: "store-1", modelId: "model-1", files });

    expect(storageMocks.upload.mock.calls.map(([path, file, options]) => ({ path, name: file.name, options }))).toEqual([
      { path: "store-1/model-1/photo-jpeg.jpg", name: "front.jpeg", options: { contentType: "image/jpeg", upsert: false } },
      { path: "store-1/model-1/photo-png.png", name: "angle.png", options: { contentType: "image/png", upsert: false } },
      { path: "store-1/model-1/photo-webp.webp", name: "detail.webp", options: { contentType: "image/webp", upsert: false } },
    ]);
    expect(storageMocks.rpc.mock.calls.map(([, payload]) => payload)).toEqual([
      { p_model_id: "model-1", p_storage_path: "store-1/model-1/photo-jpeg.jpg" },
      { p_model_id: "model-1", p_storage_path: "store-1/model-1/photo-png.png" },
      { p_model_id: "model-1", p_storage_path: "store-1/model-1/photo-webp.webp" },
    ]);
    expect(storageMocks.remove).not.toHaveBeenCalled();
  });

  it("rejects unsupported file types before creating a client", async () => {
    const file = new File(["gif"], "photo.gif", { type: "image/gif" });

    await expect(uploadProductImages({ storeId: "store-1", modelId: "model-1", files: [file] }))
      .rejects.toThrow("Use JPEG, PNG or WebP photos only.");
    expect(storageMocks.createClient).not.toHaveBeenCalled();
  });

  it("rejects a file larger than 8 MiB before creating a client", async () => {
    const file = new File(["oversize"], "photo.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 8 * 1024 * 1024 + 1 });

    await expect(uploadProductImages({ storeId: "store-1", modelId: "model-1", files: [file] }))
      .rejects.toThrow("Each photo must be 8 MB or smaller.");
    expect(storageMocks.createClient).not.toHaveBeenCalled();
  });

  it("removes every uploaded object when a later database record fails", async () => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn().mockReturnValueOnce("photo-1").mockReturnValueOnce("photo-2") });
    storageMocks.rpc
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("record failed") });
    const files = [
      new File(["one"], "one.png", { type: "image/png" }),
      new File(["two"], "two.png", { type: "image/png" }),
    ];

    await expect(uploadProductImages({ storeId: "store-1", modelId: "model-1", files })).rejects.toThrow("record failed");
    expect(storageMocks.remove).toHaveBeenCalledWith([
      "store-1/model-1/photo-1.png",
      "store-1/model-1/photo-2.png",
    ]);
  });
});
