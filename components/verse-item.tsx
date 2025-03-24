"use client";

import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  PlayCircle,
  PauseCircle,
  Loader2,
  Share2,
  Copy,
} from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useEffect, useRef, useState } from "react";
import {
  addBookmark,
  removeBookmark,
  isVerseBookmarked,
  type BookmarkedVerse,
} from "@/lib/local-storage";

// Convert numbers to Arabic numerals
function convertToArabicNumeral(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Number.parseInt(digit)])
    .join("");
}

interface VerseItemProps {
  verse: {
    number: number;
    arabic: string;
    translation: string;
    audioUrl: string;
    juz?: number;
    page?: number;
  };
  surahId: number;
  surahName: string;
  englishName: string;
  verses: any[];
  quranFont?: string;
  viewMode?: string;
}

export default function VerseItem({
  verse,
  surahId,
  surahName,
  englishName,
  verses,
  quranFont = "uthmani",
  viewMode = "default",
}: VerseItemProps) {
  const {
    isPlaying,
    isLoading,
    currentVerse,
    currentSurah,
    playVerse,
    pauseAudio,
  } = useAudio();

  const [bookmarked, setBookmarked] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);

  const isCurrentVerse =
    currentVerse === verse.number && currentSurah === surahId;
  const isLoadingThisVerse = isLoading && isCurrentVerse;

  // Check if verse is bookmarked on mount
  useEffect(() => {
    setBookmarked(isVerseBookmarked(surahId, verse.number));
  }, [surahId, verse.number]);

  // Handle play/pause for this verse
  const handlePlayClick = () => {
    if (isCurrentVerse && isPlaying) {
      pauseAudio();
    } else {
      playVerse(surahId, verse.number, verses, surahName);
    }
  };

  // Handle bookmark toggle
  const toggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(surahId, verse.number);
      setBookmarked(false);
    } else {
      const newBookmark: BookmarkedVerse = {
        surahId,
        surahName,
        englishName,
        verseNumber: verse.number,
        verseText: verse.arabic,
        timestamp: Date.now(),
      };
      addBookmark(newBookmark);
      setBookmarked(true);
    }
  };

  // Scroll to this verse if it's currently playing
  useEffect(() => {
    if (isCurrentVerse && isPlaying && verseRef.current) {
      // Use a small timeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        verseRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isCurrentVerse, isPlaying]);

  // Handle verse sharing
  const handleShareVerse = async () => {
    // Create the share URL with verse information
    const verseUrl = `${window.location.origin}/surah/${surahId}#verse-${verse.number}`;

    // Prepare share data with proper metadata
    const shareData = {
      title: `Surah ${surahName} (${englishName}) - Verse ${verse.number}`,
      text: `${verse.arabic}\n\n${verse.translation}`,
      url: verseUrl,
    };

    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );

        // Show a temporary message
        const message = document.createElement("div");
        message.textContent = "Link copied to clipboard!";
        message.className =
          "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1a5e63] text-white px-4 py-2 rounded-lg shadow-lg";
        document.body.appendChild(message);

        // Remove the message after 2 seconds
        setTimeout(() => {
          document.body.removeChild(message);
        }, 2000);
      }
    } catch (error) {
      console.error("Error sharing verse:", error);
    }
  };

  const handleCopyVerse = async () => {
    // Prepare the text to copy
    const textToCopy = `${verse.arabic}\n\n${verse.translation}\n\nSurah ${englishName} (${verse.number})`;

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(textToCopy);

      // Show a temporary message
      const message = document.createElement("div");
      message.textContent = "Verse copied to clipboard!";
      message.className =
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1a5e63] text-white px-4 py-2 rounded-lg shadow-lg z-50";
      document.body.appendChild(message);

      // Remove the message after 2 seconds
      setTimeout(() => {
        document.body.removeChild(message);
      }, 2000);
    } catch (error) {
      console.error("Error copying verse:", error);
    }
  };

  // Determine border and padding based on view mode
  const borderClass =
    viewMode === "arabic-only"
      ? "border-b border-[#d4af37]/5 pb-2"
      : viewMode === "compact"
      ? "border-b border-[#d4af37]/10 pb-3"
      : "border-b border-[#d4af37]/10 pb-4";

  // Determine verse number size based on view mode
  const verseNumberSize =
    viewMode === "arabic-only"
      ? "w-6 h-6 text-sm"
      : viewMode === "compact"
      ? "w-7 h-7 text-sm"
      : "w-8 h-8 text-base";

  // Determine Arabic text size based on view mode
  const arabicTextSize =
    viewMode === "arabic-only"
      ? "text-xl"
      : viewMode === "compact"
      ? "text-xl"
      : "text-2xl";

  return (
    <div
      ref={verseRef}
      className={`${borderClass} transition-all duration-300 ${
        isCurrentVerse
          ? "bg-[#f8f5f0] rounded-lg p-4 -mx-4 shadow-md sticky top-14 z-10"
          : ""
      }`}
      id={`verse-${verse.number}`}
      data-page={verse.page}
    >
      <span className="verse-page sr-only">{verse.page}</span>
      <div
        className={`flex justify-between items-center ${
          viewMode === "arabic-only"
            ? "mb-1"
            : viewMode === "compact"
            ? "mb-1.5"
            : "mb-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`${verseNumberSize} rounded-full ${
              isCurrentVerse ? "bg-[#d4af37]" : "bg-[#1a5e63]"
            } text-white flex items-center justify-center`}
          >
            {verse.number}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#1a5e63]"
              onClick={handlePlayClick}
              disabled={isLoadingThisVerse}
            >
              {isLoadingThisVerse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCurrentVerse && isPlaying ? (
                <PauseCircle className="h-4 w-4" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#1a5e63]"
              onClick={toggleBookmark}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 fill-[#1a5e63]" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#1a5e63]"
              onClick={handleShareVerse}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#1a5e63]"
              onClick={handleCopyVerse}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <p
        className={`font-amiri text-right ${arabicTextSize} leading-loose ${
          viewMode === "arabic-only" || viewMode === "compact" ? "mb-1" : "mb-4"
        } quran-${quranFont} ${
          isCurrentVerse ? "text-[#1a5e63]" : "text-[#333]"
        } relative`}
      >
        {(() => {
          // Debug log to check the verse number and surah ID
          // console.log(`Verse Number: ${verse.number}, Surah ID: ${surahId}`);

          // Check if this is the first verse, not Surah 1 (Al-Fatiha), and not Surah 9 (At-Tawbah)
          if (verse.number === 1 && surahId !== 1 && surahId !== 9) {
            // Debug log to check the original Arabic text
            // console.log(`Original Arabic Text: ${verse.arabic}`);

            // Remove "Bismillah" from the first verse
            const modifiedText = verse.arabic.replace(
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
              ""
            );

            // Debug log to check the modified Arabic text
            // console.log(`Modified Arabic Text: ${modifiedText}`);

            return modifiedText;
          }

          // Debug log for non-first verses, Surah 1, or Surah 9
          // console.log(`No modification needed for this verse.`);

          return verse.arabic;
        })()}
      </p>
      {(viewMode === "default" || viewMode === "compact") && (
        <p
          className={`verse-translation ${
            viewMode === "compact" ? "text-sm" : "text-base"
          } text-[#555]`}
        >
          {verse.translation}
        </p>
      )}
    </div>
  );
}
