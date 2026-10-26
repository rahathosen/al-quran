"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          We couldn&apos;t load the Quran data. This might be due to a network issue or API limitation.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="flex-1">
            Try again
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex-1"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
