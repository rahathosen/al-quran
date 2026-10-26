"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AISearchModal from "@/components/ai-search-modal";

export default function AISearchInfo() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm p-4 sm:p-6 mb-8 border border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-foreground text-lg sm:text-xl font-bold">
          AI-Powered Quran Search
        </h2>
      </div>

      <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed max-w-prose text-pretty">
        Discover verses in the Quran related to specific topics, concepts, or
        themes using natural language. Find relevant verses even when you do not
        know exact Arabic wording or Surah numbers.
      </p>

      <Accordion type="single" collapsible className="mb-5">
        <AccordionItem value="how-it-works" className="border-border">
          <AccordionTrigger className="text-sm font-medium hover:text-primary">
            How It Works
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm space-y-2">
            <p>
              Our AI search interprets semantic meaning rather than exact keywords,
              mapping concepts to relevant Quranic passages with English and Bengali translations.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="example-searches" className="border-border">
          <AccordionTrigger className="text-sm font-medium hover:text-primary">
            Example Searches
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground text-sm">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <li>• <span className="font-medium text-foreground">Patience & perseverance</span></li>
              <li>• <span className="font-medium text-foreground">Forgiveness & mercy</span></li>
              <li>• <span className="font-medium text-foreground">Dealing with hardship</span></li>
              <li>• <span className="font-medium text-foreground">Gratitude to Allah</span></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-start">
        <Button
          onClick={openSearch}
          className="gap-2 font-medium"
        >
          <Sparkles className="h-4 w-4" />
          <span>Search with AI</span>
        </Button>
      </div>

      <AISearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  );
}
