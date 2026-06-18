import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orKey = process.env.OPENROUTER_API_KEY;
  return NextResponse.json({
    'OPENROUTER_API_KEY': typeof orKey,
    'length': orKey?.length ?? 0,
    'starts_with': orKey?.startsWith('sk-or') ? 'sk-or...' : (orKey?.slice(0, 8) ?? 'undefined'),
    'NEXT_PUBLIC_SANITY_PROJECT_ID': process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.slice(0, 10) ?? 'not set',
    'node_version': process.version,
  });
}
