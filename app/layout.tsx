import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Zebra Retail",
  title: "Zebra — Inventory & Sales",
  description: "Inventory and sales for Zebra Retail",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Zebra Retail" },
  icons: { apple: "/icons/zebra-icon.svg", icon: "/icons/zebra-icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
