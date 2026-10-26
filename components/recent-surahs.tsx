"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentSurahs, type RecentSurah } from "@/lib/local-storage";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentSurahs() {
  const [recentSurahs, setRecentSurahs] = useState<RecentSurah[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRecentSurahs(getRecentSurahs());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`recent-skeleton-${i}`}
            className="bg-card rounded-xl p-3.5 md:p-4 border border-border/60 flex items-center gap-3"
          >
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentSurahs.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-border text-center shadow-xs">
        <p className="font-medium text-foreground">No recently read surahs</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your recently read surahs will appear here automatically
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {recentSurahs.map((surah) => (
        <Link
          href={`/surah/${surah.surahId}${
            surah.lastVerse ? `#verse-${surah.lastVerse}` : ""
          }`}
          key={surah.surahId}
          className="bg-card text-card-foreground rounded-xl p-3.5 md:p-4 border border-border/80 hover:border-primary/40 hover:shadow-sm transition-all duration-200 active:scale-[0.98] group"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0 font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors tabular-nums">
              {surah.surahId}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                dir="rtl"
                lang="ar"
                className="font-amiri text-lg text-foreground font-semibold truncate group-hover:text-primary transition-colors"
              >
                {surah.surahName}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3 mr-1 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {new Date(surah.lastRead).toLocaleDateString()}
                  {surah.lastVerse ? ` • Verse ${surah.lastVerse}` : ""}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
