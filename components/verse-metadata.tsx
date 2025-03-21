"use client"

import { useAudio } from "@/context/audio-context"
import { useEffect, useRef, useState } from "react"

export default function VerseMetadata() {
  const { currentVerse, verses, currentSurah, surahName } = useAudio()
  const [isSticky, setIsSticky] = useState(false)
  const metadataRef = useRef<HTMLDivElement>(null)

  // Get current verse data
  const currentVerseData = currentVerse !== null ? verses.find((v) => v.number === currentVerse) : null

  // Set up scroll event listener to detect when the component becomes sticky
  useEffect(() => {
    const handleScroll = () => {
      if (metadataRef.current) {
        const rect = metadataRef.current.getBoundingClientRect()
        setIsSticky(rect.top === 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!currentVerseData?.juz) return null

  return (
    <div
      ref={metadataRef}
      className={`sticky top-0 z-20 flex items-center justify-between bg-[#1a5e63]/90 backdrop-blur-sm rounded-lg p-2 text-xs text-white border-b border-[#d4af37]/30 mb-4 shadow-md transition-all duration-300 ${isSticky ? "py-3" : ""}`}
    >
      {isSticky ? (
        // Simplified sticky version
        <>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md">
            <span className="font-semibold">Juz:</span>
            <span>{currentVerseData.juz}</span>
          </div>

          <div className="font-medium text-center">
            <span>
              Surah {surahName} - Verse {currentVerse}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md">
            <span className="font-semibold">Page:</span>
            <span>{currentVerseData.page}</span>
          </div>
        </>
      ) : (
        // Full metadata version
        <>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md m-0.5">
            <span className="font-semibold">Juz:</span>
            <span>{currentVerseData.juz}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md m-0.5">
            <span className="font-semibold">Hizb:</span>
            <span>{Math.ceil(currentVerseData.juz * 2)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md m-0.5">
            <span className="font-semibold">Page:</span>
            <span>{currentVerseData.page}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md m-0.5">
            <span className="font-semibold">Manzil:</span>
            <span>{Math.ceil(currentVerseData.juz / 7)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md m-0.5">
            <span className="font-semibold">Ruku:</span>
            <span>{Math.ceil((currentVerseData.juz * 8) / 30)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md m-0.5">
            <span className="font-semibold">Sajda:</span>
            <span>
              {[2, 7, 13, 15, 16, 19, 22, 25, 27, 32, 38, 41, 53, 84, 96].includes(currentSurah || 0) ? "Yes" : "No"}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

