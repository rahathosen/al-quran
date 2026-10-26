import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="bg-primary text-primary-foreground py-4 md:py-6 border-b border-primary-foreground/10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24 bg-primary-foreground/20 rounded-md" />
              <div>
                <Skeleton className="h-7 w-48 bg-primary-foreground/20 rounded-md" />
                <Skeleton className="h-4 w-36 bg-primary-foreground/20 rounded-md mt-1" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 bg-primary-foreground/20 rounded-md" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls Skeleton */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-border">
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Tabs Skeleton */}
                <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
                  <Skeleton className="h-8 rounded" />
                  <Skeleton className="h-8 rounded" />
                  <Skeleton className="h-8 rounded" />
                </div>

                {/* Form Controls Skeleton */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-4 w-10 rounded" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-11 w-full rounded-xl" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stage Preview Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-lg border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full min-h-[500px] flex items-center justify-center p-6 bg-muted/30">
                  <Skeleton className="w-full max-w-[450px] aspect-[4/5] rounded-2xl shadow-md" />
                </div>
              </CardContent>
            </Card>

            {/* Info and Tips Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-2.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2.5">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
