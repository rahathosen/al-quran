"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Loader2, BookOpen, Eraser } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  bengaliTranslation?: string;
  explanation?: string;
};

export default function AISearchModal({ isOpen, onClose }: AISearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
            "No verses found for this query. Please try phrasing your search differently."
          );
        } else {
          setResults(data.results);

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
        setError("No results found or invalid response format.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-2xl p-0 gap-0 overflow-hidden bg-card text-card-foreground border-border shadow-2xl">
        <DialogHeader className="p-4 pb-2 border-b border-border/80">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Quran Search</span>
          </DialogTitle>
        </DialogHeader>

        {/* Input Bar */}
        <div className="p-3 border-b border-border/60 flex items-center gap-2 bg-muted/20">
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search concepts (e.g. 'patience in hardship', 'gratitude')"
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm h-9"
            aria-label="AI search query"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Clear query input"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={isLoading || !searchTerm.trim()}
            className="h-9 gap-1.5"
            aria-label="Submit AI search"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>

        {/* Content Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3.5 rounded-xl text-sm mb-4">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary">
                Found {results.length} relevant verses:
              </h3>

              {results.map((result, index) => (
                <div
                  key={`${result.surahNumber}-${result.verseNumber}-${index}`}
                  className="bg-muted/30 p-4 rounded-xl border border-border/70 space-y-2.5"
                >
                  {result.explanation && (
                    <p className="text-xs sm:text-sm text-foreground/85 italic border-l-2 border-primary pl-3 py-0.5">
                      {result.explanation}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/surah/${result.surahNumber}#verse-${result.verseNumber}`}
                      onClick={onClose}
                      className="text-primary font-semibold text-sm hover:underline flex items-center gap-1.5"
                    >
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span>
                        Surah {result.englishName} ({result.surahNumber}:{result.verseNumber})
                      </span>
                    </Link>
                    <span dir="rtl" lang="ar" className="font-amiri text-base text-foreground font-semibold">
                      {result.surahName}
                    </span>
                  </div>

                  <p
                    dir="rtl"
                    lang="ar"
                    className="font-amiri text-right text-lg sm:text-xl text-foreground leading-loose"
                  >
                    {result.verseText}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {result.translation}
                  </p>

                  {result.bengaliTranslation && (
                    <div className="pt-2 border-t border-border/40 text-xs sm:text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Bengali: </span>
                      {result.bengaliTranslation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Recent AI Searches
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, index) => (
                      <button
                        key={`recent-ai-${index}`}
                        className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2.5 py-1 rounded-full transition-colors"
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground text-base mb-1">
                  Ask about themes, virtues, and life questions
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-4 text-pretty">
                  Enter questions or topics in plain English. The AI matches conceptual meaning across all 6,236 Ayahs.
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto text-xs">
                  {["Patience in trials", "Mercy and forgiveness", "Honoring parents", "Gratitude in ease"].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleRecentSearchClick(prompt)}
                      className="bg-muted/60 hover:bg-muted border border-border px-3 py-1.5 rounded-lg text-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
