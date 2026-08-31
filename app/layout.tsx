import type { Metadata } from "next";
import "./globals.css";
import { PwaServiceWorker } from "@/components/pwa-service-worker";

export const metadata: Metadata = {
  applicationName: "Zebra Retail",
  title: "Zebra — Inventory & Sales",
  description: "Inventory and sales for Zebra Retail",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Zebra Retail" },
  icons: {
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    icon: [
      { url: "/icons/zebra-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/zebra-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body><PwaServiceWorker />{children}</body>
    </html>
  );
}
