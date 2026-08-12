import type { SellerMembershipStatus } from "@/features/sellers/model/types";

export type SellerStatusResult = { membershipId: string; status: SellerMembershipStatus; changed: boolean };

export async function updateSellerStatus(command: { storeId: string; sellerId: string; status: SellerMembershipStatus }): Promise<SellerStatusResult> {
  const response = await fetch("/api/sellers/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to update Seller access.");
  return payload;
}
