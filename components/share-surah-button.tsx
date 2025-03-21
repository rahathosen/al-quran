"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Facebook, Twitter } from "lucide-react"

interface ShareSurahButtonProps {
  surahId: number
  surahName: string
}

export default function ShareSurahButton({ surahId, surahName }: ShareSurahButtonProps) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/surah/${surahId}` : `/surah/${surahId}`

  const shareTitle = `Surah ${surahName} - Al-Quran Al-Kareem`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast("Link copied to clipboard")
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  // Show toast notification
  const showToast = (message: string) => {
    const toast = document.createElement("div")
    toast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#1a5e63] text-white px-4 py-2 rounded-lg shadow-lg z-50"
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 2000)
  }

  // If Web Share API is available, use it directly
  if (typeof navigator !== "undefined" && navigator.share) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-[#d4af37] h-8 w-8 sm:h-10 sm:w-10"
        onClick={handleShare}
        aria-label="Share"
      >
        <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    )
  }

  // Otherwise use dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-[#d4af37] h-8 w-8 sm:h-10 sm:w-10"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4" />
          <span>Share to Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="mr-2 h-4 w-4" />
          <span>Share to Twitter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

