"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { PlayCircle, PauseCircle, SkipForward, SkipBack, Volume2, VolumeX, Loader2 } from "lucide-react"

interface AudioPlayerProps {
  audioUrls: string[]
  surahName?: string
  verseNumber?: number
  isVersePlayer?: boolean
}

export default function AudioPlayer({ audioUrls, surahName, verseNumber, isVersePlayer = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    // Clean up any existing audio element first
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = "" // Clear the source
      audioRef.current.load() // Reset the audio element
      audioRef.current.removeEventListener("loadstart", () => {})
      audioRef.current.removeEventListener("canplay", () => {})
      audioRef.current.removeEventListener("loadedmetadata", () => {})
      audioRef.current.removeEventListener("ended", () => {})
      audioRef.current.removeEventListener("error", () => {})
    }

    // Create audio element
    const audio = new Audio(audioUrls[currentTrack])
    audioRef.current = audio

    // Define named event handlers for proper cleanup
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      console.error("Error loading audio file")
    }

    // Set up event listeners
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleNext)
    audio.addEventListener("error", handleError)

    // Set volume
    audio.volume = volume

    return () => {
      // Clean up
      audio.pause()
      audio.src = "" // Clear the source
      audio.load() // Reset the audio element
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleNext)
      audio.removeEventListener("error", handleError)
      cancelAnimationFrame(animationRef.current!)
    }
  }, [audioUrls, currentTrack])

  // Handle audio loading errors
  const handleAudioError = () => {
    setIsLoading(false)
    setIsPlaying(false)
    console.error("Error loading audio file")
  }

  // Update progress bar
  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }

  // Play/pause toggle
  const togglePlay = () => {
    if (isLoading) return

    if (isPlaying) {
      audioRef.current?.pause()
      cancelAnimationFrame(animationRef.current!)
    } else {
      audioRef.current?.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
      animationRef.current = requestAnimationFrame(updateProgress)
    }

    setIsPlaying(!isPlaying)
  }

  // Handle next track
  const handleNext = () => {
    if (currentTrack < audioUrls.length - 1) {
      setCurrentTrack((prev) => prev + 1)
      setCurrentTime(0)

      // If was playing, continue playing the next track
      if (isPlaying) {
        setTimeout(() => {
          audioRef.current?.play().catch(console.error)
        }, 100)
      }
    } else {
      // End of playlist
      setIsPlaying(false)
      setCurrentTime(0)
      setCurrentTrack(0)
      cancelAnimationFrame(animationRef.current!)
    }
  }

  // Handle previous track
  const handlePrev = () => {
    if (currentTrack > 0) {
      setCurrentTrack((prev) => prev - 1)
      setCurrentTime(0)

      // If was playing, continue playing the previous track
      if (isPlaying) {
        setTimeout(() => {
          audioRef.current?.play().catch(console.error)
        }, 100)
      }
    }
  }

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // For single verse player, render a simplified version
  if (isVersePlayer) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#1a5e63]" onClick={togglePlay} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <PauseCircle className="h-4 w-4" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
      </Button>
    )
  }

  // For full surah player
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <div className="flex items-center gap-2">
        <Button
          onClick={togglePlay}
          className="bg-[#1a5e63] hover:bg-[#134548] h-10 w-10 rounded-full p-0 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <PauseCircle className="h-5 w-5" />
          ) : (
            <PlayCircle className="h-5 w-5" />
          )}
        </Button>

        {audioUrls.length > 1 && (
          <>
            <Button
              onClick={handlePrev}
              variant="ghost"
              size="icon"
              className="text-[#1a5e63]"
              disabled={currentTrack === 0 || isLoading}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="text-[#1a5e63]"
              disabled={currentTrack === audioUrls.length - 1 || isLoading}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </>
        )}

        <div className="relative">
          <Button
            onClick={toggleMute}
            onMouseEnter={() => setShowVolumeControl(true)}
            variant="ghost"
            size="icon"
            className="text-[#1a5e63]"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          {showVolumeControl && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white p-3 rounded-lg shadow-lg border border-[#d4af37]/20 w-32"
              onMouseEnter={() => setShowVolumeControl(true)}
              onMouseLeave={() => setShowVolumeControl(false)}
            >
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="text-xs text-[#1a5e63] font-medium">
          {surahName ? `Playing Surah ${surahName}` : verseNumber ? `Verse ${verseNumber}` : "Playing"}
        </div>
      </div>

      {audioUrls.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#666]">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-[#666]">{formatTime(duration)}</span>
        </div>
      )}
    </div>
  )
}

