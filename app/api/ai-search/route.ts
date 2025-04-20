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
- Ensure all strings are properly escaped for JSON
- Do not include any line breaks within JSON strings
- Do not include any text outside the JSON structure
- If Bengali translation is unavailable, set "bengaliTranslation" to null`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
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

    // First try to parse directly
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        return NextResponse.json({ results: parsed });
      }
      if (parsed && typeof parsed === "object") {
        // Check for common response formats
        if (Array.isArray(parsed.results)) {
          return NextResponse.json({ results: parsed.results });
        }
        if (Array.isArray(parsed.verses)) {
          return NextResponse.json({ results: parsed.verses });
        }
        if (parsed.surahNumber) {
          // Single verse case
          return NextResponse.json({ results: [parsed] });
        }
      }
    } catch (directParseError) {
      console.log("Direct parse failed, trying cleanup...");
    }

    // If direct parse fails, try cleaning the response
    try {
      // Remove any non-JSON content before and after the JSON
      const jsonStart = responseText.indexOf("[") >= 0 ? "[" : "{";
      const jsonEnd = jsonStart === "[" ? "]" : "}";

      const startIndex = Math.max(0, responseText.indexOf(jsonStart));
      const endIndex = responseText.lastIndexOf(jsonEnd) + 1;

      if (startIndex >= 0 && endIndex > startIndex) {
        const jsonStr = responseText
          .slice(startIndex, endIndex)
          // Remove any newlines within strings
          .replace(/"([^"]*)\n([^"]*)"/g, '"$1 $2"')
          // Escape special characters
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\t/g, "\\t");

        const cleanedJson = JSON.parse(jsonStr);

        if (Array.isArray(cleanedJson)) {
          return NextResponse.json({ results: cleanedJson });
        }
        if (cleanedJson && typeof cleanedJson === "object") {
          if (Array.isArray(cleanedJson.results)) {
            return NextResponse.json({ results: cleanedJson.results });
          }
          if (cleanedJson.surahNumber) {
            return NextResponse.json({ results: [cleanedJson] });
          }
        }
      }
    } catch (cleanParseError) {
      console.error("Error parsing cleaned response:", cleanParseError);
      console.error("Raw response:", responseText);
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
