import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <header className="bg-[#1a5e63] text-white py-4 md:py-6 border-b border-[#d4af37]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0 text-center md:text-left">
              Quran Verse Cards
              <span className="block text-lg font-normal text-[#d4af37]">
                Create & Share Beautiful Verses
              </span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-[#1a5e63] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium text-[#1a5e63] mb-2">
              Loading Canvas Editor
            </h2>
            <p className="text-gray-500">
              Please wait while we prepare the canvas editor for you...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
