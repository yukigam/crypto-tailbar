import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const allKeys = Object.keys(process.env).sort();
  const openKeys = allKeys.filter(k => k.toUpperCase().includes('OPEN') || k.toUpperCase().includes('ROUTER') || k.toUpperCase().includes('AI'));
  const allVars = {};
  for (const k of openKeys) {
    allVars[k] = process.env[k] ? (process.env[k].slice(0, 10) + '...') : '(empty)';
  }
  return NextResponse.json({
    total_env_vars: allKeys.length,
    sample: allKeys.slice(0, 20),
    openrouter_vars: allVars,
    OPENROUTER_API_KEY_defined: 'OPENROUTER_API_KEY' in process.env,
    OPENROUTER_API_KEY_value: process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_API_KEY.slice(0, 12) + '...') : 'undefined',
  });
}
