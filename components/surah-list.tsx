"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, SortAsc, SortDesc, BookOpen, Layers, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the Surah type
type Surah = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
  juz?: number
}

// Group surahs by juz
const groupByJuz = (surahs: Surah[]) => {
  // In a real implementation, we would have juz data for each surah
  // For this example, we'll simulate it by assigning juz based on surah number
  const surahsWithJuz = surahs.map((surah) => ({
    ...surah,
    juz: Math.ceil(surah.number / 4), // This is just a simulation, not accurate
  }))

  const juzGroups: Record<number, Surah[]> = {}

  surahsWithJuz.forEach((surah) => {
    const juz = surah.juz || 1
    if (!juzGroups[juz]) {
      juzGroups[juz] = []
    }
    juzGroups[juz].push(surah)
  })

  return juzGroups
}

interface SurahListProps {
  surahs: Surah[]
}

export default function SurahList({ surahs }: SurahListProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")

  // Sort surahs based on current sort order
  const sortedSurahs = [...surahs].sort((a, b) => {
    return sortOrder === "asc" ? a.number - b.number : b.number - a.number
  })

  // Group surahs by juz
  const juzGroups = groupByJuz(surahs)
  const juzNumbers = Object.keys(juzGroups)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-[#1a5e63] text-xl md:text-2xl font-semibold flex items-center">
          <span className="w-8 h-8 rounded-full bg-[#1a5e63] text-white flex items-center justify-center mr-3 flex-shrink-0">
            114
          </span>
          Surahs (Chapters)
        </h2>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#1a5e63] text-[#1a5e63]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSortOrder("asc")}
                className={sortOrder === "asc" ? "bg-[#1a5e63]/10" : ""}
              >
                <SortAsc className="mr-2 h-4 w-4" />
                Ascending (1-114)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOrder("desc")}
                className={sortOrder === "desc" ? "bg-[#1a5e63]/10" : ""}
              >
                <SortDesc className="mr-2 h-4 w-4" />
                Descending (114-1)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className={`border-[#1a5e63] ${viewMode === "grid" ? "bg-[#1a5e63] text-white" : "text-[#1a5e63]"}`}
            onClick={() => setViewMode("grid")}
          >
            <Layers className="mr-2 h-4 w-4" />
            Grid
          </Button>

          <Button
            variant="outline"
            className={`border-[#1a5e63] ${viewMode === "list" ? "bg-[#1a5e63] text-white" : "text-[#1a5e63]"}`}
            onClick={() => setViewMode("list")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="bg-[#f0ebe0] mb-4 overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="all" className="flex-shrink-0">
            All Surahs
          </TabsTrigger>
          {juzNumbers.map((juz) => (
            <TabsTrigger key={juz} value={`juz-${juz}`} className="flex-shrink-0">
              Juz {juz}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {sortedSurahs.map((surah) => (
                <SurahCard key={surah.number} surah={surah} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSurahs.map((surah) => (
                <SurahListItem key={surah.number} surah={surah} />
              ))}
            </div>
          )}
        </TabsContent>

        {juzNumbers.map((juz) => (
          <TabsContent key={juz} value={`juz-${juz}`}>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {juzGroups[juz]
                  .sort((a, b) => (sortOrder === "asc" ? a.number - b.number : b.number - a.number))
                  .map((surah) => (
                    <SurahCard key={surah.number} surah={surah} />
                  ))}
              </div>
            ) : (
              <div className="space-y-2">
                {juzGroups[juz]
                  .sort((a, b) => (sortOrder === "asc" ? a.number - b.number : b.number - a.number))
                  .map((surah) => (
                    <SurahListItem key={surah.number} surah={surah} />
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function SurahCard({ surah }: { surah: Surah }) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      className="bg-white rounded-lg shadow-md p-3 md:p-4 border border-[#d4af37]/20 hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#1a5e63] text-white flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-[#d4af37] transition-colors">
          {surah.number}
        </div>
        <div className="min-w-0">
          <div className="flex items-center">
            <h3 className="font-amiri text-lg md:text-xl text-[#333] truncate">{surah.name}</h3>
            {surah.revelationType === "Meccan" ? (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800">Meccan</span>
            ) : (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800">Medinan</span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#666] truncate">
            {surah.englishName} • {surah.numberOfAyahs} Verses
          </p>
          <p className="text-xs text-[#1a5e63] italic truncate mt-0.5">"{surah.englishNameTranslation}"</p>
        </div>
      </div>
    </Link>
  )
}

function SurahListItem({ surah }: { surah: Surah }) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      className="bg-white rounded-lg shadow-sm p-3 border border-[#d4af37]/20 hover:shadow-md transition-shadow flex items-center group"
    >
      <div className="w-8 h-8 rounded-full bg-[#1a5e63] text-white flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-[#d4af37] transition-colors">
        {surah.number}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h3 className="font-amiri text-lg text-[#333] truncate">{surah.name}</h3>
          <span className="mx-2 text-[#666]">•</span>
          <p className="text-sm text-[#666] truncate">{surah.englishName}</p>

          {surah.revelationType === "Meccan" ? (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800">Meccan</span>
          ) : (
            <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-800">Medinan</span>
          )}
        </div>

        <p className="text-xs text-[#1a5e63] italic truncate">
          "{surah.englishNameTranslation}" • {surah.numberOfAyahs} Verses
        </p>
      </div>

      <div className="ml-2 text-[#1a5e63]">
        <BookOpen className="h-4 w-4" />
      </div>
    </Link>
  )
}

