import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surahId = searchParams.get("surah");

    // If it's for the canvas page

    // If no surah ID is provided, return a generic image
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
              Al-Quran
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

    // For surah details, use a super simplified version
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
            Surah {surahId}
          </div>
          <div style={{ fontSize: 30, color: "#d4af37" }}>Al-Quran</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);

    // Return a simple fallback image on error
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
            Al-Quran
          </div>
          <div style={{ fontSize: 30, color: "#d4af37" }}>The Noble Quran</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
