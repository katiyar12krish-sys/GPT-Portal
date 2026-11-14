/**
 * PATCH /api/students/<id>/marks – faculty edit subject marks. RBAC: a teacher may edit only subjects in their assignedSubjects (checked here, on the server).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { tx } from '@/lib/server/db';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { gradeFor, rowToStudent } from '@/lib/server/students';
import { isDemoMode } from '@/lib/server/demo';
import { demoUpdateMarks } from '@/lib/server/demoRoster';

const Body = z.object({
  semNumber: z.number().int().min(1).max(6),
  subjectCode: z.string().min(2).max(20),
  obtainedMarks: z.number().min(0).max(1000),
});

export const PATCH = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await requireUser('faculty', 'admin');
  const { semNumber, subjectCode, obtainedMarks } = Body.parse(await req.json());
  if (isDemoMode()) return NextResponse.json({ success: true, student: demoUpdateMarks(me, id, semNumber, subjectCode, obtainedMarks) });

  // Subject-level RBAC is enforced HERE on the server, not in the browser.
  if (me.role !== 'admin' && !me.assignedSubjects.includes(subjectCode) && !me.assignedSubjects.includes('ALL')) {
    await audit(me, `Unauthorized marks edit on ${subjectCode}`, 'MARKS_RBAC', 'FAILED', `student=${id}`, clientIp(req));
    throw new HttpError(403, `Access denied: you can only edit marks for your assigned subjects (${me.assignedSubjects.join(', ') || 'none'}).`);
  }

  const updated = await tx(async c => {
    const r = (await c.query('SELECT * FROM students WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!r) throw new HttpError(404, 'Student not found.');
    const profile = r.profile;
    const sem = profile.semesters?.find((s: any) => s.semNumber === semNumber);
    const sub = sem?.subjects?.find((s: any) => s.subjectCode === subjectCode);
    if (!sub) throw new HttpError(404, 'Subject not found for this semester.');
    if (obtainedMarks > sub.maxMarks) throw new HttpError(400, `Marks cannot exceed ${sub.maxMarks}.`);

    sub.obtainedMarks = obtainedMarks;
    sub.grade = gradeFor((obtainedMarks / sub.maxMarks) * 100);
    sub.lastUpdatedBy = `${me.name} (${me.role})`;
    const tot = sem.subjects.reduce((a: number, x: any) => a + x.obtainedMarks, 0);
    const max = sem.subjects.reduce((a: number, x: any) => a + x.maxMarks, 0);
    sem.obtainedMarks = tot;
    sem.totalMarks = max;
    sem.percentage = max ? Number(((tot / max) * 100).toFixed(1)) : sem.percentage;

    const out = await c.query('UPDATE students SET profile=$2::jsonb, updated_at=now() WHERE id=$1 RETURNING *', [id, JSON.stringify(profile)]);
    await c.query(
      `INSERT INTO notifications (id, target_user_id, data) VALUES ($1,$2,$3)`,
      [`notif-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, r.user_id,
       JSON.stringify({ title: 'Marks updated', message: `${subjectCode} marks updated by ${me.name}.`, type: 'general' })]
    );
    return out.rows[0];
  });
  await audit(me, `Marks updated ${subjectCode}`, 'MARKS_RBAC', 'SUCCESS', `student=${id} sem=${semNumber} marks=${obtainedMarks}`, clientIp(req));
  return NextResponse.json({ success: true, student: rowToStudent(updated) });
});
