import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadPaymentRates } from "./load-payment-rates";

const eq = vi.fn();
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from }),
}));

describe("loadPaymentRates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps today's saved native-currency rates and keeps EUR as the base", async () => {
    eq.mockResolvedValue({
      data: [
        { currency: "EUR", eur_rate: "1" },
        { currency: "USD", eur_rate: "0.83333333" },
        { currency: "TRY", eur_rate: "0.021" },
      ],
      error: null,
    });

    await expect(loadPaymentRates()).resolves.toEqual({ EUR: 1, USD: 0.83333333, TRY: 0.021, RUB: null, GBP: null });
    expect(from).toHaveBeenCalledWith("exchange_rates");
    expect(select).toHaveBeenCalledWith("currency, eur_rate");
    expect(eq).toHaveBeenCalledWith("business_date", expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });

  it("rejects an unavailable rate query instead of inventing foreign-currency values", async () => {
    const error = new Error("RLS denied");
    eq.mockResolvedValue({ data: null, error });

    await expect(loadPaymentRates()).rejects.toBe(error);
  });
});
