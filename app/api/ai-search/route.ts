import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  // baseURL: "https://api.groq.com/openai/v1",
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

    // Update the system prompt to include Bengali translation and use transliterated names
    const systemPrompt = `You are an AI assistant specialized in the Quran. 
When given a topic or concept, find relevant verses from the Quran that address this topic.
For each verse, provide:
1. The Surah number
2. The verse number
3. The Arabic name of the Surah
4. The transliterated Arabic name of the Surah (like "Al-Baqara", "Al-Fatiha", etc.) - NOT the English translation
5. The Arabic text of the verse
6. An English translation of the verse
7. A Bengali translation of the verse (if available)

Format your response as a JSON array of objects with these fields:
[
  {
    "surahNumber": number,
    "verseNumber": number,
    "surahName": "Arabic name",
    "englishName": "Transliterated name (e.g., Al-Baqara, not The Cow)",
    "verseText": "Arabic text",
    "translation": "English translation",
    "bengaliTranslation": "Bengali translation"
  }
]

Limit your response to the 5 most relevant verses. Do not include any explanations or additional text outside the JSON structure.
If you cannot find relevant verses, return an empty array.
If Bengali translation is not available for a verse, you can omit the bengaliTranslation field or set it to null.`;

    // Make the API request to OpenRouter
    const completion = await openai.chat.completions.create({
      // model: "deepseek/deepseek-r1:free",
      // model: "google/gemini-2.0-pro-exp-02-05:free",
      model: "mistralai/mistral-small-3.1-24b-instruct:free",
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
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 2000, // Ensure enough tokens for complete responses
    });

    // Extract the response text
    const responseText = completion.choices[0]?.message?.content || "";

    try {
      // Parse the JSON response
      const jsonResponse = JSON.parse(responseText);

      // Check if the response has the expected format
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
          { error: "Invalid response format from AI", results: [] },
          { status: 500 }
        );
      } else {
        console.error("Unexpected response format:", jsonResponse);
        return NextResponse.json(
          { error: "Invalid response format from AI", results: [] },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response:", responseText);

      // Try to extract JSON from the response if it's embedded in text
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          if (Array.isArray(extractedJson)) {
            return NextResponse.json({ results: extractedJson });
          } else if (extractedJson && typeof extractedJson === "object") {
            if (Array.isArray(extractedJson.results)) {
              return NextResponse.json({ results: extractedJson.results });
            }
          }
        }
      } catch (e) {
        console.error("Failed to extract JSON from response:", e);
      }

      return NextResponse.json(
        { error: "Failed to parse AI response", results: [] },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "An error occurred during the search" },
      { status: 500 }
    );
  }
}
