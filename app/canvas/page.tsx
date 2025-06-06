import CanvasEditor from "@/components/canvas/canvas-editor";
import { getAllSurahs } from "@/lib/quran-api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Quran Verse Cards | Al-Quran",
  description:
    "Create beautiful Quran verse cards with custom backgrounds and share them on social media",
  openGraph: {
    title: "Create Quran Verse Cards | Al-Quran",
    description:
      "Create beautiful Quran verse cards with custom backgrounds and share them on social media",
    type: "website",
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://al-quran-ai.vercel.app/canvas",
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
        }/og-images/verse-cards-og.svg`,
        width: 1200,
        height: 630,
        alt: "Quran Verse Cards Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Quran Verse Cards | Al-Quran",
    description:
      "Create beautiful Quran verse cards with custom backgrounds and share them on social media",
    images: [
      `${
        process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app"
      }/og-images/verse-cards-og.svg`,
    ],
  },
  keywords:
    "Quran verses, Islamic quotes, Quran cards, verse creator, Islamic social media, Quran sharing",
};

export default async function CanvasPage() {
  // Fetch all surahs for the selection dropdown
  const surahs = await getAllSurahs();

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <header className="bg-[#1a5e63] text-white py-4 md:py-6 border-b border-[#d4af37]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0 text-center md:text-left">
              Quran Verse Cards
              <span className="block text-lg font-normal text-[#d4af37]">
                Create & Share Beautiful Verses
              </span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <CanvasEditor surahs={surahs} />
      </main>
    </div>
  );
}
