import type { NextRequest } from "next/server";
// Keep this import relative: Vercel's Edge bundler must resolve middleware
// dependencies directly rather than leave the TypeScript `@/` alias external.
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
