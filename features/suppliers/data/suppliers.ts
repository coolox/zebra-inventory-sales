import { createClient } from "@/lib/supabase/client";
import type { Supplier } from "@/features/suppliers/model/types";

export async function loadSuppliers(storeId: string, includeArchived = false): Promise<Supplier[]> {
  const query = createClient().from("suppliers").select("id,name,phone,notes,is_active").eq("store_id", storeId).order("name");
  if (!includeArchived) query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ id: row.id, name: row.name, phone: row.phone, notes: row.notes, isActive: row.is_active }));
}

export async function saveSupplier({ storeId, supplier, name, phone, notes }: { storeId: string; supplier?: Supplier; name: string; phone: string; notes: string }) {
  if (!name.trim()) throw new Error("Supplier name is required.");
  const { error } = await createClient().rpc("save_supplier", { p_store_id: storeId, p_supplier_id: supplier?.id ?? null, p_name: name.trim(), p_phone: phone.trim() || null, p_notes: notes.trim() || null });
  if (error) throw new Error(error.message);
}

export async function setSupplierArchived(storeId: string, supplierId: string, archived: boolean) {
  const { error } = await createClient().rpc("set_supplier_archived", { p_store_id: storeId, p_supplier_id: supplierId, p_archived: archived });
  if (error) throw new Error(error.message);
}
