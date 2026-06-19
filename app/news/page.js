import Link from 'next/link';
import { getPosts } from '../../lib/sanity';
import { mapSanityPosts } from '../../lib/mapPost';

export const dynamic = 'force-dynamic';

const C = {
  bg: "#0f172a",
  bgDark: "#1e293b",
  ink: "#ffffff",
  inkLight: "#e2e8f0",
  inkFaint: "#94a3b8",
  accentBlue: "#38bdf8",
  accentPurple: "#c084fc",
  border: "#334155",
};

function RelDate({ date, publishedAt }) {
  const target = publishedAt ? new Date(publishedAt) : date ? new Date(date + 'T00:00:00Z') : null;
  if (!target) return null;
  const now = new Date();
  const diffMs = now - target;
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  let display;
  if (diffH < 1) display = '🔥 Саяхан';
  else if (diffH < 24) display = `🔥 ${diffH} цагийн өмнө`;
  else if (diffD < 7) display = `${diffD} өдрийн өмнө`;
  else display = target.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
  return (
    <span style={{ fontSize: 10, fontWeight: diffH < 24 ? 800 : 600, letterSpacing: "0.05em", color: diffH < 24 ? "#34d399" : C.inkFaint }}>
      {display}
    </span>
  );
}

function getImgSrc(p) {
  if (p.cover && typeof p.cover === 'string' && p.cover.startsWith('http')) return p.cover;
  const fallbacks = {
    btc: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&auto=format&fit=crop&q=80",
    eth: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
    defi: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
    wallet: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80",
    mining: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=600&auto=format&fit=crop&q=80",
    nft: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80",
  };
  return fallbacks[p.cover] || fallbacks.btc;
}

export default async function NewsPage() {
  const data = await getPosts();
  const posts = data?.uncategorizedPosts || [];
  const mapped = mapSanityPosts(posts);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink, fontFamily: "inherit" }}>
      <div className="container-wide" style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.accentBlue, textDecoration: "none", fontSize: 13, fontWeight: 800, marginBottom: 24 }}>
          ← Буцах
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px", color: C.ink }}>Зах зээлийн мэдээ</h1>
        <p style={{ fontSize: 14, color: C.inkLight, fontWeight: "500", margin: "0 0 32px" }}>Крипто зах зээлийн сүүлийн үеийн мэдээнүүд</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {mapped.length === 0 && (
            <p style={{ color: C.inkFaint, fontSize: 14, textAlign: "center", padding: 60 }}>Одоогоор мэдээ байхгүй байна.</p>
          )}
          {mapped.map((p, i) => (
            <Link key={p.id} href={`/post/${p.slug}`} style={{ textDecoration: "none" }}>
              <div className="modern-card hover-glow" style={{
                display: "flex", gap: 24, padding: "20px", cursor: "pointer", background: C.bgDark, alignItems: "center",
                border: i === 0 ? '2px solid rgba(52,211,153,0.5)' : `1px solid ${C.border}`,
                borderRadius: 12,
              }}>
                <div style={{ width: 160, height: 110, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: `1px solid ${C.border}` }}>
                  <img src={getImgSrc(p)} alt={p.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                    <RelDate date={p.date} publishedAt={p.publishedAt} />
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 850, color: C.ink, lineHeight: 1.35 }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: C.inkLight, lineHeight: 1.55, fontWeight: "500" }} className="line-clamp-2">{p.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
