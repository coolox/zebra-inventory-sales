import { describe, expect, it } from "vitest";
import { collectSignedImageUrls } from "./load-live-catalog";

describe("collectSignedImageUrls", () => {
  it("keeps successful product photos when another private URL is unavailable", () => {
    const urls = collectSignedImageUrls([
      { path: "store/model/available.jpg", signedUrl: "https://example.test/available" },
      { path: "store/model/missing.jpg", signedUrl: null },
    ]);

    expect(urls.get("store/model/available.jpg")).toBe("https://example.test/available");
    expect(urls.has("store/model/missing.jpg")).toBe(false);
  });

  it("returns no photo URLs without turning the catalog into an error", () => {
    expect(collectSignedImageUrls([
      { path: "store/model/a.jpg" },
      { path: "store/model/b.jpg", signedUrl: null },
    ])).toEqual(new Map());
  });
});
