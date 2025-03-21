"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getBookmarks, type BookmarkedVerse } from "@/lib/local-storage"
import { BookmarkIcon } from "lucide-react"

export default function BookmarkedVerses() {
  const [bookmarks, setBookmarks] = useState<BookmarkedVerse[]>([])

  useEffect(() => {
    setBookmarks(getBookmarks())
  }, [])

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-[#d4af37]/20 text-center text-[#666]">
        <p>No bookmarked verses</p>
        <p className="text-sm mt-1">Your bookmarked verses will appear here</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4">
      {bookmarks.map((bookmark) => (
        <Link
          href={`/surah/${bookmark.surahId}#verse-${bookmark.verseNumber}`}
          key={`${bookmark.surahId}-${bookmark.verseNumber}`}
          className="bg-white rounded-lg shadow-md p-3 md:p-4 border border-[#d4af37]/20 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <BookmarkIcon className="h-5 w-5 text-[#1a5e63]" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-[#1a5e63] font-medium">
                Surah {bookmark.englishName} - Verse {bookmark.verseNumber}
              </h3>
              <p className="font-amiri text-right text-lg text-[#333] mt-2 mb-1 line-clamp-2">{bookmark.verseText}</p>
              <div className="text-xs text-[#666]">{new Date(bookmark.timestamp).toLocaleDateString()}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

