"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { getSettings } from "@/lib/local-storage";

// Available Quran font styles
const QURAN_FONTS = [
  { id: "uthmani", name: "Uthmani", description: "Standard Uthmani script" },
  {
    id: "indopak",
    name: "IndoPak",
    description: "Indo-Pakistani style script",
  },
  { id: "naskh", name: "Naskh", description: "Clear Naskh style" },
  {
    id: "quran",
    name: "Amiri Quran",
    description: "Specialized for Quran text",
  },
  { id: "hafs", name: "Hafs", description: "Traditional Hafs typography" },
  { id: "madani", name: "Madani", description: "Medina Mushaf style" },
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

// Available color schemes
const COLOR_SCHEMES = [
  {
    id: "light",
    name: "Light",
    background: "rgba(255, 255, 255, 0.85)",
    text: "#1a1a1a",
  },
  {
    id: "dark",
    name: "Dark",
    background: "rgba(0, 0, 0, 0.75)",
    text: "#ffffff",
  },
  {
    id: "teal",
    name: "Teal",
    background: "rgba(26, 94, 99, 0.85)",
    text: "#ffffff",
  },
  {
    id: "gold",
    name: "Gold",
    background: "rgba(212, 175, 55, 0.85)",
    text: "#1a1a1a",
  },
  {
    id: "sepia",
    name: "Sepia",
    background: "rgba(112, 66, 20, 0.85)",
    text: "#f8f5f0",
  },
];

// Add a new COLOR_OPTIONS array after the COLOR_SCHEMES array
const COLOR_OPTIONS = [
  { id: "white", name: "White", color: "#ffffff" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "teal", name: "Teal", color: "#1a5e63" },
  { id: "gold", name: "Gold", color: "#d4af37" },
  { id: "red", name: "Red", color: "#e53e3e" },
  { id: "blue", name: "Blue", color: "#3182ce" },
  { id: "green", name: "Green", color: "#38a169" },
  { id: "purple", name: "Purple", color: "#805ad5" },
];

// Define background images
const backgroundImages = [
  { id: "mountains", src: "/canvas-images/mountains.webp", alt: "Mountains" },
  { id: "nature1", src: "/canvas-images/nature1.jpeg", alt: "Snowy Mountains" },
  { id: "water", src: "/canvas-images/water.webp", alt: "Dark Ocean" },
  { id: "ocean", src: "/canvas-images/ocean.jpeg", alt: "Blue Ocean" },
  {
    id: "mountain-peak",
    src: "/canvas-images/mountain-peak.jpeg",
    alt: "Mountain Peak",
  },
  { id: "forest", src: "/canvas-images/forest.jpeg", alt: "Misty Forest" },
  {
    id: "lavender",
    src: "/canvas-images/lavender.jpeg",
    alt: "Lavender Field",
  },
  { id: "sunset", src: "/canvas-images/sunset.jpeg", alt: "Sunset" },
  { id: "bridge", src: "/canvas-images/bridge.jpeg", alt: "Forest Bridge" },
];

interface CanvasEditorProps {
  surahs: any[];
}

export default function CanvasEditor({ surahs }: CanvasEditorProps) {
  // Canvas settings
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);
  const [selectedBackground, setSelectedBackground] = useState<string>("");
  const [selectedFont, setSelectedFont] = useState<string>("uthmani");
  const [selectedTranslation, setSelectedTranslation] =
    useState<string>("en.asad");
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showReference, setShowReference] = useState<boolean>(true);
  const [colorScheme, setColorScheme] = useState<string>("light");
  const [opacity, setOpacity] = useState<number>(20);
  const [fontSize, setFontSize] = useState<number>(2); // 1-4 scale

  // Add a new state for font color after the fontSize state
  const [fontColor, setFontColor] = useState<string>("white");

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

  // Load user settings on mount
  useEffect(() => {
    const settings = getSettings();
    if (settings.quranFont) setSelectedFont(settings.quranFont);
    if (settings.translationId) setSelectedTranslation(settings.translationId);

    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    setCanvasRef(canvas);
  }, []);

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

      // Draw text
      ctx.textAlign = "center";
      // Use the selected font color
      const selectedColorOption =
        COLOR_OPTIONS.find((option) => option.id === fontColor) ||
        COLOR_OPTIONS[0];
      ctx.fillStyle = selectedColorOption.color;

      // Draw Arabic text
      const arabicText = getCurrentVerseText();
      const fontSizeMap = { 1: 36, 2: 48, 3: 60, 4: 72 };
      const arabicFontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap];
      ctx.font = `${arabicFontSize}px 'Amiri', serif`;

      // Handle multiline text
      const maxWidth = canvasRef.width * 0.8;
      const lineHeight = arabicFontSize * 1.4;
      const arabicLines = wrapText(ctx, arabicText, maxWidth);

      // Position Arabic text
      let y = canvasRef.height * 0.35;
      arabicLines.forEach((line) => {
        ctx.fillText(line, canvasRef.width / 2, y);
        y += lineHeight;
      });

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

        // Position translation text
        y = canvasRef.height * 0.6;
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

  // Function to wrap text into multiple lines
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    if (!text) return [""];

    const words = text.split(" ");
    if (words.length === 0) return [""];

    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;

      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
    return lines;
  };

  // Render canvas with current settings
  const renderCanvas = () => {
    if (!canvasRef || !selectedBackground) return;

    const ctx = canvasRef.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);

    // Load background image
    const img = new Image();
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

      // Draw text
      ctx.textAlign = "center";
      // Use the selected font color instead of the color scheme text color
      const selectedColorOption =
        COLOR_OPTIONS.find((option) => option.id === fontColor) ||
        COLOR_OPTIONS[0];
      ctx.fillStyle = selectedColorOption.color;

      // Draw Arabic text
      const arabicText = getCurrentVerseText();
      const fontSizeMap = { 1: 36, 2: 48, 3: 60, 4: 72 };
      const arabicFontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap];
      ctx.font = `${arabicFontSize}px 'Amiri', serif`;

      // Handle multiline text
      const maxWidth = canvasRef.width * 0.8;
      const lineHeight = arabicFontSize * 1.4;
      const arabicLines = wrapText(ctx, arabicText, maxWidth);

      // Position Arabic text
      let y = canvasRef.height * 0.35;
      arabicLines.forEach((line) => {
        ctx.fillText(line, canvasRef.width / 2, y);
        y += lineHeight;
      });

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

        // Position translation text
        y = canvasRef.height * 0.6;
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
    img.src = selectedBackground;
  };

  // Get current verse text
  const getCurrentVerseText = () => {
    if (!surahData || !surahData.ayahs) return "";
    const verse = surahData.ayahs.find(
      (v: any) => v.numberInSurah === selectedVerse
    );
    return verse ? verse.text : "";
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

  // Effect to render canvas when background changes
  useEffect(() => {
    if (selectedBackground) {
      renderCanvas();
    }
  }, [selectedBackground]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Settings */}
      <div className="lg:col-span-1">
        <Card className="shadow-lg border-[#d4af37]/20">
          <CardContent className="p-6">
            <Tabs defaultValue="content">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger
                  value="content"
                  className="flex items-center gap-1"
                >
                  <Type className="h-4 w-4" />
                  <span>Content</span>
                </TabsTrigger>
                <TabsTrigger
                  value="background"
                  className="flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Background</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  <span>Style</span>
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
              </TabsContent>

              <TabsContent value="background">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Background</h3>
                  <RadioGroup
                    value={selectedBackground}
                    onValueChange={setSelectedBackground}
                    className="grid grid-cols-3 gap-2"
                  >
                    {backgroundImages.map((image) => (
                      <div key={image.id} className="relative">
                        <RadioGroupItem
                          value={image.src}
                          id={image.id}
                          className="sr-only"
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

                {/* Add a new section for font color in the Style tab content */}
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
              {!selectedBackground ? (
                <div className="text-center p-8">
                  <p className="text-gray-500">
                    Select a background image to preview your verse card
                  </p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {canvasRef && (
                    <img
                      src={
                        canvasRef.toDataURL("image/jpeg") || "/placeholder.svg"
                      }
                      alt="Verse preview"
                      className="max-w-full max-h-[70vh] object-contain shadow-lg"
                    />
                  )}
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

        {!selectedBackground && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <p className="font-medium">
              Please select a background image from the Background tab to create
              your verse card.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
