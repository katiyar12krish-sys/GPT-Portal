import { NextRequest, NextResponse } from 'next/server';
import { tx } from '@/lib/server/db';
import { handle, HttpError, requireUser } from '@/lib/server/auth';

/** POST {action:'reply', messageText} | {action:'resolve'} */
export const POST = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await requireUser();
  const body = await req.json();
  const doubt = await tx(async c => {
    const r = (await c.query('SELECT * FROM doubts WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!r) throw new HttpError(404, 'Doubt not found.');
    if (me.role === 'student' && r.student_id !== me.id) throw new HttpError(403, 'Not your doubt.');
    const d = r.data;
    if (body.action === 'reply') {
      const text = String(body.messageText || '').trim();
      if (!text) throw new HttpError(400, 'Reply cannot be empty.');
      d.replies.push({
        id: `rep-${Date.now()}`, senderName: me.name, senderRole: me.role === 'admin' ? 'faculty' : me.role,
        messageText: text.slice(0, 5000), timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      });
      if (d.status === 'Open') d.status = 'In Discussion';
      if (me.role !== 'student') {
        await c.query('INSERT INTO notifications (id,target_user_id,data) VALUES ($1,$2,$3)', [
          `notif-${Date.now()}`, r.student_id, JSON.stringify({ title: 'New reply on your doubt', message: d.title, type: 'doubt' }),
        ]);
      }
    } else if (body.action === 'resolve') {
      d.status = 'Resolved';
      d.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    } else throw new HttpError(400, 'Unknown action.');
    await c.query('UPDATE doubts SET data=$2::jsonb WHERE id=$1', [id, JSON.stringify(d)]);
    return { ...d, id };
  });
  return NextResponse.json({ success: true, doubt });
});
