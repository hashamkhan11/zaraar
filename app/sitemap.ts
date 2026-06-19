import type { MetadataRoute } from "next";
import { CATALOG } from "@/data/products";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zaraar.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls: MetadataRoute.Sitemap = CATALOG.map(p => ({
    url: `${BASE}/product/${p.id}/`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: `${BASE}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${BASE}/about/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...productUrls,
  ];
}
