"use client"

import { Button } from "@/components/ui/button"
import { Layers, AlignJustify, Type } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ViewToggleProps {
  currentView: string
  surahId: number
}

export default function ViewToggle({ currentView, surahId }: ViewToggleProps) {
  const router = useRouter()

  const handleViewChange = (view: string) => {
    router.push(`/surah/${surahId}?view=${view}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-[#1a5e63] text-[#1a5e63]">
          {currentView === "default" && <AlignJustify className="mr-2 h-4 w-4" />}
          {currentView === "compact" && <Layers className="mr-2 h-4 w-4" />}
          {currentView === "arabic-only" && <Type className="mr-2 h-4 w-4" />}
          <span className="hidden sm:inline">
            {currentView === "default" ? "Default View" : currentView === "compact" ? "Compact View" : "Arabic Only"}
          </span>
          <span className="sm:hidden">View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleViewChange("default")}
          className={currentView === "default" ? "bg-[#1a5e63]/10" : ""}
        >
          <AlignJustify className="mr-2 h-4 w-4" />
          <span>Default View</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleViewChange("compact")}
          className={currentView === "compact" ? "bg-[#1a5e63]/10" : ""}
        >
          <Layers className="mr-2 h-4 w-4" />
          <span>Compact View</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleViewChange("arabic-only")}
          className={currentView === "arabic-only" ? "bg-[#1a5e63]/10" : ""}
        >
          <Type className="mr-2 h-4 w-4" />
          <span>Arabic Only</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

