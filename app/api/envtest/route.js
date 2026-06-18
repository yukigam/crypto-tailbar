import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const checks = {
    OPENROUTER_API_KEY: typeof process.env.OPENROUTER_API_KEY,
    len: (process.env.OPENROUTER_API_KEY || '').length,
    empty: process.env.OPENROUTER_API_KEY === '',
    defined: process.env.OPENROUTER_API_KEY !== undefined,
    keys: Object.keys(process.env).filter(k => k.includes('OPEN') || k.includes('API') || k.includes('KEY')).slice(0, 10),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };
  return NextResponse.json(checks);
}
