import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f2ece0",
    theme_color: "#101317",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/images/tsop-crest.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/tsop-crest.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
