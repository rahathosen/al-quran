"use client";

import type React from "react";
import { createContext, useState, useContext, useRef, useEffect, useCallback } from "react";
import { getVerseAudioUrl } from "@/lib/quran-api";
import { updateRecentSurah, getSettings } from "@/lib/local-storage";

// Add global declaration for the audio settings
declare global {
  interface Window {
    audioRepeatCount?: number;
    audioPlaybackSpeed?: number;
    audioVolume?: number;
    audioIsMuted?: boolean;
  }
}

export type RepeatMode = "off" | "once" | "twice" | "thrice" | "infinite";

export type Verse = {
  number: number;
  arabic: string;
  translation: string;
  audioUrl: string;
  juz?: number;
  page?: number;
};

export type AudioContextType = {
  isPlaying: boolean;
  isLoading: boolean;
  currentVerse: number | null;
  currentSurah: number | null;
  verses: Verse[];
  surahName: string;
  englishName: string;
  playSurah: (
    surahId: number,
    verses: Verse[],
    surahName: string,
    englishName?: string
  ) => void;
  playVerse: (
    surahId: number,
    verseNumber: number,
    verses: Verse[],
    surahName: string,
    englishName?: string
  ) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  nextVerse: () => void;
  previousVerse: () => void;
  goToFirstVerse: () => void;
  replayCurrentVerse: () => void;
  seekAudio: (secondsDelta: number) => void;
  setProgress: (time: number) => void;
  duration: number;
  currentTime: number;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isPlayerVisible: boolean;
  isPlayerExpanded: boolean;
  setIsPlayerExpanded: (expanded: boolean) => void;
  closePlayer: () => void;
  calculateProgress: () => number;
  scrollToCurrentVerse: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  repeatMode: RepeatMode;
  setRepeatMode: (mode: RepeatMode) => void;
  isRepeatEnabled: boolean;
  setIsRepeatEnabled: (enabled: boolean) => void;
  currentVerseData?: Verse;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const getRepeatTarget = (mode: RepeatMode): number => {
  switch (mode) {
    case "once":
      return 1;
    case "twice":
      return 2;
    case "thrice":
      return 3;
    case "infinite":
      return -1;
    default:
      return 0;
  }
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<number | null>(null);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [surahName, setSurahName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [reciterId, setReciterId] = useState("alafasy");

  // Volume & Mute state with persistence
  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("audio-volume");
      if (saved !== null) {
        const parsed = Number.parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
      if (window.audioVolume !== undefined) return window.audioVolume;
    }
    return 1;
  });

  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("audio-is-muted");
      if (saved !== null) return saved === "true";
      if (window.audioIsMuted !== undefined) return window.audioIsMuted;
    }
    return false;
  });

  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(() => {
    if (typeof window !== "undefined" && window.audioPlaybackSpeed) {
      return window.audioPlaybackSpeed;
    }
    return 1;
  });

  const [repeatMode, setRepeatModeState] = useState<RepeatMode>(() => {
    if (typeof window !== "undefined" && window.audioRepeatCount !== undefined) {
      const count = window.audioRepeatCount;
      if (count === 1) return "once";
      if (count === 2) return "twice";
      if (count === 3) return "thrice";
      if (count === -1) return "infinite";
    }
    return "off";
  });

  const [isRepeatEnabled, setIsRepeatEnabledState] = useState<boolean>(repeatMode !== "off");
  const [retryCount, setRetryCount] = useState(0);
  const [audioSource, setAudioSource] = useState<"primary" | "fallback">("primary");
  const [currentVerseData, setCurrentVerseData] = useState<Verse | undefined>(undefined);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();
  const remainingVerseRepeats = useRef<number>(getRepeatTarget(repeatMode));

  // Initialize global variables if needed
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.audioRepeatCount = getRepeatTarget(repeatMode);
      window.audioPlaybackSpeed = playbackSpeed;
      window.audioVolume = volume;
      window.audioIsMuted = isMuted;
    }
  }, [repeatMode, playbackSpeed, volume, isMuted]);

  // Load user settings on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings.reciterId) {
      setReciterId(settings.reciterId);
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Real-time volume setter
  const setVolume = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clamped);
    if (typeof window !== "undefined") {
      window.audioVolume = clamped;
      localStorage.setItem("audio-volume", clamped.toString());
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped === 0) {
      setIsMutedState(true);
      if (typeof window !== "undefined") {
        window.audioIsMuted = true;
        localStorage.setItem("audio-is-muted", "true");
      }
      if (audioRef.current) audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMutedState(false);
      if (typeof window !== "undefined") {
        window.audioIsMuted = false;
        localStorage.setItem("audio-is-muted", "false");
      }
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  // Real-time mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    if (typeof window !== "undefined") {
      window.audioIsMuted = nextMuted;
      localStorage.setItem("audio-is-muted", nextMuted.toString());
    }
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);
    if (typeof window !== "undefined") {
      window.audioPlaybackSpeed = speed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setRepeatModeState(mode);
    const target = getRepeatTarget(mode);
    remainingVerseRepeats.current = target;
    const enabled = mode !== "off";
    setIsRepeatEnabledState(enabled);
    if (typeof window !== "undefined") {
      window.audioRepeatCount = target;
    }
  };

  const setIsRepeatEnabled = (enabled: boolean) => {
    if (!enabled) {
      setRepeatMode("off");
    } else if (repeatMode === "off") {
      setRepeatMode("once");
    }
  };

  // Get audio URL based on source preference
  const getAudioUrl = (
    surahId: number,
    verseNumber: number,
    currentReciter: string,
    source: "primary" | "fallback"
  ) => {
    if (source === "primary") {
      return getVerseAudioUrl(surahId, verseNumber, currentReciter);
    } else {
      const formattedSurahNumber = surahId.toString().padStart(3, "0");
      const formattedVerseNumber = verseNumber.toString().padStart(3, "0");
      return `https://audio.qurancdn.com/${currentReciter}/${formattedSurahNumber}${formattedVerseNumber}.mp3`;
    }
  };

  // Move to next verse
  const nextVerse = useCallback(() => {
    if (currentVerse !== null && verses.length > 0) {
      const currentIndex = verses.findIndex((v) => v.number === currentVerse);
      if (currentIndex < verses.length - 1) {
        setAudioSource("primary");
        setRetryCount(0);
        setCurrentVerse(verses[currentIndex + 1].number);
      } else {
        // End of Surah
        setIsPlaying(false);
      }
    }
  }, [currentVerse, verses]);

  // Move to previous verse
  const previousVerse = () => {
    if (currentVerse !== null && verses.length > 0) {
      // If played more than 3 seconds, restart current verse first
      if (audioRef.current && audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        return;
      }

      const currentIndex = verses.findIndex((v) => v.number === currentVerse);
      if (currentIndex > 0) {
        setAudioSource("primary");
        setRetryCount(0);
        setCurrentVerse(verses[currentIndex - 1].number);
      } else {
        replayCurrentVerse();
      }
    }
  };

  // Replay current verse from 00:00
  const replayCurrentVerse = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  // Seek relative audio time (e.g. -10s, +10s)
  const seekAudio = (secondsDelta: number) => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || duration || 0;
      const target = Math.max(0, Math.min(dur, audioRef.current.currentTime + secondsDelta));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    } else {
      const target = Math.max(0, Math.min(duration || 0, currentTime + secondsDelta));
      setCurrentTime(target);
    }
  };

  // Go to first verse
  const goToFirstVerse = () => {
    if (verses.length > 0 && currentSurah !== null) {
      setAudioSource("primary");
      setRetryCount(0);
      setCurrentVerse(verses[0].number);
    }
  };

  // Set progress (for scrubber seeking)
  const setProgress = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // Resume audio
  const resumeAudio = () => {
    if (audioRef.current && !isLoading) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error resuming audio:", error);
          setIsPlaying(false);
        });
      }
    }
    setIsPlaying(true);
  };

  // Stop audio completely
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentVerse(null);
    setCurrentSurah(null);
    setVerses([]);
    setSurahName("");
    setEnglishName("");
    setIsLoading(false);
    setAudioSource("primary");
    setRetryCount(0);
  };

  // Close player
  const closePlayer = () => {
    stopAudio();
    setIsPlayerVisible(false);
    setIsPlayerExpanded(false);
  };

  // Scroll to current verse
  const scrollToCurrentVerse = () => {
    if (currentVerse) {
      const verseElement = document.getElementById(`verse-${currentVerse}`);
      if (verseElement) {
        verseElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (!verses.length || currentVerse === null) return 0;

    const currentIdx = verses.findIndex((v) => v.number === currentVerse);
    if (currentIdx === -1) return 0;

    const baseProgress = currentIdx / verses.length;
    const verseProgress =
      duration > 0 ? (currentTime / duration) / verses.length : 0;

    return Math.min(1, Math.max(0, baseProgress + verseProgress));
  };

  // Update audio element when current verse changes
  useEffect(() => {
    if (currentVerse !== null && verses.length > 0 && currentSurah !== null) {
      const verse = verses.find((v) => v.number === currentVerse);

      if (verse) {
        setCurrentVerseData(verse);
        setIsLoading(true);
        setRetryCount(0);

        // Reset repeat target count for this newly started verse
        remainingVerseRepeats.current = getRepeatTarget(repeatMode);

        const settings = getSettings();
        const currentReciterId = settings.reciterId || reciterId;

        const audioUrl = getAudioUrl(
          currentSurah,
          currentVerse,
          currentReciterId,
          audioSource
        );

        // Clean up previous audio element completely
        if (audioRef.current) {
          const oldAudio = audioRef.current;
          oldAudio.oncanplaythrough = null;
          oldAudio.onloadedmetadata = null;
          oldAudio.onended = null;
          oldAudio.ontimeupdate = null;
          oldAudio.onerror = null;
          oldAudio.pause();
          oldAudio.src = "";
          oldAudio.load();
          audioRef.current = null;
        }

        // Create new in-memory audio element
        const audio = new Audio();
        audioRef.current = audio;

        // Apply sound and playback properties
        audio.preload = "auto";
        audio.volume = isMuted ? 0 : volume;
        audio.muted = isMuted;
        audio.playbackRate = playbackSpeed;

        const handleLoadedMetadata = () => {
          setDuration(audio.duration || 0);
        };

        const handleCanPlayThrough = () => {
          setIsLoading(false);
          if (isPlaying) {
            audio.play().catch((error) => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
            });
          }
        };

        const handleEnded = () => {
          // Infinite loop mode
          if (repeatMode === "infinite") {
            audio.currentTime = 0;
            audio.play().catch(console.error);
            return;
          }

          // Counted repeat mode (once, twice, thrice)
          if (remainingVerseRepeats.current > 0) {
            remainingVerseRepeats.current -= 1;
            audio.currentTime = 0;
            audio.play().catch(console.error);
            return;
          }

          // Advance to next verse
          nextVerse();
        };

        const handleTimeUpdate = () => {
          setCurrentTime(audio.currentTime);
        };

        const handleError = (e: Event) => {
          console.error("Audio error:", e);

          if (audioSource === "primary" && retryCount === 0) {
            setAudioSource("fallback");
            setRetryCount(1);
          } else if (retryCount < 2) {
            const alternativeReciter =
              currentReciterId === "alafasy" ? "minshawi" : "alafasy";

            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = "";
              audioRef.current.load();
            }

            const newUrl = getAudioUrl(
              currentSurah,
              currentVerse,
              alternativeReciter,
              audioSource
            );
            audio.src = newUrl;
            audio.load();
            setRetryCount((prev) => prev + 1);
          } else {
            setIsLoading(false);
            setIsPlaying(false);
            setAudioSource("primary");
            setRetryCount(0);
            setTimeout(() => {
              nextVerse();
            }, 1000);
          }
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("canplaythrough", handleCanPlayThrough);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("error", handleError);

        audio.src = audioUrl;
        audio.load();

        if (currentSurah && (englishName || surahName)) {
          updateRecentSurah({
            surahId: currentSurah,
            surahName: surahName || englishName,
            englishName: englishName || surahName,
            lastRead: Date.now(),
            lastVerse: currentVerse,
          });
        }

        return () => {
          if (audio) {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("canplaythrough", handleCanPlayThrough);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("error", handleError);
            audio.pause();
            audio.src = "";
            audio.load();
          }
        };
      }
    }

    if (currentVerse !== null && currentSurah !== null) {
      setTimeout(scrollToCurrentVerse, 300);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [
    currentVerse,
    currentSurah,
    verses,
    isPlaying,
    surahName,
    englishName,
    reciterId,
    playbackSpeed,
    repeatMode,
    audioSource,
    retryCount,
    volume,
    isMuted,
    nextVerse,
  ]);

  // Play entire surah
  const playSurah = (
    surahId: number,
    surahVerses: Verse[],
    name: string,
    engName?: string
  ) => {
    setAudioSource("primary");
    setRetryCount(0);
    setVerses(surahVerses);
    setSurahName(name);
    setEnglishName(engName || name);
    setCurrentSurah(surahId);
    setCurrentVerse(1);
    setIsPlaying(true);
    setIsPlayerVisible(true);
    setIsPlayerExpanded(true);

    updateRecentSurah({
      surahId,
      surahName: name,
      englishName: engName || name,
      lastRead: Date.now(),
      lastVerse: 1,
    });
  };

  // Play specific verse
  const playVerse = (
    surahId: number,
    verseNumber: number,
    surahVerses: Verse[],
    name: string,
    engName?: string
  ) => {
    setAudioSource("primary");
    setRetryCount(0);
    setVerses(surahVerses);
    setSurahName(name);
    setEnglishName(engName || name);
    setCurrentSurah(surahId);
    setCurrentVerse(verseNumber);
    setIsPlaying(true);
    setIsPlayerVisible(true);

    updateRecentSurah({
      surahId,
      surahName: name,
      englishName: engName || name,
      lastRead: Date.now(),
      lastVerse: verseNumber,
    });
  };

  const value: AudioContextType = {
    isPlaying,
    isLoading,
    currentVerse,
    currentSurah,
    verses,
    surahName,
    englishName,
    playSurah,
    playVerse,
    pauseAudio,
    resumeAudio,
    stopAudio,
    nextVerse,
    previousVerse,
    goToFirstVerse,
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
    playbackSpeed,
    setPlaybackSpeed,
    repeatMode,
    setRepeatMode,
    isRepeatEnabled,
    setIsRepeatEnabled,
    currentVerseData,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
