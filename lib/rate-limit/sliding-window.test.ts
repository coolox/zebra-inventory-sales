import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./sliding-window";
describe("checkRateLimit", () => it("blocks after the limit and resets after its window", () => { expect(checkRateLimit("test", 2, 1000, 0).allowed).toBe(true); expect(checkRateLimit("test", 2, 1000, 1).allowed).toBe(true); expect(checkRateLimit("test", 2, 1000, 2).allowed).toBe(false); expect(checkRateLimit("test", 2, 1000, 1001).allowed).toBe(true); }));
