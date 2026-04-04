import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CT Alter Ego Generator",
  description: "Generate your Crypto Twitter alter ego with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(139,92,246,0.2); } }
          @keyframes borderGlow { 0%, 100% { border-color: rgba(139,92,246,0.3); } 50% { border-color: rgba(139,92,246,0.6); } }
          @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes typewriter { from { width: 0; } to { width: 100%; } }
          @keyframes blink { 50% { border-color: transparent; } }
          input::placeholder { color: #4B5563; }
          input:focus { border-color: rgba(139,92,246,0.6) !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.15), 0 0 30px rgba(139,92,246,0.1); }
          button:hover:not(:disabled) { filter: brightness(1.15) !important; transform: translateY(-1px); }
          button:active:not(:disabled) { transform: translateY(0) !important; }
          * { box-sizing: border-box; }
          ::selection { background: rgba(139,92,246,0.3); }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #0A0A0A; }
          ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        `}</style>
        {children}
      </body>
    </html>
  );
}
