"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import {
  isSurahBookmarked,
  addSurahBookmark,
  removeSurahBookmark,
} from "@/lib/local-storage";
import { toast } from "sonner";

interface BookmarkSurahButtonProps {
  surahId: number;
  surahName: string;
  englishName?: string;
}

export default function BookmarkSurahButton({
  surahId,
  surahName,
  englishName = "",
}: BookmarkSurahButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if surah is bookmarked on mount
  useEffect(() => {
    setIsBookmarked(isSurahBookmarked(surahId));
  }, [surahId]);

  const toggleBookmark = () => {
    if (isBookmarked) {
      removeSurahBookmark(surahId);
      setIsBookmarked(false);
      toast.info(`Removed Surah ${englishName || surahName} from bookmarks`);
    } else {
      addSurahBookmark({
        surahId,
        surahName,
        englishName: englishName || surahName,
        timestamp: Date.now(),
      });
      setIsBookmarked(true);
      toast.success(`Bookmarked Surah ${englishName || surahName}`);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:text-white/80 hover:bg-white/10 h-8 w-8 sm:h-9 sm:w-9"
      onClick={toggleBookmark}
      aria-label={
        isBookmarked
          ? `Remove Surah ${englishName || surahName} from bookmarks`
          : `Bookmark Surah ${englishName || surahName}`
      }
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5 fill-primary-foreground text-primary-foreground" />
      ) : (
        <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </Button>
  );
}
