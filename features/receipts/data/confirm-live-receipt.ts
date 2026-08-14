import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { receiptClientError, receiptErrorMessage } from "../model/receipt-errors";
import type { ReceiptDraft } from "../model/types";
import { toConfirmReceiptCommand } from "@/lib/contracts/receipts";
import { reportClientFailure } from "@/lib/observability/client";

type ConfirmLiveReceiptInput = {
  storeId: string;
  lines: ReceiptDraft[];
  locale: Locale;
};

export async function confirmLiveReceipt({ storeId, lines, locale }: ConfirmLiveReceiptInput) {
  if (!storeId) throw new Error(receiptClientError("membership", locale));
  if (!lines.length) return;

  const command = toConfirmReceiptCommand(storeId, lines, crypto.randomUUID());
  if (!command) return;
  const { error } = await createClient().rpc("confirm_inventory_receipt", {
    p_store_id: command.storeId,
    p_model: {
      model_code: command.model.code, name: command.model.name, brand: command.model.brand, category: command.model.category, gender: command.model.gender, supplier_name: command.model.supplier, barcode: command.model.barcode ?? null,
    },
    p_lines: command.lines.map((line) => ({ color: line.color, size: line.size, barcode: line.barcode ?? null, quantity: line.quantity, unit_cost: line.unitCost, currency: line.currency })),
    p_idempotency_key: command.idempotencyKey,
  });

  if (!error) return;
  reportClientFailure({ operation: "receipt.confirm", error, correlationId: command.idempotencyKey, context: { lineCount: command.lines.length } });
  throw new Error(receiptErrorMessage(error.message, locale));
}
