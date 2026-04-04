"use client";

import { useState } from "react";

interface UsernameInputProps {
  onSubmit: (username: string) => void;
  isLoading: boolean;
}

const styles = {
  form: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
  } as React.CSSProperties,
  flexRow: {
    display: "flex",
    gap: 12,
  } as React.CSSProperties,
  inputWrapper: {
    position: "relative" as const,
    flex: 1,
  } as React.CSSProperties,
  atSymbol: {
    position: "absolute" as const,
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6B7280",
    fontSize: 18,
  } as React.CSSProperties,
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "16px 16px 16px 40px",
    color: "#fff",
    fontSize: 16,
    outline: "none",
    transition: "all 0.2s",
  } as React.CSSProperties,
  button: {
    padding: "16px 24px",
    background: "linear-gradient(135deg, #2563EB, #7C3AED)",
    color: "#fff",
    fontWeight: 600,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    boxShadow: "0 4px 20px rgba(124,58,237,0.25)",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 120,
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  } as React.CSSProperties,
  spinner: {
    width: 20,
    height: 20,
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,
};

export default function UsernameInput({ onSubmit, isLoading }: UsernameInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = input.replace(/^@/, "").trim();
    if (clean) {
      onSubmit(clean);
    }
  };

  const isDisabled = isLoading || !input.trim();

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.flexRow}>
        <div style={styles.inputWrapper}>
          <span style={styles.atSymbol}>@</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="username"
            disabled={isLoading}
            style={{
              ...styles.input,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isDisabled}
          style={{
            ...styles.button,
            ...(isDisabled ? styles.buttonDisabled : {}),
          }}
        >
          {isLoading ? (
            <svg style={styles.spinner} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" opacity="0.75" />
            </svg>
          ) : (
            "Generate"
          )}
        </button>
      </div>
    </form>
  );
}
