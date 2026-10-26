import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="bg-primary text-primary-foreground py-4 md:py-6 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <Skeleton className="h-8 w-28 bg-primary-foreground/20 rounded-md" />
              <Skeleton className="h-4 w-20 bg-primary-foreground/20 rounded-md" />
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
              <Skeleton className="h-10 w-full sm:w-44 bg-primary-foreground/20 rounded-md" />
              <Skeleton className="h-10 w-full sm:w-44 bg-primary-foreground/20 rounded-md" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* AI Search Info Banner Skeleton */}
        <div className="bg-primary/5 rounded-2xl p-4 sm:p-6 border border-primary/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-full max-w-md rounded" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
        </div>

        {/* Recently Read Section Skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-6 w-36 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`recent-skeleton-${i}`}
                className="bg-card text-card-foreground rounded-xl p-3.5 md:p-4 border border-border/80 flex items-center"
              >
                <Skeleton className="w-9 h-9 rounded-full mr-3 shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bookmarked Section Skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-6 w-44 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={`bookmark-skeleton-${i}`}
                className="bg-card text-card-foreground rounded-xl p-4 border border-border/80 space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-6 w-4/5 ml-auto rounded" />
                <Skeleton className="h-3.5 w-full rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Surah List Section Skeleton */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 md:w-10 md:h-10 rounded-full shrink-0" />
              <Skeleton className="h-7 w-48 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`surah-skeleton-${i}`}
                className="bg-card text-card-foreground rounded-xl p-3.5 md:p-4 border border-border/80 flex items-center"
              >
                <Skeleton className="w-10 h-10 rounded-full mr-3 shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-3.5 w-36 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
