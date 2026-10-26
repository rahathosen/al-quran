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
import { toast } from "sonner";
import {
  addBookmark,
  removeBookmark,
  isVerseBookmarked,
  type BookmarkedVerse,
} from "@/lib/local-storage";

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
      toast.info(`Removed verse ${verse.number} from bookmarks`);
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
      toast.success(`Bookmarked verse ${verse.number}`);
    }
  };

  // Scroll to this verse if it's currently playing
  useEffect(() => {
    if (isCurrentVerse && isPlaying && verseRef.current) {
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
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const verseUrl = `${origin}/surah/${surahId}#verse-${verse.number}`;

    const shareData = {
      title: `Surah ${surahName} (${englishName}) - Verse ${verse.number}`,
      text: `${verse.arabic}\n\n${verse.translation}`,
      url: verseUrl,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
        );
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelling native share is not an error to display
      if ((error as any)?.name !== "AbortError") {
        console.error("Error sharing verse:", error);
      }
    }
  };

  const handleCopyVerse = async () => {
    const textToCopy = `${verse.arabic}\n\n${verse.translation}\n\n— Surah ${englishName} [${surahId}:${verse.number}]`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success("Verse copied to clipboard!");
      }
    } catch (error) {
      console.error("Error copying verse:", error);
      toast.error("Failed to copy verse text");
    }
  };

  // Determine border and padding based on view mode
  const borderClass =
    viewMode === "arabic-only"
      ? "border-b border-border/50 pb-2"
      : viewMode === "compact"
      ? "border-b border-border/60 pb-3"
      : "border-b border-border/70 pb-4";

  // Determine verse number size based on view mode
  const verseNumberSize =
    viewMode === "arabic-only"
      ? "w-6 h-6 text-xs"
      : viewMode === "compact"
      ? "w-7 h-7 text-xs"
      : "w-8 h-8 text-sm";

  // Determine Arabic text size based on view mode
  const arabicTextSize =
    viewMode === "arabic-only"
      ? "text-xl sm:text-2xl"
      : viewMode === "compact"
      ? "text-xl sm:text-2xl"
      : "text-2xl sm:text-3xl";

  return (
    <div
      ref={verseRef}
      className={`${borderClass} transition-colors duration-200 ${
        isCurrentVerse
          ? "bg-primary/10 rounded-lg p-4 -mx-2 sm:-mx-4 shadow-sm border border-primary/20 sticky top-14 z-10 backdrop-blur-md"
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
            ? "mb-2"
            : "mb-3"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`${verseNumberSize} rounded-full ${
              isCurrentVerse
                ? "bg-primary text-primary-foreground font-bold ring-2 ring-primary/40"
                : "bg-muted text-muted-foreground font-semibold"
            } flex items-center justify-center tabular-nums`}
          >
            {verse.number}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary active:scale-95 transition-transform"
              onClick={handlePlayClick}
              disabled={isLoadingThisVerse}
              aria-label={
                isLoadingThisVerse
                  ? `Loading verse ${verse.number} audio`
                  : isCurrentVerse && isPlaying
                  ? `Pause verse ${verse.number}`
                  : `Play verse ${verse.number}`
              }
            >
              {isLoadingThisVerse ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : isCurrentVerse && isPlaying ? (
                <PauseCircle className="h-4 w-4 text-primary" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary active:scale-95 transition-transform"
              onClick={toggleBookmark}
              aria-label={
                bookmarked
                  ? `Remove bookmark for verse ${verse.number}`
                  : `Bookmark verse ${verse.number}`
              }
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary active:scale-95 transition-transform"
              onClick={handleShareVerse}
              aria-label={`Share verse ${verse.number}`}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary active:scale-95 transition-transform"
              onClick={handleCopyVerse}
              aria-label={`Copy verse ${verse.number} text`}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <p
        dir="rtl"
        lang="ar"
        className={`font-amiri text-right ${arabicTextSize} leading-[2.2] sm:leading-[2.4] ${
          viewMode === "arabic-only" || viewMode === "compact"
            ? "mb-1.5"
            : "mb-4"
        } quran-${quranFont} ${
          isCurrentVerse
            ? "text-primary font-medium"
            : "text-foreground"
        } relative select-text`}
      >
        {(() => {
          if (verse.number === 1 && surahId !== 1 && surahId !== 9) {
            return verse.arabic.replace(
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
              ""
            );
          }
          return verse.arabic;
        })()}
      </p>

      {(viewMode === "default" || viewMode === "compact") && (
        <p
          className={`verse-translation ${
            viewMode === "compact" ? "text-sm" : "text-base"
          } text-muted-foreground leading-relaxed text-balance`}
        >
          {verse.translation}
        </p>
      )}
    </div>
  );
}

