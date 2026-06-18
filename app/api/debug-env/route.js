import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const key = process.env.OPENROUTER_API_KEY;
  const result = {
    defined: typeof key !== 'undefined',
    type: typeof key,
    length: key?.length ?? 0,
    empty: key === '',
    prefix: key?.slice(0, 10) ?? 'n/a',
  };
  if (key) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const body = await res.text();
      result.auth_status = res.status;
      result.auth_body = body.slice(0, 100);
    } catch (e) {
      result.auth_error = e.message;
    }
  }
  return NextResponse.json(result);
}
