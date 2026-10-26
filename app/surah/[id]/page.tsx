import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getSurahById,
  getSurahTranslation,
  getVerseAudioUrl,
} from "@/lib/quran-api";
import { notFound } from "next/navigation";
import SurahAudioPlayer from "@/components/surah-audio-player";
import VerseItem from "@/components/verse-item";
import SurahPageClient from "./page.client";
import { cookies } from "next/headers";
import SearchButton from "@/components/search-button";
import AISearchButton from "@/components/ai-search-button";
import BookmarkSurahButton from "@/components/bookmark-surah-button";
import ShareSurahButton from "@/components/share-surah-button";
import VerseMetadata from "@/components/verse-metadata";
import ViewToggle from "@/components/view-toggle";
import JsonLd from "@/components/json-ld";
import type { Metadata, ResolvingMetadata } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const surahId = Number.parseInt(id);
  const surah = await getSurahById(surahId);

  if (!surah) {
    return {
      title: "Surah Not Found | Al-Quran",
      description: "The requested Surah could not be found.",
    };
  }

  return {
    title: `Surah ${surah.englishName} (${surah.name}) | Al-Quran`,
    description: `Read and listen to Surah ${surah.englishName} (${surah.name}) - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses, ${surah.revelationType} revelation.`,
    openGraph: {
      title: `Surah ${surah.englishName} (${surah.name}) | Al-Quran`,
      description: `Read and listen to Surah ${surah.englishName} (${surah.name}) - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses.`,
      type: "article",
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
      }/surah/${surahId}`,
      images: [
        {
          url: `${
            process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
          }/api/og-svg/${surahId}`,
          width: 1200,
          height: 630,
          alt: `Surah ${surah.englishName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Surah ${surah.englishName} | Al-Quran`,
      description: `Read and listen to Surah ${surah.englishName} - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses.`,
      images: [
        `${
          process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
        }/api/og-svg/${surahId}`,
      ],
    },
    alternates: {
      canonical: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
      }/surah/${surahId}`,
    },
    keywords: `Quran, Surah ${surah.englishName}, ${surah.name}, ${surah.englishNameTranslation}, Islamic scripture, Holy Quran`,
  };
}

