export type AppMode = "demo" | "live";

/**
 * The mode must be explicit. Inferring it from credentials can make a local
 * Next server and its browser bundle choose different first-render trees.
 */
export function resolveAppMode(configuredMode: string | undefined): AppMode {
  return configuredMode === "live" ? "live" : "demo";
}

export const appMode = resolveAppMode(process.env.NEXT_PUBLIC_APP_MODE);

export const isLiveMode = appMode === "live";
