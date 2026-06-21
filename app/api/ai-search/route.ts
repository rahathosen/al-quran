// app/api/ai-search/route.ts
import { NextResponse } from "next/server";
import { QURAN_SEARCH_PROMPT } from "@/lib/prompts";
import { getAyah, getAllSurahs } from "@/lib/quran-api";
import { getVerseData } from "@/lib/quran-data";
import OpenAI from "openai";
import { preloadQuranData } from "@/lib/quran-data";

// Start loading immediately (non‑blocking)
preloadQuranData();

const openai = new OpenAI({
  baseURL: process.env.LLM_BASE_URL || "",
  apiKey: process.env.LLM_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "",
    "X-Title": "Al-Quran Al-Kareem",
  },
});

// Simple in‑memory cache for AI references (optional but powerful)
const referenceCache = new Map<
  string,
  {
    verses: {
      surahNumber: number;
      verseNumber: number;
      explanation?: string;
    }[];
  }
>();

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 },
      );
    }
    if (!process.env.LLM_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // 1. Get AI references (with caching)
    let references;
    if (referenceCache.has(query)) {
      references = referenceCache.get(query)!.verses;
    } else {
      const completion = await openai.chat.completions.create({
        model: process.env.LLM_MODEL_NAME || "",
        messages: [
          { role: "system", content: QURAN_SEARCH_PROMPT },
          { role: "user", content: `Find Quranic verses about: ${query}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500, // very small, only references
      });

      const text = completion.choices[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: "AI response not valid JSON", results: [] },
          { status: 500 },
        );
      }

      const verses = parsed?.verses || [];
      // Validate basic structure
      if (!Array.isArray(verses) || verses.length === 0) {
        return NextResponse.json({ results: [] });
      }

      // Keep only valid references (1–7)
      const cleanRefs = verses
        .filter(
          (v: any) =>
            typeof v.surahNumber === "number" &&
            typeof v.verseNumber === "number",
        )
        .slice(0, 7);
      if (cleanRefs.length === 0) return NextResponse.json({ results: [] });

      referenceCache.set(query, { verses: cleanRefs });
      references = cleanRefs;
    }

    // 2. Fetch actual verse data from Quran API (parallel)
    const surahList = await getAllSurahs(); // get surah names (cached)
    const surahMap = new Map(surahList.map((s) => [s.number, s]));

    // inside POST handler, after references are obtained:
    const fetchVerseData = async (ref: {
      surahNumber: number;
      verseNumber: number;
      explanation?: string;
    }) => {
      const { surahNumber, verseNumber, explanation } = ref;
      const verse = await getVerseData(surahNumber, verseNumber);
      return { ...verse, explanation: explanation || "" };
    };

    const results = await Promise.all(references.map(fetchVerseData));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "An error occurred during the search" },
      { status: 500 },
    );
  }
}
