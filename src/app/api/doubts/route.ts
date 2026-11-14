/**
 * GET/POST /api/doubts – online doubts: students ask, faculty answer. Students see only their own doubts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, requireUser } from '@/lib/server/auth';
import { demoDoubts, isDemoMode } from '@/lib/server/demo';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const me = await requireUser();
  if (isDemoMode()) return NextResponse.json({ success: true, doubts: demoDoubts(me) });
  const rows =
    me.role === 'student'
      ? await query('SELECT * FROM doubts WHERE student_id=$1 ORDER BY created_at DESC', [me.id])
      : await query('SELECT * FROM doubts ORDER BY created_at DESC');
  return NextResponse.json({ success: true, doubts: rows.map(r => ({ ...r.data, id: r.id })) });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser('student');
  const { title, subject, questionText, assignedFaculty } = await req.json();
  if (!title?.trim() || !questionText?.trim()) return NextResponse.json({ success: false, error: 'Title and question are required.' }, { status: 400 });
  const st = (await query('SELECT branch FROM students WHERE user_id=$1', [me.id]))[0];
  const id = `dbt-${Date.now()}`;
  const data = {
    studentId: me.id, studentName: me.name, rollNumber: me.rollNumber ?? '', branch: st?.branch ?? 'Computer Science & Engineering',
    subject, title: title.trim(), questionText: questionText.trim(), assignedFacultyOrExpert: assignedFaculty,
    status: 'Open', createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16), replies: [],
  };
  await query('INSERT INTO doubts (id,student_id,data) VALUES ($1,$2,$3)', [id, me.id, JSON.stringify(data)]);
  await audit(me, `Posted doubt: ${title}`, 'STUDENT_MGMT', 'SUCCESS', '', clientIp(req));
  return NextResponse.json({ success: true, doubt: { ...data, id } });
});
