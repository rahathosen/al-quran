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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.load()
    }

    const audio = new Audio(audioUrls[currentTrack])
    audioRef.current = audio

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      console.error("Error loading audio file")
    }

    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleNext)
    audio.addEventListener("error", handleError)

    audio.volume = volume

    return () => {
      audio.pause()
      audio.src = ""
      audio.load()
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleNext)
      audio.removeEventListener("error", handleError)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioUrls, currentTrack])

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      animationRef.current = requestAnimationFrame(updateProgress)
    }
  }

  const togglePlay = () => {
    if (isLoading) return

    if (isPlaying) {
      audioRef.current?.pause()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    } else {
      audioRef.current?.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
      animationRef.current = requestAnimationFrame(updateProgress)
    }

    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (currentTrack < audioUrls.length - 1) {
      setCurrentTrack((prev) => prev + 1)
      setCurrentTime(0)

      if (isPlaying) {
        setTimeout(() => {
          audioRef.current?.play().catch(console.error)
        }, 100)
      }
    } else {
      setIsPlaying(false)
      setCurrentTime(0)
      setCurrentTrack(0)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }

  const handlePrev = () => {
    if (currentTrack > 0) {
      setCurrentTrack((prev) => prev - 1)
      setCurrentTime(0)

      if (isPlaying) {
        setTimeout(() => {
          audioRef.current?.play().catch(console.error)
        }, 100)
      }
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

    setIsMuted(newVolume === 0)
  }

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

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  if (isVersePlayer) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary hover:bg-primary/10"
        onClick={togglePlay}
        disabled={isLoading}
        aria-label={
          isLoading
            ? "Loading audio"
            : isPlaying
            ? "Pause verse recitation"
            : "Play verse recitation"
        }
      >
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

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs bg-card text-card-foreground p-3 rounded-xl border border-border shadow-xs">
      <div className="flex items-center gap-2">
        <Button
          onClick={togglePlay}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 rounded-full p-0 flex items-center justify-center shrink-0"
          disabled={isLoading}
          aria-label={
            isLoading
              ? "Loading recitation"
              : isPlaying
              ? "Pause recitation"
              : "Play recitation"
          }
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
              className="text-foreground hover:bg-muted"
              disabled={currentTrack === 0 || isLoading}
              aria-label="Previous track"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-muted"
              disabled={currentTrack === audioUrls.length - 1 || isLoading}
              aria-label="Next track"
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
            className="text-foreground hover:bg-muted"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          {showVolumeControl && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card p-3 rounded-xl shadow-lg border border-border w-32"
              onMouseEnter={() => setShowVolumeControl(true)}
              onMouseLeave={() => setShowVolumeControl(false)}
            >
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
                aria-label="Volume slider"
              />
            </div>
          )}
        </div>

        <div className="text-xs text-primary font-medium truncate">
          {surahName ? `Surah ${surahName}` : verseNumber ? `Verse ${verseNumber}` : "Playing"}
        </div>
      </div>

      {audioUrls.length > 1 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums font-mono">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="flex-1"
            aria-label="Seek track"
          />
          <span className="tabular-nums font-mono">{formatTime(duration)}</span>
        </div>
      )}
    </div>
  )
}
