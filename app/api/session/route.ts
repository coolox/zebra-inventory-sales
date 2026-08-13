import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toSessionDto } from "@/lib/contracts/auth";
import { domainError } from "@/lib/http/errors";
import { checkRateLimit, rateLimitKey, rateLimitPolicies } from "@/lib/rate-limit/sliding-window";

export async function GET(request: NextRequest) {
  const policy = rateLimitPolicies.session;
  const limit = checkRateLimit(rateLimitKey(request, "session"), policy.limit, policy.windowMs);
  if (!limit.allowed) return domainError("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return domainError("unauthorized", 401);

  const [{ data: profile }, { data: memberships, error: membershipError }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, locale, theme").eq("id", user.id).maybeSingle(),
    supabase
      .from("store_memberships")
      .select("store_id, role, status, stores(id, code, name, category)")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  if (membershipError || !memberships?.length) {
    return domainError("forbidden", 403);
  }

  return NextResponse.json(toSessionDto({
    user: { id: user.id, email: user.email, fullName: profile?.full_name },
    profile,
    memberships: memberships.map((membership) => ({
      ...membership,
      stores: Array.isArray(membership.stores) ? membership.stores[0] ?? null : membership.stores,
    })),
  }));
}
