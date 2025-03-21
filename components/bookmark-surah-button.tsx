"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { getSettings, saveSettings } from "@/lib/local-storage"

interface BookmarkSurahButtonProps {
  surahId: number
  surahName: string
}

export default function BookmarkSurahButton({ surahId, surahName }: BookmarkSurahButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Check if surah is bookmarked on mount
  useEffect(() => {
    const settings = getSettings()
    const bookmarkedSurahs = settings.bookmarkedSurahs || []
    setIsBookmarked(bookmarkedSurahs.some((s: any) => s.id === surahId))
  }, [surahId])

  const toggleBookmark = () => {
    const settings = getSettings()
    let bookmarkedSurahs = settings.bookmarkedSurahs || []

    if (isBookmarked) {
      // Remove from bookmarks
      bookmarkedSurahs = bookmarkedSurahs.filter((s: any) => s.id !== surahId)
      showToast("Surah removed from bookmarks")
    } else {
      // Add to bookmarks
      bookmarkedSurahs.push({
        id: surahId,
        name: surahName,
        timestamp: Date.now(),
      })
      showToast("Surah added to bookmarks")
    }

    // Update settings
    saveSettings({
      ...settings,
      bookmarkedSurahs,
    })

    // Update state
    setIsBookmarked(!isBookmarked)
  }

  // Show toast notification
  const showToast = (message: string) => {
    const toast = document.createElement("div")
    toast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1a5e63] text-white px-4 py-2 rounded-lg shadow-lg z-50"
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 2000)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:text-[#d4af37] h-8 w-8 sm:h-10 sm:w-10"
      onClick={toggleBookmark}
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5 fill-[#d4af37]" />
      ) : (
        <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
      )}
    </Button>
  )
}

