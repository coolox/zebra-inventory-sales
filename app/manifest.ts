import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zebra Retail",
    short_name: "Zebra",
    description: "Inventory and sales workspace for Zebra Retail.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/icons/zebra-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/zebra-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
