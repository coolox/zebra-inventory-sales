export type AppMode = "demo" | "live";

const configuredMode = process.env.NEXT_PUBLIC_APP_MODE;
const hasSupabaseCredentials = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export const appMode: AppMode = configuredMode === "demo"
  ? "demo"
  : configuredMode === "live"
    ? "live"
    : hasSupabaseCredentials
      ? "live"
      : "demo";

export const isLiveMode = appMode === "live";
