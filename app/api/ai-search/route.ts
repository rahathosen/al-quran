import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer":
      process.env.NEXT_PUBLIC_APP_URL || "https://al-quran-ai.vercel.app",
    "X-Title": "Al-Quran",
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

    // Update the system prompt to be more explicit about JSON structure
    const systemPrompt = `You are an AI assistant specialized in the Quran. 
When given a topic or concept, find relevant verses from the Quran that address this topic.

For each verse, provide the following information in a clean, structured format:
1. Surah number (surahNumber)
2. Verse number (verseNumber)
3. Arabic name of the Surah (surahName)
4. Transliterated Arabic name (englishName) like "Al-Baqara", "Al-Fatiha", etc.
5. Arabic text of the verse (verseText)
6. English translation of the verse (translation)
7. Bengali translation of the verse if available (bengaliTranslation)

IMPORTANT: Make sure all text fields are properly escaped and do not contain any line breaks within the strings.
If you need to include a line break in the original text, use the escaped form "\\n" instead.

Format your response as a JSON object with a "results" array containing verse objects:
{
  "results": [
    {
      "surahNumber": 1,
      "verseNumber": 1,
      "surahName": "الفاتحة",
      "englishName": "Al-Fatiha",
      "verseText": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      "bengaliTranslation": "পরম করুণাময় অতি দয়ালু আল্লাহর নামে।"
    }
  ]
}

Limit your response to the 5 most relevant verses. Return only valid JSON with no additional text.
If you cannot find relevant verses, return {"results": []}.
If Bengali translation is not available for a verse, set bengaliTranslation to null.`;

    // Make the API request to Groq
    const completion = await openai.chat.completions.create({
      model: "gemma2-9b-it",
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

    // Extract the response text
    const responseText = completion.choices[0]?.message?.content || "";

    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(responseText);

      // Return the results with better error handling
      if (Array.isArray(jsonResponse.results)) {
        return NextResponse.json({ results: jsonResponse.results });
      } else if (Array.isArray(jsonResponse)) {
        return NextResponse.json({ results: jsonResponse });
      } else if (jsonResponse && typeof jsonResponse === "object") {
        // Try to extract results from any property that might be an array
        for (const key in jsonResponse) {
          if (Array.isArray(jsonResponse[key])) {
            return NextResponse.json({ results: jsonResponse[key] });
          }
        }

        // If we have an object but no array property, convert it to an array if it has the right structure
        if (jsonResponse.surahNumber && jsonResponse.verseNumber) {
          return NextResponse.json({ results: [jsonResponse] });
        }

        console.error("Unexpected response format:", jsonResponse);
        return NextResponse.json(
          {
            error: "Invalid response format from AI",
            results: [],
            debugResponse: jsonResponse,
          },
          { status: 500 }
        );
      } else {
        console.error("Unexpected response format:", jsonResponse);
        return NextResponse.json(
          {
            error: "Invalid response format from AI",
            results: [],
            debugResponse: jsonResponse,
          },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", responseText);

      // Return both the error and the raw response for debugging
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          results: [],
          rawResponse: responseText,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("AI search error:", error);

    // Return more detailed error information
    return NextResponse.json(
      {
        error: "An error occurred during the search",
        message: error.message,
        details: error.error?.message || null,
        code: error.error?.code || null,
      },
      { status: 500 }
    );
  }
}
