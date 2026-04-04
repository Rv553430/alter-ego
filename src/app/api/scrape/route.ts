import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { success: false, error: "Username is required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/^@/, "").trim();

    const avatarUrl = `https://unavatar.io/x/${cleanUsername}?fallback=false`;

    const profileUrl = `https://x.com/${cleanUsername}`;

    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: true, data: { bio: "No bio available", tweets: ["No tweets found"], avatar: avatarUrl, displayName: cleanUsername, username: cleanUsername } },
        { status: 200 }
      );
    }

    const html = await response.text();

    const bioMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const nameMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

    let bio = "";
    let displayName = cleanUsername;

    if (bioMatch) {
      const rawBio = bioMatch[1];
      const parts = rawBio.split(":");
      if (parts.length > 1) {
        bio = parts.slice(1).join(":").trim();
        displayName = parts[0].trim();
      } else {
        bio = rawBio.trim();
      }
    }

    if (nameMatch) {
      displayName = nameMatch[1].replace(/\s*\/\s*X$/, "").trim();
    }

    const tweets: string[] = [];

    const tweetPatterns = [
      /<div[^>]*data-testid="tweetText"[^>]*>([\s\S]*?)<\/div>/gi,
      /<p[^>]*>([\s\S]*?)<\/p>/gi,
    ];

    for (const pattern of tweetPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null && tweets.length < 20) {
        const text = match[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        if (text && text.length > 5 && !tweets.includes(text)) {
          tweets.push(text);
        }
      }
      if (tweets.length >= 5) break;
    }

    return NextResponse.json({
      success: true,
      data: {
        bio: bio || "No bio available",
        tweets: tweets.length > 0 ? tweets : ["No tweets found"],
        avatar: avatarUrl,
        displayName: displayName || cleanUsername,
        username: cleanUsername,
      },
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to scrape profile",
      },
      { status: 500 }
    );
  }
}
