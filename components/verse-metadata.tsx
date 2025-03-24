"use client";

import { useEffect, useRef, useState } from "react";

interface VerseMetadataProps {
  verseNumber?: number;
  surahName?: string;
  juz?: number;
  page?: number;
}

export default function VerseMetadata({
  verseNumber = 1,
  surahName = "Al-Fatiha",
  juz = 1,
  page = 1,
}: VerseMetadataProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const metadataRef = useRef<HTMLDivElement>(null);

  // Set up scroll event listener to detect when to show the component
  useEffect(() => {
    const handleScroll = () => {
      // Get header height (assuming the header has a fixed height or we can get it)
      const headerHeight =
        document.querySelector("header")?.getBoundingClientRect().height || 200;

      // Show component when scrolled past header
      if (window.scrollY > headerHeight && !isVisible) {
        setIsVisible(true);
      } else if (window.scrollY <= headerHeight && isVisible) {
        setIsVisible(false);
      }

      // Check if component is sticky
      if (metadataRef.current && isVisible) {
        const rect = metadataRef.current.getBoundingClientRect();
        setIsSticky(rect.top === 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={metadataRef}
      className={`sticky top-0 z-20 flex items-center justify-between bg-[#1a5e63]/90 backdrop-blur-sm rounded-lg p-2 text-xs text-white border-b border-[#d4af37]/30 mb-4 shadow-md transition-all duration-300 ${
        isSticky ? "py-3" : ""
      }`}
    >
      <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md">
        <span className="font-semibold">Juz:</span>
        <span>{juz}</span>
      </div>

      <div className="font-medium text-center">
        <span>
          Surah {surahName} - Verse {verseNumber}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md">
        <span className="font-semibold">Page:</span>
        <span>{page}</span>
      </div>
    </div>
  );
}
