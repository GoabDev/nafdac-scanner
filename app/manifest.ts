import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NAFDAC Scanner",
    short_name: "NAFDAC Scan",
    description:
      "Take a photo or enter a NAFDAC number to check a product in the official NAFDAC Greenbook.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8f5",
    theme_color: "#0b8f47",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
