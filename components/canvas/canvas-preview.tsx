"use client";

import { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getFontFamilyClass,
  wrapText,
  applyTextEffect,
  drawFrame,
  addWatermark,
} from "@/lib/canvas-utils";

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
  textEffect?: string;
  frameStyle?: string;
  watermark?: string;
  textPosition?: number;
  canvasWidth?: number;
  canvasHeight?: number;
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
  textEffect = "none",
  frameStyle = "none",
  watermark = "",
  textPosition = 50,
  canvasWidth = 1080,
  canvasHeight = 1080,
  isGenerating,
  onImageGenerated,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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

      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw overlay with specified opacity
      ctx.fillStyle = colorScheme.background.replace(
        /[\d.]+\)$/,
        `${opacity / 100})`
      );
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frame if selected
      if (frameStyle !== "none") {
        drawFrame(
          ctx,
          frameStyle,
          canvas.width,
          canvas.height,
          colorScheme.text
        );
      }

      // Set text properties
      ctx.textAlign = "center";
      ctx.fillStyle = colorScheme.text;

      // Apply text effect
      applyTextEffect(ctx, textEffect, colorScheme.text);

      // Draw Arabic text
      const arabicFontSize = fontSizeMap[fontSize as keyof typeof fontSizeMap];

      // Get the font family based on fontType
      ctx.font = `${arabicFontSize}px ${getFontFamilyClass(fontType)}`;

      // Handle multiline text
      const maxWidth = canvas.width * 0.8;
      const lineHeight = arabicFontSize * 1.4;
      const arabicLines = wrapText(ctx, arabicText, maxWidth);

      // Position Arabic text based on textPosition
      let y = canvas.height * (textPosition / 100);

      // Draw Arabic text lines
      arabicLines.forEach((line) => {
        ctx.fillText(line, canvas.width / 2, y);
        if (textEffect === "outline") {
          ctx.strokeText(line, canvas.width / 2, y);
        }
        y += lineHeight;
      });

      // Reset shadow for other text
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

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
        y += translationLineHeight * 0.5;

        // Draw translation lines
        translationLines.forEach((line) => {
          ctx.fillText(line, canvas.width / 2, y);
          y += translationLineHeight;
        });
      }

      // Draw reference if provided
      if (reference) {
        ctx.font = '24px "Noto Sans", sans-serif';
        ctx.fillText(reference, canvas.width / 2, canvas.height - 50);
      }

      // Add watermark if provided
      if (watermark) {
        addWatermark(ctx, watermark, canvas.width, canvas.height);
      }

      // If generating, create image URL
      if (isGenerating) {
        const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
        onImageGenerated(imageUrl);
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
    textEffect,
    frameStyle,
    watermark,
    textPosition,
  ]);

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
