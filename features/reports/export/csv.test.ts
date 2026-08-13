import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";
describe("report CSV", () => { it("escapes RFC 4180 cells and neutralizes formulas", () => { expect(csvCell('a,"b"')).toBe('"a,""b"""'); expect(csvCell("=SUM(A1:A2)")).toBe("'=SUM(A1:A2)"); expect(toCsv(["EUR revenue", "Original note"], [[12.5, "+unsafe"]])).toBe("\uFEFFEUR revenue,Original note\r\n12.5,'+unsafe\r\n"); }); });
