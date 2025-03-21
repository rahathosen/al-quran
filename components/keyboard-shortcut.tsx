"use client"

import { useEffect } from "react"

interface KeyboardShortcutProps {
  shortcut: string
  action: () => void
  disabled?: boolean
}

export default function KeyboardShortcut({ shortcut, action, disabled = false }: KeyboardShortcutProps) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Command+K or Ctrl+K
      if (shortcut === "mod+k" && (e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        action()
      }

      // Add more shortcuts as needed
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcut, action, disabled])

  return null
}

