/**
 * POST /api/assignments/<id>/remind – faculty/admin send a reminder for one assignment to the students who have not submitted.
 */
import { NextRequest, NextResponse } from 'next/server';
import { audit, clientIp, handle, requireUser } from '@/lib/server/auth';
import { sendReminder } from '@/lib/server/reminders';

export const POST = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await requireUser('faculty', 'admin');
  const sent = await sendReminder(id);
  await audit(me, 'Manual assignment reminder', 'STUDENT_MGMT', 'SUCCESS', `${id}: ${sent} students`, clientIp(req));
  return NextResponse.json({ success: true, sent });
});
