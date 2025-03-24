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

// Convert numbers to Arabic numerals
function convertToArabicNumeral(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[Number.parseInt(digit)])
    .join("");
}

// Initialize global variables if they don't exist
if (typeof window !== "undefined") {
  window.audioRepeatCount = window.audioRepeatCount || 0;
  window.audioVolume = window.audioVolume || 1;
  window.audioIsMuted = window.audioIsMuted || false;
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
    isRepeatEnabled: contextRepeatEnabled,
    setIsRepeatEnabled: setContextRepeatEnabled,
    currentVerseData,
  } = useAudio();

  const [volume, setVolume] = useState(
    typeof window !== "undefined" && window.audioVolume ? window.audioVolume : 1
  );
  const [isMuted, setIsMuted] = useState(
    typeof window !== "undefined" && window.audioIsMuted
      ? window.audioIsMuted
      : false
  );
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [repeatMode, setRepeatMode] = useState<
    "off" | "once" | "twice" | "thrice" | "infinite"
  >("off");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Find the active audio element
  const getActiveAudioElement = () => {
    // Try to find the audio element that's currently playing
    const audioElements = document.querySelectorAll("audio");
    for (let i = 0; i < audioElements.length; i++) {
      const audio = audioElements[i] as HTMLAudioElement;
      if (!audio.paused || audio.currentTime > 0) {
        return audio;
      }
    }

    // If no playing audio is found, return the first audio element or null
    return audioElements.length > 0
      ? (audioElements[0] as HTMLAudioElement)
      : null;
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    // Save to global state
    if (typeof window !== "undefined") {
      window.audioVolume = newVolume;
    }

    // Apply to audio element
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

  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Save to global state
    if (typeof window !== "undefined") {
      window.audioIsMuted = newMutedState;
    }

    // Apply to audio element
    const audioElement = getActiveAudioElement();
    if (audioElement) {
      audioElement.muted = newMutedState;
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  // Handle repeat mode
  const handleRepeat = () => {
    let newRepeatCount = 0;
    let newRepeatMode = "off";

    // Cycle through repeat modes
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
      newRepeatCount = -1; // -1 means infinite
    } else {
      newRepeatMode = "off";
      newRepeatCount = 0;
    }

    // Update state
    setRepeatMode(newRepeatMode as any);
    setContextRepeatEnabled(newRepeatCount !== 0);

    // Save to global state
    if (typeof window !== "undefined") {
      window.audioRepeatCount = newRepeatCount;
      console.log(
        `Repeat mode set to: ${newRepeatMode}, count: ${newRepeatCount}`
      );
    }
  };

  // Initialize repeat mode from global state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const count = window.audioRepeatCount || 0;

      // Set the appropriate repeat mode based on count
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

  // Apply settings to audio element whenever it changes
  useEffect(() => {
    // Function to apply settings to audio element
    const applySettingsToAudio = () => {
      const audioElement = getActiveAudioElement();
      if (audioElement) {
        // Apply volume and mute settings
        audioElement.volume = volume;
        audioElement.muted = isMuted;

        console.log(
          `Applied settings to audio: volume=${volume}, muted=${isMuted}`
        );
      }
    };

    // Apply settings immediately
    applySettingsToAudio();

    // Set up a periodic check to apply settings to new audio elements
    const intervalId = setInterval(applySettingsToAudio, 1000);

    return () => clearInterval(intervalId);
  }, [volume, isMuted]);

  // Update repeat mode when it changes in context
  useEffect(() => {
    if (contextRepeatEnabled && repeatMode === "off") {
      // Default to "once" if enabled but mode is off
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

  // Animation class for expanding/collapsing
  useEffect(() => {
    if (isPlayerExpanded) {
      setAnimationClass("player-expanding");
    } else if (isPlayerVisible) {
      setAnimationClass("player-collapsing");
    }
  }, [isPlayerExpanded, isPlayerVisible]);

  // Listen for new audio elements and apply settings
  useEffect(() => {
    // Function to handle new audio elements
    const handleNewAudio = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === "AUDIO") {
              const audioElement = node as HTMLAudioElement;

              // Apply current settings
              audioElement.volume = volume;
              audioElement.muted = isMuted;

              console.log("Applied settings to new audio element");

              // Add ended event listener for repeat functionality
              audioElement.addEventListener("ended", () => {
                if (
                  typeof window !== "undefined" &&
                  window.audioRepeatCount !== 0
                ) {
                  const repeatCount = window.audioRepeatCount;

                  // Handle repeat based on count
                  if (repeatCount === -1) {
                    // Infinite repeat
                    audioElement.currentTime = 0;
                    audioElement.play().catch(console.error);
                  } else if (repeatCount > 0) {
                    // Decrement count and repeat if still positive
                    window.audioRepeatCount = repeatCount - 1;
                    audioElement.currentTime = 0;
                    audioElement.play().catch(console.error);
                  }
                  // If count reaches 0, let the normal ended behavior happen
                }
              });
            }
          });
        }
      }
    };

    // Set up mutation observer to watch for new audio elements
    if (
      typeof window !== "undefined" &&
      typeof MutationObserver !== "undefined"
    ) {
      const observer = new MutationObserver(handleNewAudio);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => observer.disconnect();
    }
  }, [volume, isMuted]);

  const rewind = () => {
    const audioElement = getActiveAudioElement();
    if (audioElement) {
      // Calculate new time (current time - 10 seconds, but not less than 0)
      const newTime = Math.max(0, audioElement.currentTime - 10);

      // Update audio element time
      audioElement.currentTime = newTime;

      // Also update the progress in the context to keep UI in sync
      setProgress(newTime);

      console.log(`Rewind to: ${newTime}s`);
    }
  };

  const fastForward = () => {
    const audioElement = getActiveAudioElement();
    if (audioElement) {
      // Calculate new time (current time + 10 seconds)
      const newTime = Math.min(
        audioElement.duration,
        audioElement.currentTime + 10
      );

      // Update audio element time
      audioElement.currentTime = newTime;

      // Also update the progress in the context to keep UI in sync
      setProgress(newTime);

      console.log(`Fast forward to: ${newTime}s`);
    }
  };

  if (!isPlayerVisible) {
    return null;
  }

  // Get the repeat mode display text
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
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
      <div
        className={`bg-black/90 backdrop-blur-lg shadow-lg transition-all duration-300 ease-in-out ${animationClass}
        ${
          isPlayerExpanded
            ? "w-full max-w-3xl rounded-2xl p-4"
            : "w-auto max-w-md p-2 pr-4 rounded-full"
        }`}
        onClick={() => !isPlayerExpanded && setIsPlayerExpanded(true)}
      >
        {isPlayerExpanded ? (
          // Expanded view
          <div className="text-white">
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentSurah && currentVerse) {
                    window.location.href = `/surah/${currentSurah}#verse-${currentVerse}`;
                  }
                }}
                title="Go to this verse"
              >
                <div className="w-10 h-10 rounded-full bg-[#d4af37] text-black flex items-center justify-center overflow-hidden">
                  <span
                    className="font-amiri quran-uthmani text-lg"
                    style={{ textShadow: "0 0 1px rgba(0,0,0,0.3)" }}
                  >
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
                    e.stopPropagation();
                    setIsPlayerExpanded(false);
                  }}
                >
                  <svg
                    width="14"
                    height="2"
                    viewBox="0 0 14 2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="14" height="2" rx="1" fill="white" />
                  </svg>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    closePlayer();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Controls for repeat only */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-white hover:bg-white/10 rounded-md flex items-center gap-1 ${
                      repeatMode !== "off" ? "bg-white/20" : ""
                    }`}
                    onClick={handleRepeat}
                  >
                    <Repeat
                      className={`h-4 w-4 mr-1 ${
                        repeatMode !== "off" ? "text-[#d4af37]" : ""
                      }`}
                    />
                    Repeat: {getRepeatModeText()}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-white/70">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.01}
                  onValueChange={(value) => setProgress(value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-white/70">
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToFirstVerse();
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
                    e.stopPropagation();
                    previousVerse();
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
                    e.stopPropagation();
                    rewind();
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
                >
                  <Rewind className="h-4 w-4" />
                </Button>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
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
                    e.stopPropagation();
                    fastForward();
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 rounded-full"
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
                  className="text-white hover:bg-white/10 rounded-full"
                  disabled={
                    !currentVerse || currentVerse >= verses.length || isLoading
                  }
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <div className="relative">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    onMouseEnter={() => setShowVolumeControl(true)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-full"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
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
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="#d4af37"
                  className="stroke-none"
                />

                {/* Progress circle - stroke-dasharray is the circumference of the circle (2πr) */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="transparent"
                  stroke="white"
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
                  {currentVerse &&
                  verses.length &&
                  currentVerse >= verses.length
                    ? "100%"
                    : `${Math.round(calculateProgress() * 100)}%`}
                </text>
              </svg>
            </div>

            <div
              className="flex-1 min-w-0 cursor-pointer hover:bg-white/10 rounded-md px-2 py-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (currentSurah && currentVerse) {
                  window.location.href = `/surah/${currentSurah}#verse-${currentVerse}`;
                }
              }}
              title="Go to this verse"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">
                  Surah {surahName}
                </p>
                {/* {currentVerseData?.juz && (
                  <div className="text-xs text-white/70 bg-white/10 px-1.5 py-0.5 rounded-sm hidden sm:flex items-center gap-1.5">
                    <span>J:{currentVerseData.juz}</span>
                    <span>H:{Math.ceil(currentVerseData.juz * 2)}</span>
                    <span>P:{currentVerseData.page}</span>
                  </div>
                )} */}
              </div>
              <p className="text-xs text-white/70 truncate flex items-center gap-1">
                <span>
                  Verse {currentVerse} of {verses.length}
                </span>
                {currentVerseData?.juz && (
                  <span className="sm:hidden bg-white/10 px-1 rounded-sm text-[10px]">
                    J:{currentVerseData.juz} H:
                    {Math.ceil(currentVerseData.juz * 2)} P:
                    {currentVerseData.page}
                  </span>
                )}
              </p>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
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
  );
}
