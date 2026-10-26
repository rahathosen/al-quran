import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="bg-primary text-primary-foreground py-4 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col gap-3">
          {/* Top navigation row: Back icon & Desktop search on left, action buttons on right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 md:flex-initial">
              <Skeleton className="w-9 h-9 rounded-full bg-primary-foreground/20 shrink-0" />
              <div className="hidden md:flex items-center gap-2">
                <Skeleton className="h-9 w-48 bg-primary-foreground/20 rounded-md" />
                <Skeleton className="h-9 w-36 bg-primary-foreground/20 rounded-md" />
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Skeleton className="w-9 h-9 bg-primary-foreground/20 rounded-md" />
              <Skeleton className="w-9 h-9 bg-primary-foreground/20 rounded-md" />
              <Skeleton className="w-9 h-9 bg-primary-foreground/20 rounded-md" />
            </div>
          </div>

          {/* Mobile search buttons - 2-column grid on small screens (< md) */}
          <div className="w-full grid grid-cols-2 gap-2 md:hidden">
            <Skeleton className="h-10 bg-primary-foreground/20 rounded-xl w-full" />
            <Skeleton className="h-10 bg-primary-foreground/20 rounded-xl w-full" />
          </div>

          {/* Bottom row: Surah title & metadata */}
          <div className="text-center pb-0.5 sm:pb-1 space-y-1.5">
            <Skeleton className="h-8 w-40 bg-primary-foreground/20 rounded-md mx-auto" />
            <Skeleton className="h-4 w-52 bg-primary-foreground/20 rounded-md mx-auto" />
            <Skeleton className="h-3 w-36 bg-primary-foreground/20 rounded-md mx-auto" />
            <div className="flex justify-center gap-1.5 pt-1 flex-wrap">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={`meta-pill-${i}`}
                  className="h-5 w-14 bg-primary-foreground/20 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8 pb-32">
        <div className="bg-card text-card-foreground rounded-2xl shadow-sm p-3.5 sm:p-6 md:p-8 mb-6 border border-border">
          {/* Controls header skeleton */}
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Skeleton className="h-8.5 w-16 sm:w-24 rounded-md" />
              <Skeleton className="h-8.5 w-18 sm:w-24 rounded-md" />
            </div>
          </div>

          {/* Bismillah skeleton */}
          <div className="bg-muted/30 p-3.5 sm:p-5 rounded-xl border border-border/80 mb-5 sm:mb-8 text-center space-y-2">
            <Skeleton className="h-4 w-44 mx-auto rounded" />
            <Skeleton className="h-7 w-60 mx-auto rounded" />
          </div>

          {/* Verses Skeletons */}
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`verse-skeleton-${index}`} className="border-b border-border/60 pb-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-7 h-7 rounded-md" />
                    <Skeleton className="w-7 h-7 rounded-md" />
                  </div>
                </div>

                {/* Arabic text line */}
                <Skeleton className="h-8 w-4/5 ml-auto rounded" />

                {/* Translation lines */}
                <div className="space-y-1.5 pt-1">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons skeleton */}
        <div className="flex justify-between mt-6">
          <Skeleton className="w-32 h-10 rounded-xl" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </main>
    </div>
  );
}
