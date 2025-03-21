import { ImageResponse } from "next/og";
import { getSurahById } from "@/lib/quran-api";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surahId = searchParams.get("surah");

    if (!surahId) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 40,
              background: "#1a5e63",
              color: "white",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: 20 }}>
              Al-Quran Ai
            </div>
            <div style={{ fontSize: 30, color: "#d4af37" }}>
              The Noble Quran
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Fetch surah data
    const surah = await getSurahById(Number.parseInt(surahId));

    if (!surah) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 40,
              background: "#1a5e63",
              color: "white",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: 20 }}>
              Surah Not Found
            </div>
            <div style={{ fontSize: 30, color: "#d4af37" }}>Al-Quran Ai</div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Generate the OG image
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 40,
            background: "#1a5e63",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {surah.name}
          </div>
          <div style={{ fontSize: 50, marginBottom: 20, color: "#d4af37" }}>
            Surah {surah.englishName}
          </div>
          <div style={{ fontSize: 30, marginBottom: 10 }}>
            {surah.englishNameTranslation}
          </div>
          <div
            style={{ fontSize: 24, marginTop: 20, display: "flex", gap: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#d4af37",
                }}
              ></div>
              <span>{surah.numberOfAyahs} Verses</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#d4af37",
                }}
              ></div>
              <span>{surah.revelationType}</span>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 30,
              fontSize: 20,
              opacity: 0.8,
            }}
          >
            Al-Quran Ai | The Noble Quran
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
