import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { seriesList, teachings } from "@/content/teachings";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const pages: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/gatherings", priority: 0.9, freq: "weekly" },
    { path: "/teachings", priority: 0.9, freq: "weekly" },
    { path: "/training", priority: 0.8, freq: "monthly" },
    { path: "/events", priority: 0.7, freq: "monthly" },
    { path: "/testimonies", priority: 0.6, freq: "monthly" },
    { path: "/prayer", priority: 0.7, freq: "monthly" },
    { path: "/give", priority: 0.6, freq: "yearly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
  ];

  return [
    ...pages.map((page) => ({
      url: `${base}${page.path}`,
      lastModified: now,
      changeFrequency: page.freq,
      priority: page.priority,
    })),
    ...teachings.map((teaching) => ({
      url: `${base}/teachings/${teaching.slug}`,
      lastModified: new Date(`${teaching.date}T12:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...seriesList.map((series) => ({
      url: `${base}/teachings/series/${series.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
