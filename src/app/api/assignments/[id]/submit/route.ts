/**
 * POST /api/assignments/<id>/submit – a student marks an assignment as submitted (optionally with a note/file name).
 */
import { NextRequest, NextResponse } from 'next/server';
import { tx } from '@/lib/server/db';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';

export const POST = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await requireUser('student');
  const { submissionText } = await req.json();
  if (!submissionText || String(submissionText).trim().length < 3) throw new HttpError(400, 'Write or paste your submission first.');

  await tx(async c => {
    const st = (await c.query('SELECT id FROM students WHERE user_id=$1', [me.id])).rows[0];
    const row = (await c.query('SELECT * FROM assignments WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!st || !row) throw new HttpError(404, 'Assignment not found.');
    const d = row.data;
    const sub = d.studentSubmissions.find((s: any) => s.studentId === st.id);
    if (!sub) throw new HttpError(403, 'This assignment is not assigned to you.');
    if (sub.isSubmitted) throw new HttpError(409, 'Already submitted.');
    const late = new Date() > new Date(d.deadlineDate);
    Object.assign(sub, {
      isSubmitted: true,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      submissionUrlOrText: String(submissionText).slice(0, 20000),
      feedback: late ? 'Submitted after deadline. Awaiting faculty grading.' : 'Submitted on time. Awaiting faculty grading.',
    });
    await c.query('UPDATE assignments SET data=$2::jsonb WHERE id=$1', [id, JSON.stringify(d)]);
  });
  await audit(me, 'Assignment submitted', 'STUDENT_MGMT', 'SUCCESS', id, clientIp(req));
  return NextResponse.json({ success: true });
});
