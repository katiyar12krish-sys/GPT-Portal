/**
 * GET/POST /api/notifications – portal alerts shown in the bell drawer; staff can broadcast a notification.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { handle, requireUser } from '@/lib/server/auth';
import { isDemoMode } from '@/lib/server/demo';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const me = await requireUser();
  if (isDemoMode()) return NextResponse.json({ success: true, notifications: [] });
  const rows = await query(
    'SELECT * FROM notifications WHERE target_user_id IS NULL OR target_user_id=$1 ORDER BY created_at DESC LIMIT 100',
    [me.id]
  );
  return NextResponse.json({
    success: true,
    notifications: rows.map(r => ({
      ...r.data,
      id: r.id,
      timestamp: new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      read: (r.read_by as string[]).includes(me.id),
    })),
  });
});

/** POST {ids: string[]} or {all: true} -> mark read for this user */
export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser();
  const { ids, all } = await req.json();
  if (all) {
    await query("UPDATE notifications SET read_by = array_append(read_by,$1) WHERE (target_user_id IS NULL OR target_user_id=$1) AND NOT ($1 = ANY(read_by))", [me.id]);
  } else if (Array.isArray(ids) && ids.length) {
    await query('UPDATE notifications SET read_by = array_append(read_by,$1) WHERE id = ANY($2::text[]) AND NOT ($1 = ANY(read_by))', [me.id, ids]);
  }
  return NextResponse.json({ success: true });
});
