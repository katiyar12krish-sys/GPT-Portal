/**
 * GET /api/health – quick check after deployment: {"ok":true,"db":"up"} means the server and database work.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/server/db';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await query('SELECT 1');
    return NextResponse.json({ ok: true, db: 'up' });
  } catch {
    return NextResponse.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
