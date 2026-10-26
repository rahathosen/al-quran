import CanvasEditor from "@/components/canvas/canvas-editor";
import { getAllSurahs } from "@/lib/quran-api";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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
  const surahs = await getAllSurahs();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="bg-primary text-primary-foreground py-4 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/15 px-2"
                  aria-label="Back to home"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Home</span>
                </Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">
                Verse Cards Creator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-primary-foreground/80">
              Create & Share Beautiful Ayahs
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <CanvasEditor surahs={surahs} />
      </main>
    </div>
  );
}
