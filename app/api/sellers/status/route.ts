import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { domainError } from "@/lib/http/errors";
import { checkRateLimit, rateLimitKey, rateLimitPolicies } from "@/lib/rate-limit/sliding-window";
import { parseSellerStatus } from "@/lib/validation/seller-commands";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const policy = rateLimitPolicies.sellerStatus;
  const limit = checkRateLimit(rateLimitKey(request, "seller-status"), policy.limit, policy.windowMs);
  if (!limit.allowed) return domainError("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  let input: unknown;
  try { input = await request.json(); } catch { return domainError("invalid_json", 400); }
  const parsed = parseSellerStatus(input);
  if (!parsed.ok) return domainError("invalid_request", 400);
  const command = parsed.value;

  const memberClient = await createClient();
  const { data: { user }, error: authError } = await memberClient.auth.getUser();
  if (authError || !user) return domainError("unauthorized", 401);
  const { data: ownerMembership } = await memberClient
    .from("store_memberships")
    .select("id")
    .eq("store_id", command.storeId)
    .eq("user_id", user.id)
    .eq("role", "owner")
    .eq("status", "active")
    .maybeSingle();
  if (!ownerMembership) return domainError("forbidden", 403);

  const { data, error } = await memberClient.rpc("set_seller_membership_status", {
    p_store_id: command.storeId,
    p_seller_id: command.sellerId,
    p_status: command.status,
  });
  if (error) return domainError(/Owner|access|Seller membership/i.test(error.message) ? "forbidden" : "invalid_request", /Owner|access|Seller membership/i.test(error.message) ? 403 : 400);
  return NextResponse.json({ membershipId: data.membership_id, status: data.status, changed: data.changed });
}
