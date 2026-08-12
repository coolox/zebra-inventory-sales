export type SellerInviteCommand = { storeId: string; email: string; fullName: string; phone: string; idempotencyKey: string };
export type SellerInviteResult = { invitationId: string; idempotentReplay: boolean; emailSent: boolean };
export type SellerMembershipStatus = "active" | "blocked";
export type SellerStatusCommand = { storeId: string; sellerId: string; status: SellerMembershipStatus };

export function validateSellerInvite(input: Partial<SellerInviteCommand>) {
  if (!input.storeId || !input.idempotencyKey || !input.fullName?.trim() || !input.phone?.trim()) return "Store, full name, phone and idempotency key are required.";
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return "A valid email address is required.";
  return null;
}

export function validateSellerStatus(input: Partial<SellerStatusCommand>) {
  if (!input.storeId || !input.sellerId) return "Store and Seller are required.";
  if (input.status !== "active" && input.status !== "blocked") return "Seller status must be active or blocked.";
  return null;
}
