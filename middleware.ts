import { createServerClient } from "@supabase/ssr";

const publicPaths = new Set(["/login", "/auth/callback", "/access-denied", "/api/observability"]);

function getRequestCookies(request: Request) {
  const header = request.headers.get("cookie");
  if (!header) return [];

  return header.split(";").flatMap((part) => {
    const separator = part.indexOf("=");
    if (separator <= 0) return [];
    return [{ name: part.slice(0, separator).trim(), value: part.slice(separator + 1).trim() }];
  });
}

function redirect(request: Request, pathname: string) {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return new Response(null, { headers: { Location: url.toString() }, status: 307 });
}

export async function middleware(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const requestUrl = new URL(request.url);
  const requestIsPublic = publicPaths.has(requestUrl.pathname);

  if (process.env.NEXT_PUBLIC_APP_MODE !== "live" || !url || !key) return;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => getRequestCookies(request),
      // The callback route owns new session cookies. Middleware only validates
      // the incoming session, so it must not overwrite cookies while passing
      // a request through to the Next router.
      setAll: () => undefined,
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return requestIsPublic ? undefined : redirect(request, "/login");

  if (!requestIsPublic) {
    const { data: membership, error } = await supabase
      .from("store_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error || !membership) return redirect(request, "/access-denied");
  }

  if (requestUrl.pathname === "/login") return redirect(request, "/");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
