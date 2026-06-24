'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function MonetagScript() {
  const pathname = usePathname();
  if (pathname?.startsWith('/studio')) return null;
  return <Script src="https://quge5.com/88/tag.min.js" data-zone="252181" strategy="beforeInteractive" data-cfasync="false" />;
}
