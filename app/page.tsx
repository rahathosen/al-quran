import { Button } from "@/components/ui/button"
import { Clock, BookmarkIcon } from "lucide-react"
import { getAllSurahs } from "@/lib/quran-api"
import RecentSurahs from "@/components/recent-surahs"
import BookmarkedVerses from "@/components/bookmarked-verses"
import SearchButton from "@/components/search-button"
import AISearchButton from "@/components/ai-search-button"
import AISearchInfo from "@/components/ai-search-info"
import SurahList from "@/components/surah-list"

export default async function Home() {
  const surahs = await getAllSurahs()

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <header className="bg-[#1a5e63] text-white py-4 md:py-6 border-b border-[#d4af37]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0 text-center md:text-left">
              القرآن الكريم
              <span className="block text-lg font-normal text-[#d4af37]">Al-Quran Al-Kareem</span>
            </h1>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <SearchButton />
              <AISearchButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 md:mb-8 border border-[#d4af37]/20">
          <h2 className="text-[#1a5e63] text-xl md:text-2xl font-semibold mb-4">Welcome to Al-Quran Al-Kareem</h2>
          <p className="text-[#555] mb-4">
            Read and explore the Holy Quran with beautiful Arabic text and translations. Navigate through all 114
            Surahs.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-[#1a5e63] hover:bg-[#134548]">Start Reading</Button>
            <Button variant="outline" className="border-[#1a5e63] text-[#1a5e63]">
              Bookmarks
            </Button>
          </div>
        </div>

        {/* AI Search Info Section */}
        <AISearchInfo />

        {/* Recent Surahs Section */}
        <div className="mb-8">
          <h2 className="text-[#1a5e63] text-xl md:text-2xl font-semibold mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2" />
            Recently Read
          </h2>
          <RecentSurahs />
        </div>

        {/* Bookmarks Section */}
        <div className="mb-8">
          <h2 className="text-[#1a5e63] text-xl md:text-2xl font-semibold mb-4 flex items-center">
            <BookmarkIcon className="w-6 h-6 mr-2" />
            Bookmarked Verses
          </h2>
          <BookmarkedVerses />
        </div>

        <SurahList surahs={surahs} />
      </main>

      <footer className="bg-[#1a5e63] text-white py-4 md:py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>Al-Quran Al-Kareem • The Noble Quran</p>
          <p className="text-xs sm:text-sm mt-2 text-[#d4af37]">Read, Study, and Listen to the Holy Quran</p>
        </div>
      </footer>
    </div>
  )
}

