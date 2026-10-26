"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  juz?: number;
}

export default function VerseMetadata({
  verseNumber = 1,
  surahName = "Al-Fatiha",
  surahNumber = 1,
  page = 1,
}: VerseMetadataProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentVerse, setCurrentVerse] = useState(verseNumber);
  const [totalVerses, setTotalVerses] = useState(0);
  const metadataRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use IntersectionObserver to efficiently track visible verses without scroll layout thrashing
  useEffect(() => {
    const verseElements = document.querySelectorAll<HTMLElement>('[id^="verse-"]');
    setTotalVerses(verseElements.length);

    if (verseElements.length === 0) return;

    // Observe verses entering/exiting viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const verseId = el.id;
            const verseNum = Number.parseInt(verseId.replace("verse-", ""), 10);
            if (!isNaN(verseNum)) {
              setCurrentVerse(verseNum);
            }

            const pageAttr = el.getAttribute("data-page");
            if (pageAttr) {
              const newPage = Number.parseInt(pageAttr, 10);
              if (!isNaN(newPage)) {
                setCurrentPage(newPage);
              }
            } else {
              const pageElement = el.querySelector(".verse-page");
              if (pageElement && pageElement.textContent) {
                const newPage = Number.parseInt(pageElement.textContent, 10);
                if (!isNaN(newPage)) {
                  setCurrentPage(newPage);
                }
              }
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    verseElements.forEach((el) => observer.observe(el));

    // Handle visibility of floating bar
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const headerHeight =
            document.querySelector("header")?.getBoundingClientRect().height || 180;
          setIsVisible(window.scrollY > headerHeight);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle verse selection
  const handleVerseSelect = (value: string) => {
    const verseNum = Number.parseInt(value, 10);
    if (!isNaN(verseNum)) {
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
      router.push(`/surah/${surahNum}`);
    }
  };

  const handlePrevSurah = () => {
    if (surahNumber > 1) {
      router.push(`/surah/${surahNumber - 1}`);
    }
  };

  const handleNextSurah = () => {
    if (surahNumber < 114) {
      router.push(`/surah/${surahNumber + 1}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={metadataRef}
      className="sticky top-0 sm:top-2 z-30 -mx-4 sm:mx-0 px-3 sm:px-4 py-2 sm:rounded-2xl bg-card/95 backdrop-blur-md border-b sm:border border-border/80 shadow-xs sm:shadow-md mb-4 sm:mb-6 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full">
        {/* Left group: Surah Navigation & Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            onClick={handlePrevSurah}
            disabled={surahNumber <= 1}
            title={
              surahNumber > 1
                ? `Previous: Surah ${surahNumber - 1} (${SURAHS[surahNumber - 2]?.name})`
                : "First Surah"
            }
            aria-label="Previous Surah"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={surahNumber.toString()}
            onValueChange={handleSurahSelect}
          >
            <SelectTrigger
              className="h-8 text-xs font-semibold bg-muted/60 border border-border/60 hover:bg-muted font-medium rounded-lg px-2 sm:px-2.5 max-w-[125px] sm:max-w-[170px] truncate transition-colors"
              aria-label="Select Surah"
            >
              <span className="truncate">
                {surahNumber}. {surahName}
              </span>
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[300px]">
                {SURAHS.map((surah) => (
                  <SelectItem
                    key={surah.number}
                    value={surah.number.toString()}
                  >
                    {surah.number}. {surah.name}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            onClick={handleNextSurah}
            disabled={surahNumber >= 114}
            title={
              surahNumber < 114
                ? `Next: Surah ${surahNumber + 1} (${SURAHS[surahNumber]?.name})`
                : "Last Surah"
            }
            aria-label="Next Surah"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Right group: Verse Jump & Page Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Select
            value={currentVerse.toString()}
            onValueChange={handleVerseSelect}
          >
            <SelectTrigger
              className="h-8 text-xs min-w-[76px] sm:min-w-[85px] bg-muted/60 border border-border/60 hover:bg-muted font-medium rounded-lg px-2 sm:px-2.5 transition-colors"
              aria-label="Select verse number"
            >
              <span>Verse {currentVerse}</span>
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {Array.from({ length: totalVerses || 1 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Verse {i + 1}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>

          <div className="h-8 px-2 sm:px-2.5 flex items-center gap-1 bg-muted/50 border border-border/50 rounded-lg text-[11px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">
            <span className="hidden sm:inline">Page</span>
            <span className="sm:hidden">P.</span>
            <span className="tabular-nums font-semibold text-foreground">
              {currentPage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
