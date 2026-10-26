"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchModal from "@/components/search-modal"
import KeyboardShortcut from "@/components/keyboard-shortcut"
import { cn } from "@/lib/utils"

interface SearchButtonProps {
  className?: string
  size?: "default" | "sm"
}

export default function SearchButton({ className, size = "default" }: SearchButtonProps = {}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => setIsSearchOpen(false)

  return (
    <>
      <Button
        onClick={openSearch}
        size={size}
        className={cn(
          "bg-white/10 hover:bg-white/20 text-white border-none flex items-center gap-2 w-full md:w-auto transition-colors",
          className
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline flex-1 text-left truncate">Search surah or verse...</span>
        <span className="sm:hidden flex-1 text-left truncate">Search...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white opacity-70 shrink-0">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />

      <KeyboardShortcut shortcut="mod+k" action={openSearch} />
    </>
  )
}

