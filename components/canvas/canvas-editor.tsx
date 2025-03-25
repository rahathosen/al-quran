"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSurahById, getSurahTranslation } from "@/lib/quran-api";
import {
  Loader2,
  Download,
  Share2,
  RefreshCw,
  ImageIcon,
  Type,
  Palette,
  Layout,
  Save,
  Undo,
  Redo,
  Copy,
  Trash2,
  HelpCircle,
  Instagram,
  Twitter,
  Facebook,
  Smartphone,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { getSettings } from "@/lib/local-storage";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  QURAN_FONTS,
  TRANSLATIONS,
  COLOR_SCHEMES,
  COLOR_OPTIONS,
  BACKGROUND_IMAGES,
  TEXT_EFFECTS,
  FRAME_STYLES,
  CANVAS_SIZES,
  SOCIAL_TEMPLATES,
  getFontFamilyClass,
  wrapText,
  applyTextEffect,
  drawFrame,
  addWatermark,
  debounce,
} from "@/lib/canvas-utils";

// Define default settings
const DEFAULT_SETTINGS = {
  surahId: 1,
  verseNumber: 1,
  background: "/canvas-images/mountains.webp",
  fontStyle: "uthmani",
  translation: "en.asad",
  showTranslation: true,
  showReference: true,
  colorScheme: "light",
  opacity: 20,
  fontSize: 2,
  fontColor: "white",
  textEffect: "none",
  frameStyle: "none",
  canvasSize: "square",
  watermark: "",
  textPosition: 50, // Vertical position as percentage
};

// Define history state type
type HistoryState = {
  past: Record<string, any>[];
  present: Record<string, any>;
  future: Record<string, any>[];
};

interface CanvasEditorProps {
  surahs: any[];
}

