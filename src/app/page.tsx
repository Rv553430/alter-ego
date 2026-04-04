"use client";

import { useState, useCallback } from "react";
import AlterEgoCard from "@/components/AlterEgoCard";
import ActionButtons from "@/components/ActionButtons";
import LoadingState from "@/components/LoadingState";
import { AlterEgoResult } from "@/types";

export default function Home() {
  const [stage, setStage] = useState<"idle" | "scraping" | "generating" | "done" | "error">("idle");
  const [result, setResult] = useState<AlterEgoResult | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleGenerate = useCallback(async (inputUsername: string) => {
    setUsername(inputUsername);
    setStage("scraping");
    setError("");
    setResult(null);

    try {
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUsername }),
      });

      if (!scrapeRes.ok) {
        const err = await scrapeRes.json();
        throw new Error(err.error || "Profile not found. Try another username.");
      }

      const scrapeData = await scrapeRes.json();
      const profile = scrapeData.data;

      setAvatarUrl(profile.avatar || "");

      setStage("generating");

      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: profile.bio,
          tweets: profile.tweets,
        }),
      });

      if (!generateRes.ok) {
        const err = await generateRes.json();
        throw new Error(err.error || "AI failed to generate. Try again.");
      }

      const generateData = await generateRes.json();
      setResult(generateData.data);
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (username) {
      handleGenerate(username);
    }
  }, [username, handleGenerate]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.replace(/^@/, "").trim();
    if (clean) {
      handleGenerate(clean);
    }
  }, [inputValue, handleGenerate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background effects */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.05) 0%, transparent 50%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 100,
            marginBottom: 24,
            fontSize: 13,
            color: "#A78BFA",
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#A78BFA",
              boxShadow: "0 0 8px rgba(139,92,246,0.6)",
            }} />
            AI-Powered
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 10vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 16,
            background: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 25%, #F472B6 50%, #A78BFA 75%, #60A5FA 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientShift 4s ease infinite",
          }}>
            CT Alter Ego
          </h1>

          <p style={{ color: "#6B7280", fontSize: 16, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
            Enter any Twitter handle. Get a ruthless AI-crafted alter ego.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
          <div style={{
            display: "flex",
            gap: 12,
            padding: 6,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#4B5563",
                fontSize: 18,
                fontWeight: 500,
                pointerEvents: "none",
              }}>
                @
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="elonmusk"
                disabled={stage === "scraping" || stage === "generating"}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "14px 16px 14px 38px",
                  color: "#fff",
                  fontSize: 16,
                  outline: "none",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={(stage === "scraping" || stage === "generating") || !inputValue.trim()}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                color: "#fff",
                fontWeight: 600,
                borderRadius: 12,
                border: "none",
                cursor: (stage === "scraping" || stage === "generating") || !inputValue.trim() ? "not-allowed" : "pointer",
                fontSize: 15,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 24px rgba(124,58,237,0.3)",
                opacity: (stage === "scraping" || stage === "generating") || !inputValue.trim() ? 0.5 : 1,
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {stage === "scraping" || stage === "generating" ? (
                <svg style={{ width: 20, height: 20, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.8" />
                </svg>
              ) : (
                "Generate"
              )}
            </button>
          </div>
        </form>

        {/* Loading */}
        <LoadingState stage={stage} error={error} />

        {/* Result */}
        {stage === "done" && result && (
          <div style={{ animation: "fadeIn 0.6s ease-out forwards" }}>
            <AlterEgoCard result={result} username={username} avatarUrl={avatarUrl} />
            <ActionButtons result={result} username={username} onRegenerate={handleRegenerate} />
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 64 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#374151",
            fontSize: 13,
          }}>
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            powered by groq
          </div>
        </div>
      </div>
    </div>
  );
}
