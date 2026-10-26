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
import { useRouter } from "next/navigation";

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
    isRepeatEnabled: contextRepeatEnabled,
    setIsRepeatEnabled: setContextRepeatEnabled,
    currentVerseData,
  } = useAudio();

  const [volume, setVolume] = useState(
    typeof window !== "undefined" && window.audioVolume !== undefined
      ? window.audioVolume
      : 1
  );
  const [isMuted, setIsMuted] = useState(
    typeof window !== "undefined" && window.audioIsMuted !== undefined
      ? window.audioIsMuted
      : false
  );
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [repeatMode, setRepeatMode] = useState<
    "off" | "once" | "twice" | "thrice" | "infinite"
  >("off");

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getActiveAudioElement = () => {
    if (typeof document === "undefined") return null;
    const audioElements = document.querySelectorAll("audio");
    for (let i = 0; i < audioElements.length; i++) {
      const audio = audioElements[i] as HTMLAudioElement;
      if (!audio.paused || audio.currentTime > 0) {
        return audio;
      }
    }
    return audioElements.length > 0 ? (audioElements[0] as HTMLAudioElement) : null;
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    if (typeof window !== "undefined") {
      window.audioVolume = newVolume;
    }

    const audioElement = getActiveAudioElement();
    if (audioElement) {
      audioElement.volume = newVolume;
    }

    if (newVolume === 0) {
      setIsMuted(true);
      if (typeof window !== "undefined") {
        window.audioIsMuted = true;
      }
    } else {
      setIsMuted(false);
      if (typeof window !== "undefined") {
        window.audioIsMuted = false;
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (typeof window !== "undefined") {
      window.audioIsMuted = newMutedState;
    }

    const audioElement = getActiveAudioElement();
    if (audioElement) {
      audioElement.muted = newMutedState;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const handleRepeat = () => {
    let newRepeatCount = 0;
    let newRepeatMode: "off" | "once" | "twice" | "thrice" | "infinite" = "off";

    if (repeatMode === "off") {
      newRepeatMode = "once";
      newRepeatCount = 1;
    } else if (repeatMode === "once") {
      newRepeatMode = "twice";
      newRepeatCount = 2;
    } else if (repeatMode === "twice") {
      newRepeatMode = "thrice";
      newRepeatCount = 3;
    } else if (repeatMode === "thrice") {
      newRepeatMode = "infinite";
      newRepeatCount = -1;
    } else {
      newRepeatMode = "off";
      newRepeatCount = 0;
    }

    setRepeatMode(newRepeatMode);
    setContextRepeatEnabled(newRepeatCount !== 0);

    if (typeof window !== "undefined") {
      window.audioRepeatCount = newRepeatCount;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const count = window.audioRepeatCount || 0;
      if (count === 0) {
        setRepeatMode("off");
        setContextRepeatEnabled(false);
      } else if (count === 1) {
        setRepeatMode("once");
        setContextRepeatEnabled(true);
      } else if (count === 2) {
        setRepeatMode("twice");
        setContextRepeatEnabled(true);
      } else if (count === 3) {
        setRepeatMode("thrice");
        setContextRepeatEnabled(true);
      } else if (count === -1) {
        setRepeatMode("infinite");
        setContextRepeatEnabled(true);
      }
    }
  }, [setContextRepeatEnabled]);

  useEffect(() => {
    const applySettingsToAudio = () => {
      const audioElement = getActiveAudioElement();
      if (audioElement) {
        audioElement.volume = volume;
        audioElement.muted = isMuted;
      }
    };

    applySettingsToAudio();
    const intervalId = setInterval(applySettingsToAudio, 1500);
    return () => clearInterval(intervalId);
  }, [volume, isMuted]);

  useEffect(() => {
    if (contextRepeatEnabled && repeatMode === "off") {
      setRepeatMode("once");
      if (typeof window !== "undefined" && window.audioRepeatCount === 0) {
        window.audioRepeatCount = 1;
      }
    } else if (!contextRepeatEnabled && repeatMode !== "off") {
      setRepeatMode("off");
      if (typeof window !== "undefined") {
        window.audioRepeatCount = 0;
      }
    }
  }, [contextRepeatEnabled, repeatMode]);

  useEffect(() => {
    if (isPlayerExpanded) {
      setAnimationClass("player-expanding");
    } else if (isPlayerVisible) {
      setAnimationClass("player-collapsing");
    }
  }, [isPlayerExpanded, isPlayerVisible]);

  useEffect(() => {
    const handleNewAudio = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "AUDIO") {
              const audioElement = node as HTMLAudioElement;
              audioElement.volume = volume;
              audioElement.muted = isMuted;

              audioElement.addEventListener("ended", () => {
                if (
                  typeof window !== "undefined" &&
                  window.audioRepeatCount !== undefined &&
                  window.audioRepeatCount !== 0
                ) {
                  const repeatCount = window.audioRepeatCount;
                  if (repeatCount === -1) {
                    audioElement.currentTime = 0;
                    audioElement.play().catch(console.error);
                  } else if (repeatCount !== undefined && repeatCount > 0) {
                    // Decrement count and repeat if still positive
                    window.audioRepeatCount = repeatCount - 1;
                    audioElement.currentTime = 0;
                    audioElement.play().catch(console.error);
                  }
                }
              });
            }
          });
        }
      }
    };

    if (typeof window !== "undefined" && typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(handleNewAudio);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [volume, isMuted]);

  const rewind = () => {
    const audioElement = getActiveAudioElement();
    if (audioElement) {
      const newTime = Math.max(0, audioElement.currentTime - 10);
      audioElement.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const fastForward = () => {
    const audioElement = getActiveAudioElement();
    if (audioElement) {
      const newTime = Math.min(
        audioElement.duration || 0,
        audioElement.currentTime + 10
      );
      audioElement.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const navigateToCurrentVerse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSurah && currentVerse) {
      router.push(`/surah/${currentSurah}#verse-${currentVerse}`);
    }
  };

  if (!isPlayerVisible) {
    return null;
  }

  const getRepeatModeText = () => {
    switch (repeatMode) {
      case "once":
        return "1×";
      case "twice":
        return "2×";
      case "thrice":
        return "3×";
      case "infinite":
        return "∞";
      default:
        return "Off";
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
      <div
        className={`pointer-events-auto bg-neutral-950/95 text-white backdrop-blur-xl border border-white/10 shadow-2xl transition-[max-width,border-radius,padding] duration-300 ease-out ${animationClass} ${
          isPlayerExpanded
            ? "w-full max-w-2xl rounded-2xl p-4 sm:p-5"
            : "w-auto max-w-md p-2.5 pr-4 rounded-full"
        }`}
        onClick={() => !isPlayerExpanded && setIsPlayerExpanded(true)}
      >
        {isPlayerExpanded ? (
          <div className="text-white space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-white/10 p-1.5 rounded-xl transition-colors"
                onClick={navigateToCurrentVerse}
                title="Go to verse in Surah"
              >
                <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                  <span className="font-amiri text-base">
                    {currentVerse && convertToArabicNumeral(currentVerse)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold leading-tight">
                    Surah {surahName}
                  </h3>
                  <p className="text-xs text-white/70">
                    Verse {currentVerse} of {verses.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
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

            {/* Time & progress bar */}
            <div className="flex items-center gap-2.5 text-xs text-white/70">
              <span className="tabular-nums font-mono min-w-[36px]">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.01}
                onValueChange={(value) => setProgress(value[0])}
                className="flex-1 cursor-pointer"
                aria-label="Recitation progress"
              />
              <span className="tabular-nums font-mono min-w-[36px] text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                className={`text-white hover:bg-white/15 rounded-lg text-xs h-8 px-2.5 flex items-center gap-1.5 ${
                  repeatMode !== "off" ? "bg-white/20 text-white font-medium" : ""
                }`}
                onClick={handleRepeat}
                aria-label={`Repeat mode: ${getRepeatModeText()}`}
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>{getRepeatModeText()}</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToFirstVerse();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  aria-label="Restart from first verse"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousVerse();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  disabled={!currentVerse || currentVerse <= 1 || isLoading}
                  aria-label="Previous verse"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    rewind();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  aria-label="Rewind 10 seconds"
                >
                  <Rewind className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 rounded-full p-0 flex items-center justify-center shrink-0 shadow-sm"
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
                    <PauseCircle className="h-5 w-5" />
                  ) : (
                    <PlayCircle className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    fastForward();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  aria-label="Fast forward 10 seconds"
                >
                  <FastForward className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextVerse();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  disabled={
                    !currentVerse || currentVerse >= verses.length || isLoading
                  }
                  aria-label="Next verse"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume Popover */}
              <div className="relative">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVolumeControl(!showVolumeControl);
                  }}
                  onMouseEnter={() => setShowVolumeControl(true)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/15 rounded-full"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                {showVolumeControl && (
                  <div
                    className="absolute bottom-full right-0 mb-3 bg-neutral-900 border border-white/15 p-3 rounded-xl shadow-xl w-32 flex flex-col gap-2"
                    onMouseEnter={() => setShowVolumeControl(true)}
                    onMouseLeave={() => setShowVolumeControl(false)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center text-[10px] text-white/70">
                      <span>Volume</span>
                      <button
                        onClick={toggleMute}
                        className="hover:underline text-xs"
                      >
                        {isMuted ? "Unmute" : "Mute"}
                      </button>
                    </div>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-full cursor-pointer"
                      aria-label="Volume slider"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Island */
          <div className="flex items-center gap-3 text-white">
            {/* Circular Progress */}
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
                  strokeDashoffset={
                    100.53 -
                    (currentVerse &&
                    verses.length &&
                    currentVerse >= verses.length
                      ? 1
                      : calculateProgress()) *
                      100.53
                  }
                  className="text-primary transition-[stroke-dashoffset] duration-300"
                  transform="rotate(-90 18 18)"
                />
                <text
                  x="18"
                  y="18"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  className="font-mono"
                >
                  {currentVerse &&
                  verses.length &&
                  currentVerse >= verses.length
                    ? "100%"
                    : `${Math.round(calculateProgress() * 100)}%`}
                </text>
              </svg>
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer hover:bg-white/10 rounded-lg px-2 py-0.5 transition-colors"
              onClick={navigateToCurrentVerse}
              title="Go to verse"
            >
              <p className="text-xs font-semibold truncate leading-tight">
                Surah {surahName}
              </p>
              <p className="text-[11px] text-white/70 truncate">
                Verse {currentVerse} of {verses.length}
              </p>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/15 rounded-full shrink-0"
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

