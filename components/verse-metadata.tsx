"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

// List of all surahs for the selector
const SURAHS = [
  { number: 1, name: "Al-Fatiha" },
  { number: 2, name: "Al-Baqarah" },
  { number: 3, name: "Aal-E-Imran" },
  { number: 4, name: "An-Nisa" },
  { number: 5, name: "Al-Ma'idah" },
  { number: 6, name: "Al-An'am" },
  { number: 7, name: "Al-A'raf" },
  { number: 8, name: "Al-Anfal" },
  { number: 9, name: "At-Tawbah" },
  { number: 10, name: "Yunus" },
  { number: 11, name: "Hud" },
  { number: 12, name: "Yusuf" },
  { number: 13, name: "Ar-Ra'd" },
  { number: 14, name: "Ibrahim" },
  { number: 15, name: "Al-Hijr" },
  { number: 16, name: "An-Nahl" },
  { number: 17, name: "Al-Isra" },
  { number: 18, name: "Al-Kahf" },
  { number: 19, name: "Maryam" },
  { number: 20, name: "Ta-Ha" },
  { number: 21, name: "Al-Anbiya" },
  { number: 22, name: "Al-Hajj" },
  { number: 23, name: "Al-Mu'minun" },
  { number: 24, name: "An-Nur" },
  { number: 25, name: "Al-Furqan" },
  { number: 26, name: "Ash-Shu'ara" },
  { number: 27, name: "An-Naml" },
  { number: 28, name: "Al-Qasas" },
  { number: 29, name: "Al-Ankabut" },
  { number: 30, name: "Ar-Rum" },
  { number: 31, name: "Luqman" },
  { number: 32, name: "As-Sajda" },
  { number: 33, name: "Al-Ahzab" },
  { number: 34, name: "Saba" },
  { number: 35, name: "Fatir" },
  { number: 36, name: "Ya-Sin" },
  { number: 37, name: "As-Saffat" },
  { number: 38, name: "Sad" },
  { number: 39, name: "Az-Zumar" },
  { number: 40, name: "Ghafir" },
  { number: 41, name: "Fussilat" },
  { number: 42, name: "Ash-Shura" },
  { number: 43, name: "Az-Zukhruf" },
  { number: 44, name: "Ad-Dukhan" },
  { number: 45, name: "Al-Jathiya" },
  { number: 46, name: "Al-Ahqaf" },
  { number: 47, name: "Muhammad" },
  { number: 48, name: "Al-Fath" },
  { number: 49, name: "Al-Hujurat" },
  { number: 50, name: "Qaf" },
  { number: 51, name: "Adh-Dhariyat" },
  { number: 52, name: "At-Tur" },
  { number: 53, name: "An-Najm" },
  { number: 54, name: "Al-Qamar" },
  { number: 55, name: "Ar-Rahman" },
  { number: 56, name: "Al-Waqi'a" },
  { number: 57, name: "Al-Hadid" },
  { number: 58, name: "Al-Mujadila" },
  { number: 59, name: "Al-Hashr" },
  { number: 60, name: "Al-Mumtahina" },
  { number: 61, name: "As-Saff" },
  { number: 62, name: "Al-Jumu'a" },
  { number: 63, name: "Al-Munafiqun" },
  { number: 64, name: "At-Taghabun" },
  { number: 65, name: "At-Talaq" },
  { number: 66, name: "At-Tahrim" },
  { number: 67, name: "Al-Mulk" },
  { number: 68, name: "Al-Qalam" },
  { number: 69, name: "Al-Haaqqa" },
  { number: 70, name: "Al-Ma'arij" },
  { number: 71, name: "Nuh" },
  { number: 72, name: "Al-Jinn" },
  { number: 73, name: "Al-Muzzammil" },
  { number: 74, name: "Al-Muddathir" },
  { number: 75, name: "Al-Qiyama" },
  { number: 76, name: "Al-Insan" },
  { number: 77, name: "Al-Mursalat" },
  { number: 78, name: "An-Naba" },
  { number: 79, name: "An-Nazi'at" },
  { number: 80, name: "Abasa" },
  { number: 81, name: "At-Takwir" },
  { number: 82, name: "Al-Infitar" },
  { number: 83, name: "Al-Mutaffifin" },
  { number: 84, name: "Al-Inshiqaq" },
  { number: 85, name: "Al-Buruj" },
  { number: 86, name: "At-Tariq" },
  { number: 87, name: "Al-A'la" },
  { number: 88, name: "Al-Ghashiya" },
  { number: 89, name: "Al-Fajr" },
  { number: 90, name: "Al-Balad" },
  { number: 91, name: "Ash-Shams" },
  { number: 92, name: "Al-Lail" },
  { number: 93, name: "Ad-Duha" },
  { number: 94, name: "Ash-Sharh" },
  { number: 95, name: "At-Tin" },
  { number: 96, name: "Al-Alaq" },
  { number: 97, name: "Al-Qadr" },
  { number: 98, name: "Al-Bayyina" },
  { number: 99, name: "Az-Zalzala" },
  { number: 100, name: "Al-Adiyat" },
  { number: 101, name: "Al-Qari'a" },
  { number: 102, name: "At-Takathur" },
  { number: 103, name: "Al-Asr" },
  { number: 104, name: "Al-Humaza" },
  { number: 105, name: "Al-Fil" },
  { number: 106, name: "Quraish" },
  { number: 107, name: "Al-Ma'un" },
  { number: 108, name: "Al-Kawthar" },
  { number: 109, name: "Al-Kafirun" },
  { number: 110, name: "An-Nasr" },
  { number: 111, name: "Al-Masad" },
  { number: 112, name: "Al-Ikhlas" },
  { number: 113, name: "Al-Falaq" },
  { number: 114, name: "An-Nas" },
];

interface VerseMetadataProps {
  verseNumber?: number;
  surahName?: string;
  surahNumber?: number;
  page?: number;
}

export default function VerseMetadata({
  verseNumber = 1,
  surahName = "Al-Fatiha",
  surahNumber = 1,
  page = 1,
}: VerseMetadataProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentVerse, setCurrentVerse] = useState(verseNumber);
  const [totalVerses, setTotalVerses] = useState(0);
  const metadataRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [currentSurah, setCurrentSurah] = useState(surahNumber);

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

  // Handle surah selection
  const handleSurahSelect = (value: string) => {
    const surahNum = Number.parseInt(value, 10);
    if (!isNaN(surahNum)) {
      // Navigate to the selected surah
      router.push(`/surah/${surahNum}`);
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
      <div className="text-center">
        <Select
          value={currentVerse.toString()}
          onValueChange={handleVerseSelect}
        >
          <SelectTrigger className="h-6  text-xs min-w-[80px] bg-white/10 border-none text-white">
            <span className="font-semibold">Verse {currentVerse}</span>
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
      <div className="flex items-center">
        <Select
          value={currentSurah.toString()}
          onValueChange={handleSurahSelect}
        >
          <SelectTrigger className="h-6 min-w-[100px] bg-white/10 border-none text-white">
            <span className="truncate text-xs font-semibold"> {surahName}</span>
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {SURAHS.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  {surah.number}. {surah.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      <div className="flex text-xs items-center gap-1 px-2 py-1 bg-white/10 rounded-md">
        <span className="font-semibold">Page:</span>
        <span>{currentPage}</span>
      </div>
    </div>
  );
}
