// Utility functions for canvas operations

// Available color schemes
export const COLOR_SCHEMES = [
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
  {
    id: "royal",
    name: "Royal",
    background: "rgba(25, 25, 112, 0.85)",
    text: "#ffffff",
  },
  {
    id: "forest",
    name: "Forest",
    background: "rgba(34, 85, 34, 0.85)",
    text: "#ffffff",
  },
  {
    id: "rose",
    name: "Rose",
    background: "rgba(188, 143, 143, 0.85)",
    text: "#1a1a1a",
  },
];

// Font color options
export const COLOR_OPTIONS = [
  { id: "white", name: "White", color: "#ffffff" },
  { id: "black", name: "Black", color: "#000000" },
  { id: "teal", name: "Teal", color: "#1a5e63" },
  { id: "gold", name: "Gold", color: "#d4af37" },
  { id: "red", name: "Red", color: "#e53e3e" },
  { id: "blue", name: "Blue", color: "#3182ce" },
  { id: "green", name: "Green", color: "#38a169" },
  { id: "purple", name: "Purple", color: "#805ad5" },
];

// Available Quran font styles
export const QURAN_FONTS = [
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
export const TRANSLATIONS = [
  { id: "en.asad", name: "Muhammad Asad", language: "English" },
  { id: "en.pickthall", name: "Marmaduke Pickthall", language: "English" },
  { id: "en.sahih", name: "Saheeh International", language: "English" },
  { id: "en.yusufali", name: "Yusuf Ali", language: "English" },
  { id: "bn.bengali", name: "Muhiuddin Khan", language: "Bengali" },
  { id: "ur.jalandhry", name: "Jalandhry", language: "Urdu" },
  { id: "fr.hamidullah", name: "Hamidullah", language: "French" },
  { id: "es.cortes", name: "Julio Cortes", language: "Spanish" },
];

// Define background images
export const BACKGROUND_IMAGES = [
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
  // New backgrounds
  //   { id: "mosque", src: "/canvas-images/mosque.jpeg", alt: "Mosque" },
  //   { id: "desert", src: "/canvas-images/desert.jpeg", alt: "Desert" },
  //   {
  //     id: "geometric",
  //     src: "/canvas-images/geometric.jpeg",
  //     alt: "Islamic Geometric Pattern",
  //   },
];

// Text effects
export const TEXT_EFFECTS = [
  { id: "none", name: "None" },
  { id: "shadow", name: "Shadow" },
  { id: "glow", name: "Glow" },
  { id: "outline", name: "Outline" },
];

// Frame styles
export const FRAME_STYLES = [
  { id: "none", name: "None" },
  { id: "simple", name: "Simple Border" },
  { id: "ornate", name: "Ornate" },
  { id: "modern", name: "Modern" },
  { id: "double", name: "Double Line" },
];

// Canvas sizes
export const CANVAS_SIZES = [
  { id: "square", name: "Square (1:1)", width: 1080, height: 1080 },
  { id: "portrait", name: "Portrait (4:5)", width: 1080, height: 1350 },
  { id: "landscape", name: "Landscape (16:9)", width: 1920, height: 1080 },
  { id: "story", name: "Story (9:16)", width: 1080, height: 1920 },
];

// Social media templates
export const SOCIAL_TEMPLATES = [
  { id: "instagram", name: "Instagram Post", width: 1080, height: 1080 },
  { id: "instagram-story", name: "Instagram Story", width: 1080, height: 1920 },
  { id: "facebook", name: "Facebook Post", width: 1200, height: 630 },
  { id: "twitter", name: "Twitter Post", width: 1200, height: 675 },
];

// Helper function to get the correct font family based on the selected font style
export function getFontFamilyClass(fontStyle: string): string {
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
}

// Function to wrap text into multiple lines
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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
}

// Apply text effect to canvas context
export function applyTextEffect(
  ctx: CanvasRenderingContext2D,
  effect: string,
  color: string
): void {
  switch (effect) {
    case "shadow":
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      break;
    case "glow":
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      break;
    case "outline":
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      break;
    default:
      // Reset effects
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;
  }
}

// Draw frame on canvas
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frameStyle: string,
  width: number,
  height: number,
  color = "#d4af37"
): void {
  const padding = 20;

  switch (frameStyle) {
    case "simple":
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(
        padding,
        padding,
        width - padding * 2,
        height - padding * 2
      );
      break;
    case "double":
      // Outer border
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        padding,
        padding,
        width - padding * 2,
        height - padding * 2
      );

      // Inner border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        padding + 10,
        padding + 10,
        width - (padding + 10) * 2,
        height - (padding + 10) * 2
      );
      break;
    case "ornate":
      // Draw ornate corners
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      // Draw main border
      ctx.strokeRect(
        padding,
        padding,
        width - padding * 2,
        height - padding * 2
      );

      // Draw corner ornaments
      const cornerSize = 30;

      // Top-left corner
      drawCornerOrnament(ctx, padding, padding, cornerSize, color);

      // Top-right corner
      drawCornerOrnament(
        ctx,
        width - padding,
        padding,
        cornerSize,
        color,
        Math.PI * 0.5
      );

      // Bottom-right corner
      drawCornerOrnament(
        ctx,
        width - padding,
        height - padding,
        cornerSize,
        color,
        Math.PI
      );

      // Bottom-left corner
      drawCornerOrnament(
        ctx,
        padding,
        height - padding,
        cornerSize,
        color,
        Math.PI * 1.5
      );
      break;
    case "modern":
      // Draw only at corners
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      const cornerLength = 40;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(padding, padding + cornerLength);
      ctx.lineTo(padding, padding);
      ctx.lineTo(padding + cornerLength, padding);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(width - padding - cornerLength, padding);
      ctx.lineTo(width - padding, padding);
      ctx.lineTo(width - padding, padding + cornerLength);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(width - padding, height - padding - cornerLength);
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(width - padding - cornerLength, height - padding);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(padding + cornerLength, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(padding, height - padding - cornerLength);
      ctx.stroke();
      break;
    default:
      // No frame
      break;
  }
}

// Helper function to draw ornate corner
function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(-size / 2, -size / 2, -size, 0);
  ctx.stroke();

  // Add decorative curl
  ctx.beginPath();
  ctx.moveTo(-size / 2, -size / 2);
  ctx.quadraticCurveTo(-size / 4, -size / 4, -size / 3, -size / 6);
  ctx.stroke();

  ctx.restore();
}

// Add watermark to canvas
export function addWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.font = '14px "Noto Sans", sans-serif';
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.textAlign = "end";
  ctx.fillText(text, width - 20, height - 20);
  ctx.restore();
}

// Generate a debounced function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
