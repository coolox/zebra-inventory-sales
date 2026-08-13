import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { toCancelSaleCommand } from "@/lib/contracts/sales";
import { saleErrorMessage } from "../model/sale-errors";

export async function cancelSale({ storeId, saleId, reason, locale }: { storeId: string; saleId: string; reason: string; locale: Locale }) {
  let command;
  try {
    command = toCancelSaleCommand({ storeId, saleId, reason });
  } catch {
    throw new Error(locale === "tr" ? "İptal nedeni zorunludur." : "A cancellation reason is required.");
  }

  const { error } = await createClient().rpc("cancel_sale", {
    p_store_id: command.storeId,
    p_sale_id: command.saleId,
    p_reason: command.reason,
  });
  if (!error) return;
  throw new Error(saleErrorMessage(error.message, locale));
}
