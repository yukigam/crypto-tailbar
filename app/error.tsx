'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "#0f172a", color: "#e2e8f0", padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
      <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "#fff" }}>Алдаа гарлаа</h1>
      <p style={{ fontSize: 15, textAlign: "center", maxWidth: 480, lineHeight: 1.6, color: "#94a3b8" }}>
        Уучлаарай, системд гэнэтийн алдаа гарлаа. Та түр хүлээгээд дахин оролдоно уу.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "12px 32px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #38bdf8, #c084fc)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Дахин оролдох
      </button>
    </div>
  );
}
