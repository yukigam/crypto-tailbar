'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function VignetteAd() {
  const pathname = usePathname();
  if (pathname?.startsWith('/studio')) return null;

  return (
    <Script
      id="vignette-ad"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(s){s.dataset.zone='11211782',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
        }}
      />
    );
  }
