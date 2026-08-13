import { createClient } from "@/lib/supabase/client";

export type ReconciliationDiscrepancy = { type: "payment_mismatch" | "missing_sale_movement" | "negative_balance" | "manual_correction"; severity: "error" | "review"; sourceIds: Record<string, unknown>; expectedValue: number | null; actualValue: number | null; occurredAt: string; summary: string };
type Row = { discrepancy_type: ReconciliationDiscrepancy["type"]; severity: ReconciliationDiscrepancy["severity"]; source_ids: Record<string, unknown>; expected_value: number | string | null; actual_value: number | string | null; occurred_at: string; summary: string };

/** Reads Owner-only immutable-ledger discrepancies; it does not amend any records. */
export async function loadDiscrepancies(storeId: string): Promise<ReconciliationDiscrepancy[]> {
  const { data, error } = await createClient().rpc("get_reconciliation_discrepancies", { p_store_id: storeId });
  if (error) throw error;
  return ((data ?? []) as Row[]).map((row) => ({ type: row.discrepancy_type, severity: row.severity, sourceIds: row.source_ids, expectedValue: row.expected_value === null ? null : Number(row.expected_value), actualValue: row.actual_value === null ? null : Number(row.actual_value), occurredAt: row.occurred_at, summary: row.summary }));
}
