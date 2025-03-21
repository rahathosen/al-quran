// Types for the API responses
type Surah = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: string
}

type SurahDetail = Surah & {
  ayahs: {
    number: number
    text: string
    numberInSurah: number
    juz: number
    page: number
  }[]
}

type SurahResponse = {
  code: number
  status: string
  data: Surah[]
}

type SurahDetailResponse = {
  code: number
  status: string
  data: SurahDetail
}

// Cache the results to avoid unnecessary API calls
let surahsCache: Surah[] | null = null
const surahDetailCache = new Map<string, SurahDetail>() // Changed to string key for reciter+surah
const translationCache = new Map<string, SurahDetail>() // Changed to string key for translation+surah

/**
 * Fetches all surahs from the API
 */
export async function getAllSurahs(): Promise<Surah[]> {
  if (surahsCache) {
    return surahsCache
  }

  try {
    const response = await fetch("https://api.alquran.cloud/v1/surah")

    if (!response.ok) {
      throw new Error(`Failed to fetch surahs: ${response.status}`)
    }

    const data: SurahResponse = await response.json()

    if (data.code !== 200 || !data.data) {
      throw new Error("Invalid API response")
    }

    surahsCache = data.data
    return data.data
  } catch (error) {
    console.error("Error fetching surahs:", error)
    // Return empty array or throw error based on your error handling strategy
    return []
  }
}

/**
 * Fetches a specific surah by ID with a specific reciter
 */
export async function getSurahById(id: number, reciterId = "ar.alafasy"): Promise<SurahDetail | null> {
  const cacheKey = `${reciterId}-${id}`

  if (surahDetailCache.has(cacheKey)) {
    return surahDetailCache.get(cacheKey)!
  }

  try {
    // Using specified reciter
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/${reciterId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch surah ${id}: ${response.status}`)
    }

    const data: SurahDetailResponse = await response.json()

    if (data.code !== 200 || !data.data) {
      throw new Error("Invalid API response")
    }

    surahDetailCache.set(cacheKey, data.data)
    return data.data
  } catch (error) {
    console.error(`Error fetching surah ${id}:`, error)
    return null
  }
}

/**
 * Fetches the translation of a specific surah
 */
export async function getSurahTranslation(id: number, translationId = "en.asad"): Promise<SurahDetail | null> {
  const cacheKey = `${translationId}-${id}`

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  try {
    // Using specified translation
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/${translationId}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch translation for surah ${id}: ${response.status}`)
    }

    const data: SurahDetailResponse = await response.json()

    if (data.code !== 200 || !data.data) {
      throw new Error("Invalid API response")
    }

    translationCache.set(cacheKey, data.data)
    return data.data
  } catch (error) {
    console.error(`Error fetching translation for surah ${id}:`, error)
    return null
  }
}

/**
 * Constructs the audio URL for a verse based on reciter
 */
export function getVerseAudioUrl(surahId: number, verseNumber: number, reciterId = "alafasy"): string {
  // Format surah number (e.g., 1 -> "001", 10 -> "010")
  const formattedSurahNumber = surahId.toString().padStart(3, "0")
  // Format verse number (e.g., 1 -> "001", 10 -> "010")
  const formattedVerseNumber = verseNumber.toString().padStart(3, "0")

  // Map reciter IDs to their respective audio sources
  const reciterMap: Record<string, string> = {
    alafasy: "Alafasy_128kbps",
    minshawi: "Minshawy_Murattal_128kbps",
    husary: "Husary_128kbps",
    abdulbasit: "AbdulSamad_128kbps",
    sudais: "Abdurrahmaan_As-Sudais_128kbps",
    shatri: "Abu_Bakr_Ash-Shaatree_128kbps",
    ajamy: "Ahmed_ibn_Ali_al-Ajamy_128kbps",
    maher: "Maher_AlMuaiqly_128kbps",
  }

  const reciterPath = reciterMap[reciterId] || "Alafasy_128kbps"

  // Use the everyayah.com API which is more reliable for audio
  return `https://everyayah.com/data/${reciterPath}/${formattedSurahNumber}${formattedVerseNumber}.mp3`
}

/**
 * Preloads an audio file to check if it exists
 */
export async function preloadAudio(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio()

    audio.oncanplaythrough = () => {
      resolve(true)
    }

    audio.onerror = () => {
      resolve(false)
    }

    audio.src = url
    audio.load()
  })
}

