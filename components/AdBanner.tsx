'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AdBanner() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname?.startsWith('/studio') || !containerRef.current) return;

    const s = document.createElement('script');
    s.dataset.zone = '11208315';
    s.src = 'https://nap5k.com/tag.min.js';
    containerRef.current.appendChild(s);
  }, [pathname]);

  if (pathname?.startsWith('/studio')) return null;

  return (
    <div ref={containerRef} style={{
      width: '100%',
      minHeight: '90px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px 0',
      overflow: 'hidden',
    }} />
  );
}
