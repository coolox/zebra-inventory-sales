import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server.js";

// Node.js middleware is emitted as a standalone Vercel function. Keep its
// authentication boundary self-contained: local TypeScript imports are not
// traced as runtime ESM modules by that adapter.
const publicPaths = new Set(["/login", "/auth/callback", "/access-denied", "/api/observability"]);

function getRequestCookies(request: NextRequest) {
  const header = request.headers.get("cookie");

  if (!header) {
    return [];
  }

  return header.split(";").flatMap((part) => {
    const separator = part.indexOf("=");
    if (separator <= 0) {
      return [];
    }

    return [{
      name: part.slice(0, separator).trim(),
      value: part.slice(separator + 1).trim(),
    }];
  });
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (process.env.NEXT_PUBLIC_APP_MODE !== "live" || !url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        // Vercel's Node middleware adapter passes a standard Request rather
        // than a NextRequest with the `cookies` helper. The raw Cookie header
        // remains available in both runtimes.
        return getRequestCookies(request);
      },
      setAll(items) {
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser validates the token with Supabase Auth. Do not trust getSession here.
  const { data: { user } } = await supabase.auth.getUser();
  const requestIsPublic = publicPaths.has(request.nextUrl.pathname);

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

export default middleware;

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
