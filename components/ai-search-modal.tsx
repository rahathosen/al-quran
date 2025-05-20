"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Sparkles, Loader2, BookOpen, Eraser } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  surahNumber: number;
  verseNumber: number;
  surahName: string;
  englishName: string;
  verseText: string;
  translation: string;
  bengaliTranslation?: string; // Add Bengali translation field
};

export default function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load recent searches on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("quran-ai-recent-searches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Error parsing recent AI searches:", e);
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search submission
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        if (data.results.length === 0) {
          setError(
            "No verses found for this search term. Please try a different query."
          );
        } else {
          setResults(data.results);

          // Save to recent searches
          const newRecentSearches = [
            searchTerm.trim(),
            ...recentSearches.filter((s) => s !== searchTerm.trim()),
          ].slice(0, 5);

          setRecentSearches(newRecentSearches);
          localStorage.setItem(
            "quran-ai-recent-searches",
            JSON.stringify(newRecentSearches)
          );
        }
      } else {
        setError("No results found or invalid response format");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recent search click
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    // Auto-search when clicking a recent search
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Enter to submit search
      if (e.key === "Enter" && searchTerm.trim()) {
        e.preventDefault();
        handleSearch();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, searchTerm]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-lg shadow-xl z-50 flex flex-col">
        {/* Search header */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#d4af37]" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Quran with AI (e.g., 'patience', 'gratitude', 'forgiveness')"
            className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800"
          />

          {/* Ensure Erase button is fully visible */}
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="text-gray-600 hover:text-gray-800"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          )}

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </Button>
        </div>

        {/* Search button */}
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={handleSearch}
            className="w-full bg-[#1a5e63] hover:bg-[#134548]"
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search with AI
              </>
            )}
          </Button>
        </div>

        {/* Search results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              <p className="font-medium">
                High Traffic or Rate limit exceeded for Today
              </p>
              <p>Thanks for your patience. Please try again later.</p>
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-[#1a5e63] font-medium">
                Found {results.length} relevant verses:
              </h3>
              {results.map((result, index) => (
                <div
                  key={`${result.surahNumber}-${result.verseNumber}-${index}`}
                  className="bg-[#f8f5f0] p-4 rounded-lg border border-[#d4af37]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/surah/${result.surahNumber}#verse-${result.verseNumber}`}
                      className="text-[#1a5e63] font-medium hover:underline flex items-center"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Surah {result.englishName} ({result.surahNumber}:
                      {result.verseNumber})
                    </Link>
                    <span className="text-sm text-[#666]">
                      {result.surahName}
                    </span>
                  </div>

                  <p className="font-amiri text-[#555] text-right text-lg mb-2 leading-relaxed">
                    {result.verseText}
                  </p>
                  <p className="text-sm text-[#555] mb-2">
                    {result.translation}
                  </p>

                  {/* Add Bengali translation if available */}
                  {result.bengaliTranslation && (
                    <div className="mt-2 pt-2 border-t border-[#d4af37]/10">
                      <p className="text-sm text-[#555] font-medium">
                        Bengali Translation:
                      </p>
                      <p className="text-sm text-[#555]">
                        {result.bengaliTranslation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Recent AI Searches
                  </h3>
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

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f8f5f0] mb-4">
                  <Sparkles className="h-8 w-8 text-[#d4af37]" />
                </div>
                <h3 className="text-lg font-medium text-[#1a5e63] mb-2">
                  AI-Powered Quran Search
                </h3>
                <p className="text-[#555] mb-4">
                  Search for concepts, topics, or words in the Quran using
                  natural language. Results include Arabic text with English and
                  Bengali translations.
                </p>
                <div className="bg-[#f8f5f0] p-4 rounded-md text-left">
                  <h4 className="font-medium text-[#1a5e63] mb-2">
                    Example searches:
                  </h4>
                  <ul className="text-sm text-[#555] space-y-1">
                    <li>• Verses about patience and perseverance</li>
                    <li>• Mentions of forgiveness in the Quran</li>
                    <li>• Guidance on dealing with hardship</li>
                    <li>• Verses about gratitude to Allah</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
