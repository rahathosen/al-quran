"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = () => {
  // Use next-themes hook directly
  const { theme, setTheme } = useNextTheme()

  return {
    theme,
    setTheme,
  }
}

// Import the actual hook from next-themes
import { useTheme as useNextTheme } from "next-themes"

