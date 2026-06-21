// lib/quran-data.ts
import { getAllSurahs, getSurahById, getSurahTranslation } from "./quran-api";

type FullSurahData = {
  surahNumber: number;
  arabicName: string;
  englishName: string;
  ayahs: {
    number: number; // verse number in surah
    arabic: string;
    english: string;
    bengali: string;
  }[];
};

// Global cache – populated once on first access
let quranDataCache: Map<number, FullSurahData> | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

/**
 * Fetch all surahs with all translations and store in memory.
 * Uses a concurrency limiter and retries to avoid rate limits.
 */
async function loadQuranData(): Promise<void> {
  if (quranDataCache) return;
  if (loadPromise) return loadPromise; // already loading

  isLoading = true;
  loadPromise = (async () => {
    const surahs = await getAllSurahs(); // cached list
    const map = new Map<number, FullSurahData>();

    // Helper to fetch with delay and retry
    const fetchWithRetry = async <T>(
      fn: () => Promise<T>,
      retries = 3,
    ): Promise<T> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await fn();
        } catch (err: any) {
          if (attempt === retries) throw err;
          // wait longer after each attempt
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
      throw new Error("Unreachable");
    };

    // Process surahs one by one (or in small batches) to avoid 429
    for (const surah of surahs) {
      const { number } = surah;
      try {
        // Fetch Arabic, English, Bengali with a small delay between calls
        const arabic = await fetchWithRetry(() =>
          getSurahById(number, "ar.alafasy"),
        );
        await new Promise((r) => setTimeout(r, 200)); // polite delay
        const english = await fetchWithRetry(() =>
          getSurahTranslation(number, "en.asad"),
        );
        await new Promise((r) => setTimeout(r, 200));
        const bengali = await fetchWithRetry(() =>
          getSurahTranslation(number, "bn.bengali"),
        );

        if (!arabic || !english || !bengali) {
          console.warn(`Skipping surah ${number}: missing data`);
          continue;
        }

        // Build verse array
        const ayahs = arabic.ayahs.map((ayah, i) => ({
          number: ayah.numberInSurah,
          arabic: ayah.text,
          english: english.ayahs?.[i]?.text || "",
          bengali: bengali.ayahs?.[i]?.text || "",
        }));

        map.set(number, {
          surahNumber: number,
          arabicName: arabic.name,
          englishName: arabic.englishName,
          ayahs,
        });
      } catch (err) {
        console.error(`Failed to load surah ${number}:`, err);
        // Continue with other surahs
      }
    }

    quranDataCache = map;
    isLoading = false;
  })();

  return loadPromise;
}

/**
 * Get verse data from the global cache. Ensures data is loaded.
 */
export async function getVerseData(surahNumber: number, verseNumber: number) {
  // Trigger loading if not yet done
  if (!quranDataCache) {
    await loadQuranData();
  }

  const surah = quranDataCache!.get(surahNumber);
  if (!surah) throw new Error(`Surah ${surahNumber} not found in cache`);

  const ayah = surah.ayahs[verseNumber - 1];
  if (!ayah)
    throw new Error(`Verse ${verseNumber} not found in surah ${surahNumber}`);

  return {
    surahNumber: surah.surahNumber,
    verseNumber: ayah.number,
    surahName: surah.arabicName,
    englishName: surah.englishName,
    verseText: ayah.arabic,
    translation: ayah.english,
    bengaliTranslation: ayah.bengali || null,
  };
}

// Optional: preload immediately (call this in your server startup)
export function preloadQuranData() {
  return loadQuranData();
}
