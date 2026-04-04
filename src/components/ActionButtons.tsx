"use client";

import { useState } from "react";

interface ActionButtonsProps {
  result: { name: string };
  username: string;
  onRegenerate: () => void;
}

const baseBtn: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "14px 16px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  color: "#E5E7EB",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  transition: "all 0.25s ease",
  fontFamily: "inherit",
  letterSpacing: 0.2,
};

const iconStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  flexShrink: 0,
};

export default function ActionButtons({ username, onRegenerate }: ActionButtonsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById("alter-ego-card");
      if (!element) return;

      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        document.head.appendChild(script);
        await new Promise<void>((resolve) => { script.onload = () => resolve(); });
      }

      const canvas = await (window as any).html2canvas(element, {
        backgroundColor: "#050505",
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `alter-ego-${username}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `this AI created my CT alter ego not sure if it's better than me`;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 480,
      margin: "20px auto 0",
      display: "flex",
      gap: 10,
    }}>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        style={{ ...baseBtn, ...(isDownloading ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}
      >
        {isDownloading ? (
          <svg style={{ ...iconStyle, animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.8" />
          </svg>
        ) : (
          <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {isDownloading ? "Saving..." : "Download"}
      </button>

      <button onClick={handleShare} style={baseBtn}>
        <svg style={iconStyle} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </button>

      <button onClick={onRegenerate} style={baseBtn}>
        <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Again
      </button>
    </div>
  );
}
