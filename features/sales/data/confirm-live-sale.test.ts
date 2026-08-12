import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmLiveSale } from "./confirm-live-sale";

const rpc = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ rpc }),
}));

describe("confirmLiveSale", () => {
  beforeEach(() => {
    rpc.mockReset();
    rpc.mockResolvedValue({ error: null });
    vi.stubGlobal("crypto", { randomUUID: () => "test-idempotency-key" });
  });

  it("sends each payment in its entered currency to the native-currency RPC", async () => {
    await confirmLiveSale({
      storeId: "store-1",
      locale: "en",
      pricingMode: "per_item",
      products: [
        {
          id: "product-1",
          variantId: "variant-1",
        } as never,
      ],
      lines: [
        { productId: "product-1", quantity: 1, price: 100, currency: "EUR" },
      ],
      payments: [
        { id: "payment-1", method: "cash", amount: 50, currency: "EUR" },
        { id: "payment-2", method: "card", amount: 55, currency: "USD" },
      ],
    });

    expect(rpc).toHaveBeenCalledWith("confirm_sale_with_payments", {
      p_store_id: "store-1",
      p_lines: [
        { variant_id: "variant-1", quantity: 1, unit_price: 100, currency: "EUR" },
      ],
      p_payments: [
        { method: "cash", amount: 50, currency: "EUR" },
        { method: "card", amount: 55, currency: "USD" },
      ],
      p_idempotency_key: "test-idempotency-key",
      p_pricing_mode: "per_item",
    });
  });

  it("sends total-price lines without invented item prices", async () => {
    await confirmLiveSale({
      storeId: "store-1",
      locale: "en",
      pricingMode: "sale_total",
      products: [{ id: "product-1", variantId: "variant-1" } as never],
      lines: [{ productId: "product-1", quantity: 2, price: null, currency: null }],
      payments: [
        { id: "payment-1", method: "cash", amount: 50, currency: "EUR" },
        { id: "payment-2", method: "card", amount: 50, currency: "USD" },
      ],
    });

    expect(rpc).toHaveBeenCalledWith("confirm_sale_with_payments", expect.objectContaining({
      p_lines: [{ variant_id: "variant-1", quantity: 2 }],
      p_pricing_mode: "sale_total",
    }));
  });
});
