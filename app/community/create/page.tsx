'use client';

import { useState } from 'react';
import { createPost } from './actions';

export default function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = new FormData();
    form.set('title', title);
    form.set('content', content);

    const result = await createPost(form);

    if (result.success) {
      setStatus('success');
      setTitle('');
      setContent('');
    } else {
      setStatus('error');
      setMessage(result.error || 'Алдаа гарлаа');
    }
  }

  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>Амжилттай илгээгдлээ</h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#94a3b8', marginBottom: 28 }}>
            Таны пост хяналтанд орж, баталгаажсаны дараа нийтлэгдэх болно.
          </p>
          <a
            href="/"
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
            Нүүр хуудас руу буцах
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px' }}>
        <a href="/" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginBottom: 24 }}>
          ← Нүүр хуудас руу буцах
        </a>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>Нийтлэл, Пост оруулах</h1>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 36px' }}>
          Крипто зах зээлийн талаарх өөрийн шинжилгээ, сүүлийн үеийн мэдээ, эсвэл сонирхолтой бодлоо бусадтайгаа чөлөөтэй хуваалцаарай. Таны оруулсан пост хяналтанд орсны дараа вэбсайт дээр нийтлэгдэх болно.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label htmlFor="title" style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'block', marginBottom: 8 }}>
              Гарчиг
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Нийтлэлийн гарчиг..."
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                background: '#1e293b',
                border: '1.5px solid #334155',
                borderRadius: 12,
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
              onBlur={(e) => (e.target.style.borderColor = '#334155')}
            />
          </div>

          <div>
            <label htmlFor="content" style={{ fontSize: 14, fontWeight: 800, color: '#fff', display: 'block', marginBottom: 8 }}>
              Текст
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Нийтлэлийн үндсэн текст эсвэл санал бодлоо бичнэ үү..."
              required
              rows={10}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: '#1e293b',
                border: '1.5px solid #334155',
                borderRadius: 12,
                color: '#fff',
                fontSize: 15,
                fontWeight: 500,
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                lineHeight: 1.7,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#38bdf8')}
              onBlur={(e) => (e.target.style.borderColor = '#334155')}
            />
          </div>

          {status === 'error' && (
            <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#fca5a5', fontSize: 14, fontWeight: 600 }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '14px 32px',
              border: 'none',
              borderRadius: 12,
              background: status === 'loading' ? '#334155' : 'linear-gradient(135deg, #38bdf8, #c084fc)',
              color: status === 'loading' ? '#94a3b8' : '#fff',
              fontSize: 16,
              fontWeight: 800,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {status === 'loading' ? 'Илгээж байна...' : 'Пост оруулах'}
          </button>
        </form>
      </div>
    </div>
  );
}
