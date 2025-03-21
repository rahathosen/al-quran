"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import SettingsDrawer from "@/components/settings-drawer"

interface SurahPageClientProps {
  surahId: number
}

export default function SurahPageClient({ surahId }: SurahPageClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-[#d4af37]"
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentSurahId={surahId} />
    </>
  )
}

