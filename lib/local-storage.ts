// Types for stored data
export type BookmarkedVerse = {
  surahId: number
  surahName: string
  englishName: string
  verseNumber: number
  verseText: string
  timestamp: number
}

export type RecentSurah = {
  surahId: number
  surahName: string
  englishName: string
  lastRead: number // timestamp
  lastVerse?: number // last verse read
}

// Storage keys
const STORAGE_KEYS = {
  BOOKMARKS: "quran-bookmarks",
  RECENT_SURAHS: "quran-recent-surahs",
  SETTINGS: "quran-settings",
}

// Get bookmarked verses
export function getBookmarks(): BookmarkedVerse[] {
  if (typeof window === "undefined") return []

  try {
    const bookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
    return bookmarks ? JSON.parse(bookmarks) : []
  } catch (error) {
    console.error("Error getting bookmarks:", error)
    return []
  }
}

// Add a bookmark
export function addBookmark(bookmark: BookmarkedVerse): void {
  if (typeof window === "undefined") return

  try {
    const bookmarks = getBookmarks()

    // Check if this verse is already bookmarked
    const existingIndex = bookmarks.findIndex(
      (b) => b.surahId === bookmark.surahId && b.verseNumber === bookmark.verseNumber,
    )

    if (existingIndex >= 0) {
      // Update existing bookmark
      bookmarks[existingIndex] = bookmark
    } else {
      // Add new bookmark
      bookmarks.push(bookmark)
    }

    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks))
  } catch (error) {
    console.error("Error adding bookmark:", error)
  }
}

// Remove a bookmark
export function removeBookmark(surahId: number, verseNumber: number): void {
  if (typeof window === "undefined") return

  try {
    const bookmarks = getBookmarks()
    const filteredBookmarks = bookmarks.filter((b) => !(b.surahId === surahId && b.verseNumber === verseNumber))

    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filteredBookmarks))
  } catch (error) {
    console.error("Error removing bookmark:", error)
  }
}

// Check if a verse is bookmarked
export function isVerseBookmarked(surahId: number, verseNumber: number): boolean {
  if (typeof window === "undefined") return false

  try {
    const bookmarks = getBookmarks()
    return bookmarks.some((b) => b.surahId === surahId && b.verseNumber === verseNumber)
  } catch (error) {
    console.error("Error checking bookmark:", error)
    return false
  }
}

// Get recent surahs
export function getRecentSurahs(): RecentSurah[] {
  if (typeof window === "undefined") return []

  try {
    const recentSurahs = localStorage.getItem(STORAGE_KEYS.RECENT_SURAHS)
    return recentSurahs ? JSON.parse(recentSurahs) : []
  } catch (error) {
    console.error("Error getting recent surahs:", error)
    return []
  }
}

// Add or update a recent surah
export function updateRecentSurah(surah: RecentSurah): void {
  if (typeof window === "undefined") return

  try {
    const recentSurahs = getRecentSurahs()

    // Check if this surah is already in recents
    const existingIndex = recentSurahs.findIndex((s) => s.surahId === surah.surahId)

    if (existingIndex >= 0) {
      // Update existing entry
      recentSurahs[existingIndex] = surah
    } else {
      // Add new entry
      recentSurahs.push(surah)
    }

    // Sort by most recent and limit to 5
    const sortedSurahs = recentSurahs.sort((a, b) => b.lastRead - a.lastRead).slice(0, 5)

    localStorage.setItem(STORAGE_KEYS.RECENT_SURAHS, JSON.stringify(sortedSurahs))
  } catch (error) {
    console.error("Error updating recent surah:", error)
  }
}

// Get user settings
export function getSettings(): Record<string, any> {
  if (typeof window === "undefined") return {}

  try {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    const parsedSettings = settings ? JSON.parse(settings) : {}

    // Set cookies for server components to access
    if (typeof document !== "undefined") {
      document.cookie = `quran-settings=${JSON.stringify(parsedSettings)}; path=/; max-age=31536000; SameSite=Lax`
    }

    return parsedSettings
  } catch (error) {
    console.error("Error getting settings:", error)
    return {}
  }
}

// Save user settings
export function saveSettings(settings: Record<string, any>): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))

    // Set cookies for server components to access
    if (typeof document !== "undefined") {
      document.cookie = `quran-settings=${JSON.stringify(settings)}; path=/; max-age=31536000; SameSite=Lax`
    }
  } catch (error) {
    console.error("Error saving settings:", error)
  }
}

