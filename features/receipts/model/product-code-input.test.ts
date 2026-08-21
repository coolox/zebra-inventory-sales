import { describe, expect, it } from "vitest";
import { hasForbiddenProductCodeCharacter, isProductCodeKeyboardTerminator } from "./product-code-input";

describe("product-code input boundary", () => {
  it("allows visible leading-zero, Latin and Turkish code characters", () => {
    expect(hasForbiddenProductCodeCharacter("0007-Azİğ")).toBe(false);
  });

  it("rejects control and invisible format characters", () => {
    expect(hasForbiddenProductCodeCharacter("0007-Az\n")).toBe(true);
    expect(hasForbiddenProductCodeCharacter("0007-Az\u200B")).toBe(true);
  });

  it("treats only mobile keyboard terminators as non-input keys", () => {
    expect(isProductCodeKeyboardTerminator("Enter")).toBe(true);
    expect(isProductCodeKeyboardTerminator("Done")).toBe(true);
    expect(isProductCodeKeyboardTerminator("A")).toBe(false);
  });
});
