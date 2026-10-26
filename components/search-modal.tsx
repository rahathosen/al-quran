"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, BookOpen, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllSurahs } from "@/lib/quran-api";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
};

type SearchResult = {
  type: "surah" | "ayah";
  surahNumber: number;
  surahName: string;
  englishName: string;
  ayahNumber?: number;
  matchText?: string;
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load surahs on mount
  useEffect(() => {
    const fetchSurahs = async () => {
      const data = await getAllSurahs();
      setSurahs(data);
    };
    fetchSurahs();

    const savedSearches = localStorage.getItem("quran-recent-searches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Error parsing recent searches:", e);
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim() || !surahs.length) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const normalizedTerm = searchTerm.toLowerCase().trim();
    const isNumber = /^\d+$/.test(normalizedTerm);
    const searchResults: SearchResult[] = [];

    // Search for surah by number
    if (isNumber) {
      const surahNumber = Number.parseInt(normalizedTerm, 10);
      const exactSurah = surahs.find((s) => s.number === surahNumber);
      if (exactSurah) {
        searchResults.push({
          type: "surah",
          surahNumber: exactSurah.number,
          surahName: exactSurah.name,
          englishName: exactSurah.englishName,
        });
      }
    }

    // Search for surah:ayah format (e.g., "2:255")
    if (normalizedTerm.includes(":")) {
      const [surahPart, ayahPart] = normalizedTerm.split(":");
      const surahNum = Number.parseInt(surahPart, 10);
      const ayahNum = Number.parseInt(ayahPart, 10);

      if (!isNaN(surahNum) && !isNaN(ayahNum)) {
        const surah = surahs.find((s) => s.number === surahNum);
        if (surah && ayahNum > 0 && ayahNum <= surah.numberOfAyahs) {
          searchResults.push({
            type: "ayah",
            surahNumber: surah.number,
            surahName: surah.name,
            englishName: surah.englishName,
            ayahNumber: ayahNum,
            matchText: `${surah.englishName} ${ayahNum}`,
          });
        }
      }
    }

    // Search for surah by name (Arabic or English)
    surahs.forEach((surah) => {
      if (
        surah.name.toLowerCase().includes(normalizedTerm) ||
        surah.englishName.toLowerCase().includes(normalizedTerm) ||
        surah.englishNameTranslation.toLowerCase().includes(normalizedTerm)
      ) {
        if (!searchResults.some((r) => r.type === "surah" && r.surahNumber === surah.number)) {
          searchResults.push({
            type: "surah",
            surahNumber: surah.number,
            surahName: surah.name,
            englishName: surah.englishName,
          });
        }
      }
    });

    setResults(searchResults);
    setIsLoading(false);
  }, [searchTerm, surahs]);

  const handleResultClick = (result: SearchResult) => {
    if (searchTerm.trim()) {
      const newRecentSearches = [
        searchTerm.trim(),
        ...recentSearches.filter((s) => s !== searchTerm.trim()),
      ].slice(0, 5);

      setRecentSearches(newRecentSearches);
      localStorage.setItem("quran-recent-searches", JSON.stringify(newRecentSearches));
    }

    if (result.type === "surah") {
      router.push(`/surah/${result.surahNumber}`);
    } else if (result.type === "ayah") {
      router.push(`/surah/${result.surahNumber}#verse-${result.ayahNumber}`);
    }
    onClose();
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 gap-0 overflow-hidden bg-card text-card-foreground border-border shadow-xl">
        <DialogHeader className="p-4 pb-2 border-b border-border/80">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <span>Search Quran</span>
          </DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="p-3 border-b border-border/60 flex items-center gap-2 bg-muted/20">
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Surah name, number, or verse (e.g., 2:255)"
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm h-9"
            aria-label="Search term input"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-1">

              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`search-skeleton-${i}`}
                  className="w-full p-3 rounded-xl border border-border/50 flex items-center gap-3 bg-muted/20"
                >
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Skeleton className="h-4 w-1/3 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.surahNumber}-${result.ayahNumber || ""}-${index}`}
                  className="w-full text-left p-3 hover:bg-muted/60 rounded-xl transition-colors flex items-center gap-3 text-foreground active:scale-[0.99]"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {result.type === "surah" ? (
                      <BookOpen className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                      <span>
                        {result.type === "surah"
                          ? `Surah ${result.englishName} (${result.surahNumber})`
                          : `${result.englishName}, Verse ${result.ayahNumber}`}
                      </span>
                      <span dir="rtl" lang="ar" className="font-amiri text-base text-primary">
                        {result.surahName}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center p-8 text-sm text-muted-foreground">
              No results found for &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, index) => (
                      <button
                        key={`recent-${index}`}
                        className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full transition-colors"
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-xs text-muted-foreground space-y-1.5">
                <p className="font-medium text-foreground">Search tips:</p>
                <p>• Search by surah name (e.g., &quot;Baqarah&quot;, &quot;فاتحة&quot;)</p>
                <p>• Search by number (e.g., &quot;1&quot;, &quot;114&quot;)</p>
                <p>• Search specific verse (e.g., &quot;2:255&quot; for Ayatul Kursi)</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
