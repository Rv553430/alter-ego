import { NextRequest, NextResponse } from "next/server";
import { generateAlterEgo } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { bio, tweets } = await request.json();

    if (!bio && (!tweets || tweets.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Bio or tweets are required" },
        { status: 400 }
      );
    }

    const result = await generateAlterEgo(bio || "", tweets || []);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate alter ego",
      },
      { status: 500 }
    );
  }
}
