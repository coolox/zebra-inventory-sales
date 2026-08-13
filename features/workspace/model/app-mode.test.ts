import { describe, expect, it } from "vitest";
import { resolveAppMode } from "./app-mode";

describe("resolveAppMode", () => {
  it("defaults to a deterministic demo tree unless live mode is explicit", () => {
    expect(resolveAppMode(undefined)).toBe("demo");
    expect(resolveAppMode("demo")).toBe("demo");
    expect(resolveAppMode("live")).toBe("live");
    expect(resolveAppMode("anything-else")).toBe("demo");
  });
});
