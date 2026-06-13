'use client';
import { useRouter } from 'next/navigation';

export default function BackButton({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, ...style }}
    >
      {children}
    </button>
  );
}
