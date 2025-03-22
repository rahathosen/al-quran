import { ImageResponse } from "next/og";
import { getSurahById } from "@/lib/quran-api";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse the surah ID from the URL
    const surahId = Number.parseInt(params.id);

    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      return new Response("Invalid surah ID", { status: 400 });
    }

    // Fetch the surah data
    const surah = await getSurahById(surahId);

    if (!surah) {
      return new Response("Surah not found", { status: 404 });
    }

    // Create the SVG image with the surah details
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a5e63",
            position: "relative",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Background gradient overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, #134548 0%, #1a5e63 100%)",
              opacity: 0.2,
            }}
          />

          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "20px",
              background: "#d4af37",
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "20px",
              background: "#d4af37",
              opacity: 0.3,
            }}
          />

          {/* Decorative corners */}
          {[
            { top: 100, left: 100 },
            { top: 100, right: 100 },
            { bottom: 100, left: 100 },
            { bottom: 100, right: 100 },
          ].map((position, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "160px",
                height: "160px",
                borderRadius: "80px",
                background: "#d4af37",
                opacity: 0.1,
                ...position,
              }}
            />
          ))}

          {/* Surah name in Arabic */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {surah.name}
          </div>

          {/* Surah name in English */}
          <div
            style={{
              fontSize: "48px",
              fontWeight: "normal",
              color: "#d4af37",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Surah {surah.englishName}
          </div>

          {/* Surah details */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "normal",
              color: "white",
              opacity: 0.8,
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses •{" "}
            {surah.revelationType}
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: "400px",
              height: "2px",
              background: "#d4af37",
              opacity: 0.5,
              marginBottom: "30px",
            }}
          />

          {/* App name */}
          <div
            style={{
              fontSize: "24px",
              fontWeight: "normal",
              color: "white",
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            Al-Quran
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
