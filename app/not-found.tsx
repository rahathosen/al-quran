import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-lg border border-border max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Surah Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          The Surah or page you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
        </p>
        <Link href="/">
          <Button className="w-full">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
}
