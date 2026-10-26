import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground py-4 md:py-6 border-b border-primary-foreground/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0 text-center md:text-left">
              Quran Verse Cards
              <span className="block text-lg font-normal text-primary-foreground/80">
                Create & Share Beautiful Verses
              </span>
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">
              Loading Canvas Editor
            </h2>
            <p className="text-muted-foreground">
              Please wait while we prepare the canvas editor for you...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
