"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface CanvasPreviewProps {
  backgroundImage: string;
  arabicText: string;
  translationText: string;
  reference: string;
  fontType: string;
  fontSize: number;
  colorScheme: {
    id: string;
    name: string;
    background: string;
    text: string;
  };
  opacity: number;
  isGenerating: boolean;
  onImageGenerated: (imageUrl: string | null) => void;
}

export default function CanvasPreview({
  backgroundImage,
  arabicText,
  translationText,
  reference,
  fontType,
  fontSize,
  colorScheme,
  opacity,
  isGenerating,
  onImageGenerated,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);

  // Font size mapping
  const fontSizeMap = {
    1: 36,
    2: 48,
    3: 60,
    4: 72,
  };

  // Translation font size mapping (smaller than Arabic)
  const translationFontSizeMap = {
    1: 24,
    2: 30,
    3: 36,
    4: 42,
  };

  // Draw canvas when dependencies change
  useEffect(() => {
    if (!backgroundImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear previous content
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Show loading state
    setIsImageLoaded(false);

    // Load background image
    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for CORS

    // Set up onload handler before setting src
    img.onload = () => {
      setIsImageLoaded(true);

      // Set canvas dimensions based on image aspect ratio
      const aspectRatio = img.width / img.height;
      let newWidth = canvasWidth;
      let newHeight = canvasWidth / aspectRatio;

      if (newHeight > canvasHeight * 1.5) {
        newHeight = canvasHeight;
        newWidth = canvasHeight * aspectRatio;
      }

      // Update canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw background
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Draw overlay with specified opacity
      ctx.fillStyle = colorScheme.background.replace(
        /[\d.]+\)$/,
        `${opacity})`
      );
      ctx.fillRect(0, 0, newWidth, newHeight);

      // Set text properties
      ctx.textAlign = "center";
      ctx.fillStyle = colorScheme.text;

      // Draw Arabic text
      const arabicFontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap];

      // Get the font family based on fontType
      ctx.font = `${arabicFontSize}px ${getFontFamilyClass(fontType)}`;

      // Handle multiline text
      const maxWidth = newWidth * 0.8;
      const lineHeight = arabicFontSize * 1.4;
      const arabicLines = wrapText(ctx, arabicText, maxWidth);

      // Position Arabic text in the upper portion
      let y = newHeight * 0.35;

      // Draw Arabic text lines
      arabicLines.forEach((line) => {
        ctx.fillText(line, newWidth / 2, y);
        y += lineHeight;
      });

      // Draw translation if provided
      if (translationText) {
        const translationFontSize =
          translationFontSizeMap[
            fontSize as keyof typeof translationFontSizeMap
          ];
        ctx.font = `${translationFontSize}px 'Noto Sans', sans-serif`;

        // Handle multiline translation
        const translationLineHeight = translationFontSize * 1.4;
        const translationLines = wrapText(ctx, translationText, maxWidth);

        // Position translation text below Arabic
        y = newHeight * 0.6;

        // Draw translation lines
        translationLines.forEach((line) => {
          ctx.fillText(line, newWidth / 2, y);
          y += translationLineHeight;
        });
      }

      // Draw reference if provided
      if (reference) {
        ctx.font = '24px "Noto Sans", sans-serif';
        ctx.fillText(reference, newWidth / 2, newHeight - 50);
      }

      // If generating, create image URL
      if (isGenerating) {
        const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
        onImageGenerated(imageUrl);

        // Set up download and share buttons
        setupDownloadButton(imageUrl);
        setupShareButton(imageUrl);
      }
    };

    img.onerror = () => {
      console.error("Error loading image");
      setIsImageLoaded(false);

      // Draw error message on canvas
      ctx.fillStyle = "#f8f5f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ff0000";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Error loading image. Please try another background.",
        canvas.width / 2,
        canvas.height / 2
      );
    };

    // Set src after setting up event handlers
    img.src = backgroundImage;
  }, [
    backgroundImage,
    arabicText,
    translationText,
    reference,
    fontType,
    fontSize,
    colorScheme,
    opacity,
    isGenerating,
    canvasWidth,
    canvasHeight,
  ]);

  // Function to wrap text into multiple lines
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

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

  // Helper function to get the correct font family based on the selected font style
  const getFontFamilyClass = (fontStyle: string): string => {
    switch (fontStyle) {
      case "uthmani":
        return "'Amiri', serif";
      case "indopak":
        return "'Scheherazade New', serif";
      case "naskh":
        return "'Noto Naskh Arabic', serif";
      case "quran":
        return "'Amiri Quran', serif";
      case "hafs":
        return "'Scheherazade New', serif";
      case "madani":
        return "'Amiri', serif";
      default:
        return "'Amiri', serif";
    }
  };

  // Set up download button
  const setupDownloadButton = (imageUrl: string) => {
    const downloadButton = document.getElementById("download-button");
    if (downloadButton) {
      downloadButton.onclick = () => {
        const link = document.createElement("a");
        link.download = `quran-verse-card-${Date.now()}.jpg`;
        link.href = imageUrl;
        link.click();
      };
    }
  };

  // Set up share button
  const setupShareButton = (imageUrl: string) => {
    const shareButton = document.getElementById("share-button");
    if (shareButton) {
      shareButton.onclick = async () => {
        try {
          // Convert data URL to Blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();

          // Check if Web Share API supports sharing files
          if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
              files: [
                new File([blob], "quran-verse.jpg", { type: "image/jpeg" }),
              ],
            })
          ) {
            await navigator.share({
              title: "Quran Verse Card",
              text: reference,
              files: [
                new File([blob], "quran-verse.jpg", { type: "image/jpeg" }),
              ],
            });
          } else {
            // Fallback to clipboard copy
            try {
              await navigator.clipboard.writeText(
                "Quran Verse Card - " + reference
              );
              alert(
                "Image cannot be shared directly. The reference has been copied to your clipboard."
              );
            } catch (err) {
              console.error("Failed to copy to clipboard:", err);
            }
          }
        } catch (err) {
          console.error("Error sharing:", err);
        }
      };
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100 min-h-[500px]">
      {!backgroundImage ? (
        <div className="text-center p-8">
          <p className="text-gray-500">
            Select a background image to preview your verse card
          </p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[70vh] object-contain shadow-lg"
        />
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
  );
}
