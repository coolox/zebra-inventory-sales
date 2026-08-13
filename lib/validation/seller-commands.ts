import type { SellerInviteCommand, SellerMembershipStatus, SellerStatusCommand } from "@/features/sellers/model/types";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phone = /^[0-9+()\-\s]{3,40}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function string(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;
}

function identifier(value: unknown) {
  const candidate = string(value, 64);
  return candidate && uuid.test(candidate) ? candidate : null;
}

export function parseSellerInvite(input: unknown): ValidationResult<SellerInviteCommand> {
  if (!isRecord(input)) return { ok: false };
  const storeId = identifier(input.storeId);
  const idempotencyKey = identifier(input.idempotencyKey);
  const fullName = string(input.fullName, 120);
  const rawEmail = string(input.email, 254);
  const rawPhone = string(input.phone, 40);
  const normalizedEmail = rawEmail?.toLowerCase();
  if (!storeId || !idempotencyKey || !fullName || !normalizedEmail || !email.test(normalizedEmail) || !rawPhone || !phone.test(rawPhone)) return { ok: false };
  return { ok: true, value: { storeId, idempotencyKey, fullName, email: normalizedEmail, phone: rawPhone } };
}

export function parseSellerStatus(input: unknown): ValidationResult<SellerStatusCommand> {
  if (!isRecord(input)) return { ok: false };
  const storeId = identifier(input.storeId);
  const sellerId = identifier(input.sellerId);
  const status: SellerMembershipStatus | null = input.status === "active" || input.status === "blocked" ? input.status : null;
  return storeId && sellerId && status ? { ok: true, value: { storeId, sellerId, status } } : { ok: false };
}
