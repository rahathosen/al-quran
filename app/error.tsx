"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-[#d4af37]/20 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-[#1a5e63] mb-4">Something went wrong</h2>
        <p className="text-[#555] mb-6">
          We couldn't load the Quran data. This might be due to a network issue or API limitation.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} className="bg-[#1a5e63] hover:bg-[#134548]">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="border-[#1a5e63] text-[#1a5e63]"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}

