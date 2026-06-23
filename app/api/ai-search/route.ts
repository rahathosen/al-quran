import { NextResponse } from "next/server";
import { QURAN_SEARCH_PROMPT } from "@/lib/prompts";
import { getAyah, getAllSurahs } from "@/lib/quran-api";
import OpenAI from "openai";
import { headers } from "next/headers";

const openai = new OpenAI({
  baseURL: process.env.LLM_BASE_URL || "",
  apiKey: process.env.LLM_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "",
    "X-Title": "Al-Quran Al-Kareem",
  },
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_IP = 10;
const RATE_LIMIT_MAX_GLOBAL = 60;
const MAX_QUERY_LENGTH = 500;
const requestLog = new Map<string, number[]>();
const globalRequestLog: number[] = [];

function getClientIp(): string {
  const hdrs = headers();
  return (
    hdrs.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("cf-connecting-ip") ??
    hdrs.get("x-real-ip") ??
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  const globalRecent = globalRequestLog.filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  globalRecent.push(now);
  globalRequestLog.length = 0;
  globalRequestLog.push(...globalRecent);
  if (globalRecent.length > RATE_LIMIT_MAX_GLOBAL) return true;

  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_PER_IP;
}

function sanitizeQuery(raw: string): string {
  return raw.replace(/[\x00-\x1f]/g, "").trim();
}

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
    const ip = getClientIp();

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many searches. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const rawQuery = body?.query;
    if (!rawQuery || typeof rawQuery !== "string") {
      return NextResponse.json(
        { error: "Please enter a search query." },
        { status: 400 },
      );
    }

    const query = sanitizeQuery(rawQuery).slice(0, MAX_QUERY_LENGTH);
    if (query.length === 0) {
      return NextResponse.json(
        { error: "Please enter a search query." },
        { status: 400 },
      );
    }

    if (!process.env.LLM_API_KEY) {
      return NextResponse.json(
        {
          error:
            "AI search is not configured. Please contact the administrator.",
        },
        { status: 500 },
      );
    }

    const surahList = await getAllSurahs();
    const surahMap = new Map(surahList.map((s) => [s.number, s]));

    let references;
    if (referenceCache.has(query)) {
      references = referenceCache.get(query)!.verses;
    } else {
      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: process.env.LLM_MODEL_NAME || "",
          messages: [
            { role: "system", content: QURAN_SEARCH_PROMPT },
            { role: "user", content: `Find Quranic verses about: ${query}` },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 500,
        });
      } catch {
        return NextResponse.json(
          {
            error:
              "AI service is temporarily unavailable. Please try again later.",
          },
          { status: 502 },
        );
      }

      const text = completion.choices[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return NextResponse.json(
          {
            error:
              "Could not parse AI response. Please try a different search.",
            results: [],
          },
          { status: 500 },
        );
      }

      const verses = parsed?.verses || [];
      if (!Array.isArray(verses) || verses.length === 0) {
        return NextResponse.json({ results: [] });
      }

      const cleanRefs = verses
        .filter((v: any) => {
          if (
            typeof v.surahNumber !== "number" ||
            typeof v.verseNumber !== "number"
          )
            return false;
          const surah = surahMap.get(v.surahNumber);
          if (!surah) return false;
          if (v.verseNumber < 1 || v.verseNumber > surah.numberOfAyahs)
            return false;
          return true;
        })
        .slice(0, 7);
      if (cleanRefs.length === 0) return NextResponse.json({ results: [] });

      referenceCache.set(query, { verses: cleanRefs });
      references = cleanRefs;
    }

    const fetchVerseData = async (ref: {
      surahNumber: number;
      verseNumber: number;
      explanation?: string;
    }) => {
      const { surahNumber, verseNumber, explanation } = ref;

      const [arabic, english, bengali] = await Promise.all([
        getAyah(surahNumber, verseNumber, "quran-uthmani"),
        getAyah(surahNumber, verseNumber, "en.asad"),
        getAyah(surahNumber, verseNumber, "bn.bengali"),
      ]);

      const surahInfo = surahMap.get(surahNumber);

      return {
        surahNumber,
        verseNumber,
        surahName: arabic?.surah?.name ?? surahInfo?.name ?? "",
        englishName:
          arabic?.surah?.englishName ?? surahInfo?.englishName ?? "",
        verseText: arabic?.text ?? "",
        translation: english?.text ?? "",
        bengaliTranslation: bengali?.text ?? null,
        explanation: explanation || "",
      };
    };

    const results = await Promise.all(references.map(fetchVerseData));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "Could not load verse data. Please try again." },
      { status: 500 },
    );
  }
}
