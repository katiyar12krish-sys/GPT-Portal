import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { sendReminder } from '@/lib/server/reminders';

/**
 * Call this once an hour (Vercel Cron / cron-job.org / Cloud Scheduler):
 *   GET /api/cron/reminders   with header  Authorization: Bearer $CRON_SECRET
 * Reminder 1 at <=7 days left, 2 at <=3 days, 3 at <=1 day left. Skips submitted students.
 */
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await query("SELECT id, deadline, data FROM assignments WHERE deadline > now() AND (data->>'remindersSentCount')::int < 3");
  let fired = 0;
  for (const r of rows) {
    const daysLeft = (new Date(r.deadline).getTime() - Date.now()) / 86_400_000;
    const sent = r.data.remindersSentCount;
    const due = (sent === 0 && daysLeft <= 7) || (sent === 1 && daysLeft <= 3) || (sent === 2 && daysLeft <= 1);
    if (due) {
      await sendReminder(r.id, true);
      fired++;
    }
  }
  return NextResponse.json({ success: true, checked: rows.length, fired });
}
