import { describe, expect, it } from "vitest";
import { saleErrorMessage } from "./sale-errors";

describe("saleErrorMessage", () => {
  it("maps known sale RPC errors to actionable English messages", () => {
    expect(saleErrorMessage("Insufficient stock for selected variant", "en")).toMatch(/sold out/i);
    expect(saleErrorMessage("Owner must set the USD exchange rate", "en")).toMatch(/exchange rate/i);
    expect(saleErrorMessage("Selected variant has no purchase cost", "en")).toMatch(/purchase cost/i);
    expect(saleErrorMessage("No access to this store", "en")).toMatch(/do not have access/i);
    expect(saleErrorMessage("Payment total must equal sale total", "en")).toMatch(/Payment total/i);
  });

  it("maps duplicate and validation failures without exposing database details", () => {
    expect(saleErrorMessage("duplicate key value violates unique constraint sale_lines_sale_id_variant_id_key", "en")).not.toMatch(/constraint/i);
    expect(saleErrorMessage("Invalid sale line", "tr")).toMatch(/Satış ürünlerini/i);
    expect(saleErrorMessage("unexpected postgres detail", "tr")).toBe("Satış kaydedilemedi. Lütfen tekrar deneyin.");
  });
});

