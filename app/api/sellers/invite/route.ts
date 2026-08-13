import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { domainError } from "@/lib/http/errors";
import { checkRateLimit, rateLimitKey, rateLimitPolicies } from "@/lib/rate-limit/sliding-window";
import { parseSellerInvite } from "@/lib/validation/seller-commands";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const policy = rateLimitPolicies.sellerInvite;
  const limit = checkRateLimit(rateLimitKey(request, "seller-invite"), policy.limit, policy.windowMs);
  if (!limit.allowed) return domainError("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  let input: unknown;
  try { input = await request.json(); } catch { return domainError("invalid_json", 400); }
  const parsed = parseSellerInvite(input);
  if (!parsed.ok) return domainError("invalid_request", 400);
  const command = parsed.value;

  const memberClient = await createClient();
  const { data: { user }, error: authError } = await memberClient.auth.getUser();
  if (authError || !user) return domainError("unauthorized", 401);
  const { data: ownerMembership } = await memberClient.from("store_memberships").select("id").eq("store_id", command.storeId).eq("user_id", user.id).eq("role", "owner").eq("status", "active").maybeSingle();
  if (!ownerMembership) return domainError("forbidden", 403);

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return domainError("unavailable", 503);
  }

  let invite: Awaited<ReturnType<typeof admin.auth.admin.inviteUserByEmail>>;
  try {
    invite = await admin.auth.admin.inviteUserByEmail(command.email, { data: { full_name: command.fullName, phone: command.phone } });
  } catch {
    return domainError("unavailable", 502);
  }
  let invitedUser = invite.data.user;
  let emailSent = !invite.error;
  if (!invitedUser && /already been registered|already exists/i.test(invite.error?.message ?? "")) {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) return domainError("unavailable", 502);
    invitedUser = data.users.find((candidate) => candidate.email?.toLowerCase() === command.email) ?? null;
    emailSent = false;
  }
  if (!invitedUser) return domainError("unavailable", 502);

  const { data, error } = await memberClient.rpc("activate_invited_seller", {
    p_store_id: command.storeId, p_user_id: invitedUser.id, p_email: command.email, p_full_name: command.fullName, p_phone: command.phone, p_idempotency_key: command.idempotencyKey,
  });
  if (error) return domainError(/Owner|access/i.test(error.message) ? "forbidden" : "invalid_request", /Owner|access/i.test(error.message) ? 403 : 400);
  return NextResponse.json({ invitationId: data.invitation_id, idempotentReplay: data.idempotent_replay, emailSent });
}
