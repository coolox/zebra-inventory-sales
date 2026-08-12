import { createClient } from "@/lib/supabase/client";
import { auditCategory, type AuditLogFilter, type AuditLogItem, type AuditLogPage } from "@/features/audit/model/types";

type AuditRow = { id: string; action: string; entity_type: string; entity_id: string | null; actor_id: string | null; details: Record<string, unknown>; created_at: string };
type ProfileRow = { id: string; full_name: string | null };

export function mapAuditLog(rows: AuditRow[], profiles: ProfileRow[]): AuditLogItem[] {
  const names = new Map(profiles.map((profile) => [profile.id, profile.full_name?.trim() || "Zebra team member"]));
  return rows.map((row) => ({ id: row.id, action: row.action, category: auditCategory(row.action), entityType: row.entity_type, entityId: row.entity_id, actorName: row.actor_id ? names.get(row.actor_id) ?? "Zebra team member" : "System", createdAt: row.created_at, details: row.details ?? {} }));
}

export async function loadAuditLog(storeId: string, filter: AuditLogFilter = {}): Promise<AuditLogPage> {
  if (!storeId) return { items: [], page: 1, pageSize: 25, hasMore: false };
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 25));
  const client = createClient();
  let query = client.from("audit_logs").select("id, action, entity_type, entity_id, actor_id, details, created_at").eq("store_id", storeId).order("created_at", { ascending: false }).order("id", { ascending: false });
  if (filter.actions?.length) query = query.in("action", filter.actions);
  const { data, error } = await query.range((page - 1) * pageSize, page * pageSize);
  if (error) throw error;
  const rows = (data ?? []) as AuditRow[];
  const filtered = filter.categories?.length ? rows.filter((row) => filter.categories!.includes(auditCategory(row.action))) : rows;
  const actorIds = [...new Set(filtered.flatMap((row) => row.actor_id ? [row.actor_id] : []))];
  const profiles = actorIds.length ? await client.from("profiles").select("id, full_name").in("id", actorIds) : { data: [], error: null };
  if (profiles.error) throw profiles.error;
  return { items: mapAuditLog(filtered.slice(0, pageSize), (profiles.data ?? []) as ProfileRow[]), page, pageSize, hasMore: rows.length > pageSize };
}
