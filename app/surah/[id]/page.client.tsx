"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsDrawer from "@/components/settings-drawer";

interface SurahPageClientProps {
  surahId: number;
}

export default function SurahPageClient({ surahId }: SurahPageClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-white/80 hover:bg-white/10 h-8 w-8 sm:h-9 sm:w-9"
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Reading settings"
      >
        <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSurahId={surahId}
      />
    </>
  );
}
