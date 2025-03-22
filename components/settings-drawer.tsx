"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, RefreshCw, Sun, Moon, Palette } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getSettings, saveSettings } from "@/lib/local-storage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSurahTranslation } from "@/lib/quran-api";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurahId?: number;
}

// Available reciters
const RECITERS = [
  { id: "alafasy", name: "Mishary Alafasy", language: "Arabic" },
  { id: "minshawi", name: "Mohamed Siddiq Al-Minshawi", language: "Arabic" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", language: "Arabic" },
  { id: "abdulbasit", name: "Abdul Basit Abdus-Samad", language: "Arabic" },
  { id: "sudais", name: "Abdur-Rahman As-Sudais", language: "Arabic" },
  { id: "shatri", name: "Abu Bakr Ash-Shatri", language: "Arabic" },
  { id: "ajamy", name: "Ahmed ibn Ali al-Ajamy", language: "Arabic" },
  { id: "maher", name: "Maher Al Muaiqly", language: "Arabic" },
];

// Available translations
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

// Available Quran font styles
const QURAN_FONTS = [
  { id: "uthmani", name: "Uthmani", description: "Standard Uthmani script" },
  {
    id: "indopak",
    name: "IndoPak",
    description: "Indo-Pakistani style script",
  },
  { id: "tajweed", name: "Tajweed", description: "Colored Tajweed rules" },
  { id: "naskh", name: "Naskh", description: "Clear Naskh style" },
  {
    id: "quran",
    name: "Amiri Quran",
    description: "Specialized for Quran text",
  },
  { id: "hafs", name: "Hafs", description: "Traditional Hafs typography" },
  { id: "madani", name: "Madani", description: "Medina Mushaf style" },
];

// Available themes
const THEMES = [
  { id: "light", name: "Light", description: "Default light theme", icon: Sun },
  {
    id: "dark",
    name: "Dark",
    description: "Dark theme for night reading",
    icon: Moon,
  },
  {
    id: "sepia",
    name: "Sepia",
    description: "Warm sepia tone for comfort",
    icon: Palette,
    color: "amber",
  },
  {
    id: "green",
    name: "Green",
    description: "Soft green theme",
    icon: Palette,
    color: "green",
  },
  {
    id: "blue",
    name: "Blue",
    description: "Calming blue theme",
    icon: Palette,
    color: "blue",
  },
];

export default function SettingsDrawer({
  isOpen,
  onClose,
  currentSurahId,
}: SettingsDrawerProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Settings state
  const [translationId, setTranslationId] = useState<string>("en.asad");
  const [reciterId, setReciterId] = useState<string>("alafasy");
  const [quranFont, setQuranFont] = useState<string>("uthmani");
  const [arabicFontSize, setArabicFontSize] = useState(2); // Scale from 1-4
  const [translationFontSize, setTranslationFontSize] = useState(2); // Scale from 1-4
  const [activeTab, setActiveTab] = useState<
    "general" | "reciters" | "translations" | "fonts"
  >("general");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("light");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings.translationId)
      setTranslationId(savedSettings.translationId);
    if (savedSettings.reciterId) setReciterId(savedSettings.reciterId);
    if (savedSettings.quranFont) setQuranFont(savedSettings.quranFont);
    if (savedSettings.arabicFontSize)
      setArabicFontSize(savedSettings.arabicFontSize);
    if (savedSettings.translationFontSize)
      setTranslationFontSize(savedSettings.translationFontSize);
    if (savedSettings.theme) setSelectedTheme(savedSettings.theme);

    // Set initial theme from system
    if (theme) {
      setSelectedTheme(theme);
    }
  }, [theme]);

  // Save settings when they change
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

  // Apply font size changes to the document
  useEffect(() => {
    // Get all Arabic text elements
    const arabicTexts = document.querySelectorAll(".font-amiri");
    const baseArabicSize = 2; // Base size is text-2xl
    const arabicSizeClasses = ["text-xl", "text-2xl", "text-3xl", "text-4xl"];

    arabicTexts.forEach((element) => {
      // Remove existing size classes
      element.classList.remove(...arabicSizeClasses);
      // Add new size class
      element.classList.add(arabicSizeClasses[arabicFontSize - 1]);
    });

    // Get all translation text elements
    const translationTexts = document.querySelectorAll(".verse-translation");
    const baseTrSize = 1; // Base size is text-base
    const trSizeClasses = ["text-sm", "text-base", "text-lg", "text-xl"];

    translationTexts.forEach((element) => {
      // Remove existing size classes
      element.classList.remove(...trSizeClasses);
      // Add new size class
      element.classList.add(trSizeClasses[translationFontSize - 1]);
    });
  }, [arabicFontSize, translationFontSize]);

  // Apply Quran font style
  useEffect(() => {
    // Get all Arabic text elements
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
      // Remove existing font classes
      element.classList.remove(...fontClasses);
      // Add new font class
      element.classList.add(`quran-${quranFont}`);
    });
  }, [quranFont]);

  // Handle translation change
  const handleTranslationChange = async (newTranslationId: string) => {
    setTranslationId(newTranslationId);

    // Update translations immediately if on a surah page
    if (currentSurahId) {
      setIsRefreshing(true);

      try {
        // Fetch new translation
        const translation = await getSurahTranslation(
          currentSurahId,
          newTranslationId
        );

        if (translation) {
          // Update all verse translations on the page
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

  // Handle reciter change
  const handleReciterChange = (newReciterId: string) => {
    setReciterId(newReciterId);
  };

  // Handle font change
  const handleFontChange = (newFontId: string) => {
    setQuranFont(newFontId);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
  };

  // Apply custom theme
  const applyCustomTheme = (themeId: string) => {
    // Apply theme-specific CSS variables or classes
    document.documentElement.classList.remove(
      "theme-sepia",
      "theme-green",
      "theme-blue"
    );

    if (themeId !== "light" && themeId !== "dark") {
      document.documentElement.classList.add(`theme-${themeId}`);
    }
  };

  // Apply theme when it changes
  useEffect(() => {
    applyCustomTheme(selectedTheme);
  }, [selectedTheme]);

  // Refresh page to apply all settings
  const refreshPage = () => {
    router.refresh();
    onClose();
  };

  return (
    <>
      {/* Settings Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform ${
          isOpen ? "translate-x-0" : "translate-x-[100%]"
        } transition-transform duration-300 ease-in-out flex flex-col dark:bg-gray-900 dark:text-white`}
      >
        <div className="p-4 border-b border-[#d4af37]/20 dark:border-[#d4af37]/40">
          <div className="flex justify-between items-center">
            <h2 className="text-[#1a5e63] text-xl font-semibold dark:text-[#4db6bd]">
              Settings
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#1a5e63] dark:text-[#4db6bd]"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d4af37]/20 dark:border-[#d4af37]/40">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none ${
              activeTab === "general"
                ? "border-b-2 border-[#1a5e63] text-[#1a5e63] dark:border-[#4db6bd] dark:text-[#4db6bd]"
                : "text-[#666] dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none ${
              activeTab === "reciters"
                ? "border-b-2 border-[#1a5e63] text-[#1a5e63] dark:border-[#4db6bd] dark:text-[#4db6bd]"
                : "text-[#666] dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("reciters")}
          >
            Reciters
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none ${
              activeTab === "translations"
                ? "border-b-2 border-[#1a5e63] text-[#1a5e63] dark:border-[#4db6bd] dark:text-[#4db6bd]"
                : "text-[#666] dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("translations")}
          >
            Trans.
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none ${
              activeTab === "fonts"
                ? "border-b-2 border-[#1a5e63] text-[#1a5e63] dark:border-[#4db6bd] dark:text-[#4db6bd]"
                : "text-[#666] dark:text-gray-400"
            }`}
            onClick={() => setActiveTab("fonts")}
          >
            Fonts
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <>
                {/* Theme Selection */}
                <div className="mb-6">
                  <h3 className="text-[#1a5e63] font-medium mb-3 dark:text-[#4db6bd]">
                    Theme
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((theme) => {
                      const Icon = theme.icon;
                      return (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id)}
                          className={`flex items-center p-3 rounded-lg border transition-all ${
                            selectedTheme === theme.id
                              ? "border-[#1a5e63] bg-[#1a5e63]/5 dark:border-[#4db6bd] dark:bg-[#4db6bd]/10"
                              : "border-[#d4af37]/20 hover:border-[#1a5e63]/30 dark:border-gray-700 dark:hover:border-[#4db6bd]/30"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 
                            ${
                              theme.id === "light"
                                ? "bg-gray-100 text-yellow-500"
                                : theme.id === "dark"
                                ? "bg-gray-800 text-blue-400"
                                : theme.id === "sepia"
                                ? "bg-amber-50 text-amber-800"
                                : theme.id === "green"
                                ? "bg-green-50 text-green-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <span
                              className={`font-medium ${
                                theme.id === "light"
                                  ? "text-gray-800 dark:text-gray-200"
                                  : theme.id === "dark"
                                  ? "text-gray-800 dark:text-gray-200"
                                  : theme.id === "sepia"
                                  ? "text-amber-800 dark:text-amber-300"
                                  : theme.id === "green"
                                  ? "text-green-800 dark:text-green-300"
                                  : "text-blue-800 dark:text-blue-300"
                              }`}
                            >
                              {theme.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Size Adjustment */}
                <div>
                  <h3 className="text-[#1a5e63] font-medium mb-2 dark:text-[#4db6bd]">
                    Arabic Font Size
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-[#1a5e63] dark:text-[#4db6bd] dark:border-gray-700"
                      onClick={() =>
                        setArabicFontSize(Math.max(1, arabicFontSize - 1))
                      }
                      disabled={arabicFontSize <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 h-1 bg-[#1a5e63]/20 rounded-full dark:bg-[#4db6bd]/20">
                      <div
                        className="h-full bg-[#1a5e63] rounded-full transition-all duration-300 dark:bg-[#4db6bd]"
                        style={{ width: `${(arabicFontSize / 4) * 100}%` }}
                      ></div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-[#1a5e63] dark:text-[#4db6bd] dark:border-gray-700"
                      onClick={() =>
                        setArabicFontSize(Math.min(4, arabicFontSize + 1))
                      }
                      disabled={arabicFontSize >= 4}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-[#1a5e63] font-medium mb-2 dark:text-[#4db6bd]">
                    Translation Font Size
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-[#1a5e63] dark:text-[#4db6bd] dark:border-gray-700"
                      onClick={() =>
                        setTranslationFontSize(
                          Math.max(1, translationFontSize - 1)
                        )
                      }
                      disabled={translationFontSize <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 h-1 bg-[#1a5e63]/20 rounded-full dark:bg-[#4db6bd]/20">
                      <div
                        className="h-full bg-[#1a5e63] rounded-full transition-all duration-300 dark:bg-[#4db6bd]"
                        style={{ width: `${(translationFontSize / 4) * 100}%` }}
                      ></div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-[#1a5e63] dark:text-[#4db6bd] dark:border-gray-700"
                      onClick={() =>
                        setTranslationFontSize(
                          Math.min(4, translationFontSize + 1)
                        )
                      }
                      disabled={translationFontSize >= 4}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Settings Summary */}
                <div className="bg-[#f8f5f0] p-3 rounded-lg border border-[#d4af37]/20 dark:bg-gray-800 dark:border-[#d4af37]/40 mt-6">
                  <h3 className="text-[#1a5e63] font-medium mb-2 dark:text-[#4db6bd]">
                    Current Settings
                  </h3>
                  <div className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
                    <p>
                      <span className="font-medium">Reciter:</span>{" "}
                      {RECITERS.find((r) => r.id === reciterId)?.name ||
                        "Mishary Alafasy"}
                    </p>
                    <p>
                      <span className="font-medium">Translation:</span>{" "}
                      {TRANSLATIONS.find((t) => t.id === translationId)?.name ||
                        "Muhammad Asad"}
                    </p>
                    <p>
                      <span className="font-medium">Quran Font:</span>{" "}
                      {QURAN_FONTS.find((f) => f.id === quranFont)?.name ||
                        "Uthmani"}
                    </p>
                    <p>
                      <span className="font-medium">Theme:</span>{" "}
                      {THEMES.find((t) => t.id === selectedTheme)?.name ||
                        "Light"}
                    </p>
                  </div>
                </div>

                {/* Refresh button */}
                <Button
                  onClick={refreshPage}
                  className="w-full bg-[#1a5e63] hover:bg-[#134548] dark:bg-[#1a5e63]/80 dark:hover:bg-[#1a5e63] mt-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh to Apply All Settings
                </Button>
              </>
            )}

            {/* Reciters Tab */}
            {activeTab === "reciters" && (
              <div>
                <h3 className="text-[#1a5e63] font-medium mb-3 dark:text-[#4db6bd]">
                  Select Reciter
                </h3>
                <RadioGroup
                  value={reciterId}
                  onValueChange={handleReciterChange}
                  className="space-y-2"
                >
                  {RECITERS.map((reciter) => (
                    <div
                      key={reciter.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        reciterId === reciter.id
                          ? "border-[#1a5e63] bg-[#1a5e63]/5 dark:border-[#4db6bd] dark:bg-[#4db6bd]/10"
                          : "border-[#d4af37]/20 dark:border-gray-700"
                      }`}
                    >
                      <Label
                        htmlFor={`reciter-${reciter.id}`}
                        className="flex flex-col cursor-pointer flex-1"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {reciter.name}
                        </span>
                        <span className="text-xs text-[#666] dark:text-gray-400">
                          {reciter.language}
                        </span>
                      </Label>
                      <RadioGroupItem
                        value={reciter.id}
                        id={`reciter-${reciter.id}`}
                        className="text-[#1a5e63] dark:text-[#4db6bd]"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Translations Tab */}
            {activeTab === "translations" && (
              <div>
                <h3 className="text-[#1a5e63] font-medium mb-3 dark:text-[#4db6bd]">
                  Select Translation
                </h3>
                {isRefreshing && (
                  <div className="flex items-center justify-center p-2 mb-3 bg-[#1a5e63]/10 rounded-lg dark:bg-[#4db6bd]/10">
                    <RefreshCw className="h-4 w-4 text-[#1a5e63] animate-spin mr-2 dark:text-[#4db6bd]" />
                    <span className="text-sm text-[#1a5e63] dark:text-[#4db6bd]">
                      Updating translation...
                    </span>
                  </div>
                )}
                <RadioGroup
                  value={translationId}
                  onValueChange={handleTranslationChange}
                  className="space-y-2"
                >
                  {TRANSLATIONS.map((translation) => (
                    <div
                      key={translation.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        translationId === translation.id
                          ? "border-[#1a5e63] bg-[#1a5e63]/5 dark:border-[#4db6bd] dark:bg-[#4db6bd]/10"
                          : "border-[#d4af37]/20 dark:border-gray-700"
                      }`}
                    >
                      <Label
                        htmlFor={`translation-${translation.id}`}
                        className="flex flex-col cursor-pointer flex-1"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {translation.name}
                        </span>
                        <span className="text-xs text-[#666] dark:text-gray-400">
                          {translation.language}
                        </span>
                      </Label>
                      <RadioGroupItem
                        value={translation.id}
                        id={`translation-${translation.id}`}
                        className="text-[#1a5e63] dark:text-[#4db6bd]"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Fonts Tab */}
            {activeTab === "fonts" && (
              <div>
                <h3 className="text-[#1a5e63] font-medium mb-3 dark:text-[#4db6bd]">
                  Quran Font Style
                </h3>
                <RadioGroup
                  value={quranFont}
                  onValueChange={handleFontChange}
                  className="space-y-2"
                >
                  {QURAN_FONTS.map((font) => (
                    <div
                      key={font.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        quranFont === font.id
                          ? "border-[#1a5e63] bg-[#1a5e63]/5 dark:border-[#4db6bd] dark:bg-[#4db6bd]/10"
                          : "border-[#d4af37]/20 dark:border-gray-700"
                      }`}
                    >
                      <Label
                        htmlFor={`font-${font.id}`}
                        className="flex flex-col cursor-pointer flex-1"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {font.name}
                        </span>
                        <span className="text-xs text-[#666] dark:text-gray-400">
                          {font.description}
                        </span>
                      </Label>
                      <RadioGroupItem
                        value={font.id}
                        id={`font-${font.id}`}
                        className="text-[#1a5e63] dark:text-[#4db6bd]"
                      />
                    </div>
                  ))}
                </RadioGroup>

                {/* Font preview */}
                <div className="mt-4 p-3 bg-[#f8f5f0] rounded-lg border border-[#d4af37]/20 dark:bg-gray-800 dark:border-[#d4af37]/40">
                  <h4 className="text-sm font-medium text-[#1a5e63] mb-2 dark:text-[#4db6bd]">
                    Preview:
                  </h4>
                  <p
                    className={`font-amiri text-right text-xl quran-${quranFont} leading-loose`}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p
                    className={`font-amiri text-right text-lg quran-${quranFont} leading-loose mt-2 text-[#555] dark:text-gray-300`}
                  >
                    الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay when drawer is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      )}
    </>
  );
}
