"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import AISearchModal from "@/components/ai-search-modal"
import { cn } from "@/lib/utils"

interface AISearchButtonProps {
  className?: string
  size?: "default" | "sm"
}

export default function AISearchButton({ className, size = "default" }: AISearchButtonProps = {}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => setIsSearchOpen(false)

  return (
    <>
      <Button
        onClick={openSearch}
        size={size}
        className={cn(
          "bg-[#d4af37] hover:bg-[#c9a431] text-[#1a5e63] font-medium border-none flex items-center gap-2 w-full md:w-auto transition-colors",
          className
        )}
      >
        <Sparkles className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline flex-1 text-left truncate">AI Quran Search</span>
        <span className="sm:hidden flex-1 text-left truncate">AI Search</span>
      </Button>

      <AISearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  )
}

