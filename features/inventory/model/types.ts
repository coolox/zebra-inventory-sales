export type InventoryMovementSource =
  | "receipt"
  | "sale"
  | "adjustment"
  | "exchange"
  | "transfer"
  | "write_off"
  | "sale_cancellation"
  | "unknown";

export type InventoryMovementHistoryItem = {
  id: string;
  variantId: string;
  quantity: number;
  occurredAt: string;
  actorName: string;
  source: InventoryMovementSource;
  reason: string | null;
  receiptLineId: string | null;
};
