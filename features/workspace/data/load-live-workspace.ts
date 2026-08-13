import { loadLiveCatalog } from "@/features/catalog/data/load-live-catalog";
import { loadLiveSales } from "@/features/sales/data/load-live-sales";
import { createClient } from "@/lib/supabase/client";
import type { Seller } from "@/lib/types";
import type { WorkspaceData } from "../model/workspace-data";
import { toWorkspaceSnapshot } from "@/lib/contracts/workspace";
type ProfileRow = { id: string; full_name: string; phone: string | null };
type MembershipRow = { user_id: string; status: "invited" | "active" | "blocked" };

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "ZR";
}


async function loadLiveSellers(storeId: string): Promise<Seller[]> {
  const client = createClient();
  const { data: membershipData, error: membershipError } = await client
    .from("store_memberships")
    .select("user_id, status")
    .eq("store_id", storeId)
    .eq("role", "seller");
  if (membershipError) throw membershipError;

  const memberships = (membershipData ?? []) as MembershipRow[];
  const membershipByUserId = new Map(memberships.map((membership) => [membership.user_id, membership.status]));
  const userIds = memberships.map((membership) => membership.user_id);
  if (!userIds.length) return [];

  const { data: profileData, error: profileError } = await client
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", userIds);
  if (profileError) throw profileError;

  return ((profileData ?? []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    name: profile.full_name || "Zebra seller",
    initials: initials(profile.full_name),
    store: "clothing",
    status: "offline",
    email: "—",
    phone: profile.phone || "—",
    membershipStatus: membershipByUserId.get(profile.id) ?? "invited",
  }));
}

export async function loadLiveWorkspace(storeId: string): Promise<WorkspaceData> {
  const [products, salesData, sellers] = await Promise.all([
    loadLiveCatalog(storeId),
    loadLiveSales(storeId),
    loadLiveSellers(storeId),
  ]);

  return toWorkspaceSnapshot({
    products,
    sales: salesData.sales,
    sellers,
    activities: salesData.activities,
    exchanges: [],
  });
}
