import { NextRequest, NextResponse } from "next/server";
import { generateAlterEgo } from "@/lib/groq";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(ip);

  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const record = body as Record<string, unknown>;
    const bio = typeof record.bio === "string" ? record.bio : "";
    const tweets = Array.isArray(record.tweets)
      ? (record.tweets as string[]).filter((t) => typeof t === "string")
      : [];

    if (!bio && tweets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Bio or tweets are required" },
        { status: 400 }
      );
    }

    if (bio.length > 500) {
      return NextResponse.json(
        { success: false, error: "Bio too long" },
        { status: 400 }
      );
    }

    const result = await generateAlterEgo(bio, tweets.slice(0, 20));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Generate error:", error);

    const message = error instanceof Error ? error.message : "Failed to generate";

    if (message.includes("Rate limited")) {
      return NextResponse.json(
        { success: false, error: "AI service is busy. Try again in a moment." },
        { status: 503 }
      );
    }

    if (message.includes("timed out")) {
      return NextResponse.json(
        { success: false, error: "AI request timed out. Try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate alter ego" },
      { status: 500 }
    );
  }
}
