import type { InventoryMovementHistoryItem, InventoryMovementSource } from "@/features/inventory/model/types";

export type InventoryMovementDto = InventoryMovementHistoryItem;
export type InventoryMovementKind = InventoryMovementSource;

export type InventoryHistoryQuery = { storeId: string; variantId: string; limit?: number };

export function toInventoryMovements(items: InventoryMovementDto[]): InventoryMovementDto[] {
  return items.map((item) => ({ ...item }));
}
