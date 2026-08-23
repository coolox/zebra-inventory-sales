import type { NextConfig } from "next";

const appMode = process.env.NEXT_PUBLIC_APP_MODE === "live" ? "live" : "demo";
const distDir = process.env.VERCEL === "1" ? ".next" : `.next-${appMode}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Keep development artifacts mode-specific. A live dev session can never
  // serve a stale demo client bundle (or the reverse) from the same `.next`.
  distDir,
};

export default nextConfig;
