"use client";

import { useState, useEffect, useRef } from "react";

interface LoadingStateProps {
  stage: "idle" | "scraping" | "generating" | "done" | "error";
  error?: string;
}

const containerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  margin: "0 auto",
  textAlign: "center",
  padding: "48px 0",
};

const errorBoxStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.06)",
  border: "1px solid rgba(239,68,68,0.15)",
  borderRadius: 16,
  padding: "24px 28px",
  backdropFilter: "blur(10px)",
};

const errorTextStyle: React.CSSProperties = {
  color: "#FCA5A5",
  fontSize: 14,
  lineHeight: 1.6,
  margin: 0,
};

const spinnerOuterStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  margin: "0 auto 20px",
  borderRadius: "50%",
  border: "2px solid rgba(139,92,246,0.15)",
  position: "relative",
};

const spinnerInnerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: "2px solid transparent",
  borderTopColor: "#8B5CF6",
  animation: "spin 0.8s linear infinite",
};

const loadingTextStyle: React.CSSProperties = {
  color: "#9CA3AF",
  fontSize: 14,
  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  margin: 0,
};

const dotsStyle: React.CSSProperties = {
  color: "#8B5CF6",
  fontWeight: 700,
  marginLeft: 2,
};

export default function LoadingState({ stage, error }: LoadingStateProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (stage === "scraping" || stage === "generating") {
      intervalRef.current = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 400);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [stage]);

  if (stage === "idle" || stage === "done") return null;

  const message = stage === "scraping" ? "Scraping profile" : stage === "generating" ? "Generating alter ego" : "";

  return (
    <div style={containerStyle}>
      {stage === "error" ? (
        <div style={errorBoxStyle}>
          <p style={errorTextStyle}>{error || "Something went wrong"}</p>
        </div>
      ) : (
        <div>
          <div style={spinnerOuterStyle}>
            <div style={spinnerInnerStyle} />
          </div>
          <p style={loadingTextStyle}>
            {message}<span style={dotsStyle}>{dots}</span>
          </p>
        </div>
      )}
    </div>
  );
}
