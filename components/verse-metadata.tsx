"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [currentPage, setCurrentPage] = useState(page);
  const [currentVerse, setCurrentVerse] = useState(verseNumber);
  const [totalVerses, setTotalVerses] = useState(0);
  const metadataRef = useRef<HTMLDivElement>(null);

  // Set up scroll event listener to detect when to show the component
  useEffect(() => {
    // Get total number of verses
    const verseElements = document.querySelectorAll('[id^="verse-"]');
    setTotalVerses(verseElements.length);

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

      // Find the current verse in view and update page number
      const verseElements = document.querySelectorAll('[id^="verse-"]');
      if (verseElements.length === 0) return;

      // Find which verse is most visible in the viewport
      let mostVisibleVerse = null;
      let maxVisibleArea = 0;

      verseElements.forEach((verse) => {
        const rect = verse.getBoundingClientRect();

        // Calculate how much of the element is visible in the viewport
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(window.innerHeight, rect.bottom);

        if (visibleBottom > visibleTop) {
          const visibleArea = visibleBottom - visibleTop;
          if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            mostVisibleVerse = verse;
          }
        }
      });

      if (mostVisibleVerse) {
        // Extract verse number from the ID
        const verseId = mostVisibleVerse.id;
        const verseNum = Number.parseInt(verseId.replace("verse-", ""), 10);

        // Update current verse
        if (!isNaN(verseNum) && verseNum !== currentVerse) {
          setCurrentVerse(verseNum);
        }

        // Find the page number for this verse
        const pageElement = mostVisibleVerse.querySelector(".verse-page");
        if (pageElement && pageElement.textContent) {
          const newPage = Number.parseInt(pageElement.textContent, 10);
          if (!isNaN(newPage) && newPage !== currentPage) {
            setCurrentPage(newPage);
          }
        } else {
          // Alternative: look for page info in a data attribute
          const pageAttr = mostVisibleVerse.getAttribute("data-page");
          if (pageAttr) {
            const newPage = Number.parseInt(pageAttr, 10);
            if (!isNaN(newPage) && newPage !== currentPage) {
              setCurrentPage(newPage);
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible, currentPage, currentVerse]);

  // Handle verse selection
  const handleVerseSelect = (value: string) => {
    const verseNum = Number.parseInt(value, 10);
    if (!isNaN(verseNum)) {
      // Scroll to the selected verse
      const verseElement = document.getElementById(`verse-${verseNum}`);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
        setCurrentVerse(verseNum);
      }
    }
  };

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
        <Select
          value={currentVerse.toString()}
          onValueChange={handleVerseSelect}
        >
          <SelectTrigger className="h-7 min-w-[120px] bg-white/10 border-none text-white">
            <span>
              Surah {surahName} - Verse {currentVerse}
            </span>
            {/* <ChevronDown className="h-3 w-3 opacity-50" /> */}
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {Array.from({ length: totalVerses }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Verse {i + 1}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md">
        <span className="font-semibold">Page:</span>
        <span>{currentPage}</span>
      </div>
    </div>
  );
}
