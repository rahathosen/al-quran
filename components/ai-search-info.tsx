"use client"

// Add click handler to open the AI search modal
import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import AISearchModal from "@/components/ai-search-modal"

export default function AISearchInfo() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => setIsSearchOpen(false)

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 border border-[#d4af37]/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#d4af37]" />
        </div>
        <h2 className="text-[#1a5e63] text-xl font-semibold">AI-Powered Quran Search</h2>
      </div>

      <p className="text-[#555] mb-4">
        Discover verses in the Quran related to specific topics, concepts, or themes using our AI-powered search. This
        feature helps you find relevant verses even when you don't know the exact words or surah numbers.
      </p>

      <Accordion type="single" collapsible className="mb-4">
        <AccordionItem value="how-it-works">
          <AccordionTrigger className="text-[#1a5e63]">How It Works</AccordionTrigger>
          <AccordionContent className="text-[#555]">
            <p className="mb-2">
              Our AI search uses advanced language models to understand the meaning behind your query and find relevant
              verses in the Quran.
            </p>
            <p className="mb-2">
              Unlike traditional search that looks for exact words, AI search understands concepts and can find verses
              that relate to your topic even if they use different wording.
            </p>
            <p>
              For each result, you'll see the verse in Arabic, its English translation, and a link to view it in context
              within its surah.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="example-searches">
          <AccordionTrigger className="text-[#1a5e63]">Example Searches</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 text-[#555]">
              <li>
                • <span className="font-medium">Patience</span> - Find verses about patience and perseverance
              </li>
              <li>
                • <span className="font-medium">Forgiveness</span> - Discover verses about Allah's forgiveness
              </li>
              <li>
                • <span className="font-medium">Dealing with hardship</span> - Guidance on facing difficulties
              </li>
              <li>
                • <span className="font-medium">Gratitude</span> - Verses about being thankful to Allah
              </li>
              <li>
                • <span className="font-medium">Knowledge</span> - Verses about seeking knowledge
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tips">
          <AccordionTrigger className="text-[#1a5e63]">Search Tips</AccordionTrigger>
          <AccordionContent className="text-[#555]">
            <ul className="space-y-2">
              <li>• Be specific in your search to get more relevant results</li>
              <li>• Use natural language questions like "How should I treat my parents?"</li>
              <li>• Try different phrasings if you don't get the results you expect</li>
              <li>• Search for concepts rather than specific words for better results</li>
              <li>• Remember that results are AI-generated and may not be perfect</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-center">
        <Button className="bg-[#d4af37] hover:bg-[#c9a431] text-[#1a5e63]" onClick={openSearch}>
          <Sparkles className="mr-2 h-4 w-4" />
          Try AI Search
        </Button>
      </div>

      <AISearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </div>
  )
}

