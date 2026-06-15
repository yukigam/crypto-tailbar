'use client';

import { useEffect } from 'react';

export default function SaveToken({ postId, token }) {
  useEffect(() => {
    if (!postId || !token) return;
    const tokens = JSON.parse(localStorage.getItem('deleteTokens') || '{}');
    tokens[postId] = token;
    localStorage.setItem('deleteTokens', JSON.stringify(tokens));
    window.history.replaceState({}, '', '/community');
  }, [postId, token]);
  return null;
}
