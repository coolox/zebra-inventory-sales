import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { receiptClientError, receiptErrorMessage } from "../model/receipt-errors";
import type { ReceiptDraft } from "../model/types";

type ConfirmLiveReceiptInput = {
  storeId: string;
  lines: ReceiptDraft[];
  locale: Locale;
};

export async function confirmLiveReceipt({ storeId, lines, locale }: ConfirmLiveReceiptInput) {
  if (!storeId) throw new Error(receiptClientError("membership", locale));
  if (!lines.length) return;

  const first = lines[0];
  const { error } = await createClient().rpc("confirm_inventory_receipt", {
    p_store_id: storeId,
    p_model: {
      model_code: first.code,
      name: first.name,
      brand: first.brand,
      category: first.category,
      gender: first.gender,
      supplier_name: first.supplier,
      barcode: first.barcode ?? null,
    },
    p_lines: lines.map((line) => ({ color: line.color, size: line.size, quantity: line.stock, unit_cost: line.cost, currency: line.currency })),
    p_idempotency_key: crypto.randomUUID(),
  });

  if (!error) return;
  throw new Error(receiptErrorMessage(error.message, locale));
}
