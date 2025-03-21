import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-[#1a5e63] animate-spin" />
        <p className="text-[#1a5e63] font-medium">Loading Quran data...</p>
      </div>
    </div>
  )
}

