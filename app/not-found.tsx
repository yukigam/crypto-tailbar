'use client';

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "#0f172a", color: "#e2e8f0", padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>🔍</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#fff" }}>Хуудас олдсонгүй</h1>
      <p style={{ fontSize: 15, textAlign: "center", maxWidth: 480, lineHeight: 1.6, color: "#94a3b8" }}>
        Таны хайсан хуудас байхгүй эсвэл устгагдсан байна.
      </p>
      <a
        href="/"
        style={{
          padding: "12px 32px",
          borderRadius: 12,
          border: "none",
          background: "linear-gradient(135deg, #38bdf8, #c084fc)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 800,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        Нүүр хуудас руу буцах
      </a>
    </div>
  );
}
