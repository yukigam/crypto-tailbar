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
    s.dataset.zone = '11232641';
    s.src = 'https://n6wxm.com/vignette.min.js';
    const target = [document.documentElement, document.body].filter(Boolean).pop();
    if (target) target.appendChild(s);
  }, [pathname]);

  return null;
}
