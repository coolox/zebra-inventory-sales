import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSellerStatus, type SellerStatusCommand } from "@/features/sellers/model/types";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit/sliding-window";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(rateLimitKey(request, "seller-status"), 20, 60_000);
  if (!limit.allowed) return NextResponse.json({ error: "Too many access changes. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  let input: Partial<SellerStatusCommand>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const validationError = validateSellerStatus(input);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
  const command = input as SellerStatusCommand;

  const memberClient = await createClient();
  const { data: { user }, error: authError } = await memberClient.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: ownerMembership } = await memberClient
    .from("store_memberships")
    .select("id")
    .eq("store_id", command.storeId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .eq("status", "active")
    .maybeSingle();
  if (!ownerMembership) return NextResponse.json({ error: "Only an Owner can change Seller access." }, { status: 403 });

  const { data, error } = await memberClient.rpc("set_seller_membership_status", {
    p_store_id: command.storeId,
    p_seller_id: command.sellerId,
    p_status: command.status,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: /Owner|access|Seller membership/i.test(error.message) ? 403 : 400 });
  return NextResponse.json({ membershipId: data.membership_id, status: data.status, changed: data.changed });
}
