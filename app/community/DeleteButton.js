'use client';

import { useState, useEffect } from 'react';

export default function DeleteButton({ sanityId }) {
  const [show, setShow] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('deleteTokens') || '{}');
    if (tokens[sanityId]) setShow(true);
  }, [sanityId]);

  const handleDelete = async () => {
    if (!confirm('Нийтлэлээ устгахдаа итгэлтэй байна уу?')) return;
    setDeleting(true);
    const tokens = JSON.parse(localStorage.getItem('deleteTokens') || '{}');
    const token = tokens[sanityId];
    try {
      const res = await fetch(`/api/posts?postId=${sanityId}&token=${token}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const updated = JSON.parse(localStorage.getItem('deleteTokens') || '{}');
      delete updated[sanityId];
      localStorage.setItem('deleteTokens', JSON.stringify(updated));
      window.location.reload();
    } catch {
      alert('Устгахад алдаа гарлаа');
      setDeleting(false);
    }
  };

  if (!show) return null;

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      style={{
        marginTop: 10,
        padding: '6px 16px',
        borderRadius: 8,
        border: '1px solid #ef4444',
        background: 'transparent',
        color: '#ef4444',
        fontSize: 13,
        fontWeight: 700,
        cursor: deleting ? 'not-allowed' : 'pointer',
        opacity: deleting ? 0.5 : 1,
        transition: 'all 0.2s',
      }}
    >
      {deleting ? 'Устгаж байна...' : 'Устгах'}
    </button>
  );
}
