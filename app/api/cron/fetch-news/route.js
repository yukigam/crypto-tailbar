export const runtime = 'nodejs';
export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ success: false, message: 'Auto-publishing disabled. Add articles via Sanity Studio manually.' });
}