export default function CanvasEditor({ surahs }: CanvasEditorProps) {
  // Canvas settings
  const [selectedSurah, setSelectedSurah] = useState<number>(
    DEFAULT_SETTINGS.surahId
  );
  const [selectedVerse, setSelectedVerse] = useState<number>(
    DEFAULT_SETTINGS.verseNumber
  );
  const [selectedBackground, setSelectedBackground] = useState<string>(
    DEFAULT_SETTINGS.background
  );
  const [selectedFont, setSelectedFont] = useState<string>(
    DEFAULT_SETTINGS.fontStyle
  );
  const [selectedTranslation, setSelectedTranslation] = useState<string>(
    DEFAULT_SETTINGS.translation
  );
  const [showTranslation, setShowTranslation] = useState<boolean>(
    DEFAULT_SETTINGS.showTranslation
  );
  const [showReference, setShowReference] = useState<boolean>(
    DEFAULT_SETTINGS.showReference
  );
  const [colorScheme, setColorScheme] = useState<string>(
    DEFAULT_SETTINGS.colorScheme
  );
  const [opacity, setOpacity] = useState<number>(DEFAULT_SETTINGS.opacity);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_SETTINGS.fontSize);
  const [fontColor, setFontColor] = useState<string>(
    DEFAULT_SETTINGS.fontColor
  );
  const [textEffect, setTextEffect] = useState<string>(
    DEFAULT_SETTINGS.textEffect
  );
  const [frameStyle, setFrameStyle] = useState<string>(
    DEFAULT_SETTINGS.frameStyle
  );
  const [canvasSize, setCanvasSize] = useState<string>(
    DEFAULT_SETTINGS.canvasSize
  );
  const [watermark, setWatermark] = useState<string>(
    DEFAULT_SETTINGS.watermark
  );
  const [textPosition, setTextPosition] = useState<number>(
    DEFAULT_SETTINGS.textPosition
  );

  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);

  // State for loading and data
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [surahData, setSurahData] = useState<any>(null);
  const [translationData, setTranslationData] = useState<any>(null);
  const [verseCount, setVerseCount] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: { ...DEFAULT_SETTINGS },
    future: [],
  });

  // Saved presets
  const [presets, setPresets] = useState<Record<string, any>[]>([]);
  const [presetName, setPresetName] = useState<string>("");

  // UI state
  const [activeTab, setActiveTab] = useState<string>("content");
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showPresetSave, setShowPresetSave] = useState<boolean>(false);
  const [showSocialOptions, setShowSocialOptions] = useState<boolean>(false);

  // Load user settings on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings.quranFont) setSelectedFont(settings.quranFont);
    if (settings.translationId) setSelectedTranslation(settings.translationId);

    // Load saved presets from localStorage
    const savedPresets = localStorage.getItem("quran-canvas-presets");
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (e) {
        console.error("Error loading presets:", e);
      }
    }

    // Create canvas element
    const canvas = document.createElement("canvas");

    // Set canvas size based on selected template
    const selectedSize =
      CANVAS_SIZES.find((size) => size.id === canvasSize) || CANVAS_SIZES[0];
    canvas.width = selectedSize.width;
    canvas.height = selectedSize.height;
    setCanvasWidth(selectedSize.width);
    setCanvasHeight(selectedSize.height);

    setCanvasRef(canvas);

    // Render the canvas with default background after a short delay to ensure everything is loaded
    setTimeout(() => {
      renderCanvas();
    }, 100);
  }, []);

  // Update canvas dimensions when size changes
  useEffect(() => {
    if (!canvasRef) return;

    const selectedSize =
      CANVAS_SIZES.find((size) => size.id === canvasSize) || CANVAS_SIZES[0];
    canvasRef.width = selectedSize.width;
    canvasRef.height = selectedSize.height;
    setCanvasWidth(selectedSize.width);
    setCanvasHeight(selectedSize.height);

    renderCanvas();
  }, [canvasSize, canvasRef]);

  // Fetch surah data when selected surah changes
  useEffect(() => {
    const fetchSurahData = async () => {
      setIsLoading(true);
      try {
        const [surah, translation] = await Promise.all([
          getSurahById(selectedSurah),
          getSurahTranslation(selectedSurah, selectedTranslation),
        ]);

        if (surah && translation) {
          setSurahData(surah);
          setTranslationData(translation);
          setVerseCount(surah.numberOfAyahs);

          // Reset selected verse if it's out of range
          if (selectedVerse > surah.numberOfAyahs) {
            setSelectedVerse(1);
          }
        }
      } catch (error) {
        console.error("Error fetching surah data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurahData();
  }, [selectedSurah, selectedTranslation]);

  // Save current state to history when settings change
  const saveToHistory = useCallback(
    debounce(() => {
      const currentState = {
        selectedSurah,
        selectedVerse,
        selectedBackground,
        selectedFont,
        selectedTranslation,
        showTranslation,
        showReference,
        colorScheme,
        opacity,
        fontSize,
        fontColor,
        textEffect,
        frameStyle,
        canvasSize,
        watermark,
        textPosition,
      };

      setHistory((prev) => ({
        past: [...prev.past, prev.present],
        present: currentState,
        future: [],
      }));
    }, 500),
    [
      selectedSurah,
      selectedVerse,
      selectedBackground,
      selectedFont,
      selectedTranslation,
      showTranslation,
      showReference,
      colorScheme,
      opacity,
      fontSize,
      fontColor,
      textEffect,
      frameStyle,
      canvasSize,
      watermark,
      textPosition,
    ]
  );

  // Call saveToHistory when settings change
  useEffect(() => {
    saveToHistory();
  }, [
    selectedSurah,
    selectedVerse,
    selectedBackground,
    selectedFont,
    selectedTranslation,
    showTranslation,
    showReference,
    colorScheme,
    opacity,
    fontSize,
    fontColor,
    textEffect,
    frameStyle,
    canvasSize,
    watermark,
    textPosition,
    saveToHistory,
  ]);

  // Undo function
  const handleUndo = () => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];

    setHistory({
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    });

    // Apply the previous state
    setSelectedSurah(previous.selectedSurah);
    setSelectedVerse(previous.selectedVerse);
    setSelectedBackground(previous.selectedBackground);
    setSelectedFont(previous.selectedFont);
    setSelectedTranslation(previous.selectedTranslation);
    setShowTranslation(previous.showTranslation);
    setShowReference(previous.showReference);
    setColorScheme(previous.colorScheme);
    setOpacity(previous.opacity);
    setFontSize(previous.fontSize);
    setFontColor(previous.fontColor);
    setTextEffect(previous.textEffect);
    setFrameStyle(previous.frameStyle);
    setCanvasSize(previous.canvasSize);
    setWatermark(previous.watermark);
    setTextPosition(previous.textPosition);
  };

  // Redo function
  const handleRedo = () => {
    if (history.future.length === 0) return;

    const next = history.future[0];

    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
    });

    // Apply the next state
    setSelectedSurah(next.selectedSurah);
    setSelectedVerse(next.selectedVerse);
    setSelectedBackground(next.selectedBackground);
    setSelectedFont(next.selectedFont);
    setSelectedTranslation(next.selectedTranslation);
    setShowTranslation(next.showTranslation);
    setShowReference(next.showReference);
    setColorScheme(next.colorScheme);
    setOpacity(next.opacity);
    setFontSize(next.fontSize);
    setFontColor(next.fontColor);
    setTextEffect(next.textEffect);
    setFrameStyle(next.frameStyle);
    setCanvasSize(next.canvasSize);
    setWatermark(next.watermark);
    setTextPosition(next.textPosition);
  };

  // Reset to defaults
  const handleReset = () => {
    setSelectedSurah(DEFAULT_SETTINGS.surahId);
    setSelectedVerse(DEFAULT_SETTINGS.verseNumber);
    setSelectedBackground(DEFAULT_SETTINGS.background);
    setSelectedFont(DEFAULT_SETTINGS.fontStyle);
    setSelectedTranslation(DEFAULT_SETTINGS.translation);
    setShowTranslation(DEFAULT_SETTINGS.showTranslation);
    setShowReference(DEFAULT_SETTINGS.showReference);
    setColorScheme(DEFAULT_SETTINGS.colorScheme);
    setOpacity(DEFAULT_SETTINGS.opacity);
    setFontSize(DEFAULT_SETTINGS.fontSize);
    setFontColor(DEFAULT_SETTINGS.fontColor);
    setTextEffect(DEFAULT_SETTINGS.textEffect);
    setFrameStyle(DEFAULT_SETTINGS.frameStyle);
    setCanvasSize(DEFAULT_SETTINGS.canvasSize);
    setWatermark(DEFAULT_SETTINGS.watermark);
    setTextPosition(DEFAULT_SETTINGS.textPosition);

    // Add current state to history
    saveToHistory();
  };

  // Save current settings as preset
  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset = {
      name: presetName,
      timestamp: Date.now(),
      settings: {
        selectedSurah,
        selectedVerse,
        selectedBackground,
        selectedFont,
        selectedTranslation,
        showTranslation,
        showReference,
        colorScheme,
        opacity,
        fontSize,
        fontColor,
        textEffect,
        frameStyle,
        canvasSize,
        watermark,
        textPosition,
      },
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);

    // Save to localStorage
    localStorage.setItem(
      "quran-canvas-presets",
      JSON.stringify(updatedPresets)
    );

    // Reset form
    setPresetName("");
    setShowPresetSave(false);
  };

  // Load a preset
  const loadPreset = (preset: any) => {
    const settings = preset.settings;

    setSelectedSurah(settings.selectedSurah);
    setSelectedVerse(settings.selectedVerse);
    setSelectedBackground(settings.selectedBackground);
    setSelectedFont(settings.selectedFont);
    setSelectedTranslation(settings.selectedTranslation);
    setShowTranslation(settings.showTranslation);
    setShowReference(settings.showReference);
    setColorScheme(settings.colorScheme);
    setOpacity(settings.opacity);
    setFontSize(settings.fontSize);
    setFontColor(settings.fontColor);
    setTextEffect(settings.textEffect);
    setFrameStyle(settings.frameStyle);
    setCanvasSize(settings.canvasSize);
    setWatermark(settings.watermark);
    setTextPosition(settings.textPosition);

    // Add to history
    saveToHistory();
  };

  // Delete a preset
  const deletePreset = (presetIndex: number) => {
    const updatedPresets = presets.filter((_, index) => index !== presetIndex);
    setPresets(updatedPresets);

    // Save to localStorage
    localStorage.setItem(
      "quran-canvas-presets",
      JSON.stringify(updatedPresets)
    );
  };

  // Update the generateImage function to ensure the image is properly generated
  const generateImage = () => {
    if (!selectedBackground) {
      // Show an alert if no background is selected
      alert("Please select a background image first");
      return;
    }

    setIsGenerating(true);

    // Create a new Image to load the background
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for CORS

    img.onload = () => {
      if (!canvasRef) return;

      const ctx = canvasRef.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

      // Draw background
      ctx.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);

      // Get current color scheme
      const currentScheme =
        COLOR_SCHEMES.find((scheme) => scheme.id === colorScheme) ||
        COLOR_SCHEMES[0];

      // Draw overlay
      ctx.fillStyle = currentScheme.background.replace(
        /[\d.]+\)$/,
        `${opacity / 100})`
      );
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

      // Draw frame if selected
      if (frameStyle !== "none") {
        drawFrame(
          ctx,
          frameStyle,
          canvasRef.width,
          canvasRef.height,
          COLOR_OPTIONS.find((c) => c.id === fontColor)?.color || "#ffffff"
        );
      }

      // Draw text
      ctx.textAlign = "center";
      // Use the selected font color
      const selectedColorOption =
        COLOR_OPTIONS.find((option) => option.id === fontColor) ||
        COLOR_OPTIONS[0];
      ctx.fillStyle = selectedColorOption.color;

      // Apply text effect
      applyTextEffect(ctx, textEffect, selectedColorOption.color);

      // Draw Arabic text
      const arabicText = getCurrentVerseText();
      const fontSizeMap = { 1: 36, 2: 48, 3: 60, 4: 72 };
      const arabicFontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap];
      // Get the font family based on selected font
      const fontFamily =
        QURAN_FONTS.find((font) => font.id === selectedFont)?.id || "uthmani";
      ctx.font = `${arabicFontSize}px ${getFontFamilyClass(fontFamily)}`;

      // Handle multiline text
      const maxWidth = canvasRef.width * 0.8;
      const lineHeight = arabicFontSize * 1.4;
      const arabicLines = wrapText(ctx, arabicText, maxWidth);

      // Position Arabic text based on textPosition
      let y = canvasRef.height * (textPosition / 100);
      arabicLines.forEach((line) => {
        ctx.fillText(line, canvasRef.width / 2, y);
        if (textEffect === "outline") {
          ctx.strokeText(line, canvasRef.width / 2, y);
        }
        y += lineHeight;
      });

      // Reset shadow for other text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw translation if enabled
      if (showTranslation) {
        const translationText = getCurrentVerseTranslation();
        const translationFontSizeMap = { 1: 24, 2: 30, 3: 36, 4: 42 };
        const translationFontSize =
          translationFontSizeMap[
            fontSize as keyof typeof translationFontSizeMap
          ];
        ctx.font = `${translationFontSize}px 'Noto Sans', sans-serif`;

        // Handle multiline translation
        const translationLineHeight = translationFontSize * 1.4;
        const translationLines = wrapText(ctx, translationText, maxWidth);

        // Position translation text below Arabic
        y += translationLineHeight * 0.5;
        translationLines.forEach((line) => {
          ctx.fillText(line, canvasRef.width / 2, y);
          y += translationLineHeight;
        });
      }

      // Draw reference if enabled
      if (showReference && surahData) {
        ctx.font = '24px "Noto Sans", sans-serif';
        ctx.fillText(
          `Surah ${surahData.englishName} (${selectedVerse})`,
          canvasRef.width / 2,
          canvasRef.height - 50
        );
      }

      // Add watermark if provided
      if (watermark) {
        addWatermark(ctx, watermark, canvasRef.width, canvasRef.height);
      }

      // Generate image URL
      try {
        const imageUrl = canvasRef.toDataURL("image/jpeg", 0.9);
        setGeneratedImage(imageUrl);

        // Set up download and share buttons
        setupDownloadButton(imageUrl);
        setupShareButton(imageUrl);

        // Enable the buttons
        const downloadButton = document.getElementById("download-button");
        const shareButton = document.getElementById("share-button");
        if (downloadButton) downloadButton.removeAttribute("disabled");
        if (shareButton) shareButton.removeAttribute("disabled");
      } catch (err) {
        console.error("Error generating image:", err);
        alert("There was an error generating the image. Please try again.");
      }

      setIsGenerating(false);
    };

    img.onerror = () => {
      console.error("Failed to load image");
      alert("Failed to load the background image. Please try another one.");
      setIsGenerating(false);
    };

    // Set image source
    img.src = selectedBackground;
  };

  // Render canvas with current settings
  const renderCanvas = () => {
    if (!canvasRef) return;

    // Use default background if none selected
    const bgImage = selectedBackground || "/canvas-images/mountains.webp";

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Load background image
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for CORS

    img.onload = () => {
      // Draw background
      ctx.drawImage(img, 0, 0, canvasRef.width, canvasRef.height);

      // Get current color scheme
      const currentScheme =
        COLOR_SCHEMES.find((scheme) => scheme.id === colorScheme) ||
        COLOR_SCHEMES[0];

      // Draw overlay
      ctx.fillStyle = currentScheme.background.replace(
        /[\d.]+\)$/,
        `${opacity / 100})`
      );
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

      // Draw frame if selected
      if (frameStyle !== "none") {
        drawFrame(
          ctx,
          frameStyle,
          canvasRef.width,
          canvasRef.height,
          COLOR_OPTIONS.find((c) => c.id === fontColor)?.color || "#ffffff"
        );
      }

      // Draw text
      ctx.textAlign = "center";
      // Use the selected font color
      const selectedColorOption =
        COLOR_OPTIONS.find((option) => option.id === fontColor) ||
        COLOR_OPTIONS[0];
      ctx.fillStyle = selectedColorOption.color;

      // Apply text effect
      applyTextEffect(ctx, textEffect, selectedColorOption.color);

      // Draw Arabic text
      const arabicText = getCurrentVerseText();
      const fontSizeMap = { 1: 36, 2: 48, 3: 60, 4: 72 };
      const arabicFontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap];
      // Get the font family based on selected font
      const fontFamily =
        QURAN_FONTS.find((font) => font.id === selectedFont)?.id || "uthmani";
      ctx.font = `${arabicFontSize}px ${getFontFamilyClass(fontFamily)}`;

      // Handle multiline text
      const maxWidth = canvasRef.width * 0.8;
      const lineHeight = arabicFontSize * 1.4;
      const arabicLines = wrapText(ctx, arabicText, maxWidth);

      // Position Arabic text based on textPosition
      let y = canvasRef.height * (textPosition / 100);
      arabicLines.forEach((line) => {
        ctx.fillText(line, canvasRef.width / 2, y);
        if (textEffect === "outline") {
          ctx.strokeText(line, canvasRef.width / 2, y);
        }
        y += lineHeight;
      });

      // Reset shadow for other text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw translation if enabled
      if (showTranslation) {
        const translationText = getCurrentVerseTranslation();
        const translationFontSizeMap = { 1: 24, 2: 30, 3: 36, 4: 42 };
        const translationFontSize =
          translationFontSizeMap[
            fontSize as keyof typeof translationFontSizeMap
          ];
        ctx.font = `${translationFontSize}px 'Noto Sans', sans-serif`;

        // Handle multiline translation
        const translationLineHeight = translationFontSize * 1.4;
        const translationLines = wrapText(ctx, translationText, maxWidth);

        // Position translation text below Arabic
        y += translationLineHeight * 0.5;
        translationLines.forEach((line) => {
          ctx.fillText(line, canvasRef.width / 2, y);
          y += translationLineHeight;
        });
      }

      // Draw reference if enabled
      if (showReference && surahData) {
        ctx.font = '24px "Noto Sans", sans-serif';
        ctx.fillText(
          `Surah ${surahData.englishName} (${selectedVerse})`,
          canvasRef.width / 2,
          canvasRef.height - 50
        );
      }

      // Add watermark if provided
      if (watermark) {
        addWatermark(ctx, watermark, canvasRef.width, canvasRef.height);
      }

      // Generate image URL
      if (isGenerating) {
        try {
          const imageUrl = canvasRef.toDataURL("image/jpeg", 0.9);
          setGeneratedImage(imageUrl);

          // Set up download and share buttons
          setupDownloadButton(imageUrl);
          setupShareButton(imageUrl);
        } catch (err) {
          console.error("Error generating image:", err);
        }
      }
    };

    // Handle image loading error
    img.onerror = () => {
      console.error("Failed to load image");
      ctx.fillStyle = "#f8f5f0";
      ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
      ctx.fillStyle = "#ff0000";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Error loading image. Please try another background.",
        canvasRef.width / 2,
        canvasRef.height / 2
      );
    };

    // Set image source
    img.src = bgImage;
  };

  // Get current verse text
  const getCurrentVerseText = () => {
    if (!surahData || !surahData.ayahs) return "";

    // Find the verse
    const verse = surahData.ayahs.find(
      (v: any) => v.numberInSurah === selectedVerse
    );

    if (!verse) return "";

    // Remove "Bismillah" from the first ayah of surahs other than Surah 1 and Surah 9
    if (
      verse.numberInSurah === 1 &&
      surahData.number !== 1 &&
      surahData.number !== 9
    ) {
      const modifiedText = verse.text.replace(
        "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        ""
      );

      return modifiedText;
    }

    return verse.text;
  };

  // Get current verse translation
  const getCurrentVerseTranslation = () => {
    if (!translationData || !translationData.ayahs) return "";
    const verse = translationData.ayahs.find(
      (v: any) => v.numberInSurah === selectedVerse
    );
    return verse ? verse.text : "";
  };

  // Fix the download functionality by updating the setupDownloadButton function
  const setupDownloadButton = (imageUrl: string) => {
    const downloadButton = document.getElementById("download-button");
    if (downloadButton) {
      downloadButton.onclick = () => {
        try {
          const link = document.createElement("a");
          link.download = `quran-verse-card-${Date.now()}.jpg`;
          link.href = imageUrl;
          link.click();
        } catch (err) {
          console.error("Error downloading image:", err);
          alert("There was an error downloading the image. Please try again.");
        }
      };
    }
  };

  // Fix the share functionality by updating the setupShareButton function
  const setupShareButton = (imageUrl: string) => {
    const shareButton = document.getElementById("share-button");
    if (shareButton) {
      shareButton.onclick = async () => {
        try {
          // Convert data URL to Blob
          const fetchResponse = await fetch(imageUrl);
          const blob = await fetchResponse.blob();
          const file = new File([blob], "quran-verse.jpg", {
            type: "image/jpeg",
          });

          // Check if Web Share API supports sharing files
          if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({ files: [file] })
          ) {
            await navigator.share({
              title: "Quran Verse Card",
              text: `Surah ${surahData?.englishName} (${selectedVerse})`,
              files: [file],
            });
          } else {
            // Fallback to opening in new tab or download
            const newTab = window.open();
            if (newTab) {
              newTab.document.write(
                `<img src="${imageUrl}" alt="Quran Verse Card" style="max-width:100%;">`
              );
              newTab.document.title = `Quran Verse Card - Surah ${surahData?.englishName} (${selectedVerse})`;
            } else {
              // If popup blocked, offer direct download
              const link = document.createElement("a");
              link.download = `quran-verse-card-${Date.now()}.jpg`;
              link.href = imageUrl;
              link.click();
            }
          }
        } catch (err) {
          console.error("Error sharing:", err);
          alert(
            "There was an error sharing the image. You can try downloading it instead."
          );
        }
      };
    }
  };

  // Share to specific social media
  const shareToSocial = (platform: string) => {
    if (!generatedImage) return;

    const text = `Surah ${surahData?.englishName} (${selectedVerse})`;
    const url = window.location.href;

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "instagram":
        alert(
          "To share on Instagram, please download the image and upload it through the Instagram app."
        );
        return;
      default:
        return;
    }

    window.open(shareUrl, "_blank");
  };

  // Effect to render canvas when background changes
  useEffect(() => {
    if (canvasRef) {
      renderCanvas();
    }
  }, [selectedBackground, canvasRef]);

  // Add this effect after the existing useEffect for background changes
  useEffect(() => {
    if (canvasRef) {
      renderCanvas();
    }
  }, [
    selectedFont,
    fontSize,
    fontColor,
    colorScheme,
    opacity,
    showTranslation,
    showReference,
    textEffect,
    frameStyle,
    watermark,
    textPosition,
  ]);

  // Debounced render function for performance
  const debouncedRender = useCallback(
    debounce(() => {
      if (canvasRef) {
        renderCanvas();
      }
    }, 300),
    [canvasRef, renderCanvas]
  );

  // Use debounced render for frequently changing values
  useEffect(() => {
    debouncedRender();
  }, [opacity, textPosition, debouncedRender]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Settings */}

      <div className="lg:col-span-1">
        <Card className="shadow-lg border-[#d4af37]/20">
          <CardContent className="p-4 sm:p-6">
            {/* this comments section is more advance feature */}

            {/* <div className="flex flex-col space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[#1a5e63] font-medium text-lg">
                  Canvas Editor
                </h3>

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowHelp(!showHelp)}
                          className="h-8 w-8"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Help</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUndo}
                          disabled={history.past.length === 0}
                          className="h-8 w-8 p-0"
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Undo</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRedo}
                          disabled={history.future.length === 0}
                          className="h-8 w-8 p-0"
                        >
                          <Redo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Redo</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset to defaults</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="ml-auto">
                  <Popover
                    open={showPresetSave}
                    onOpenChange={setShowPresetSave}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <Save className="h-4 w-4 mr-1.5" />
                        <span className="hidden sm:inline">Save Preset</span>
                        <span className="sm:hidden">Save</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h3 className="font-medium">Save Current Settings</h3>
                        <div className="space-y-2">
                          <Label htmlFor="preset-name">Preset Name</Label>
                          <Input
                            id="preset-name"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="My Preset"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPresetSave(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={savePreset}
                            disabled={!presetName.trim()}
                          >
                            Save Preset
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div> */}

            {/* {showHelp && (
              <Alert className="mb-4 bg-[#1a5e63]/10 border-[#1a5e63]/20 rounded-lg">
                <AlertDescription>
                  <div className="space-y-2 py-1">
                    <p className="text-sm">
                      Create beautiful Quran verse cards by selecting a verse,
                      background, and customizing the appearance.
                    </p>
                    <p className="text-sm">
                      Use the tabs below to navigate between content,
                      background, and style settings.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )} */}

            {/* {presets.length > 0 && (
              <div className="mb-4">
                <Label className="mb-2 block text-[#1a5e63]">
                  Saved Presets
                </Label>
                <ScrollArea className="h-auto max-h-20 border rounded-md p-2">
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((preset, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 group"
                      >
                        <Badge
                          className="cursor-pointer hover:bg-[#1a5e63] transition-colors"
                          onClick={() => loadPreset(preset)}
                        >
                          {preset.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deletePreset(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )} */}

            <Tabs
              defaultValue="content"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-4 mb-4 w-full">
                <TabsTrigger
                  value="content"
                  className="flex items-center justify-center gap-1 px-1 sm:px-3"
                >
                  <Type className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger
                  value="background"
                  className="flex items-center justify-center gap-1 px-1 sm:px-3"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Background</span>
                </TabsTrigger>
                <TabsTrigger
                  value="style"
                  className="flex items-center justify-center gap-1 px-1 sm:px-3"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Style</span>
                </TabsTrigger>
                <TabsTrigger
                  value="layout"
                  className="flex items-center justify-center gap-1 px-1 sm:px-3"
                >
                  <Layout className="h-4 w-4" />
                  <span className="hidden sm:inline">Layout</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="surah">Surah</Label>
                  <Select
                    value={selectedSurah.toString()}
                    onValueChange={(value) =>
                      setSelectedSurah(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger id="surah">
                      <SelectValue placeholder="Select Surah" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {surahs.map((surah) => (
                          <SelectItem
                            key={surah.number}
                            value={surah.number.toString()}
                          >
                            {surah.number}. {surah.englishName} ({surah.name})
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verse">Verse</Label>
                  <Select
                    value={selectedVerse.toString()}
                    onValueChange={(value) =>
                      setSelectedVerse(Number.parseInt(value))
                    }
                    disabled={isLoading || !surahData}
                  >
                    <SelectTrigger id="verse">
                      <SelectValue
                        placeholder={isLoading ? "Loading..." : "Select Verse"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {Array.from({ length: verseCount }).map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Verse {i + 1}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="translation">Translation</Label>
                  <Select
                    value={selectedTranslation}
                    onValueChange={setSelectedTranslation}
                  >
                    <SelectTrigger id="translation">
                      <SelectValue placeholder="Select Translation" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSLATIONS.map((translation) => (
                        <SelectItem key={translation.id} value={translation.id}>
                          {translation.name} ({translation.language})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-translation">Show Translation</Label>
                  <Switch
                    id="show-translation"
                    checked={showTranslation}
                    onCheckedChange={setShowTranslation}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-reference">Show Reference</Label>
                  <Switch
                    id="show-reference"
                    checked={showReference}
                    onCheckedChange={setShowReference}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="watermark">Watermark/Credit</Label>
                  <Input
                    id="watermark"
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    placeholder="@username or website"
                  />
                </div>
              </TabsContent>

              <TabsContent value="background">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Background Image</h3>
                  <RadioGroup
                    value={selectedBackground}
                    onValueChange={setSelectedBackground}
                    className="grid grid-cols-3 gap-2"
                  >
                    {BACKGROUND_IMAGES.map((image) => (
                      <div key={image.id} className="relative">
                        <RadioGroupItem
                          value={image.src}
                          id={image.id}
                          className="sr-only"
                          defaultChecked={
                            image.src === "/canvas-images/mountains.webp"
                          }
                        />
                        <Label htmlFor={image.id} className="cursor-pointer">
                          <Card
                            className={`overflow-hidden h-20 w-full border-2 ${
                              selectedBackground === image.src
                                ? "border-primary"
                                : "border-transparent"
                            }`}
                          >
                            <div className="relative h-full w-full">
                              <img
                                src={image.src || "/placeholder.svg"}
                                alt={image.alt}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </Card>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label>Color Scheme</Label>
                    <RadioGroup
                      value={colorScheme}
                      onValueChange={setColorScheme}
                      className="grid grid-cols-2 gap-2"
                    >
                      {COLOR_SCHEMES.map((scheme) => (
                        <div
                          key={scheme.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={scheme.id}
                            id={`scheme-${scheme.id}`}
                          />
                          <Label
                            htmlFor={`scheme-${scheme.id}`}
                            className="cursor-pointer flex items-center gap-1"
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: scheme.background.replace(
                                  /[^,]+\)/,
                                  "1)"
                                ),
                              }}
                            ></div>
                            {scheme.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="opacity">Background Opacity</Label>
                      <span className="text-sm text-gray-500">{opacity}%</span>
                    </div>
                    <Slider
                      id="opacity"
                      min={10}
                      max={100}
                      step={5}
                      value={[opacity]}
                      onValueChange={(value) => setOpacity(value[0])}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="space-y-2">
                  <Label>Arabic Font</Label>
                  <RadioGroup
                    value={selectedFont}
                    onValueChange={setSelectedFont}
                    className="grid grid-cols-2 gap-2"
                  >
                    {QURAN_FONTS.map((font) => (
                      <div
                        key={font.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={font.id}
                          id={`font-${font.id}`}
                        />
                        <Label
                          htmlFor={`font-${font.id}`}
                          className="cursor-pointer"
                        >
                          {font.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Small</span>
                    <Slider
                      id="font-size"
                      min={1}
                      max={4}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      className="flex-1"
                    />
                    <span className="text-sm">Large</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        className={`h-8 rounded-md flex items-center justify-center ${
                          fontColor === option.id
                            ? "ring-2 ring-offset-2 ring-[#1a5e63]"
                            : ""
                        }`}
                        style={{
                          backgroundColor: option.color,
                          color: option.id === "white" ? "#000" : "#fff",
                        }}
                        onClick={() => setFontColor(option.id)}
                      >
                        <span className="text-xs font-medium">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Effect</Label>
                  <RadioGroup
                    value={textEffect}
                    onValueChange={setTextEffect}
                    className="grid grid-cols-2 gap-2"
                  >
                    {TEXT_EFFECTS.map((effect) => (
                      <div
                        key={effect.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={effect.id}
                          id={`effect-${effect.id}`}
                        />
                        <Label
                          htmlFor={`effect-${effect.id}`}
                          className="cursor-pointer"
                        >
                          {effect.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Frame Style</Label>
                  <RadioGroup
                    value={frameStyle}
                    onValueChange={setFrameStyle}
                    className="grid grid-cols-2 gap-2"
                  >
                    {FRAME_STYLES.map((frame) => (
                      <div
                        key={frame.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={frame.id}
                          id={`frame-${frame.id}`}
                        />
                        <Label
                          htmlFor={`frame-${frame.id}`}
                          className="cursor-pointer"
                        >
                          {frame.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-2">
                  <Label>Canvas Size</Label>
                  <RadioGroup
                    value={canvasSize}
                    onValueChange={setCanvasSize}
                    className="grid grid-cols-2 gap-2"
                  >
                    {CANVAS_SIZES.map((size) => (
                      <div
                        key={size.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={size.id}
                          id={`size-${size.id}`}
                        />
                        <Label
                          htmlFor={`size-${size.id}`}
                          className="cursor-pointer"
                        >
                          {size.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="text-position">
                      Text Vertical Position
                    </Label>
                    <span className="text-sm text-gray-500">
                      {textPosition}%
                    </span>
                  </div>
                  <Slider
                    id="text-position"
                    min={20}
                    max={80}
                    step={5}
                    value={[textPosition]}
                    onValueChange={(value) => setTextPosition(value[0])}
                  />
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Social Media Templates</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOCIAL_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        className="justify-start"
                        onClick={() => {
                          setCanvasWidth(template.width);
                          setCanvasHeight(template.height);

                          // Find matching canvas size or create custom
                          const matchingSize = CANVAS_SIZES.find(
                            (size) =>
                              size.width === template.width &&
                              size.height === template.height
                          );

                          if (matchingSize) {
                            setCanvasSize(matchingSize.id);
                          } else {
                            // For custom sizes not in the predefined list
                            setCanvasSize("custom");
                          }

                          // Render with new dimensions
                          if (canvasRef) {
                            canvasRef.width = template.width;
                            canvasRef.height = template.height;
                            renderCanvas();
                          }
                        }}
                      >
                        {template.id === "instagram" && (
                          <Instagram className="h-4 w-4 mr-2" />
                        )}
                        {template.id === "instagram-story" && (
                          <Smartphone className="h-4 w-4 mr-2" />
                        )}
                        {template.id === "facebook" && (
                          <Facebook className="h-4 w-4 mr-2" />
                        )}
                        {template.id === "twitter" && (
                          <Twitter className="h-4 w-4 mr-2" />
                        )}
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={generateImage}
                className="bg-[#1a5e63] hover:bg-[#134548] w-full"
                disabled={!selectedBackground || isGenerating || isLoading}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Card
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-[#1a5e63] text-[#1a5e63]"
                  disabled={!generatedImage}
                  id="download-button"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  className="border-[#d4af37] text-[#d4af37]"
                  disabled={!generatedImage}
                  id="share-button"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Preview */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg border-[#d4af37]/20 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full h-full flex items-center justify-center bg-gray-100 min-h-[500px]">
              {!canvasRef ? (
                <div className="text-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1a5e63] mx-auto mb-2" />
                  <p className="text-gray-500">Preparing canvas...</p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={
                      canvasRef.toDataURL("image/jpeg") || "/placeholder.svg"
                    }
                    alt="Verse preview"
                    className="max-w-full max-h-[70vh] object-contain shadow-lg"
                  />
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1a5e63] mb-2" />
                    <p className="text-[#1a5e63] font-medium">
                      Generating your verse card...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!selectedBackground && !canvasRef && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <p className="font-medium">
              Loading default background. You can select a different background
              from the Background tab.
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-[#1a5e63] mb-2">
                Preview Information
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Surah:</span>{" "}
                  {surahData?.englishName || "Loading..."}
                </p>
                <p>
                  <span className="font-medium">Verse:</span> {selectedVerse}
                </p>
                <p>
                  <span className="font-medium">Canvas Size:</span>{" "}
                  {canvasWidth} x {canvasHeight}px
                </p>
                <p>
                  <span className="font-medium">Font:</span>{" "}
                  {QURAN_FONTS.find((f) => f.id === selectedFont)?.name ||
                    "Uthmani"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-[#1a5e63] mb-2">Tips</h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                <li>Use the Layout tab to adjust text position</li>
                <li>Try different frame styles for a unique look</li>
                <li>Save your favorite settings as presets</li>
                <li>Adjust opacity for better text visibility</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
