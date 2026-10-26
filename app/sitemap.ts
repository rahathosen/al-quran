import type { MetadataRoute } from "next";
import { getAllSurahs } from "@/lib/quran-api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app";
  const lastModified = new Date();

  // Root homepage
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}`,
          ar: `${baseUrl}?lang=ar`,
          bn: `${baseUrl}?lang=bn`,
        },
      },
    },
    {
      url: `${baseUrl}/canvas`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  let surahList: { number: number }[] = [];

  try {
    const fetchedSurahs = await getAllSurahs();
    if (fetchedSurahs && fetchedSurahs.length > 0) {
      surahList = fetchedSurahs.map((s) => ({ number: s.number }));
    }
  } catch (error) {
    console.error("Error fetching surahs for sitemap, using fallback:", error);
  }

  // Ensure all 114 surahs are included even if remote fetch fails
  if (surahList.length === 0) {
    surahList = Array.from({ length: 114 }, (_, i) => ({ number: i + 1 }));
  }

  const surahRoutes: MetadataRoute.Sitemap = surahList.map((surah) => ({
    url: `${baseUrl}/surah/${surah.number}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: {
      languages: {
        en: `${baseUrl}/surah/${surah.number}`,
        ar: `${baseUrl}/surah/${surah.number}?edition=quran-uthmani`,
        bn: `${baseUrl}/surah/${surah.number}?edition=bn.bengali`,
      },
    },
  }));

  return [...staticRoutes, ...surahRoutes];
}
