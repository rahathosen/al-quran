"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import AISearchModal from "@/components/ai-search-modal"

export default function AISearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => setIsSearchOpen(false)

  return (
    <>
      <Button
        onClick={openSearch}
        className="bg-[#d4af37] hover:bg-[#c9a431] text-[#1a5e63] border-none flex items-center gap-2 w-full md:w-auto"
      >
        <Sparkles className="h-4 w-4" />
        <span className="flex-1 text-left">AI Quran Search</span>
      </Button>

      <AISearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  )
}

