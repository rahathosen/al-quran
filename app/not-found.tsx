import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-[#d4af37]/20 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-[#1a5e63] mb-4">Surah Not Found</h2>
        <p className="text-[#555] mb-6">The Surah you're looking for doesn't exist or couldn't be loaded.</p>
        <Link href="/">
          <Button className="bg-[#1a5e63] hover:bg-[#134548]">Return to Home</Button>
        </Link>
      </div>
    </div>
  )
}

