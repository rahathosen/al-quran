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
      <TabsList className="mb-4 w-full">
        <TabsTrigger value="verses" className="flex items-center gap-1 flex-1">
          <BookmarkIcon className="h-4 w-4" />
          <span>Verses ({verseBookmarks.length})</span>
        </TabsTrigger>
        <TabsTrigger value="surahs" className="flex items-center gap-1 flex-1">
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
          <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {verseBookmarks.map((bookmark) => (
                <Link
                  href={`/surah/${bookmark.surahId}#verse-${bookmark.verseNumber}`}
                  key={`${bookmark.surahId}-${bookmark.verseNumber}`}
                  className="bg-white rounded-lg shadow-sm p-3 border border-[#d4af37]/10 hover:shadow-md transition-shadow flex items-start"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#1a5e63]/10 text-[#1a5e63] flex items-center justify-center text-xs">
                      {bookmark.verseNumber}
                    </div>
                  </div>
                  <div className="ml-2 min-w-0 flex-1">
                    <h3 className="text-[#1a5e63] font-medium text-sm">
                      {bookmark.englishName}{" "}
                      <span className="text-[#666]">·</span>{" "}
                      {bookmark.surahName}
                    </h3>
                    <p className="font-amiri text-right text-base text-[#333] mt-1 mb-1 line-clamp-2">
                      {bookmark.verseText}
                    </p>
                    <div className="text-xs text-[#666]">
                      {new Date(bookmark.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
          <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {surahBookmarks.map((bookmark) => (
                <Link
                  href={`/surah/${bookmark.surahId}`}
                  key={bookmark.surahId}
                  className="bg-white rounded-lg shadow-sm p-3 border border-[#d4af37]/10 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#1a5e63]/10 text-[#1a5e63] flex items-center justify-center text-xs mr-2 flex-shrink-0">
                      {bookmark.surahId}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-amiri text-base text-[#333] truncate">
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
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