export default async function SurahPage({
  params,
  searchParams,
}: Props) {
  const [{ id }, { view }] = await Promise.all([params, searchParams]);
  const surahId = Number.parseInt(id);
  const viewMode = view || "default";

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  // Get settings from cookies if available (fallback to defaults)
  const settingsSchema = z.object({
    reciterId: z.string().default("alafasy"),
    translationId: z.string().default("en.asad"),
    quranFont: z.string().default("uthmani"),
  });

  const defaultSettings = {
    reciterId: "alafasy",
    translationId: "en.asad",
    quranFont: "uthmani",
  };

  const cookieStore = await cookies();
  const settingsCookie = cookieStore.get("quran-settings");
  let settings = defaultSettings;

  if (settingsCookie?.value) {
    try {
      const decoded = decodeURIComponent(settingsCookie.value);
      const parsed = JSON.parse(decoded);
      settings = settingsSchema.parse(parsed);
    } catch {
      settings = defaultSettings;
    }
  }

  const [surah, translation] = await Promise.all([
    getSurahById(surahId, `ar.${settings.reciterId}`),
    getSurahTranslation(surahId, settings.translationId),
  ]);

  if (!surah || !translation) {
    notFound();
  }

  const verses = surah.ayahs.map((ayah, index) => ({
    number: ayah.numberInSurah,
    arabic: ayah.text,
    translation: translation.ayahs[index]?.text || "Translation not available",
    audioUrl: getVerseAudioUrl(surahId, ayah.numberInSurah, settings.reciterId),
    juz: ayah.juz,
    page: ayah.page,
  }));

  const surahSchema = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `Surah ${surah.englishName} (${surah.name})`,
    headline: `${surah.englishName} - ${surah.englishNameTranslation}`,
    position: surah.number,
    inLanguage: ["ar", "en", "bn"],
    numberOfPages: surah.numberOfAyahs,
    isPartOf: {
      "@type": "Book",
      name: "The Holy Quran",
      inLanguage: "ar",
      url: baseUrl,
    },
    url: `${baseUrl}/surah/${surah.number}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Surah ${surah.englishName}`,
        item: `${baseUrl}/surah/${surah.number}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <JsonLd data={[surahSchema, breadcrumbSchema]} />
      <header className="bg-primary text-primary-foreground py-4 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col gap-3">
          {/* Top navigation row: Back icon & Desktop search on left, action buttons on right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 md:flex-initial">
              <Link href="/" aria-label="Back to all Surahs">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/15 h-9 w-9 rounded-full shrink-0 active:scale-95 transition-all"
                  title="Back to all Surahs"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back to all Surahs</span>
                </Button>
              </Link>

              {/* Desktop search buttons - placed right alongside the Back icon */}
              <div className="hidden md:flex items-center gap-2">
                <SearchButton size="sm" className="h-9" />
                <AISearchButton size="sm" className="h-9" />
              </div>
            </div>

            {/* Right side: Surah actions */}
            <div className="flex items-center gap-1 shrink-0">
              <SurahPageClient surahId={surahId} />
              <ShareSurahButton
                surahId={surahId}
                surahName={surah.englishName}
              />
              <BookmarkSurahButton
                surahId={surahId}
                surahName={surah.name}
                englishName={surah.englishName}
              />
            </div>
          </div>

          {/* Mobile search buttons - shown only on small screens (< md) */}
          <div className="w-full flex flex-col sm:flex-row gap-2 md:hidden">
            <SearchButton size="sm" className="h-9" />
            <AISearchButton size="sm" className="h-9" />
          </div>

          {/* Bottom row: Surah info with metadata */}
          <div className="text-center pb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex flex-wrap justify-center items-center gap-2">
              <span>{surah.englishName}</span>
              <span className="opacity-80">({surah.number})</span>
              <span className="opacity-60">:</span>
              <span dir="rtl" lang="ar" className="font-amiri text-2xl sm:text-3xl">
                {surah.name}
              </span>
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-2 mt-1 text-xs sm:text-sm font-normal text-primary-foreground/80">
              <span>{surah.numberOfAyahs} Verses</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/40" />
              <span>{surah.revelationType} Revelation</span>
            </div>

            {/* Metadata information */}
            <div className="mt-2.5 flex flex-wrap justify-center items-center gap-2 text-xs">
              <div className="bg-primary-foreground/15 px-2.5 py-1 rounded-md font-medium">
                <span className="opacity-75">Juz:</span> {surah.ayahs[0]?.juz || 1}
              </div>
              <div className="bg-primary-foreground/15 px-2.5 py-1 rounded-md font-medium">
                <span className="opacity-75">Hizb:</span>{" "}
                {Math.ceil((surah.ayahs[0]?.juz || 1) * 2)}
              </div>
              <div className="bg-primary-foreground/15 px-2.5 py-1 rounded-md font-medium">
                <span className="opacity-75">Manzil:</span>{" "}
                {Math.ceil((surah.ayahs[0]?.juz || 1) / 7)}
              </div>
              <div className="bg-primary-foreground/15 px-2.5 py-1 rounded-md font-medium">
                <span className="opacity-75">Ruku:</span>{" "}
                {Math.ceil(((surah.ayahs[0]?.juz || 1) * 8) / 30)}
              </div>
              <div className="bg-primary-foreground/15 px-2.5 py-1 rounded-md font-medium">
                <span className="opacity-75">Sajda:</span>{" "}
                {[7, 13, 15, 16, 19, 22, 25, 27, 32, 38, 41, 53, 84].includes(
                  surahId
                )
                  ? "Yes"
                  : "No"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 pb-32">
        {/* Verse Metadata - Sticky bar */}
        <VerseMetadata
          surahName={surah.englishName}
          surahNumber={surahId}
          juz={surah.ayahs[0]?.juz}
          page={surah.ayahs[0]?.page}
        />

        <div className="bg-card text-card-foreground rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 mb-6 border border-border relative overflow-hidden">
          {/* Controls header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 relative z-10">
            <div className="text-sm font-medium text-muted-foreground">
              {viewMode === "arabic-only"
                ? "Arabic-only Mode"
                : viewMode === "compact"
                ? "Compact Reading Mode"
                : "Standard Reading Mode"}
            </div>
            <div className="flex items-center gap-2.5">
              <ViewToggle currentView={viewMode} surahId={surahId} />
              <SurahAudioPlayer
                surahId={surahId}
                verses={verses}
                surahName={surah.name}
                englishName={surah.englishName}
              />
            </div>
          </div>

          {/* Bismillah Banner */}
          {surah.number !== 9 && (
            <div className="bg-muted/40 p-4 sm:p-6 rounded-xl border border-border mb-8 shadow-xs text-center relative z-10">
              <p
                dir="rtl"
                lang="ar"
                className={`font-amiri text-lg md:text-xl text-muted-foreground quran-${settings.quranFont} mb-2`}
              >
                أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
              </p>
              <p
                dir="rtl"
                lang="ar"
                className={`font-amiri text-2xl md:text-3xl lg:text-4xl text-foreground quran-${settings.quranFont} font-medium`}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

          {/* Verses Container */}
          <div
            className={`${
              viewMode === "compact"
                ? "space-y-4"
                : viewMode === "arabic-only"
                ? "space-y-3"
                : "space-y-6"
            } relative z-10`}
          >
            {verses.map((verse, index) => (
              <div
                key={verse.number}
                className={
                  index % 2 === 0
                    ? "bg-muted/20 rounded-xl p-2 sm:p-3"
                    : "p-2 sm:p-3"
                }
              >
                <VerseItem
                  verse={verse}
                  surahId={surahId}
                  surahName={surah.name}
                  englishName={surah.englishName}
                  verses={verses}
                  quranFont={settings.quranFont}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Previous / Next Surah Navigation */}
        <div className="flex justify-between items-center gap-4 mt-6">
          {surahId > 1 ? (
            <Link href={`/surah/${surahId - 1}`}>
              <Button
                variant="outline"
                className="text-foreground hover:bg-muted text-sm sm:text-base px-3 sm:px-4"
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Previous Surah</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            </Link>
          ) : (
            <div className="w-1" />
          )}

          {surahId < 114 ? (
            <Link href={`/surah/${surahId + 1}`}>
              <Button
                variant="outline"
                className="text-foreground hover:bg-muted text-sm sm:text-base px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Next Surah</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="w-1" />
          )}
        </div>
      </main>
    </div>
  );
}
