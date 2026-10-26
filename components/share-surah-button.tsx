"use client";

import { Button } from "@/components/ui/button";
import { Share2, Copy, Facebook, Twitter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareSurahButtonProps {
  surahId: number;
  surahName: string;
}

export default function ShareSurahButton({
  surahId,
  surahName,
}: ShareSurahButtonProps) {
  const getShareUrl = () => {
    return typeof window !== "undefined"
      ? `${window.location.origin}/surah/${surahId}`
      : `/surah/${surahId}`;
  };

  const shareTitle = `Surah ${surahName} - Al-Quran`;

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(getShareUrl());
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: getShareUrl(),
        });
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getShareUrl()
      )}`,
      "_blank"
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareTitle
      )}&url=${encodeURIComponent(getShareUrl())}`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white/80 hover:bg-white/10 h-8 w-8 sm:h-9 sm:w-9"
          aria-label={`Share Surah ${surahName}`}
        >
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Link</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleFacebookShare}
          className="cursor-pointer"
        >
          <Facebook className="mr-2 h-4 w-4" />
          <span>Share to Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleTwitterShare}
          className="cursor-pointer"
        >
          <Twitter className="mr-2 h-4 w-4" />
          <span>Share to Twitter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
