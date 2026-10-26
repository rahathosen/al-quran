import Link from "next/link";
import { Heart, Palette } from "lucide-react";
import PrayerTimesWidget from "./prayer-times-widget";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-8 border-t border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          {/* Left side - Prayer Times */}
          <div className="flex-1">
            <h3 className="text-base font-semibold mb-3 tracking-wide">Prayer Times</h3>
            <PrayerTimesWidget />
          </div>

          {/* Right side - Links and Info */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold mb-3 tracking-wide">Quick Links</h3>
                <ul className="space-y-2 text-sm text-primary-foreground/80">
                  <li>
                    <Link
                      href="/"
                      className="hover:text-primary-foreground transition-colors"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/1"
                      className="hover:text-primary-foreground transition-colors"
                    >
                      Al-Fatiha (The Opening)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/36"
                      className="hover:text-primary-foreground transition-colors"
                    >
                      Yasin
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/55"
                      className="hover:text-primary-foreground transition-colors"
                    >
                      Ar-Rahman
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/surah/67"
                      className="hover:text-primary-foreground transition-colors"
                    >
                      Al-Mulk
                    </Link>
                  </li>
                  <li className="pt-1">
                    <Link
                      href="/canvas"
                      className="inline-flex items-center gap-1.5 text-xs bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground px-2.5 py-1 rounded-md transition-colors font-medium"
                    >
                      <Palette className="h-3.5 w-3.5" />
                      <span>Verse Cards Creator</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-3 tracking-wide">About</h3>
                <p className="text-xs sm:text-sm text-primary-foreground/80 mb-2 leading-relaxed">
                  Al-Quran is a modern web application designed for reading,
                  studying, and listening to the Holy Quran.
                </p>
                <p className="text-xs sm:text-sm text-primary-foreground/80 leading-relaxed">
                  Features audio recitation across multiple reciters, word and concept AI search, and verse card generation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright and developer info */}
        <div className="mt-8 pt-4 border-t border-primary-foreground/15 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-primary-foreground/75">
          <p>Al-Quran • The Holy Quran</p>
          <p className="flex items-center">
            Developed with{" "}
            <Heart className="h-3 w-3 mx-1 text-red-400 fill-red-400" aria-label="love" /> by
            <a
              href="https://www.linkedin.com/in/rahathosen/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium ml-1 text-primary-foreground underline underline-offset-2 hover:opacity-90"
            >
              Rahat Hosen
            </a>
            <span className="ml-2 opacity-60">© {currentYear}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
