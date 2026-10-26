"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { useEffect } from "react";
import { updateRecentSurah } from "@/lib/local-storage";

interface SurahAudioPlayerProps {
  surahId: number;
  verses: any[];
  surahName: string;
  englishName?: string;
}

export default function SurahAudioPlayer({
  surahId,
  verses,
  surahName,
  englishName,
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
      className="w-full sm:w-auto gap-2"
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
