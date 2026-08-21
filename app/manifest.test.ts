import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

function pngSize(filename: string) {
  const data = readFileSync(path.join(process.cwd(), "public", "icons", filename));
  expect(data.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

describe("PWA manifest", () => {
  it("declares standalone scope and explicit Android install icons", () => {
    const value = manifest();
    expect(value).toMatchObject({ name: "Zebra Boutique", short_name: "Zebra", start_url: "/", scope: "/", display: "standalone", background_color: "#09090b", theme_color: "#09090b" });
    expect(value.icons).toEqual([
      { src: "/icons/zebra-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/zebra-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/zebra-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ]);
  });

  it("ships PNG assets with their declared dimensions", () => {
    expect(pngSize("zebra-192.png")).toEqual({ width: 192, height: 192 });
    expect(pngSize("zebra-512.png")).toEqual({ width: 512, height: 512 });
    expect(pngSize("zebra-maskable-512.png")).toEqual({ width: 512, height: 512 });
    expect(pngSize("apple-touch-icon.png")).toEqual({ width: 180, height: 180 });
  });
});
