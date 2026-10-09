import type { MetadataRoute } from "next";
import { publicRoutes } from "@/lib/platform/public-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://debit-credit-nine.vercel.app";
  return (["ar", "en"] as const).flatMap((locale) =>
    publicRoutes.map((route) => ({
      url: `${base}/${locale}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
  );
}
