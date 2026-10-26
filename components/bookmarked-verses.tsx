"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getBookmarks,
  getBookmarkedSurahs,
  type BookmarkedVerse,
  type BookmarkedSurah,
} from "@/lib/local-storage";
import { BookmarkIcon, Book } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookmarkedVerses() {
  const [verseBookmarks, setVerseBookmarks] = useState<BookmarkedVerse[]>([]);
  const [surahBookmarks, setSurahBookmarks] = useState<BookmarkedSurah[]>([]);

  useEffect(() => {
    setVerseBookmarks(getBookmarks());
    setSurahBookmarks(getBookmarkedSurahs());
  }, []);

  const hasBookmarks = verseBookmarks.length > 0 || surahBookmarks.length > 0;

  if (!hasBookmarks) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-border text-center shadow-xs">
        <p className="font-medium text-foreground">No bookmarked items</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your bookmarked verses and surahs will appear here
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="verses" className="w-full">
      <TabsList className="mb-4 w-full grid grid-cols-2">
        <TabsTrigger value="verses" className="flex items-center gap-2">
          <BookmarkIcon className="h-4 w-4" />
          <span>Verses ({verseBookmarks.length})</span>
        </TabsTrigger>
        <TabsTrigger value="surahs" className="flex items-center gap-2">
          <Book className="h-4 w-4" />
          <span>Surahs ({surahBookmarks.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="verses">
        {verseBookmarks.length === 0 ? (
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border text-center">
            <p className="text-sm text-muted-foreground">No bookmarked verses yet</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {verseBookmarks.map((bookmark) => (
                <Link
                  href={`/surah/${bookmark.surahId}#verse-${bookmark.verseNumber}`}
                  key={`${bookmark.surahId}-${bookmark.verseNumber}`}
                  className="bg-card text-card-foreground rounded-xl p-3.5 border border-border/80 hover:border-primary/40 hover:shadow-xs transition-all duration-200 active:scale-[0.99] flex items-start gap-3 group"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 tabular-nums">
                    {bookmark.verseNumber}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-primary font-medium text-sm truncate">
                        Surah {bookmark.englishName}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(bookmark.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p
                      dir="rtl"
                      lang="ar"
                      className="font-amiri text-right text-base text-foreground mt-1 mb-1 line-clamp-2 leading-relaxed"
                    >
                      {bookmark.verseText}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="surahs">
        {surahBookmarks.length === 0 ? (
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border text-center">
            <p className="text-sm text-muted-foreground">No bookmarked surahs yet</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {surahBookmarks.map((bookmark) => (
                <Link
                  href={`/surah/${bookmark.surahId}`}
                  key={bookmark.surahId}
                  className="bg-card text-card-foreground rounded-xl p-3.5 border border-border/80 hover:border-primary/40 hover:shadow-xs transition-all duration-200 active:scale-[0.99] flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 tabular-nums">
                      {bookmark.surahId}
                    </div>
                    <div className="min-w-0">
                      <h3
                        dir="rtl"
                        lang="ar"
                        className="font-amiri text-base text-foreground font-semibold truncate group-hover:text-primary transition-colors"
                      >
                        {bookmark.surahName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {bookmark.englishName}
                      </p>
                    </div>
                  </div>
                  <BookmarkIcon className="h-4 w-4 text-primary shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
