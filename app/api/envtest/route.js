import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const allKeys = Object.keys(process.env).sort();
  const projectVars = {};
  for (const k of allKeys) {
    if (!k.startsWith('AWS_') && !k.startsWith('TURBO_') && !k.startsWith('LD_') && !k.startsWith('NODE_') && !k.startsWith('NX_') && k !== 'PATH' && k !== 'PWD' && k !== 'SHLVL' && k !== 'LANG' && k !== 'NOW_REGION') {
      projectVars[k] = process.env[k] ? process.env[k].slice(0, 20) : '(empty)';
    }
  }
  return NextResponse.json({
    total_env_vars: allKeys.length,
    project_vars: projectVars,
  });
}
