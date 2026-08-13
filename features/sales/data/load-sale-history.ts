import { loadLiveSales } from "./load-live-sales";
import { toSaleHistory } from "../model/sale-history";

/** Store access is enforced by sales/sale_lines/sale_payments RLS; this adapter never supplies a fallback store. */
export async function loadSaleHistory(storeId: string) {
  const { sales } = await loadLiveSales(storeId);
  return toSaleHistory(sales, "clothing");
}
