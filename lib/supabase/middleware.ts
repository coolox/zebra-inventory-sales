import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLiveMode } from "@/features/workspace/model/app-mode";

// Observability accepts only bounded, redacted telemetry and is rate-limited at
// the route. It must remain available before authentication so client failures
// during sign-in can be recorded.
const publicPaths = ["/login", "/auth/callback", "/access-denied", "/api/observability"];

export function isPublicPath(pathname: string) {
  return publicPaths.includes(pathname);
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Demo mode never crosses the authentication or live-data boundary.
  if (!isLiveMode) return NextResponse.next({ request });
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser validates the token with Supabase Auth. Do not trust getSession here.
  const { data: { user } } = await supabase.auth.getUser();
  const requestIsPublic = isPublicPath(request.nextUrl.pathname);

  if (!user && !requestIsPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && !requestIsPublic) {
    const { data: membership, error } = await supabase
      .from("store_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error || !membership) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/access-denied";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && request.nextUrl.pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
