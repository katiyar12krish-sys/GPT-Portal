/**
 * GET /api/logs – the activity log (logins, password changes, uploads). Staff only.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { handle, requireUser } from '@/lib/server/auth';
import { isDemoMode } from '@/lib/server/demo';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await requireUser('admin');
  if (isDemoMode()) return NextResponse.json({ success: true, logs: [] });
  const rows = await query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 300');
  return NextResponse.json({
    success: true,
    logs: rows.map(r => ({
      id: `act-${r.id}`,
      timestamp: new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19),
      userId: r.user_id ?? 'anonymous',
      userName: r.user_name ?? 'Unknown',
      userRole: r.user_role ?? 'student',
      action: r.action,
      category: r.category,
      ipAddress: r.ip ?? '',
      status: r.status,
      details: r.details,
    })),
  });
});
