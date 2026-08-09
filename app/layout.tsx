import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zebra — Inventory & Sales",
  description: "Inventory and sales for Zebra Retail",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
