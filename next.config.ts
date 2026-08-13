import type { NextConfig } from "next";

const appMode = process.env.NEXT_PUBLIC_APP_MODE === "live" ? "live" : "demo";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep development artifacts mode-specific. A live dev session can never
  // serve a stale demo client bundle (or the reverse) from the same `.next`.
  distDir: `.next-${appMode}`,
};

export default nextConfig;
