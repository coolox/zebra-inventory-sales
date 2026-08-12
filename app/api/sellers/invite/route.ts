import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { validateSellerInvite, type SellerInviteCommand } from "@/features/sellers/model/types";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit/sliding-window";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(request, "seller-invite"), 5, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many invitation attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  let input: Partial<SellerInviteCommand>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const validationError = validateSellerInvite(input);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const command = { ...input, email: input.email!.trim().toLowerCase(), fullName: input.fullName!.trim(), phone: input.phone!.trim() } as SellerInviteCommand;

  const memberClient = await createClient();
  const { data: { user }, error: authError } = await memberClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: ownerMembership } = await memberClient.from("store_memberships").select("id").eq("store_id", command.storeId).eq("user_id", user.id).eq("role", "owner").eq("status", "active").maybeSingle();
  if (!ownerMembership) return NextResponse.json({ error: "Only an Owner can invite Sellers." }, { status: 403 });

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Seller invitations are not configured on this environment." }, { status: 503 });
  }

  let invite: Awaited<ReturnType<typeof admin.auth.admin.inviteUserByEmail>>;
  try {
    invite = await admin.auth.admin.inviteUserByEmail(command.email, { data: { full_name: command.fullName, phone: command.phone } });
  } catch {
    return NextResponse.json({ error: "The invitation service is temporarily unavailable." }, { status: 502 });
  }
  let invitedUser = invite.data.user;
  let emailSent = !invite.error;
  if (!invitedUser && /already been registered|already exists/i.test(invite.error?.message ?? "")) {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) return NextResponse.json({ error: "Unable to resolve the existing account." }, { status: 502 });
    invitedUser = data.users.find((candidate) => candidate.email?.toLowerCase() === command.email) ?? null;
    emailSent = false;
  }
  if (!invitedUser) return NextResponse.json({ error: invite.error?.message ?? "Unable to send seller invite." }, { status: 502 });

  const { data, error } = await memberClient.rpc("activate_invited_seller", {
    p_store_id: command.storeId, p_user_id: invitedUser.id, p_email: command.email, p_full_name: command.fullName, p_phone: command.phone, p_idempotency_key: command.idempotencyKey,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: /Owner|access/i.test(error.message) ? 403 : 400 });
  return NextResponse.json({ invitationId: data.invitation_id, idempotentReplay: data.idempotent_replay, emailSent });
}
