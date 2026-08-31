import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { domainError } from "@/lib/http/errors";

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return domainError("unavailable", 503, { "Cache-Control": "no-store" });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
