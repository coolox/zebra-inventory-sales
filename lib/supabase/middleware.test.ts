import { describe, expect, it } from "vitest";
import { isPublicPath } from "./middleware";

describe("authentication middleware public paths", () => {
  it("allows the bounded observability endpoint before sign-in", () => {
    expect(isPublicPath("/api/observability")).toBe(true);
  });

  it("keeps other API routes protected", () => {
    expect(isPublicPath("/api/session")).toBe(false);
  });
});
