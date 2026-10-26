import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioProvider } from "@/context/audio-context";
import AudioPlayerDrawer from "@/components/audio-player-drawer";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Al-Quran - Read, Listen & Study the Holy Quran",
    template: "%s | Al-Quran",
  },
  description:
    "Read, study, and listen to the Holy Quran with authentic Arabic text (Uthmani), multiple translations (English, Bengali, Urdu), audio recitations by world-class Qaris, AI semantic search, and verse card generator.",
  applicationName: "Al-Quran",
  authors: [{ name: "Al-Quran Team", url: baseUrl }],
  generator: "Next.js",
  keywords: [
    "Quran",
    "Holy Quran",
    "Al-Quran",
    "القرآن الكريم",
    "Quran online",
    "Quran audio",
    "Quran translation",
    "Quran English",
    "Quran Bengali",
    "Surah",
    "Ayah",
    "Mishary Rashid Alafasy",
    "Abdul Basit",
    "Islamic scripture",
    "Quran AI search",
    "Verse card maker",
    "Prayer times",
  ],
  creator: "Rahat Hosen",
  publisher: "Al-Quran",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-US": baseUrl,
      ar: `${baseUrl}?lang=ar`,
      "bn-BD": `${baseUrl}?lang=bn`,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA", "bn_BD"],
    url: baseUrl,
    siteName: "Al-Quran",
    title: "Al-Quran - Read, Listen & Study the Holy Quran",
    description:
      "Explore the Holy Quran with beautiful Arabic text, synchronized audio recitations, AI-powered semantic search, and verse card generator.",
    images: [
      {
        url: "/og-images/quran-og.svg",
        width: 1200,
        height: 630,
        alt: "Al-Quran - The Holy Quran",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Al-Quran - Read, Listen & Study the Holy Quran",
    description:
      "Explore the Holy Quran with beautiful Arabic typography, multi-language translations, audio recitations, and AI search.",
    images: ["/og-images/quran-og.svg"],
    creator: "@rahathosen",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-96x96.png",
  },
  manifest: "/site.webmanifest",
  category: "religion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="231fe015-6997-42ba-bd51-ba761d2b558c"
          strategy="afterInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "theme-sepia", "theme-green", "theme-blue"]}
        >
          <AudioProvider>
            {children}
            <Analytics />
            <Footer />
            <AudioPlayerDrawer />
            <Toaster />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
