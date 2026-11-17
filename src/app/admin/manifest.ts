import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TSOP Admin",
    short_name: "TSOP Admin",
    description: "Administration dashboard for The School of Prophets",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#0c1014",
    theme_color: "#0c1014",
    icons: [
      { src: "/images/tsop-crest.webp", sizes: "192x192", type: "image/webp", purpose: "any" },
      { src: "/images/tsop-crest.webp", sizes: "512x512", type: "image/webp", purpose: "any" },
    ],
  };
}
