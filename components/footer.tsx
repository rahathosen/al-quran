import Link from "next/link";
import { Heart, Palette } from "lucide-react";
import PrayerTimesWidget from "./prayer-times-widget";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a5e63] text-white py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          {/* Left side - Prayer Times */}
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-3">Prayer Times</h3>
            <PrayerTimesWidget />
          </div>

          {/* Right side - Links and Info */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/"
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/1"
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Al-Fatiha
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/36"
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Yasin
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/55"
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Ar-Rahman
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/67"
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      Al-Mulk
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/canvas"
                      className="flex items-center gap-1.5 text-sm bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-white px-2 py-1 rounded-md transition-colors group"
                    >
                      <Palette className="h-3.5 w-3.5 text-[#d4af37] group-hover:text-white transition-colors" />
                      <span className="font-medium">Verse Cards Creator</span>
                      <span className="bg-[#d4af37] text-[#1a5e63] text-[10px] px-1 py-0.5 rounded-sm font-bold">
                        NEW
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">About</h3>
                <p className="text-sm text-white/80 mb-2">
                  Al-Quran Al-Kareem is a web application designed to help
                  Muslims read, study, and listen to the Holy Quran.
                </p>
                <p className="text-sm text-white/80">
                  Features include audio recitation, translations, bookmarks,
                  and AI-powered search.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright and developer info */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-white/80">
              Al-Quran Al-Kareem • The Noble Quran
            </p>
            <p className="text-xs text-[#d4af37] mt-1">
              Read, Study, and Listen to the Holy Quran
            </p>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-white/80 flex items-center justify-center md:justify-end">
              Developed with{" "}
              <Heart className="h-3 w-3 mx-1 text-red-400 fill-red-400" /> by
              <span className="font-medium ml-1 text-[#d4af37]">
                Rahat Hosen
              </span>
            </p>
            <p className="text-xs text-white/60 mt-1">
              © {currentYear} All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
