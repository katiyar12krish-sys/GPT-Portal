/**
 * GET/POST /api/assignments – list assignments (students: only their branch + year) and create new ones (faculty/admin).
 * Demo mode reads src/lib/data/academicData.ts; with a database it uses the `assignments` table.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, requireUser } from '@/lib/server/auth';
import { demoAssignments, isDemoMode } from '@/lib/server/demo';

export const dynamic = 'force-dynamic';

function shape(r: any, studentId?: string) {
  const d = { ...r.data, id: r.id };
  if (studentId) d.studentSubmissions = d.studentSubmissions.filter((s: any) => s.studentId === studentId); // privacy
  return d;
}

export const GET = handle(async () => {
  const me = await requireUser();
  if (isDemoMode()) return NextResponse.json({ success: true, assignments: demoAssignments(me) });
  if (me.role === 'student') {
    const st = (await query('SELECT * FROM students WHERE user_id=$1', [me.id]))[0];
    if (!st) return NextResponse.json({ success: true, assignments: [] });
    const rows = await query('SELECT * FROM assignments WHERE branch=$1 AND target_year=$2 ORDER BY created_at DESC', [st.branch, st.current_year]);
    return NextResponse.json({ success: true, assignments: rows.map(r => shape(r, st.id)) });
  }
  const rows = await query('SELECT * FROM assignments ORDER BY created_at DESC');
  return NextResponse.json({ success: true, assignments: rows.map(r => shape(r)) });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser('faculty', 'admin');
  const a = await req.json();
  if (!a.title || !a.subjectCode || !a.branch || !a.targetYear || !a.deadlineDate) {
    return NextResponse.json({ success: false, error: 'Title, subject, branch, year and deadline are required.' }, { status: 400 });
  }
  if (me.role === 'faculty' && !me.assignedSubjects.includes(a.subjectCode) && !me.assignedSubjects.includes('ALL')) {
    return NextResponse.json({ success: false, error: 'You can only create assignments for your own subjects.' }, { status: 403 });
  }
  const studs = await query('SELECT id, roll_number, profile FROM students WHERE branch=$1 AND current_year=$2', [a.branch, a.targetYear]);
  const id = `asg-${Date.now()}`;
  const data = {
    ...a,
    facultyName: me.name,
    assignedDate: new Date().toISOString().slice(0, 10),
    remindersSentCount: 0,
    reminderTimestamps: [],
    isOverdueForUnsubmitted: false,
    facultyAlertTriggered: false,
    studentSubmissions: studs.map(s => ({
      studentId: s.id, studentName: s.profile.aadharName, rollNumber: s.roll_number, isSubmitted: false, feedback: 'Awaiting submission.',
    })),
  };
  await query('INSERT INTO assignments (id,branch,target_year,subject_code,deadline,data) VALUES ($1,$2,$3,$4,$5,$6)', [
    id, a.branch, a.targetYear, a.subjectCode, new Date(a.deadlineDate), JSON.stringify(data),
  ]);
  for (const s of studs) {
    await query('INSERT INTO notifications (id,target_user_id,data) SELECT $1, user_id, $2 FROM students WHERE id=$3', [
      `notif-${id}-${s.id}`, JSON.stringify({ title: `New assignment: ${a.title}`, message: `Deadline ${new Date(a.deadlineDate).toLocaleString('en-IN')}`, type: 'assignment_reminder' }), s.id,
    ]);
  }
  await audit(me, `Created assignment ${a.title}`, 'STUDENT_MGMT', 'SUCCESS', `${studs.length} students`, clientIp(req));
  return NextResponse.json({ success: true, assignment: { ...data, id } });
});
