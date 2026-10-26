import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground py-4 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col gap-3">
          {/* Top row skeleton */}
          <div className="flex justify-between items-center">
            <div className="w-24 h-9 bg-primary-foreground/20 rounded-md animate-pulse"></div>
            <div className="flex gap-1">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Middle row skeleton */}
          <div className="w-full flex flex-col sm:flex-row gap-2">
            <div className="h-10 bg-primary-foreground/20 rounded-md w-full animate-pulse"></div>
            <div className="h-10 bg-primary-foreground/20 rounded-md w-full sm:w-auto animate-pulse"></div>
          </div>

          {/* Bottom row skeleton */}
          <div className="text-center pb-1">
            <div className="h-8 w-48 bg-primary-foreground/20 rounded-md mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 w-64 bg-primary-foreground/20 rounded-md mx-auto animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 pb-32">
        {/* Verse Metadata skeleton */}
        <div className="h-12 bg-muted rounded-xl mb-6 animate-pulse"></div>

        <div className="bg-card text-card-foreground rounded-2xl shadow-sm p-4 md:p-6 mb-6 md:mb-8 border border-border">
          {/* Surah header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="w-full sm:w-1/2">
              <div className="h-7 bg-muted rounded-md w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-muted rounded-md w-1/2 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="h-10 bg-muted rounded-md w-32 animate-pulse"></div>
              <div className="h-10 bg-muted rounded-md w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Bismillah skeleton */}
          <div className="bg-muted/40 p-3 md:p-4 rounded-xl border border-border mb-6">
            <div className="h-6 bg-muted rounded-md w-3/4 mx-auto mb-2 animate-pulse"></div>
            <div className="h-8 bg-muted rounded-md w-1/2 mx-auto animate-pulse"></div>
          </div>

          {/* Verses skeleton */}
          <div className="space-y-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="border-b border-border/60 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="h-8 bg-muted rounded-md w-full mb-4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded-md w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons skeleton */}
        <div className="flex justify-between mt-6">
          <div className="w-32 h-10 bg-muted rounded-md animate-pulse"></div>
          <div className="w-32 h-10 bg-muted rounded-md animate-pulse"></div>
        </div>
      </main>

      {/* Loading indicator overlay */}
      <div className="fixed inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center pointer-events-none z-50">
        <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-xl border border-border flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-foreground font-medium">Loading Surah...</p>
        </div>
      </div>
    </div>
  );
}
