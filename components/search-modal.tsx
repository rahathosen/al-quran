"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, BookOpen, FileText, Loader2 } from "lucide-react"
import { getAllSurahs } from "@/lib/quran-api"
import { useRouter } from "next/navigation"

type Surah = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
}

type SearchResult = {
  type: "surah" | "ayah"
  surahNumber: number
  surahName: string
  englishName: string
  ayahNumber?: number
  matchText?: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load surahs on mount
  useEffect(() => {
    const fetchSurahs = async () => {
      const data = await getAllSurahs()
      setSurahs(data)
    }
    fetchSurahs()

    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("quran-recent-searches")
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches))
      } catch (e) {
        console.error("Error parsing recent searches:", e)
      }
    }
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim() || !surahs.length) {
      setResults([])
      return
    }

    setIsLoading(true)

    // Normalize search term (remove diacritics, lowercase)
    const normalizedTerm = searchTerm.toLowerCase().trim()

    // Check if search term is a number
    const isNumber = /^\d+$/.test(normalizedTerm)

    // Search results
    const searchResults: SearchResult[] = []

    // Search for surah by number
    if (isNumber) {
      const surahNumber = Number.parseInt(normalizedTerm)

      // Search for exact surah number
      const exactSurah = surahs.find((s) => s.number === surahNumber)
      if (exactSurah) {
        searchResults.push({
          type: "surah",
          surahNumber: exactSurah.number,
          surahName: exactSurah.name,
          englishName: exactSurah.englishName,
        })
      }
    }

    // Search for surah:ayah format (e.g., "2:255" for Ayatul Kursi)
    if (normalizedTerm.includes(":")) {
      const [surahPart, ayahPart] = normalizedTerm.split(":")
      const surahNum = Number.parseInt(surahPart)
      const ayahNum = Number.parseInt(ayahPart)

      if (!isNaN(surahNum) && !isNaN(ayahNum)) {
        const surah = surahs.find((s) => s.number === surahNum)
        if (surah && ayahNum > 0 && ayahNum <= surah.numberOfAyahs) {
          searchResults.push({
            type: "ayah",
            surahNumber: surah.number,
            surahName: surah.name,
            englishName: surah.englishName,
            ayahNumber: ayahNum,
            matchText: `${surah.englishName} ${ayahNum}`,
          })
        }
      }
    }

    // Search for surah by name (Arabic or English)
    surahs.forEach((surah) => {
      // Check if surah name matches
      if (
        surah.name.toLowerCase().includes(normalizedTerm) ||
        surah.englishName.toLowerCase().includes(normalizedTerm) ||
        surah.englishNameTranslation.toLowerCase().includes(normalizedTerm)
      ) {
        // Only add if not already in results
        if (!searchResults.some((r) => r.type === "surah" && r.surahNumber === surah.number)) {
          searchResults.push({
            type: "surah",
            surahNumber: surah.number,
            surahName: surah.name,
            englishName: surah.englishName,
          })
        }
      }
    })

    setResults(searchResults)
    setIsLoading(false)
  }, [searchTerm, surahs])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }

      // Arrow navigation for results
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        // TODO: Implement arrow navigation
      }

      // Enter to select first result
      if (e.key === "Enter" && results.length > 0) {
        e.preventDefault()
        handleResultClick(results[0])
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose, results])

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    if (searchTerm.trim()) {
      const newRecentSearches = [searchTerm.trim(), ...recentSearches.filter((s) => s !== searchTerm.trim())].slice(
        0,
        5,
      )

      setRecentSearches(newRecentSearches)
      localStorage.setItem("quran-recent-searches", JSON.stringify(newRecentSearches))
    }

    if (result.type === "surah") {
      router.push(`/surah/${result.surahNumber}`)
    } else if (result.type === "ayah") {
      router.push(`/surah/${result.surahNumber}#verse-${result.ayahNumber}`)
    }
    onClose()
  }

  // Handle recent search click
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[80vh] bg-white rounded-lg shadow-xl z-50 flex flex-col">
        {/* Search header */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Search className="h-5 w-5 text-[#1a5e63]" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search surah name, number, or verse (e.g., 2:255)"
            className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm("")}
            className={`${!searchTerm ? "opacity-0" : "opacity-100"} transition-opacity`}
          >
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search results */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 text-[#1a5e63] animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.surahNumber}-${result.ayahNumber || ""}-${index}`}
                  className="w-full text-left p-3 hover:bg-[#f8f5f0] rounded-md transition-colors flex items-start gap-3 text-gray-800"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="bg-[#1a5e63] text-white p-2 rounded-full flex-shrink-0">
                    {result.type === "surah" ? <BookOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-medium text-[#1a5e63]">
                      {result.type === "surah"
                        ? `Surah ${result.englishName} (${result.surahNumber})`
                        : `${result.englishName}, Verse ${result.ayahNumber}`}
                    </div>
                    <div className="text-sm text-gray-600 font-amiri">
                      {result.surahName}
                      {result.type === "ayah" && ` - آية ${result.ayahNumber}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center p-4 text-gray-500">No results found for "{searchTerm}"</div>
          ) : (
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <button
                        key={`recent-${index}`}
                        className="text-sm bg-[#f8f5f0] hover:bg-[#e8e5e0] text-[#1a5e63] px-3 py-1 rounded-full"
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-center text-gray-500 mb-4">Search for a surah or verse</p>
              <div className="bg-[#f8f5f0] p-3 rounded-md">
                <h3 className="font-medium text-[#1a5e63] mb-2">Search tips:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Search by surah name (e.g., "Baqarah", "فاتحة")</li>
                  <li>• Search by surah number (e.g., "1", "114")</li>
                  <li>• Search for specific verse (e.g., "2:255" for Ayatul Kursi)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

