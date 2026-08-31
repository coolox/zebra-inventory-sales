import { createClient } from "@/lib/supabase/client";

type LogoutDependencies = {
  requestServerLogout?: () => Promise<unknown>;
  clearBrowserSession?: () => Promise<unknown>;
  navigate?: (url: string) => void;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 4_000;

export async function logoutAndRedirect({
  requestServerLogout = () => fetch("/api/logout", { method: "POST", cache: "no-store" }),
  clearBrowserSession = () => createClient().auth.signOut({ scope: "local" }),
  navigate = (url) => window.location.replace(url),
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: LogoutDependencies = {}) {
  const cleanup = Promise.allSettled([requestServerLogout(), clearBrowserSession()]);
  let timer: ReturnType<typeof setTimeout> | undefined;

  await Promise.race([
    cleanup,
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    }),
  ]);

  if (timer) clearTimeout(timer);
  navigate("/login");
}
