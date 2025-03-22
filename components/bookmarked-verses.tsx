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
      <div className="bg-white rounded-lg shadow-md p-4 border border-[#d4af37]/20 text-center text-[#666]">
        <p>No bookmarked items</p>
        <p className="text-sm mt-1">
          Your bookmarked verses and surahs will appear here
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="verses">
      <TabsList className="mb-4">
        <TabsTrigger value="verses" className="flex items-center gap-1">
          <BookmarkIcon className="h-4 w-4" />
          <span>Verses ({verseBookmarks.length})</span>
        </TabsTrigger>
        <TabsTrigger value="surahs" className="flex items-center gap-1">
          <Book className="h-4 w-4" />
          <span>Surahs ({surahBookmarks.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="verses">
        {verseBookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 border border-[#d4af37]/20 text-center text-[#666]">
            <p>No bookmarked verses</p>
            <p className="text-sm mt-1">
              Your bookmarked verses will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {verseBookmarks.map((bookmark) => (
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
                      Surah {bookmark.englishName} - Verse{" "}
                      {bookmark.verseNumber}
                    </h3>
                    <p className="font-amiri text-right text-lg text-[#333] mt-2 mb-1 line-clamp-2">
                      {bookmark.verseText}
                    </p>
                    <div className="text-xs text-[#666]">
                      {new Date(bookmark.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="surahs">
        {surahBookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 border border-[#d4af37]/20 text-center text-[#666]">
            <p>No bookmarked surahs</p>
            <p className="text-sm mt-1">
              Your bookmarked surahs will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {surahBookmarks.map((bookmark) => (
              <Link
                href={`/surah/${bookmark.surahId}`}
                key={bookmark.surahId}
                className="bg-white rounded-lg shadow-md p-3 md:p-4 border border-[#d4af37]/20 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1a5e63] text-white flex items-center justify-center mr-3 flex-shrink-0">
                    {bookmark.surahId}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-amiri text-lg text-[#333] truncate">
                      {bookmark.surahName}
                    </h3>
                    <p className="text-xs text-[#666]">
                      {bookmark.englishName} •{" "}
                      {new Date(bookmark.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <BookmarkIcon className="h-4 w-4 text-[#d4af37] ml-2" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
