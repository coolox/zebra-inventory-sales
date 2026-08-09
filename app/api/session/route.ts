import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: memberships, error: membershipError }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, locale, theme").eq("id", user.id).maybeSingle(),
    supabase
      .from("store_memberships")
      .select("store_id, role, status, stores(id, code, name, category)")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  if (membershipError || !memberships?.length) {
    return NextResponse.json({ error: "No active store membership" }, { status: 403 });
  }

  return NextResponse.json({
    user: { email: user.email ?? "", fullName: profile?.full_name || user.email || "Zebra team member" },
    profile: { locale: profile?.locale || "en", theme: profile?.theme || "dark" },
    memberships,
  });
}
