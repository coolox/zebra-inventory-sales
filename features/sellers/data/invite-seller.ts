import type { SellerInviteCommand, SellerInviteResult } from "@/features/sellers/model/types";

export async function inviteSeller(command: Omit<SellerInviteCommand, "idempotencyKey">): Promise<SellerInviteResult> {
  const response = await fetch("/api/sellers/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...command, idempotencyKey: crypto.randomUUID() }) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Unable to send seller invite.");
  return payload;
}
