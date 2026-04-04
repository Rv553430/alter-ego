import { AlterEgoResult } from "@/types";

interface GroqLayer {
  apiKey: string;
  model: string;
}

const layers: GroqLayer[] = [
  {
    apiKey: process.env.GROQ_API_KEY_1 || "",
    model: process.env.GROQ_MODEL_1 || "llama-3.1-70b-versatile",
  },
  {
    apiKey: process.env.GROQ_API_KEY_2 || "",
    model: process.env.GROQ_MODEL_2 || "mixtral-8x7b-32768",
  },
  {
    apiKey: process.env.GROQ_API_KEY_3 || "",
    model: process.env.GROQ_MODEL_3 || "llama-3.1-8b-instant",
  },
];

const SYSTEM_PROMPT = `You are an AI that creates alter egos for Twitter users. Analyze the given profile and tweets, then generate a sharp alter ego.

Rules:
- Keep lines under 10 words
- No emojis
- No hashtags
- Minimal and sharp tone
- Output must be clean text only
- No explanations

Format your response EXACTLY like this (nothing else):
Name: [Web3-style name]
Bio: [line 1]
Bio: [line 2]
Bio: [line 3]
Personality: [2-4 words]
Aura Score: [0-100]
Roast: [1 short witty line]`;

function parseResponse(text: string): AlterEgoResult {
  const lines = text.trim().split("\n").filter((l) => l.trim());

  let name = "Unknown";
  const bio: string[] = [];
  let personality = "Mysterious";
  let auraScore = 50;
  let roast = "Too boring to roast";

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Name:")) {
      name = trimmed.replace(/^Name:\s*/, "").trim();
    } else if (trimmed.startsWith("Bio:")) {
      const bioLine = trimmed.replace(/^Bio:\s*/, "").trim();
      if (bioLine && bio.length < 3) {
        bio.push(bioLine);
      }
    } else if (trimmed.startsWith("Personality:")) {
      personality = trimmed.replace(/^Personality:\s*/, "").trim();
    } else if (trimmed.startsWith("Aura Score:")) {
      const score = trimmed.replace(/^Aura Score:\s*/, "").trim();
      auraScore = parseInt(score, 10) || 50;
      if (auraScore < 0) auraScore = 0;
      if (auraScore > 100) auraScore = 100;
    } else if (trimmed.startsWith("Roast:")) {
      roast = trimmed.replace(/^Roast:\s*/, "").trim();
    }
  }

  return { name, bio, personality, auraScore, roast };
}

export async function generateAlterEgo(
  bio: string,
  tweets: string[]
): Promise<AlterEgoResult> {
  const tweetsText = tweets.slice(0, 20).join("\n");

  const userPrompt = `Analyze this Twitter account:

Bio: ${bio || "No bio available"}

Latest Tweets:
${tweetsText || "No tweets available"}

Detect the tone, personality type, and writing style. Then generate the alter ego.`;

  let lastError: Error | null = null;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];

    if (!layer.apiKey) {
      continue;
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${layer.apiKey}`,
        },
        body: JSON.stringify({
          model: layer.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || "";

      if (!responseText) {
        throw new Error("Empty response from AI");
      }

      return parseResponse(responseText);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Layer ${i + 1} (${layer.model}) failed:`, lastError.message);
      continue;
    }
  }

  throw lastError || new Error("All AI layers failed");
}
