"use client";

import { useAudio } from "@/context/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

// Convert numbers to Arabic numerals
function convertToArabicNumeral(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Number.parseInt(digit, 10)])
    .join("");
}

export default function AudioPlayerDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isPlaying,
    isLoading,
    currentVerse,
    verses,
    surahName,
    englishName,
    pauseAudio,
    resumeAudio,
    nextVerse,
    previousVerse,
    replayCurrentVerse,
    seekAudio,
    setProgress,
    duration,
    currentTime,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isPlayerVisible,
    isPlayerExpanded,
    setIsPlayerExpanded,
    closePlayer,
    calculateProgress,
    scrollToCurrentVerse,
    currentSurah,
    repeatMode,
    setRepeatMode,
  } = useAudio();

  // Local state for butter-smooth slider scrubbing without playback jitter
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  // Close volume popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeContainerRef.current &&
        !volumeContainerRef.current.contains(event.target as Node)
      ) {
        setShowVolumeControl(false);
      }
    };

    if (showVolumeControl) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showVolumeControl]);

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const cycleRepeatMode = () => {
    if (repeatMode === "off") {
      setRepeatMode("once");
    } else if (repeatMode === "once") {
      setRepeatMode("twice");
    } else if (repeatMode === "twice") {
      setRepeatMode("thrice");
    } else if (repeatMode === "thrice") {
      setRepeatMode("infinite");
    } else {
      setRepeatMode("off");
    }
  };

  const getRepeatModeLabel = () => {
    switch (repeatMode) {
      case "once":
        return "Repeat: 1×";
      case "twice":
        return "Repeat: 2×";
      case "thrice":
        return "Repeat: 3×";
      case "infinite":
        return "Repeat: ∞";
      default:
        return "Repeat: Off";
    }
  };

  const navigateToCurrentVerse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSurah && currentVerse) {
      if (pathname === `/surah/${currentSurah}`) {
        scrollToCurrentVerse();
      } else {
        router.push(`/surah/${currentSurah}#verse-${currentVerse}`);
      }
    }
  };

  useEffect(() => {
    if (isPlayerExpanded) {
      setAnimationClass("player-expanding");
    } else if (isPlayerVisible) {
      setAnimationClass("player-collapsing");
    }
  }, [isPlayerExpanded, isPlayerVisible]);

  if (!isPlayerVisible) {
    return null;
  }

  const effectiveTime = isScrubbing ? scrubTime : currentTime;
  const progressRatio = calculateProgress();
  const progressPercent = Math.round(progressRatio * 100);

  // Clean title display with Arabic isolation
  const displaySurahTitle = englishName || surahName || "Quran";
  const hasDistinctArabicName =
    surahName &&
    englishName &&
    surahName.trim().toLowerCase() !== englishName.trim().toLowerCase();

  return (
    <div className="fixed bottom-6 sm:bottom-8 left-0 right-0 flex justify-center z-50 px-3 sm:px-4 pointer-events-none mb-[env(safe-area-inset-bottom)]">
      <div
        className={`pointer-events-auto bg-neutral-950/95 text-white backdrop-blur-xl border border-white/10 shadow-2xl transition-[max-width,border-radius,padding] duration-300 ease-out ${animationClass} ${
          isPlayerExpanded
            ? "w-full max-w-xl md:max-w-2xl rounded-2xl p-4 sm:p-5"
            : "w-auto max-w-md p-2.5 pr-4 rounded-full"
        }`}
        onClick={() => !isPlayerExpanded && setIsPlayerExpanded(true)}
      >
        {isPlayerExpanded ? (
          <div className="text-white space-y-3">
            {/* Header row: Verse info and collapse / close */}
            <div className="flex items-center justify-between gap-3">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-1.5 -ml-1 rounded-xl transition-colors min-w-0"
                onClick={navigateToCurrentVerse}
                title="Scroll to verse in Surah"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 shadow-sm">
                  <span className="font-amiri text-base">
                    {currentVerse && convertToArabicNumeral(currentVerse)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-semibold leading-tight text-white truncate">
                      Surah {displaySurahTitle}
                    </h3>
                    {hasDistinctArabicName && (
                      <span
                        dir="rtl"
                        lang="ar"
                        className="font-amiri text-sm text-primary font-medium"
                      >
                        ({surahName})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/70">
                    Verse {currentVerse} of {verses.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlayerExpanded(false);
                  }}
                  aria-label="Collapse player"
                >
                  <svg
                    width="14"
                    height="2"
                    viewBox="0 0 14 2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect width="14" height="2" rx="1" fill="currentColor" />
                  </svg>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    closePlayer();
                  }}
                  aria-label="Close audio player"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrubber / Progress row */}
            <div className="flex items-center gap-2.5 text-xs text-white/70">
              <span className="tabular-nums font-mono min-w-[36px]">
                {formatTime(effectiveTime)}
              </span>
              <Slider
                value={[effectiveTime]}
                max={duration > 0 ? duration : 100}
                step={0.1}
                trackClassName="bg-white/20"
                thumbClassName="bg-white border-primary/50"
                onValueChange={(val) => {
                  setIsScrubbing(true);
                  setScrubTime(val[0]);
                }}
                onValueCommit={(val) => {
                  setIsScrubbing(false);
                  setProgress(val[0]);
                }}
                className="flex-1 cursor-pointer"
                aria-label="Recitation progress scrubber"
              />
              <span className="tabular-nums font-mono min-w-[36px] text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between pt-1 gap-1">
              {/* Repeat Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-white/15 rounded-lg text-xs h-8 px-2 sm:px-2.5 flex items-center gap-1.5 transition-colors shrink-0 ${
                  repeatMode !== "off"
                    ? "bg-primary/20 text-primary hover:bg-primary/30 font-medium"
                    : "text-white/80"
                }`}
                onClick={cycleRepeatMode}
                aria-label={`Current repeat mode: ${getRepeatModeLabel()}`}
              >
                <Repeat className="h-3.5 w-3.5" />
                <span className="hidden xs:inline text-[11px] sm:text-xs">
                  {getRepeatModeLabel()}
                </span>
                <span className="xs:hidden text-[11px]">
                  {repeatMode === "off" ? "Off" : repeatMode}
                </span>
              </Button>

              {/* Playback Controls Center */}
              <div className="flex items-center gap-0.5 sm:gap-1.5">
                {/* Replay Current Verse from 00:00 */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    replayCurrentVerse();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full active:scale-95"
                  aria-label="Restart current verse from beginning"
                  title="Restart verse"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                {/* Previous Verse */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousVerse();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full active:scale-95 disabled:opacity-40"
                  disabled={!currentVerse || currentVerse <= 1 || isLoading}
                  aria-label="Previous verse"
                  title="Previous verse"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                {/* Rewind 10 Seconds */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    seekAudio(-10);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full active:scale-95"
                  aria-label="Rewind 10 seconds"
                  title="Rewind 10s"
                >
                  <Rewind className="h-4 w-4" />
                </Button>

                {/* Primary Play / Pause Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 sm:h-11 sm:w-11 rounded-full p-0 flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-transform"
                  disabled={isLoading}
                  aria-label={
                    isLoading
                      ? "Loading audio"
                      : isPlaying
                      ? "Pause recitation"
                      : "Play recitation"
                  }
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPlaying ? (
                    <PauseCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </Button>

                {/* Fast Forward 10 Seconds */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    seekAudio(10);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full active:scale-95"
                  aria-label="Fast forward 10 seconds"
                  title="Fast-forward 10s"
                >
                  <FastForward className="h-4 w-4" />
                </Button>

                {/* Next Verse */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextVerse();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full active:scale-95 disabled:opacity-40"
                  disabled={
                    !currentVerse || currentVerse >= verses.length || isLoading
                  }
                  aria-label="Next verse"
                  title="Next verse"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume Popover */}
              <div className="relative shrink-0" ref={volumeContainerRef}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVolumeControl(!showVolumeControl);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full active:scale-95"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  title="Volume"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                {showVolumeControl && (
                  <div
                    className="absolute bottom-full right-0 mb-3 bg-neutral-900/95 border border-white/15 p-3 rounded-xl shadow-2xl w-36 flex flex-col gap-2.5 backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center text-[11px] text-white/80 font-medium">
                      <span>Volume</span>
                      <button
                        onClick={toggleMute}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        {isMuted ? "Unmute" : "Mute"}
                      </button>
                    </div>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.05}
                      trackClassName="bg-white/20"
                      thumbClassName="bg-white border-primary/50"
                      onValueChange={(val) => setVolume(val[0])}
                      className="w-full cursor-pointer"
                      aria-label="Volume slider"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Dynamic Island */
          <div className="flex items-center gap-3 text-white">
            {/* Circular Progress Gauge */}
            <div className="relative w-8 h-8 shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 36 36" aria-hidden="true">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="100.53"
                  strokeDashoffset={100.53 - progressRatio * 100.53}
                  className="text-primary transition-[stroke-dashoffset] duration-300"
                  transform="rotate(-90 18 18)"
                />
                <text
                  x="18"
                  y="18"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8.5"
                  fontWeight="bold"
                  className="font-mono tabular-nums"
                >
                  {`${progressPercent}%`}
                </text>
              </svg>
            </div>

            {/* Verse Title & Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer hover:bg-white/10 rounded-lg px-2 py-0.5 transition-colors"
              onClick={navigateToCurrentVerse}
              title="Go to verse in Surah"
            >
              <p className="text-xs font-semibold truncate leading-tight">
                Surah {displaySurahTitle}
              </p>
              <p className="text-[11px] text-white/70 truncate">
                Verse {currentVerse} of {verses.length}
              </p>
            </div>

            {/* Collapsed Play/Pause Toggle */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/15 rounded-full shrink-0 active:scale-95"
              disabled={isLoading}
              aria-label={
                isLoading
                  ? "Loading audio"
                  : isPlaying
                  ? "Pause playback"
                  : "Start playback"
              }
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
  );
}
