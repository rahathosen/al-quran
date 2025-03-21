"use client"

import { Button } from "@/components/ui/button"
import { PlayCircle, PauseCircle, Loader2 } from "lucide-react"
import { useAudio } from "@/context/audio-context"
import { useEffect } from "react"
import { updateRecentSurah } from "@/lib/local-storage"

interface SurahAudioPlayerProps {
  surahId: number
  verses: any[]
  surahName: string
}

export default function SurahAudioPlayer({ surahId, verses, surahName }: SurahAudioPlayerProps) {
  const { isPlaying, isLoading, currentSurah, currentVerse, playSurah, pauseAudio } = useAudio()

  const isCurrentSurah = currentSurah === surahId
  const isLoadingThisSurah = isLoading && isCurrentSurah

  // Update recent surahs when playing
  useEffect(() => {
    if (isCurrentSurah && isPlaying) {
      updateRecentSurah({
        surahId,
        surahName,
        englishName: surahName,
        lastRead: Date.now(),
        lastVerse: currentVerse || 1,
      })
    }
  }, [isCurrentSurah, isPlaying, currentVerse, surahId, surahName])

  const handlePlayClick = () => {
    if (isCurrentSurah && isPlaying) {
      pauseAudio()
    } else {
      playSurah(surahId, verses, surahName)

      // Update recent surahs immediately when starting playback
      updateRecentSurah({
        surahId,
        surahName,
        englishName: surahName,
        lastRead: Date.now(),
        lastVerse: 1,
      })
    }
  }

  return (
    <Button
      onClick={handlePlayClick}
      className="bg-[#1a5e63] hover:bg-[#134548] w-full sm:w-auto"
      disabled={isLoadingThisSurah}
    >
      {isLoadingThisSurah ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : isCurrentSurah && isPlaying ? (
        <>
          <PauseCircle className="mr-2 h-4 w-4" />
          Pause
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4" />
          Listen
        </>
      )}
    </Button>
  )
}

