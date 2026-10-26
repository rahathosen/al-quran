"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useEffect } from "react";
import { updateRecentSurah } from "@/lib/local-storage";
import { cn } from "@/lib/utils";

interface SurahAudioPlayerProps {
  surahId: number;
  verses: any[];
  surahName: string;
  englishName?: string;
  size?: "default" | "sm";
  className?: string;
}

export default function SurahAudioPlayer({
  surahId,
  verses,
  surahName,
  englishName,
  size = "default",
  className,
}: SurahAudioPlayerProps) {
  const { isPlaying, isLoading, currentSurah, currentVerse, playSurah, pauseAudio } = useAudio();

  const isCurrentSurah = currentSurah === surahId;
  const isLoadingThisSurah = isLoading && isCurrentSurah;
  const displayName = englishName || surahName;

  useEffect(() => {
    if (isCurrentSurah && isPlaying) {
      updateRecentSurah({
        surahId,
        surahName,
        englishName: displayName,
        lastRead: Date.now(),
        lastVerse: currentVerse || 1,
      });
    }
  }, [isCurrentSurah, isPlaying, currentVerse, surahId, surahName, displayName]);

  const handlePlayClick = () => {
    if (isCurrentSurah && isPlaying) {
      pauseAudio();
    } else {
      playSurah(surahId, verses, surahName, displayName);

      updateRecentSurah({
        surahId,
        surahName,
        englishName: displayName,
        lastRead: Date.now(),
        lastVerse: 1,
      });
    }
  };

  return (
    <Button
      onClick={handlePlayClick}
      size={size}
      className={cn(
        "w-full sm:w-auto gap-1.5 sm:gap-2 text-xs sm:text-sm h-8.5 sm:h-9 px-2.5 sm:px-3",
        className
      )}
      disabled={isLoadingThisSurah}
      aria-label={
        isLoadingThisSurah
          ? `Loading Surah ${displayName} audio`
          : isCurrentSurah && isPlaying
          ? `Pause Surah ${displayName} recitation`
          : `Listen to Surah ${displayName}`
      }
    >
      {isLoadingThisSurah ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : isCurrentSurah && isPlaying ? (
        <>
          <PauseCircle className="h-4 w-4" />
          <span>Pause</span>
        </>
      ) : (
        <>
          <PlayCircle className="h-4 w-4" />
          <span>Listen</span>
        </>
      )}
    </Button>
  );
}
