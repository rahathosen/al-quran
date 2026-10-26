"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, RefreshCw, Sun, Moon, Palette } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings } from "@/lib/local-storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSurahTranslation } from "@/lib/quran-api";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurahId?: number;
}

const RECITERS = [
  { id: "alafasy", name: "Mishary Alafasy", language: "Arabic" },
  { id: "minshawi", name: "Mohamed Siddiq Al-Minshawi", language: "Arabic" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", language: "Arabic" },
  { id: "shatri", name: "Abu Bakr Ash-Shatri", language: "Arabic" },
];

const TRANSLATIONS = [
  { id: "en.asad", name: "Muhammad Asad", language: "English" },
  { id: "en.pickthall", name: "Marmaduke Pickthall", language: "English" },
  { id: "en.sahih", name: "Saheeh International", language: "English" },
  { id: "en.yusufali", name: "Yusuf Ali", language: "English" },
  { id: "bn.bengali", name: "Muhiuddin Khan", language: "Bengali" },
  { id: "ur.jalandhry", name: "Jalandhry", language: "Urdu" },
  { id: "fr.hamidullah", name: "Hamidullah", language: "French" },
  { id: "es.cortes", name: "Julio Cortes", language: "Spanish" },
];

const QURAN_FONTS = [
  { id: "uthmani", name: "Uthmani", description: "Standard Uthmani script" },
  { id: "indopak", name: "IndoPak", description: "Indo-Pakistani style script" },
  { id: "tajweed", name: "Tajweed", description: "Tajweed recitation rules" },
  { id: "naskh", name: "Naskh", description: "Clear Naskh style" },
  { id: "quran", name: "Amiri Quran", description: "Specialized for Quran text" },
  { id: "hafs", name: "Hafs", description: "Traditional Hafs typography" },
  { id: "madani", name: "Madani", description: "Medina Mushaf style" },
];

const THEMES = [
  { id: "light", name: "Light", description: "Default clean light", icon: Sun },
  { id: "dark", name: "Dark", description: "Night reading mode", icon: Moon },
  { id: "theme-sepia", name: "Sepia", description: "Warm bookish tone", icon: Palette },
  { id: "theme-green", name: "Emerald", description: "Soothing green", icon: Palette },
  { id: "theme-blue", name: "Sapphire", description: "Calm sapphire", icon: Palette },
];

export default function SettingsDrawer({
  isOpen,
  onClose,
  currentSurahId,
}: SettingsDrawerProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [translationId, setTranslationId] = useState<string>("en.asad");
  const [reciterId, setReciterId] = useState<string>("alafasy");
  const [quranFont, setQuranFont] = useState<string>("uthmani");
  const [arabicFontSize, setArabicFontSize] = useState(2);
  const [translationFontSize, setTranslationFontSize] = useState(2);
  const [activeTab, setActiveTab] = useState<
    "general" | "reciters" | "translations" | "fonts"
  >("general");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("light");

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings.translationId) setTranslationId(savedSettings.translationId);
    if (savedSettings.reciterId) setReciterId(savedSettings.reciterId);
    if (savedSettings.quranFont) setQuranFont(savedSettings.quranFont);
    if (savedSettings.arabicFontSize) setArabicFontSize(savedSettings.arabicFontSize);
    if (savedSettings.translationFontSize) setTranslationFontSize(savedSettings.translationFontSize);
    if (savedSettings.theme) setSelectedTheme(savedSettings.theme);

    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    saveSettings({
      translationId,
      reciterId,
      quranFont,
      arabicFontSize,
      translationFontSize,
      theme: selectedTheme,
    });
  }, [
    translationId,
    reciterId,
    quranFont,
    arabicFontSize,
    translationFontSize,
    selectedTheme,
  ]);

  // Apply font size scale
  useEffect(() => {
    const arabicTexts = document.querySelectorAll(".font-amiri");
    const arabicSizeClasses = ["text-xl", "text-2xl", "text-3xl", "text-4xl"];

    arabicTexts.forEach((element) => {
      element.classList.remove(...arabicSizeClasses);
      element.classList.add(arabicSizeClasses[arabicFontSize - 1]);
    });

    const translationTexts = document.querySelectorAll(".verse-translation");
    const trSizeClasses = ["text-sm", "text-base", "text-lg", "text-xl"];

    translationTexts.forEach((element) => {
      element.classList.remove(...trSizeClasses);
      element.classList.add(trSizeClasses[translationFontSize - 1]);
    });
  }, [arabicFontSize, translationFontSize]);

  // Apply Quran font style
  useEffect(() => {
    const arabicTexts = document.querySelectorAll(".font-amiri");
    const fontClasses = [
      "quran-uthmani",
      "quran-indopak",
      "quran-tajweed",
      "quran-naskh",
      "quran-quran",
      "quran-hafs",
      "quran-madani",
    ];

    arabicTexts.forEach((element) => {
      element.classList.remove(...fontClasses);
      element.classList.add(`quran-${quranFont}`);
    });
  }, [quranFont]);

  const handleTranslationChange = async (newTranslationId: string) => {
    setTranslationId(newTranslationId);

    if (currentSurahId) {
      setIsRefreshing(true);
      try {
        const translation = await getSurahTranslation(currentSurahId, newTranslationId);
        if (translation) {
          const verses = document.querySelectorAll(".verse-translation");
          translation.ayahs.forEach((ayah, index) => {
            if (verses[index]) {
              verses[index].textContent = ayah.text;
            }
          });
        }
      } catch (error) {
        console.error("Error updating translation:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  const refreshPage = () => {
    router.refresh();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-card text-card-foreground border-border"
      >
        <SheetHeader className="p-4 border-b border-border/80">
          <SheetTitle className="text-lg font-bold text-foreground">
            Reading Settings
          </SheetTitle>
        </SheetHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/60 bg-muted/30">
          {(["general", "reciters", "translations", "fonts"] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-primary text-primary bg-background/50"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "translations" ? "Trans." : tab}
            </button>
          ))}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Color Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = selectedTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleThemeChange(t.id)}
                          className={`flex items-center p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                              : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center mr-2.5 shrink-0">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size Adjustment */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Arabic Font Size</span>
                    <span className="text-muted-foreground">Level {arabicFontSize} / 4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setArabicFontSize(Math.max(1, arabicFontSize - 1))}
                      disabled={arabicFontSize <= 1}
                      aria-label="Decrease Arabic font size"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${(arabicFontSize / 4) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setArabicFontSize(Math.min(4, arabicFontSize + 1))}
                      disabled={arabicFontSize >= 4}
                      aria-label="Increase Arabic font size"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">Translation Font Size</span>
                    <span className="text-muted-foreground">Level {translationFontSize} / 4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setTranslationFontSize(Math.max(1, translationFontSize - 1))}
                      disabled={translationFontSize <= 1}
                      aria-label="Decrease translation font size"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${(translationFontSize / 4) * 100}%` }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setTranslationFontSize(Math.min(4, translationFontSize + 1))}
                      disabled={translationFontSize >= 4}
                      aria-label="Increase translation font size"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={refreshPage}
                  className="w-full gap-2 mt-4"
                  size="sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Apply & Refresh Surah
                </Button>
              </div>
            )}

            {/* Reciters Tab */}
            {activeTab === "reciters" && (
              <RadioGroup
                value={reciterId}
                onValueChange={setReciterId}
                className="space-y-2"
              >
                {RECITERS.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      reciterId === r.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Label
                      htmlFor={`reciter-${r.id}`}
                      className="cursor-pointer flex-1"
                    >
                      <span className="font-semibold text-sm block text-foreground">
                        {r.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.language}
                      </span>
                    </Label>
                    <RadioGroupItem value={r.id} id={`reciter-${r.id}`} />
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Translations Tab */}
            {activeTab === "translations" && (
              <div className="space-y-2">
                {isRefreshing && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 text-primary text-xs rounded-lg mb-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating translation...</span>
                  </div>
                )}
                <RadioGroup
                  value={translationId}
                  onValueChange={handleTranslationChange}
                  className="space-y-2"
                >
                  {TRANSLATIONS.map((tr) => (
                    <div
                      key={tr.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        translationId === tr.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Label
                        htmlFor={`translation-${tr.id}`}
                        className="cursor-pointer flex-1"
                      >
                        <span className="font-semibold text-sm block text-foreground">
                          {tr.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tr.language}
                        </span>
                      </Label>
                      <RadioGroupItem value={tr.id} id={`translation-${tr.id}`} />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Fonts Tab */}
            {activeTab === "fonts" && (
              <div className="space-y-4">
                <RadioGroup
                  value={quranFont}
                  onValueChange={setQuranFont}
                  className="space-y-2"
                >
                  {QURAN_FONTS.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        quranFont === f.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <Label
                        htmlFor={`font-${f.id}`}
                        className="cursor-pointer flex-1"
                      >
                        <span className="font-semibold text-sm block text-foreground">
                          {f.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {f.description}
                        </span>
                      </Label>
                      <RadioGroupItem value={f.id} id={`font-${f.id}`} />
                    </div>
                  ))}
                </RadioGroup>

                <div className="p-4 bg-muted/40 rounded-xl border border-border/80 text-center space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Font Preview
                  </h4>
                  <p
                    dir="rtl"
                    lang="ar"
                    className={`font-amiri text-2xl quran-${quranFont} text-foreground leading-loose`}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
