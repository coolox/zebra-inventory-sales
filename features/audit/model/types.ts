export type AuditCategory = "sale" | "receipt" | "fx" | "image" | "seller" | "inventory" | "supplier" | "catalog" | "other";
export type AuditLogItem = { id: string; action: string; category: AuditCategory; entityType: string; entityId: string | null; actorName: string; createdAt: string; details: Record<string, unknown> };
export type AuditLogFilter = { actions?: string[]; categories?: AuditCategory[]; page?: number; pageSize?: number };
export type AuditLogPage = { items: AuditLogItem[]; page: number; pageSize: number; hasMore: boolean };

export function auditCategory(action: string): AuditCategory {
  if (action.startsWith("sale.")) return "sale";
  if (action.startsWith("receipt.")) return "receipt";
  if (action.startsWith("exchange_rate") || action.startsWith("fx.")) return "fx";
  if (action.startsWith("product_image")) return "image";
  if (action.startsWith("seller.")) return "seller";
  if (action.startsWith("inventory.")) return "inventory";
  if (action.startsWith("supplier.")) return "supplier";
  if (action.startsWith("product_")) return "catalog";
  return "other";
}
