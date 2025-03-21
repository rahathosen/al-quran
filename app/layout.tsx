import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AudioProvider } from "@/context/audio-context"
import AudioPlayerDrawer from "@/components/audio-player-drawer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Al-Quran Al-Kareem",
  description: "Read and explore the Holy Quran with beautiful Arabic text and translations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AudioProvider>
            {children}
            <AudioPlayerDrawer />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'