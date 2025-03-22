import { getSurahById } from "@/lib/quran-api";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const surahId = Number.parseInt(params.id);

    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      return new NextResponse("Invalid surah ID", { status: 400 });
    }

    // Fetch the surah data
    const surah = await getSurahById(surahId);

    if (!surah) {
      return new NextResponse("Surah not found", { status: 404 });
    }

    // Create an SVG that matches the style of /og-images/quran-og.svg but with surah-specific content
    const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with premium gradient -->
  <rect width="1200" height="630" fill="#1a5e63"/>
  <rect width="1200" height="630" fill="url(#paint0_linear)" fillOpacity="0.2"/>
  
  <!-- Decorative elements -->
  <path d="M0 0L1200 0L1200 20C1200 20 900 40 600 40C300 40 0 20 0 20L0 0Z" fill="#d4af37" fillOpacity="0.3"/>
  <path d="M0 630L1200 630L1200 610C1200 610 900 590 600 590C300 590 0 610 0 610L0 630Z" fill="#d4af37" fillOpacity="0.3"/>
  
  <!-- Decorative Islamic pattern at the corners -->
  <circle cx="100" cy="100" r="80" fill="#d4af37" fillOpacity="0.1"/>
  <circle cx="1100" cy="100" r="80" fill="#d4af37" fillOpacity="0.1"/>
  <circle cx="100" cy="530" r="80" fill="#d4af37" fillOpacity="0.1"/>
  <circle cx="1100" cy="530" r="80" fill="#d4af37" fillOpacity="0.1"/>
  
  <!-- Main title - Surah name in Arabic -->
  <text x="600" y="250" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="white" textAnchor="middle">${surah.name}</text>
  
  <!-- Subtitle - Surah name in English -->
  <text x="600" y="330" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="normal" fill="#d4af37" textAnchor="middle">Surah ${surah.englishName}</text>
  
  <!-- Tagline - Verse count and revelation type -->
  <text x="600" y="400" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="normal" fill="white" textAnchor="middle" fillOpacity="0.8">${surah.numberOfAyahs} Verses • ${surah.revelationType}</text>
  
  <!-- Decorative line -->
  <line x1="400" y1="450" x2="800" y2="450" stroke="#d4af37" strokeWidth="2" strokeOpacity="0.5"/>
  
  <!-- URL -->
  <text x="600" y="500" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="normal" fill="white" textAnchor="middle" fillOpacity="0.6">al-quran-ai.vercel.app</text>
  
  <!-- Gradient definition -->
  <defs>
    <linearGradient id="paint0_linear" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stopColor="#134548"/>
      <stop offset="1" stopColor="#1a5e63"/>
    </linearGradient>
  </defs>
</svg>`;

    // Return the SVG with the correct content type
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating SVG:", error);
    return new NextResponse("Error generating SVG", { status: 500 });
  }
}
