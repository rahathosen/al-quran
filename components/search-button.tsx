"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchModal from "@/components/search-modal"
import KeyboardShortcut from "@/components/keyboard-shortcut"

export default function SearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => setIsSearchOpen(false)

  return (
    <>
      <Button
        onClick={openSearch}
        className="bg-white/10 hover:bg-white/20 text-white border-none flex items-center gap-2 w-full md:w-auto"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search surah or verse...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white opacity-70">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      <KeyboardShortcut shortcut="mod+k" action={openSearch} />
    </>
  )
}

