export type ContractLocale = "en" | "tr";
export type ContractTheme = "dark" | "light";
export type ContractRole = "owner" | "seller";
export type ContractMembershipStatus = "invited" | "active" | "blocked";
export type ContractStoreCategory = "clothing" | "shoes" | "bags";

export type SessionDto = {
  user: { id: string; email: string; fullName: string };
  profile: { locale: ContractLocale; theme: ContractTheme };
  memberships: Array<{
    storeId: string;
    role: ContractRole;
    status: ContractMembershipStatus;
    store: { id: string; code: string; name: string; category: ContractStoreCategory } | null;
  }>;
};

type SessionSource = {
  user: { id: string; email?: string | null; fullName?: string | null };
  profile?: { locale?: string | null; theme?: string | null } | null;
  memberships: Array<{
    store_id: string;
    role: string;
    status: string;
    stores?: { id: string; code: string; name: string; category: string } | null;
  }>;
};

export function toSessionDto(source: SessionSource): SessionDto {
  return {
    user: {
      id: source.user.id,
      email: source.user.email ?? "",
      fullName: source.user.fullName || source.user.email || "Zebra team member",
    },
    profile: {
      locale: source.profile?.locale === "tr" ? "tr" : "en",
      theme: source.profile?.theme === "light" ? "light" : "dark",
    },
    memberships: source.memberships.map((membership) => ({
      storeId: membership.store_id,
      role: membership.role === "seller" ? "seller" : "owner",
      status: membership.status === "blocked" ? "blocked" : membership.status === "invited" ? "invited" : "active",
      store: membership.stores ? {
        id: membership.stores.id,
        code: membership.stores.code,
        name: membership.stores.name,
        category: membership.stores.category === "shoes" || membership.stores.category === "bags" ? membership.stores.category : "clothing",
      } : null,
    })),
  };
}
