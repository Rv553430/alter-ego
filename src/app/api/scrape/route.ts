import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

const CACHE = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

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

function getCache(key: string): unknown | null {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  CACHE.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

function sanitizeUsername(input: string): string {
  return input.replace(/^@/, "").trim().replace(/[^a-zA-Z0-9_]/g, "");
}

function extractBioFromMeta(html: string): { bio: string; displayName: string } {
  const bioMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  const nameMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

  let bio = "";
  let displayName = "";

  if (bioMatch) {
    const rawBio = bioMatch[1];
    const colonIndex = rawBio.indexOf(":");
    if (colonIndex > 0 && colonIndex < 30) {
      displayName = rawBio.substring(0, colonIndex).trim();
      bio = rawBio.substring(colonIndex + 1).trim();
    } else {
      bio = rawBio.trim();
    }
  }

  if (nameMatch) {
    const rawName = nameMatch[1];
    const slashIndex = rawName.lastIndexOf("/");
    displayName = slashIndex > 0 ? rawName.substring(0, slashIndex).trim() : rawName.trim();
  }

  return { bio, displayName };
}

function extractTweets(html: string): string[] {
  const tweets: string[] = [];
  const seen = new Set<string>();

  const patterns = [
    /<div[^>]*data-testid="tweetText"[^>]*>([\s\S]*?)<\/div>/gi,
    /<p[^>]*>([\s\S]*?)<\/p>/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null && tweets.length < 20) {
      const text = match[1]
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (text && text.length > 10 && text.length < 300 && !seen.has(text)) {
        seen.add(text);
        tweets.push(text);
      }
    }
    if (tweets.length >= 5) break;
  }

  return tweets;
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

    if (!body || typeof body !== "object" || !("username" in body)) {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const rawUsername = (body as Record<string, unknown>).username;
    if (typeof rawUsername !== "string") {
      return NextResponse.json(
        { success: false, error: "Username must be a string" },
        { status: 400 }
      );
    }

    const cleanUsername = sanitizeUsername(rawUsername);

    if (!cleanUsername || cleanUsername.length > 20) {
      return NextResponse.json(
        { success: false, error: "Invalid username" },
        { status: 400 }
      );
    }

    const cacheKey = `profile:${cleanUsername}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const avatarUrl = `https://unavatar.io/x/${cleanUsername}?fallback=false`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://x.com/${cleanUsername}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let bio = "";
    let displayName = cleanUsername;
    let tweets: string[] = [];

    if (response.ok) {
      try {
        const html = await response.text();
        const extracted = extractBioFromMeta(html);
        bio = extracted.bio;
        displayName = extracted.displayName || cleanUsername;
        tweets = extractTweets(html);
      } catch {
        console.warn("Failed to parse Twitter HTML");
      }
    }

    const result = {
      bio: bio || "No bio available",
      tweets: tweets.length > 0 ? tweets : ["No tweets found"],
      avatar: avatarUrl,
      displayName: displayName || cleanUsername,
      username: cleanUsername,
    };

    setCache(cacheKey, result);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Scrape error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Request timed out" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
