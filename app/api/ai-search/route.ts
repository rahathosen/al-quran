import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer":
      process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app",
    "X-Title": "Al-Quran Al-Kareem",
  },
});

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an AI assistant specialized in the Quran. 
When given a topic or concept, find relevant verses from the Quran that address this topic.
For each verse, provide:
1. The Surah number
2. The verse number
3. The Arabic name of the Surah
4. The transliterated Arabic name of the Surah (like "Al-Baqara", "Al-Fatiha", etc.)
5. The Arabic text of the verse
6. An English translation of the verse
7. A Bengali translation of the verse (if available)

Format your response as a VALID JSON array of objects with these fields:
[
  {
    "surahNumber": number,
    "verseNumber": number,
    "surahName": "Arabic name",
    "englishName": "Transliterated name",
    "verseText": "Arabic text",
    "translation": "English translation",
    "bengaliTranslation": "Bengali translation"
  }
]

IMPORTANT:
- Respond ONLY with valid JSON (no additional text or explanations)
- Ensure all strings are properly escaped for JSON
- Do not include any line breaks within JSON strings
- Do not include any text outside the JSON structure
- If Bengali translation is unavailable, set "bengaliTranslation" to null`;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      // model: "deepseek/deepseek-chat-v3-0324:free",
      //model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Find Quranic verses about: ${query}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Function to safely parse JSON with multiple fallback strategies
    const parseAIResponse = (text: string) => {
      // First attempt: Direct parse if response is clean JSON
      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (e) {
        console.log("Initial JSON parse failed, trying cleanup...");
      }

      // Second attempt: Remove markdown code blocks and trim
      try {
        const cleanText = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanText);
        return parsed;
      } catch (e) {
        console.log("Markdown cleanup parse failed, trying to extract JSON...");
      }

      // Third attempt: Extract JSON from potentially malformed response
      try {
        const jsonStart = text.indexOf("[") > -1 ? "[" : "{";
        const jsonEnd = jsonStart === "[" ? "]" : "}";

        const startIdx = text.indexOf(jsonStart);
        const endIdx = text.lastIndexOf(jsonEnd) + 1;

        if (startIdx > -1 && endIdx > startIdx) {
          const jsonStr = text
            .slice(startIdx, endIdx)
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix potential unquoted keys
            .replace(/'/g, '"') // Replace single quotes with double
            .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
            .replace(/\n/g, "\\n") // Escape newlines
            .replace(/\r/g, "\\r") // Escape carriage returns
            .replace(/\t/g, "\\t"); // Escape tabs

          return JSON.parse(jsonStr);
        }
      } catch (e) {
        console.log("Advanced cleanup parse failed");
      }

      return null;
    };

    // Parse the response
    const parsedResponse = parseAIResponse(responseText);

    // Process the parsed response
    if (parsedResponse) {
      let results = [];

      if (Array.isArray(parsedResponse)) {
        results = parsedResponse;
      } else if (Array.isArray(parsedResponse.results)) {
        results = parsedResponse.results;
      } else if (Array.isArray(parsedResponse.verses)) {
        results = parsedResponse.verses;
      } else if (parsedResponse.surahNumber) {
        results = [parsedResponse];
      }

      // Validate and clean each verse
      const cleanResults = results
        .map((verse: any) => ({
          surahNumber: Number(verse.surahNumber) || 0,
          verseNumber: Number(verse.verseNumber) || 0,
          surahName: verse.surahName?.toString()?.trim() || "",
          englishName: verse.englishName?.toString()?.trim() || "",
          verseText: verse.verseText?.toString()?.trim() || "",
          translation: verse.translation?.toString()?.trim() || "",
          bengaliTranslation:
            verse.bengaliTranslation?.toString()?.trim() || null,
        }))
        .filter(
          (verse: { surahNumber: number; verseNumber: number }) =>
            verse.surahNumber > 0 && verse.verseNumber > 0
        );

      return NextResponse.json({ results: cleanResults });
    }

    return NextResponse.json(
      { error: "Failed to parse AI response", results: [] },
      { status: 500 }
    );
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "An error occurred during the search" },
      { status: 500 }
    );
  }
}
