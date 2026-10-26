import CanvasEditor from "@/components/canvas/canvas-editor";
import { getAllSurahs } from "@/lib/quran-api";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import JsonLd from "@/components/json-ld";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app";

export const metadata: Metadata = {
  title: "Create Quran Verse Cards | Al-Quran",
  description:
    "Design and create beautiful Quran verse cards with custom backgrounds, authentic calligraphy, and typography. Share inspiring Ayahs directly to social media.",
  alternates: {
    canonical: `${baseUrl}/canvas`,
  },
  openGraph: {
    title: "Create Quran Verse Cards | Al-Quran",
    description:
      "Design and create beautiful Quran verse cards with custom backgrounds, authentic calligraphy, and typography. Share inspiring Ayahs directly to social media.",
    type: "website",
    url: `${baseUrl}/canvas`,
    images: [
      {
        url: `${baseUrl}/og-images/verse-cards-og.svg`,
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
      "Design and create beautiful Quran verse cards with custom backgrounds and share them on social media.",
    images: [`${baseUrl}/og-images/verse-cards-og.svg`],
  },
  keywords:
    "Quran verses, Islamic quotes, Quran cards, verse creator, Islamic social media, Quran sharing, Ayah designer",
};

export default async function CanvasPage() {
  const surahs = await getAllSurahs();

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Quran Verse Cards Creator",
    url: `${baseUrl}/canvas`,
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
    description:
      "Create beautiful social media cards from Quranic verses with customizable Arabic calligraphy, translations, and backgrounds.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Verse Cards Creator",
        item: `${baseUrl}/canvas`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <JsonLd data={[webAppSchema, breadcrumbSchema]} />
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
