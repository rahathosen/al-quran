"use client"

import { useAudio } from "@/context/audio-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  X,
  Volume2,
  VolumeX,
  Loader2,
  Repeat,
  RotateCcw,
  FastForward,
  Rewind,
} from "lucide-react"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Convert numbers to Arabic numerals
function convertToArabicNumeral(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Number.parseInt(digit)])
    .join("")
}

export default function AudioPlayerDrawer() {
  const {
    isPlaying,
    isLoading,
    currentVerse,
    verses,
    surahName,
    pauseAudio,
    resumeAudio,
    nextVerse,
    previousVerse,
    setProgress,
    duration,
    currentTime,
    isPlayerVisible,
    isPlayerExpanded,
    setIsPlayerExpanded,
    closePlayer,
    calculateProgress,
    goToFirstVerse,
    currentSurah,
    playbackSpeed: contextPlaybackSpeed,
    setPlaybackSpeed: setContextPlaybackSpeed,
    isRepeatEnabled: contextRepeatEnabled,
    setIsRepeatEnabled: setContextRepeatEnabled,
    currentVerseData,
  } = useAudio()

  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  const [repeatMode, setRepeatMode] = useState<"off" | "once" | "twice" | "thrice" | "infinite">("off")
  const [repeatCount, setRepeatCount] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedControl, setShowSpeedControl] = useState(false)

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
    } else {
      setIsMuted(true)
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio()
    } else {
      resumeAudio()
    }
  }

  // Handle repeat mode
  const handleRepeat = () => {
    // Cycle through repeat modes
    if (repeatMode === "off") {
      setRepeatMode("once")
      setContextRepeatEnabled(true)
    } else if (repeatMode === "once") {
      setRepeatMode("twice")
      setContextRepeatEnabled(true)
    } else if (repeatMode === "twice") {
      setRepeatMode("thrice")
      setContextRepeatEnabled(true)
    } else if (repeatMode === "thrice") {
      setRepeatMode("infinite")
      setContextRepeatEnabled(true)
    } else {
      setRepeatMode("off")
      setContextRepeatEnabled(false)
    }

    // Reset repeat count
    setRepeatCount(0)
  }

  // Change playback speed
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed)
    setContextPlaybackSpeed(speed)
  }

  // Fast forward 5 seconds
  const fastForward = () => {
    setProgress(Math.min(duration, currentTime + 5))
  }

  // Rewind 5 seconds
  const rewind = () => {
    setProgress(Math.max(0, currentTime - 5))
  }

  // Update playback speed when it changes in context
  useEffect(() => {
    setPlaybackSpeed(contextPlaybackSpeed)
  }, [contextPlaybackSpeed])

  // Update repeat mode when it changes in context
  useEffect(() => {
    if (contextRepeatEnabled && repeatMode === "off") {
      setRepeatMode("once")
    } else if (!contextRepeatEnabled && repeatMode !== "off") {
      setRepeatMode("off")
    }
  }, [contextRepeatEnabled, repeatMode])

  // Animation class for expanding/collapsing
  useEffect(() => {
    if (isPlayerExpanded) {
      setAnimationClass("player-expanding")
    } else if (isPlayerVisible) {
      setAnimationClass("player-collapsing")
    }
  }, [isPlayerExpanded, isPlayerVisible])

  if (!isPlayerVisible) {
    return null
  }

  // Get the repeat mode display text
  const getRepeatModeText = () => {
    switch (repeatMode) {
      case "once":
        return "1×"
      case "twice":
        return "2×"
      case "thrice":
        return "3×"
      case "infinite":
        return "∞"
      default:
        return "Off"
    }
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
      <div
        className={`bg-black/90 backdrop-blur-lg shadow-lg transition-all duration-300 ease-in-out ${animationClass}
        ${isPlayerExpanded ? "w-full max-w-3xl rounded-2xl p-4" : "w-auto max-w-md p-2 pr-4 rounded-full"}`}
        onClick={() => !isPlayerExpanded && setIsPlayerExpanded(true)}
      >
        {isPlayerExpanded ? (
          // Expanded view
          <div className="text-white">
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  if (currentSurah && currentVerse) {
                    window.location.href = `/surah/${currentSurah}#verse-${currentVerse}`
                  }
                }}
                title="Go to this verse"
              >
                <div className="w-10 h-10 rounded-full bg-[#d4af37] text-black flex items-center justify-center overflow-hidden">
                  <span className="font-amiri quran-uthmani text-lg" style={{ textShadow: "0 0 1px rgba(0,0,0,0.3)" }}>
                    {currentVerse && convertToArabicNumeral(currentVerse)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Surah {surahName}</h3>
                  <p className="text-xs text-white/70">
                    Verse {currentVerse} of {verses.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsPlayerExpanded(false)
                  }}
                >
                  <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="14" height="2" rx="1" fill="white" />
                  </svg>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    closePlayer()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Controls for repeat and speed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-white hover:bg-white/10 rounded-md flex items-center gap-1 ${repeatMode !== "off" ? "bg-white/20" : ""}`}
                      >
                        <Repeat className="h-4 w-4 mr-1" />
                        Repeat: {getRepeatModeText()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-black/90 border-white/10 text-white">
                      <DropdownMenuItem
                        className={`${repeatMode === "off" ? "bg-white/20" : ""}`}
                        onClick={() => {
                          setRepeatMode("off")
                          setContextRepeatEnabled(false)
                        }}
                      >
                        Off
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`${repeatMode === "once" ? "bg-white/20" : ""}`}
                        onClick={() => {
                          setRepeatMode("once")
                          setContextRepeatEnabled(true)
                        }}
                      >
                        1 time
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`${repeatMode === "twice" ? "bg-white/20" : ""}`}
                        onClick={() => {
                          setRepeatMode("twice")
                          setContextRepeatEnabled(true)
                        }}
                      >
                        2 times
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`${repeatMode === "thrice" ? "bg-white/20" : ""}`}
                        onClick={() => {
                          setRepeatMode("thrice")
                          setContextRepeatEnabled(true)
                        }}
                      >
                        3 times
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`${repeatMode === "infinite" ? "bg-white/20" : ""}`}
                        onClick={() => {
                          setRepeatMode("infinite")
                          setContextRepeatEnabled(true)
                        }}
                      >
                        Infinite
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10 rounded-md flex items-center gap-1"
                      >
                        <span className="font-medium">{playbackSpeed}×</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 text-white">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                        <DropdownMenuItem
                          key={speed}
                          className={`${playbackSpeed === speed ? "bg-white/20" : ""}`}
                          onClick={() => changePlaybackSpeed(speed)}
                        >
                          {speed}× {speed === 1 && "(Normal)"}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-white/70">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.01}
                  onValueChange={(value) => setProgress(value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-white/70">{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToFirstVerse()
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
                  title="Go to first verse"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    previousVerse()
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
                  disabled={!currentVerse || currentVerse <= 1 || isLoading}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    rewind()
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
                >
                  <Rewind className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlay()
                  }}
                  className="bg-[#d4af37] hover:bg-[#c9a431] h-10 w-10 rounded-full p-0 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 text-black animate-spin" />
                  ) : isPlaying ? (
                    <PauseCircle className="h-5 w-5 text-black" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-black" />
                  )}
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    fastForward()
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
                >
                  <FastForward className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextVerse()
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
                  disabled={!currentVerse || currentVerse >= verses.length || isLoading}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <div className="relative">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMute()
                    }}
                    onMouseEnter={() => setShowVolumeControl(true)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-full"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>

                  {showVolumeControl && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/90 p-3 rounded-lg shadow-lg border border-white/10 w-32"
                      onMouseEnter={() => setShowVolumeControl(true)}
                      onMouseLeave={() => setShowVolumeControl(false)}
                      onClick={(e) => e.stopPropagation()}
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
              </div>
            </div>
          </div>
        ) : (
          // Collapsed view (Dynamic Island style) - with added metadata
          <div className="flex items-center gap-3 text-white">
            {/* Progress circle with percentage */}
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle cx="18" cy="18" r="16" fill="#d4af37" className="stroke-none" />

                {/* Progress circle - stroke-dasharray is the circumference of the circle (2πr) */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray="100.53"
                  strokeDashoffset={100.53 - calculateProgress() * 100.53}
                  className="transition-all duration-500 ease-in-out"
                  transform="rotate(-90 18 18)"
                />

                {/* Percentage text */}
                <text
                  x="18"
                  y="18"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  fontSize="10"
                  fontWeight="bold"
                  className="font-medium"
                >
                  {Math.round(calculateProgress() * 100)}%
                </text>
              </svg>
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer hover:bg-white/10 rounded-md px-2 py-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                if (currentSurah && currentVerse) {
                  window.location.href = `/surah/${currentSurah}#verse-${currentVerse}`
                }
              }}
              title="Go to this verse"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">Surah {surahName}</p>
                {currentVerseData?.juz && (
                  <div className="text-xs text-white/70 bg-white/10 px-1.5 py-0.5 rounded-sm hidden sm:flex items-center gap-1.5">
                    <span>J:{currentVerseData.juz}</span>
                    <span>H:{Math.ceil(currentVerseData.juz * 2)}</span>
                    <span>P:{currentVerseData.page}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-white/70 truncate flex items-center gap-1">
                <span>
                  Verse {currentVerse} of {verses.length}
                </span>
                {currentVerseData?.juz && (
                  <span className="sm:hidden bg-white/10 px-1 rounded-sm text-[10px]">
                    J:{currentVerseData.juz} H:{Math.ceil(currentVerseData.juz * 2)} P:{currentVerseData.page}
                  </span>
                )}
              </p>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
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
          </div>
        )}
      </div>
    </div>
  )
}

