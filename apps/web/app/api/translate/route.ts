import { NextRequest, NextResponse } from "next/server";

// LibreTranslate API URL - use environment variable or default to local
const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || "http://localhost:5000";

interface TranslateRequest {
  text: string;
  source: string;
  target: string;
  format?: "text" | "html";
}

interface LibreTranslateResponse {
  translatedText: string;
}

interface LibreTranslateError {
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, source, target, format = "text" } = body;

    // Validate required fields
    if (!text || !target) {
      return NextResponse.json(
        { error: "Missing required fields: text and target are required" },
        { status: 400 },
      );
    }

    // Don't translate if source and target are the same
    if (source === target) {
      return NextResponse.json({ translatedText: text });
    }

    // Call LibreTranslate API
    const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: source || "auto", // 'auto' for auto-detection
        target: target,
        format: format, // 'text' or 'html'
      }),
    });

    if (!response.ok) {
      const errorData: LibreTranslateError = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      console.error("LibreTranslate error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Translation service error" },
        { status: response.status },
      );
    }

    const data: LibreTranslateResponse = await response.json();

    return NextResponse.json({
      translatedText: data.translatedText,
      source: source || "auto",
      target: target,
    });
  } catch (error) {
    console.error("Translation API error:", error);

    // Check if it's a connection error (LibreTranslate not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Translation service unavailable. Please ensure LibreTranslate is running.",
          details: "Run: docker run -ti --rm -p 5000:5000 libretranslate/libretranslate",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET endpoint to check available languages
export async function GET() {
  try {
    const response = await fetch(`${LIBRETRANSLATE_URL}/languages`);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch languages" }, { status: response.status });
    }

    const languages = await response.json();
    return NextResponse.json({ languages });
  } catch (error) {
    console.error("Languages API error:", error);
    return NextResponse.json(
      {
        error: "Translation service unavailable",
        details: "Run: docker run -ti --rm -p 5000:5000 libretranslate/libretranslate",
      },
      { status: 503 },
    );
  }
}
