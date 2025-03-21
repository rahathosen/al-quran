"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getRecentSurahs, type RecentSurah } from "@/lib/local-storage"
import { Clock } from "lucide-react"

export default function RecentSurahs() {
  const [recentSurahs, setRecentSurahs] = useState<RecentSurah[]>([])

  useEffect(() => {
    setRecentSurahs(getRecentSurahs())
  }, [])

  if (recentSurahs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-[#d4af37]/20 text-center text-[#666]">
        <p>No recently read surahs</p>
        <p className="text-sm mt-1">Your recently read surahs will appear here</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {recentSurahs.map((surah) => (
        <Link
          href={`/surah/${surah.surahId}${surah.lastVerse ? `#verse-${surah.lastVerse}` : ""}`}
          key={surah.surahId}
          className="bg-white rounded-lg shadow-md p-3 md:p-4 border border-[#d4af37]/20 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center mr-3 flex-shrink-0">
              {surah.surahId}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-amiri text-lg text-[#333] truncate">{surah.surahName}</h3>
              <div className="flex items-center text-xs text-[#666]">
                <Clock className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {new Date(surah.lastRead).toLocaleDateString()} •{surah.lastVerse ? ` Verse ${surah.lastVerse}` : ""}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

