import { describe, expect, it } from "vitest";
import { createInitialWorkspaceData } from "@/features/workspace/model/workspace-data";
import { toCatalogVariants } from "./catalog";

describe("catalog contract", () => {
  it("keeps variant identity, currency and optional barcodes in a detached DTO", () => {
    const source = createInitialWorkspaceData().products;
    const variants = toCatalogVariants(source);
    variants[0].photos?.push("another-photo");
    expect(variants[0]).toMatchObject({ id: expect.anything(), currency: expect.any(String) });
    expect(source[0].photos).not.toContain("another-photo");
  });
});
