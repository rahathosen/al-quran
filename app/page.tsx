import { Button } from "@/components/ui/button";
import { Clock, BookmarkIcon } from "lucide-react";
import { getAllSurahs } from "@/lib/quran-api";
import RecentSurahs from "@/components/recent-surahs";
import BookmarkedVerses from "@/components/bookmarked-verses";
import SearchButton from "@/components/search-button";
import AISearchButton from "@/components/ai-search-button";
import AISearchInfo from "@/components/ai-search-info";
import SurahList from "@/components/surah-list";
import JsonLd from "@/components/json-ld";
import type { Metadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app";

export const metadata: Metadata = {
  title: "Al-Quran | Read and Listen to the Holy Quran",
  description:
    "Read, study, and listen to the Holy Quran with beautiful Arabic text, multiple translations, audio recitations, and AI-powered search.",
  alternates: {
    canonical: baseUrl,
  },
  keywords:
    "Quran, Holy Quran, Quran online, Quran reading, Quran listening, Islamic scripture, Quran translations",
  openGraph: {
    title: "Al-Quran | Read and Listen to the Holy Quran",
    description:
      "Read, study, and listen to the Holy Quran with beautiful Arabic text, multiple translations, audio recitations, and AI-powered search.",
    type: "website",
    url: baseUrl,
    images: [
      {
        url: `${baseUrl}/og-images/quran-og.svg`,
        width: 1200,
        height: 630,
        alt: "Al-Quran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Al-Quran | Read and Listen to the Holy Quran",
    description:
      "Read, study, and listen to the Holy Quran with beautiful Arabic text, multiple translations, audio recitations, and AI-powered search.",
    images: [`${baseUrl}/og-images/quran-og.svg`],
  },
};

export default async function Home() {
  const surahs = await getAllSurahs();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Al-Quran",
    alternateName: ["القرآن الكريم", "The Holy Quran"],
    url: baseUrl,
    description:
      "Read, study, and listen to the Holy Quran with Arabic text, multiple translations, audio recitations, and AI semantic search.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Al-Quran",
    url: baseUrl,
    logo: `${baseUrl}/apple-icon.png`,
    sameAs: ["https://github.com/rahathosen/al-quran"],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Surahs of the Holy Quran",
    description: "Complete list of 114 Surahs (chapters) of the Holy Quran.",
    numberOfItems: surahs.length,
    itemListElement: surahs.map((surah, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Surah ${surah.englishName} (${surah.name})`,
      description: `${surah.englishNameTranslation} - ${surah.numberOfAyahs} verses, ${surah.revelationType}`,
      url: `${baseUrl}/surah/${surah.number}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <JsonLd data={[websiteSchema, organizationSchema, itemListSchema]} />
      <header className="bg-primary text-primary-foreground py-4 md:py-6 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">
              <span dir="rtl" lang="ar" className="font-amiri inline-block mr-2 text-3xl">
                القرآن
              </span>
              <span className="block text-lg font-normal text-primary-foreground/80 tracking-wide">
                Al-Quran
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <SearchButton />
              <AISearchButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* AI Search Info Section */}
        <AISearchInfo />

        {/* Recent Surahs Section */}
        <section className="mb-8" aria-labelledby="recent-surahs-heading">
          <h2
            id="recent-surahs-heading"
            className="text-primary text-xl md:text-2xl font-semibold mb-4 flex items-center"
          >
            <Clock className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
            Recently Read
          </h2>
          <RecentSurahs />
        </section>

        {/* Bookmarks Section */}
        <section className="mb-8" aria-labelledby="bookmarks-heading">
          <h2
            id="bookmarks-heading"
            className="text-primary text-xl md:text-2xl font-semibold mb-4 flex items-center"
          >
            <BookmarkIcon className="w-5 h-5 mr-2 shrink-0" aria-hidden="true" />
            Bookmarked Verses
          </h2>
          <BookmarkedVerses />
        </section>

        <SurahList surahs={surahs} />
      </main>
    </div>
  );
}
