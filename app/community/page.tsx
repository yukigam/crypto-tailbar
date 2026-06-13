import BackButton from '../components/BackButton';
import { getCommunityPosts } from '../../lib/sanity';
import { mapSanityPosts } from '../../lib/mapPost';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const posts = await getCommunityPosts();
  const mapped = mapSanityPosts(posts || []);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <BackButton>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'inline-block', marginBottom: 24 }}>← Нүүр хуудас руу буцах</span>
        </BackButton>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0 }}>Нийтлэлүүд</h1>
          <a
            href="/community/create"
            style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #38bdf8, #c084fc)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            className="hover-accent"
          >
            ✍️ Нийтлэл бичих
          </a>
        </div>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 36px' }}>
          Хэрэглэгчдийн оруулсан нийтлэл, постууд
        </p>

        {mapped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
            <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 24 }}>
              Таньд нийтлэл байхгүй байна. Та хамгийн түрүүнд нийтлэлээ оруулаарай!
            </p>
            <a
              href="/community/create"
              style={{
                display: 'inline-block',
                padding: '12px 32px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #38bdf8, #c084fc)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Пост оруулах
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mapped.map((post) => (
              <a
                key={post.id}
                href={`/post/${post.slug}`}
                style={{
                  display: 'block',
                  padding: '20px 24px',
                  background: '#1e293b',
                  borderRadius: 12,
                  border: '1.5px solid #334155',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: 'inherit',
                }}
                className="hover-card"
              >
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                  {post.subtitle?.slice(0, 200)}
                </p>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#64748b' }}>
                  <span>{post.date}</span>
                  <span>{post.author}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
