"use client"

import type React from "react"
import { createContext, useState, useContext, useRef, useEffect } from "react"
import { getVerseAudioUrl } from "@/lib/quran-api"
import { updateRecentSurah, getSettings } from "@/lib/local-storage"

type Verse = {
  number: number
  arabic: string
  translation: string
  audioUrl: string
}

type AudioContextType = {
  isPlaying: boolean
  isLoading: boolean
  currentVerse: number | null
  currentSurah: number | null
  verses: Verse[]
  surahName: string
  playSurah: (surahId: number, verses: Verse[], surahName: string) => void
  playVerse: (surahId: number, verseNumber: number, verses: Verse[], surahName: string) => void
  pauseAudio: () => void
  resumeAudio: () => void
  stopAudio: () => void
  nextVerse: () => void
  previousVerse: () => void
  setProgress: (time: number) => void
  duration: number
  currentTime: number
  isPlayerVisible: boolean
  isPlayerExpanded: boolean
  setIsPlayerExpanded: (expanded: boolean) => void
  closePlayer: () => void
  calculateProgress: () => number
  scrollToCurrentVerse: () => void
  setPlaybackSpeed: (speed: number) => void
  setIsRepeatEnabled: (enabled: boolean) => void
  playbackSpeed: number
  isRepeatEnabled: boolean
  goToFirstVerse: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentVerse, setCurrentVerse] = useState<number | null>(null)
  const [currentSurah, setCurrentSurah] = useState<number | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [surahName, setSurahName] = useState("")
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlayerVisible, setIsPlayerVisible] = useState(false)
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false)
  const [reciterId, setReciterId] = useState("alafasy") // Default reciter
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [audioSource, setAudioSource] = useState<"primary" | "fallback">("primary")

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number>()

  // Load user settings on mount
  useEffect(() => {
    const settings = getSettings()
    if (settings.reciterId) {
      setReciterId(settings.reciterId)
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Get audio URL based on source preference
  const getAudioUrl = (surahId: number, verseNumber: number, reciterId: string, source: "primary" | "fallback") => {
    if (source === "primary") {
      return getVerseAudioUrl(surahId, verseNumber, reciterId)
    } else {
      // Fallback source format
      const formattedSurahNumber = surahId.toString().padStart(3, "0")
      const formattedVerseNumber = verseNumber.toString().padStart(3, "0")
      return `https://audio.qurancdn.com/${reciterId}/${formattedSurahNumber}${formattedVerseNumber}.mp3`
    }
  }

  // Update audio element when current verse changes
  useEffect(() => {
    if (currentVerse !== null && verses.length > 0 && currentSurah !== null) {
      const verse = verses.find((v) => v.number === currentVerse)

      if (verse) {
        setIsLoading(true)
        setRetryCount(0) // Reset retry count for new verse

        // Get current settings
        const settings = getSettings()
        const currentReciterId = settings.reciterId || reciterId

        // Use the audio URL based on current source preference
        const audioUrl = getAudioUrl(currentSurah, currentVerse, currentReciterId, audioSource)

        // Clean up previous audio element completely
        if (audioRef.current) {
          const oldAudio = audioRef.current
          oldAudio.oncanplaythrough = null
          oldAudio.onloadedmetadata = null
          oldAudio.onended = null
          oldAudio.ontimeupdate = null
          oldAudio.onerror = null
          oldAudio.pause()
          oldAudio.src = ""
          oldAudio.load()
          audioRef.current = null
        }

        // Create new audio element
        const audio = new Audio()
        audioRef.current = audio

        // Set up event listeners with named functions to ensure proper cleanup
        const handleLoadedMetadata = () => {
          setDuration(audio.duration)
        }

        const handleCanPlayThrough = () => {
          setIsLoading(false)
          if (isPlaying) {
            audio.play().catch((error) => {
              console.error("Error playing audio:", error)
              setIsPlaying(false)
            })
          }
        }

        const handleEnded = () => {
          // If repeat is enabled, replay the current verse
          if (isRepeatEnabled) {
            audio.currentTime = 0
            audio.play().catch((error) => {
              console.error("Error replaying audio:", error)
            })
          } else {
            // Move to next verse when current one ends
            nextVerse()
          }
        }

        const handleTimeUpdate = () => {
          setCurrentTime(audio.currentTime)
        }

        const handleError = (e: Event) => {
          console.error("Audio error:", e)

          // Try fallback source if using primary, or try another reciter if already using fallback
          if (audioSource === "primary" && retryCount === 0) {
            console.log("Trying fallback audio source...")
            setAudioSource("fallback")
            setRetryCount(1)
          } else if (retryCount < 2) {
            // Try with a different reciter as last resort
            console.log("Trying with alternative reciter...")
            const alternativeReciter = currentReciterId === "alafasy" ? "minshawi" : "alafasy"

            // Clean up current audio
            if (audioRef.current) {
              audioRef.current.pause()
              audioRef.current.src = ""
              audioRef.current.load()
            }

            // Try with alternative reciter
            const newUrl = getAudioUrl(currentSurah, currentVerse, alternativeReciter, audioSource)
            audio.src = newUrl
            audio.load()
            setRetryCount((prev) => prev + 1)
          } else {
            // If all retries fail, give up and move to next verse
            setIsLoading(false)
            setIsPlaying(false)
            console.error("Failed to load audio after multiple attempts")

            // Reset for next attempt
            setAudioSource("primary")
            setRetryCount(0)

            // Skip to next verse after a short delay
            setTimeout(() => {
              nextVerse()
            }, 1000)
          }
        }

        // Set properties
        audio.preload = "auto"
        audio.playbackRate = playbackSpeed

        // Add event listeners with named functions
        audio.addEventListener("loadedmetadata", handleLoadedMetadata)
        audio.addEventListener("canplaythrough", handleCanPlayThrough)
        audio.addEventListener("ended", handleEnded)
        audio.addEventListener("timeupdate", handleTimeUpdate)
        audio.addEventListener("error", handleError)

        // Set source and load after event listeners are attached
        audio.src = audioUrl
        audio.load()

        // Update recent surahs in localStorage
        if (currentSurah && surahName) {
          updateRecentSurah({
            surahId: currentSurah,
            surahName,
            englishName: surahName,
            lastRead: Date.now(),
            lastVerse: currentVerse,
          })
        }

        // Return cleanup function with named event listeners
        return () => {
          if (audio) {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
            audio.removeEventListener("canplaythrough", handleCanPlayThrough)
            audio.removeEventListener("ended", handleEnded)
            audio.removeEventListener("timeupdate", handleTimeUpdate)
            audio.removeEventListener("error", handleError)
            audio.pause()
            audio.src = ""
            audio.load()
          }
        }
      }
    }

    // Scroll to the current verse when it changes
    if (currentVerse !== null && currentSurah !== null) {
      // Small delay to ensure audio is loaded first
      setTimeout(scrollToCurrentVerse, 300)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.load()
      }
    }
  }, [
    currentVerse,
    currentSurah,
    verses,
    isPlaying,
    surahName,
    reciterId,
    playbackSpeed,
    isRepeatEnabled,
    audioSource,
    retryCount,
  ])

  // Try alternative audio source if the primary one fails
  const tryAlternativeAudioSource = (surahId: number, verseNumber: number, reciterId: string) => {
    if (!audioRef.current) return

    // Format surah and verse numbers
    const formattedSurahNumber = surahId.toString().padStart(3, "0")
    const formattedVerseNumber = verseNumber.toString().padStart(3, "0")

    // Try an alternative source
    const alternativeUrl = `https://audio.qurancdn.com/${reciterId}/${formattedSurahNumber}${formattedVerseNumber}.mp3`

    console.log("Trying alternative audio source:", alternativeUrl)

    audioRef.current.src = alternativeUrl
    audioRef.current.load()
  }

  // Play entire surah
  const playSurah = (surahId: number, surahVerses: Verse[], name: string) => {
    // Reset audio source to primary for new playback
    setAudioSource("primary")
    setRetryCount(0)

    setVerses(surahVerses)
    setSurahName(name)
    setCurrentSurah(surahId)
    setCurrentVerse(1) // Start from first verse
    setIsPlaying(true)
    setIsPlayerVisible(true)
    setIsPlayerExpanded(true) // Expand player when starting a new surah

    // Update recent surahs in localStorage
    updateRecentSurah({
      surahId,
      surahName: name,
      englishName: name,
      lastRead: Date.now(),
      lastVerse: 1,
    })
  }

  // Play specific verse
  const playVerse = (surahId: number, verseNumber: number, surahVerses: Verse[], name: string) => {
    // Reset audio source to primary for new playback
    setAudioSource("primary")
    setRetryCount(0)

    setVerses(surahVerses)
    setSurahName(name)
    setCurrentSurah(surahId)
    setCurrentVerse(verseNumber)
    setIsPlaying(true)
    setIsPlayerVisible(true)

    // Update recent surahs in localStorage
    updateRecentSurah({
      surahId,
      surahName: name,
      englishName: name,
      lastRead: Date.now(),
      lastVerse: verseNumber,
    })
  }

  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }

  // Resume audio
  const resumeAudio = () => {
    if (audioRef.current && !isLoading) {
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error resuming audio:", error)
          setIsPlaying(false)
        })
      }
    }
    setIsPlaying(true)
  }

  // Stop audio completely
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
      audioRef.current.load()
    }
    setIsPlaying(false)
    setCurrentVerse(null)
    setCurrentSurah(null)
    setVerses([])
    setSurahName("")
    setIsLoading(false)
    setAudioSource("primary")
    setRetryCount(0)
  }

  // Move to next verse
  const nextVerse = () => {
    if (currentVerse !== null && verses.length > 0) {
      const currentIndex = verses.findIndex((v) => v.number === currentVerse)

      if (currentIndex < verses.length - 1) {
        // Reset audio source to primary for new verse
        setAudioSource("primary")
        setRetryCount(0)

        // Move to next verse
        setCurrentVerse(verses[currentIndex + 1].number)
      } else {
        // End of surah
        pauseAudio()
      }
    }
  }

  // Move to previous verse
  const previousVerse = () => {
    if (currentVerse !== null && verses.length > 0) {
      const currentIndex = verses.findIndex((v) => v.number === currentVerse)

      if (currentIndex > 0) {
        // Reset audio source to primary for new verse
        setAudioSource("primary")
        setRetryCount(0)

        // Move to previous verse
        setCurrentVerse(verses[currentIndex - 1].number)
      }
    }
  }

  // Go to first verse
  const goToFirstVerse = () => {
    if (verses.length > 0 && currentSurah !== null) {
      // Reset audio source to primary for new verse
      setAudioSource("primary")
      setRetryCount(0)

      setCurrentVerse(verses[0].number)
    }
  }

  // Set progress (for seeking)
  const setProgress = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Close player
  const closePlayer = () => {
    stopAudio()
    setIsPlayerVisible(false)
    setIsPlayerExpanded(false)
  }

  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (!verses.length || currentVerse === null) return 0

    // Base progress is the completed verses
    const completedVerses = verses.findIndex((v) => v.number === currentVerse)
    const baseProgress = completedVerses / verses.length

    // Add the progress within the current verse
    const verseProgress = duration > 0 ? currentTime / duration / verses.length : 0

    return baseProgress + verseProgress
  }

  // Scroll to current verse
  const scrollToCurrentVerse = () => {
    if (currentVerse) {
      const verseElement = document.getElementById(`verse-${currentVerse}`)
      if (verseElement) {
        verseElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  }

  const value = {
    isPlaying,
    isLoading,
    currentVerse,
    currentSurah,
    verses,
    surahName,
    playSurah,
    playVerse,
    pauseAudio,
    resumeAudio,
    stopAudio,
    nextVerse,
    previousVerse,
    goToFirstVerse,
    setProgress,
    duration,
    currentTime,
    isPlayerVisible,
    isPlayerExpanded,
    setIsPlayerExpanded,
    closePlayer,
    calculateProgress,
    scrollToCurrentVerse,
    playbackSpeed,
    setPlaybackSpeed,
    isRepeatEnabled,
    setIsRepeatEnabled,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

