import type { MetadataRoute } from "next";
import { catalog } from "@/data/catalog";

const BASE = "https://watchesbyfahad.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls: MetadataRoute.Sitemap = catalog.flatMap((cat) =>
    cat.groups.map((group) => ({
      url: `${BASE}/product/${group.id}/`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }))
  );

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...productUrls,
  ];
}
