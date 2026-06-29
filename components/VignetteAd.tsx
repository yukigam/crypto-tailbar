'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VignetteAd() {
  const pathname = usePathname();
  const injected = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith('/studio') || injected.current) return;
    injected.current = true;

    const s = document.createElement('script');
    s.dataset.zone = '11211782';
    s.src = 'https://n6wxm.com/vignette.min.js';
    document.body.appendChild(s);
  }, [pathname]);

  return null;
}
