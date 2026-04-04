"use client";

import { AlterEgoResult } from "@/types";
import { useEffect, useState } from "react";

interface AlterEgoCardProps {
  result: AlterEgoResult;
  username: string;
  avatarUrl?: string;
}

const styles = {
  card: {
    width: "100%",
    maxWidth: 640,
    margin: "0 auto",
    background: "#0D1117",
    border: "1px solid #30363D",
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 0 60px rgba(0,255,65,0.05), 0 20px 60px rgba(0,0,0,0.6)",
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
  } as React.CSSProperties,
  leftPanel: {
    width: 200,
    minWidth: 200,
    background: "#161B22",
    borderRight: "1px solid #30363D",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "24px 16px",
    position: "relative" as const,
  } as React.CSSProperties,
  scanlinesLeft: {
    position: "absolute" as const,
    inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)",
    pointerEvents: "none" as const,
    zIndex: 1,
  } as React.CSSProperties,
  avatarContainer: {
    width: 120,
    height: 120,
    border: "2px solid #30363D",
    overflow: "hidden",
    position: "relative" as const,
    zIndex: 2,
    marginBottom: 16,
  } as React.CSSProperties,
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  } as React.CSSProperties,
  avatarFallback: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 48,
    fontWeight: 700,
    color: "#00FF41",
  } as React.CSSProperties,
  username: {
    fontSize: 14,
    color: "#00FF41",
    fontWeight: 600,
    textAlign: "center" as const,
    position: "relative" as const,
    zIndex: 2,
    marginBottom: 4,
  } as React.CSSProperties,
  handle: {
    fontSize: 12,
    color: "#484F58",
    textAlign: "center" as const,
    position: "relative" as const,
    zIndex: 2,
  } as React.CSSProperties,
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    position: "relative" as const,
  } as React.CSSProperties,
  titleBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "#161B22",
    borderBottom: "1px solid #30363D",
  } as React.CSSProperties,
  dot: (color: string) => ({
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: color,
  }) as React.CSSProperties,
  titleBarText: {
    flex: 1,
    textAlign: "center" as const,
    fontSize: 12,
    color: "#8B949E",
    marginRight: 26,
  } as React.CSSProperties,
  terminalBody: {
    padding: "16px 20px",
    flex: 1,
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
  } as React.CSSProperties,
  scanlines: {
    position: "absolute" as const,
    inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
    pointerEvents: "none" as const,
    zIndex: 1,
  } as React.CSSProperties,
  line: {
    fontSize: 13,
    lineHeight: 1.7,
    margin: 0,
    position: "relative" as const,
    zIndex: 2,
  } as React.CSSProperties,
  prompt: {
    color: "#00FF41",
  } as React.CSSProperties,
  loading: {
    color: "#484F58",
    fontSize: 11,
  } as React.CSSProperties,
  label: {
    color: "#8B949E",
  } as React.CSSProperties,
  nameValue: {
    color: "#00FF41",
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: 1,
  } as React.CSSProperties,
  personalityValue: {
    color: "#D2A8FF",
    fontWeight: 600,
  } as React.CSSProperties,
  bioValue: {
    color: "#7EE787",
    fontSize: 12,
  } as React.CSSProperties,
  auraValue: {
    color: "#00FF41",
    fontWeight: 700,
    fontSize: 20,
  } as React.CSSProperties,
  roastValue: {
    color: "#FF7B72",
    fontStyle: "italic" as const,
    fontSize: 12,
  } as React.CSSProperties,
  divider: {
    height: 1,
    background: "#30363D",
    margin: "10px 0",
    position: "relative" as const,
    zIndex: 2,
  } as React.CSSProperties,
  cursor: {
    display: "inline-block",
    width: 7,
    height: 14,
    background: "#00FF41",
    marginLeft: 2,
    verticalAlign: "middle",
    animation: "blink 1s step-end infinite",
  } as React.CSSProperties,
  footer: {
    padding: "8px 16px",
    borderTop: "1px solid #30363D",
    background: "#161B22",
    position: "relative" as const,
    zIndex: 2,
  } as React.CSSProperties,
  footerText: {
    fontSize: 10,
    color: "#484F58",
    margin: 0,
  } as React.CSSProperties,
};

export default function AlterEgoCard({ result, username, avatarUrl }: AlterEgoCardProps) {
  const [visibleLines, setVisibleLines] = useState(0);

  const lines = [
    { type: "prompt" as const, text: `$ alter-ego --target @${username}` },
    { type: "separator" as const },
    { type: "field" as const, label: "name", value: result.name, valueStyle: styles.nameValue },
    { type: "field" as const, label: "personality", value: result.personality, valueStyle: styles.personalityValue },
    { type: "field" as const, label: "bio", value: result.bio.join(" / "), valueStyle: styles.bioValue },
    { type: "divider" as const },
    { type: "field" as const, label: "aura_score", value: `${result.auraScore}/100`, valueStyle: styles.auraValue },
    { type: "field" as const, label: "roast", value: result.roast, valueStyle: styles.roastValue },
    { type: "separator" as const },
    { type: "prompt" as const, text: `$ _` },
  ];

  useEffect(() => {
    const totalLines = lines.length;
    let lineIndex = 0;

    const showNextLine = () => {
      if (lineIndex < totalLines) {
        setVisibleLines(lineIndex + 1);
        lineIndex++;
        const delay = lines[lineIndex - 1].type === "separator" ? 80 : 150 + Math.random() * 250;
        setTimeout(showNextLine, delay);
      }
    };

    showNextLine();
  }, []);

  return (
    <div id="alter-ego-card" style={styles.card}>
      {/* Left Panel - Image */}
      <div style={styles.leftPanel}>
        <div style={styles.scanlinesLeft} />
        <div style={styles.avatarContainer}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              style={styles.avatarImg}
              crossOrigin="anonymous"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallback = document.createElement("div");
                fallback.textContent = username.charAt(0).toUpperCase();
                Object.assign(fallback.style, styles.avatarFallback);
                (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
              }}
            />
          ) : (
            <div style={styles.avatarFallback}>{username.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div style={styles.username}>{result.name}</div>
        <div style={styles.handle}>@{username}</div>
      </div>

      {/* Right Panel - Terminal */}
      <div style={styles.rightPanel}>
        <div style={styles.titleBar}>
          <div style={styles.dot("#FF5F56")} />
          <div style={styles.dot("#FFBD2E")} />
          <div style={styles.dot("#27C93F")} />
          <span style={styles.titleBarText}>alter-ego-generator</span>
        </div>

        <div style={styles.terminalBody}>
          <div style={styles.scanlines} />

          {lines.slice(0, visibleLines).map((line, i) => {
            if (line.type === "separator") {
              return <div key={i} style={{ height: 6 }} />;
            }

            if (line.type === "divider") {
              return <div key={i} style={styles.divider} />;
            }

            if (line.type === "prompt") {
              return (
                <p key={i} style={styles.line}>
                  <span style={styles.prompt}>{line.text}</span>
                  {i === visibleLines - 1 && <span style={styles.cursor} />}
                </p>
              );
            }

            return (
              <p key={i} style={styles.line}>
                <span style={styles.label}>{line.label}: </span>
                <span style={line.valueStyle || { color: "#00FF41" }}>{line.value}</span>
              </p>
            );
          })}
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ct-alter-ego // {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
