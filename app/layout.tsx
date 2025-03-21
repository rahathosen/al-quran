import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AudioProvider } from "@/context/audio-context";
import AudioPlayerDrawer from "@/components/audio-player-drawer";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Al-Quran Al-Kareem",
  description:
    "Read and explore the Holy Quran with beautiful Arabic text and translations",
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
      <script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="231fe015-6997-42ba-bd51-ba761d2b558c"
      ></script>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AudioProvider>
            {children}
            <Footer />
            <AudioPlayerDrawer />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
