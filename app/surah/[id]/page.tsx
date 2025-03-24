import Link from "next/link";
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
import type { Metadata, ResolvingMetadata } from "next";

// Add this type for the generateMetadata function params
type Props = {
  params: { id: string };
  searchParams: { view?: string };
};

// Add this generateMetadata function before the default export
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the surah ID from params
  const surahId = Number.parseInt(params.id);

  // Fetch surah data
  const surah = await getSurahById(surahId);

  if (!surah) {
    return {
      title: "Surah Not Found | Al-Quran Al-Kareem",
      description: "The requested Surah could not be found.",
    };
  }

  // Create metadata with surah details
  return {
    title: `Surah ${surah.englishName} (${surah.name}) | Al-Quran Al-Kareem`,
    description: `Read and listen to Surah ${surah.englishName} (${surah.name}) - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses, ${surah.revelationType} revelation.`,
    openGraph: {
      title: `Surah ${surah.englishName} (${surah.name}) | Al-Quran Al-Kareem`,
      description: `Read and listen to Surah ${surah.englishName} (${surah.name}) - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses, ${surah.revelationType} revelation.`,
      type: "article",
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
      }/surah/${surahId}`,
      // Use the dynamic SVG API route
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
      title: `Surah ${surah.englishName} | Al-Quran Al-Kareem`,
      description: `Read and listen to Surah ${surah.englishName} - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses.`,
      // Use the same dynamic SVG
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
}: {
  params: { id: string };
  searchParams: { view?: string };
}) {
  const surahId = Number.parseInt(params.id);
  const viewMode = searchParams.view || "default"; // Can be "default", "compact", or "arabic-only"

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    notFound();
  }

  // Get settings from cookies if available (fallback to defaults)
  const cookieStore = cookies();
  const settingsCookie = cookieStore.get("quran-settings");
  let settings = {
    reciterId: "alafasy",
    translationId: "en.asad",
    quranFont: "uthmani",
  };

  if (settingsCookie?.value) {
    try {
      const parsedSettings = JSON.parse(settingsCookie.value);
      settings = {
        reciterId: parsedSettings.reciterId || "alafasy",
        translationId: parsedSettings.translationId || "en.asad",
        quranFont: parsedSettings.quranFont || "uthmani",
      };
    } catch (e) {
      console.error("Error parsing settings cookie:", e);
    }
  }

  // Use the reciter and translation from settings
  const [surah, translation] = await Promise.all([
    getSurahById(surahId, `ar.${settings.reciterId}`),
    getSurahTranslation(surahId, settings.translationId),
  ]);

  if (!surah || !translation) {
    notFound();
  }

  // Combine Arabic text with translation and add audio URLs
  const verses = surah.ayahs.map((ayah, index) => ({
    number: ayah.numberInSurah,
    arabic: ayah.text,
    translation: translation.ayahs[index]?.text || "Translation not available",
    audioUrl: getVerseAudioUrl(surahId, ayah.numberInSurah, settings.reciterId),
    juz: ayah.juz,
    page: ayah.page,
  }));

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <header className="bg-[#1a5e63] text-white py-4 border-b border-[#d4af37]">
        <div className="container mx-auto px-4 flex flex-col gap-3">
          {/* Top row: Back button on left, action buttons on right */}
          <div className="flex justify-between items-center">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:text-[#d4af37] px-2"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Back to Surahs</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>

            <div className="flex gap-1">
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

          {/* Middle row: Search */}
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <SearchButton />
            <AISearchButton />
          </div>

          {/* Bottom row: Surah info with metadata */}
          <div className="text-center pb-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
              {surah.englishName} ({surah.number}) : {surah.name}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm font-normal text-[#d4af37]">
              {/* <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50"></span> */}
              <span>{surah.numberOfAyahs} Verses</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50"></span>
              <span>{surah.revelationType}</span>
            </div>

            {/* Metadata information */}
            <div className="mt-2 flex flex-wrap justify-center items-center gap-2 text-xs text-white/90">
              <div className="bg-white/10 px-2 py-1 rounded-md">
                <span className="font-semibold">Juz:</span>{" "}
                {surah.ayahs[0]?.juz || 1}
              </div>
              <div className="bg-white/10 px-2 py-1 rounded-md">
                <span className="font-semibold">Hizb:</span>{" "}
                {Math.ceil((surah.ayahs[0]?.juz || 1) * 2)}
              </div>
              <div className="bg-white/10 px-2 py-1 rounded-md">
                <span className="font-semibold">Manzil:</span>{" "}
                {Math.ceil((surah.ayahs[0]?.juz || 1) / 7)}
              </div>
              <div className="bg-white/10 px-2 py-1 rounded-md">
                <span className="font-semibold">Ruku:</span>{" "}
                {Math.ceil(((surah.ayahs[0]?.juz || 1) * 8) / 30)}
              </div>
              <div className="bg-white/10 px-2 py-1 rounded-md">
                <span className="font-semibold">Sajda:</span>{" "}
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
        {/* Verse Metadata - Sticky at top of page */}
        <VerseMetadata
          surahName={surah.englishName}
          juz={surah.ayahs[0]?.juz}
          page={surah.ayahs[0]?.page}
        />

        <div className="bg-gradient-to-b from-white to-[#f8f5f0]/50 rounded-xl shadow-xl p-4 md:p-8 mb-6 md:mb-8 border border-[#d4af37]/30 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#1a5e63]/5 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/5 rounded-bl-full"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#1a5e63]/5 rounded-tl-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#d4af37]/5 rounded-tr-full"></div>

          {/* Mobile header - Stack everything vertically with better spacing */}
          <div className="flex flex-col gap-4 mb-8 sm:hidden relative z-10">
            {/* <div className="text-center">
              <h2 className="text-[#1a5e63] text-xl font-semibold">
                Surah {surah.number}: {surah.englishName}
              </h2>
              <p className="text-sm text-[#666] mt-1">
                {surah.numberOfAyahs} Verses • {surah.revelationType}
              </p>
            </div> */}
            <div className="flex justify-center items-center gap-3">
              <ViewToggle currentView={viewMode} surahId={surahId} />
              <SurahAudioPlayer
                surahId={surahId}
                verses={verses}
                surahName={surah.englishName}
              />
            </div>
          </div>

          {/* Tablet/Desktop header - Side by side with better alignment */}
          <div className="hidden sm:flex sm:flex-row justify-between items-center gap-4 mb-8 relative z-10">
            <div className="text-center">
              {/* <h2 className="text-[#1a5e63] text-xl font-semibold">
                Surah {surah.number}: {surah.englishName}
              </h2>
              <p className="text-sm text-[#666] mt-1">
                {surah.numberOfAyahs} Verses • {surah.revelationType}
              </p> */}
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle currentView={viewMode} surahId={surahId} />
              <SurahAudioPlayer
                surahId={surahId}
                verses={verses}
                surahName={surah.englishName}
              />
            </div>
          </div>

          {surah.number !== 9 && (
            <div className="bg-gradient-to-r from-[#f8f5f0]/80 via-[#f8f5f0] to-[#f8f5f0]/80 p-4 md:p-6 rounded-lg border border-[#d4af37]/30 mb-8 shadow-sm relative z-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
              <p
                className={`text-center font-amiri text-lg md:text-xl text-[#555] quran-${settings.quranFont} mb-3`}
              >
                أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
              </p>
              <p
                className={`text-center font-amiri text-xl md:text-2xl lg:text-3xl text-[#333] quran-${settings.quranFont}`}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

          <div
            className={`${
              viewMode === "compact"
                ? "space-y-4"
                : viewMode === "arabic-only"
                ? "space-y-3"
                : "space-y-8"
            } relative z-10`}
          >
            {verses.map((verse, index) => (
              <div
                key={verse.number}
                className={
                  index % 2 === 0 ? "bg-[#f8f5f0]/50 rounded-lg p-2" : "p-2"
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

        <div className="flex justify-between mt-6">
          {surahId > 1 ? (
            <Link href={`/surah/${surahId - 1}`}>
              <Button
                variant="outline"
                className="border-[#1a5e63] text-[#1a5e63] text-sm sm:text-base px-2 sm:px-4"
              >
                <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Previous Surah</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            </Link>
          ) : (
            <div></div>
          )}

          {surahId < 114 ? (
            <Link href={`/surah/${surahId + 1}`}>
              <Button
                variant="outline"
                className="border-[#1a5e63] text-[#1a5e63] text-sm sm:text-base px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Next Surah</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </main>
    </div>
  );
}
