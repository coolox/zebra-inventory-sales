import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function localeForRedirect(requestUrl: URL) {
  return requestUrl.searchParams.get("locale") === "tr" ? "tr" : "en";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const locale = localeForRedirect(requestUrl);

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code&locale=${locale}`, requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(`/?locale=${locale}`, requestUrl.origin));
    }
  } catch {
    // Do not expose authentication or configuration details in the redirect.
  }

  return NextResponse.redirect(new URL(`/login?error=invalid_link&locale=${locale}`, requestUrl.origin));
}
