import { describe, expect, it } from "vitest";
import { canonicalColor, colorLabel, colorOptions } from "./colors";

describe("canonical colours", () => {
  it("collapses case and Turkish/English synonyms", () => {
    expect(canonicalColor(" siyah ")).toBe("Black");
    expect(colorLabel("black", "tr")).toBe("Siyah");
    expect(colorOptions(["black", "Black", "siyah", "white", "Boundary EUR", "mavi"], "en")).toEqual([
      { value: "Black", label: "Black" }, { value: "White", label: "White" }, { value: "Blue", label: "Blue" },
    ]);
  });
});
