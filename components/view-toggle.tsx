"use client"

import { Button } from "@/components/ui/button"
import { Layers, AlignJustify, Type } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ViewToggleProps {
  currentView: string
  surahId: number
  size?: "default" | "sm"
  className?: string
}

export default function ViewToggle({ currentView, surahId, size = "default", className }: ViewToggleProps) {
  const router = useRouter()

  const handleViewChange = (view: string) => {
    router.push(`/surah/${surahId}?view=${view}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "border-primary/40 text-primary hover:bg-primary/10 hover:text-primary transition-colors text-xs sm:text-sm h-8.5 sm:h-9 px-2.5 sm:px-3",
            className
          )}
        >
          {currentView === "default" && <AlignJustify className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          {currentView === "compact" && <Layers className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          {currentView === "arabic-only" && <Type className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          <span className="hidden sm:inline">
            {currentView === "default" ? "Default View" : currentView === "compact" ? "Compact View" : "Arabic Only"}
          </span>
          <span className="sm:hidden">View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleViewChange("default")}
          className={currentView === "default" ? "bg-primary/15 text-primary font-medium" : ""}
        >
          <AlignJustify className="mr-2 h-4 w-4" />
          <span>Default View</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleViewChange("compact")}
          className={currentView === "compact" ? "bg-primary/15 text-primary font-medium" : ""}
        >
          <Layers className="mr-2 h-4 w-4" />
          <span>Compact View</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleViewChange("arabic-only")}
          className={currentView === "arabic-only" ? "bg-primary/15 text-primary font-medium" : ""}
        >
          <Type className="mr-2 h-4 w-4" />
          <span>Arabic Only</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
