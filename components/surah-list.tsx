"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  SortAsc,
  SortDesc,
  BookOpen,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  juz?: number;
};

interface SurahListProps {
  surahs: Surah[];
}

export default function SurahList({ surahs }: SurahListProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sortedSurahs = [...surahs].sort((a, b) => {
    return sortOrder === "asc" ? a.number - b.number : b.number - a.number;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-foreground text-xl md:text-2xl font-bold flex items-center gap-3">
          <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm md:text-base font-bold tabular-nums">
            114
          </span>
          <span>Surahs (Chapters)</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                aria-label="Sort Surahs"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setSortOrder("asc")}
                className={sortOrder === "asc" ? "bg-accent font-medium" : ""}
              >
                <SortAsc className="mr-2 h-4 w-4" />
                Ascending (1–114)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOrder("desc")}
                className={sortOrder === "desc" ? "bg-accent font-medium" : ""}
              >
                <SortDesc className="mr-2 h-4 w-4" />
                Descending (114–1)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Grid
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            List
          </Button>
        </div>
      </div>

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
    </div>
  );
}

function SurahCard({ surah }: { surah: Surah }) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      className="bg-card text-card-foreground rounded-xl p-3.5 md:p-4 border border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200 active:scale-[0.98] group flex flex-col justify-between"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground font-bold text-sm transition-colors tabular-nums">
          {surah.number}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h3
              dir="rtl"
              lang="ar"
              className="font-amiri text-lg md:text-xl text-foreground font-semibold truncate group-hover:text-primary transition-colors"
            >
              {surah.name}
            </h3>
            {surah.revelationType === "Meccan" ? (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                Meccan
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                Medinan
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {surah.englishName} • {surah.numberOfAyahs} Verses
          </p>
          <p className="text-xs text-primary italic truncate mt-0.5 opacity-90">
            &quot;{surah.englishNameTranslation}&quot;
          </p>
        </div>
      </div>
    </Link>
  );
}

function SurahListItem({ surah }: { surah: Surah }) {
  return (
    <Link
      href={`/surah/${surah.number}`}
      className="bg-card text-card-foreground rounded-xl p-3 border border-border/80 hover:border-primary/40 hover:shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center group"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0 group-hover:bg-primary group-hover:text-primary-foreground font-bold text-xs transition-colors tabular-nums">
        {surah.number}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            dir="rtl"
            lang="ar"
            className="font-amiri text-base md:text-lg text-foreground font-semibold truncate group-hover:text-primary transition-colors"
          >
            {surah.name}
          </h3>
          <span className="text-muted-foreground/60">•</span>
          <p className="text-sm font-medium text-foreground truncate">{surah.englishName}</p>

          {surah.revelationType === "Meccan" ? (
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Meccan
            </span>
          ) : (
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              Medinan
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground truncate mt-0.5">
          &quot;{surah.englishNameTranslation}&quot; • {surah.numberOfAyahs} Verses
        </p>
      </div>

      <div className="ml-3 text-muted-foreground group-hover:text-primary transition-colors">
        <BookOpen className="h-4 w-4" />
      </div>
    </Link>
  );
}
