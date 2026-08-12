import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zebra Retail",
    short_name: "Zebra",
    description: "Inventory and sales workspace for Zebra Retail.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/icons/zebra-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/zebra-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/zebra-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
