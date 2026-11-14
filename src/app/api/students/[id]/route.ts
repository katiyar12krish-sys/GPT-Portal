import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { encrypt, maskAadhar } from '@/lib/server/secure';
import { rowToStudent, stripSecrets } from '@/lib/server/students';
import { isDemoMode } from '@/lib/server/demo';
import { demoDeleteStudent, demoPatchStudent } from '@/lib/server/demoRoster';

type Ctx = { params: Promise<{ id: string }> };

// Fields a student may change on their own record.
const STUDENT_EDITABLE = ['avatarUrl', 'resumeUrl', 'resumeFileName', 'resumeUploadedAt', 'careerGoal', 'skills', 'resumeHistory', 'professionalProfile'];
// Fields faculty may touch (skill endorsement only).
const FACULTY_EDITABLE = ['skills'];

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  const me = await requireUser();
  if (isDemoMode()) return NextResponse.json({ success: true, student: demoPatchStudent(me, id, await req.json()) });
  const row = (await query('SELECT * FROM students WHERE id=$1', [id]))[0];
  if (!row) throw new HttpError(404, 'Student not found.');
  if (me.role === 'student' && row.user_id !== me.id) throw new HttpError(403, 'You can only edit your own profile.');

  const body = await req.json();
  let patch: Record<string, any> = stripSecrets(body);
  delete patch.semesters; // marks only through the RBAC marks endpoint (admin may still send full record below)
  const cols: Record<string, any> = {};

  if (me.role === 'student' || me.role === 'faculty') {
    const allowed = me.role === 'student' ? STUDENT_EDITABLE : FACULTY_EDITABLE;
    patch = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)));
    if (me.role === 'student' && Array.isArray(patch.skills)) {
      // students cannot self-verify: keep verification fields from the stored copy
      const old: any[] = row.profile.skills ?? [];
      patch.skills = patch.skills.map((sk: any) => {
        const prev = old.find(o => o.id === sk.id);
        return prev
          ? { ...sk, isVerified: prev.isVerified, verifiedBy: prev.verifiedBy, verifiedById: prev.verifiedById, verifiedAt: prev.verifiedAt, remarks: prev.remarks }
          : { ...sk, isVerified: false, verifiedBy: undefined, verifiedById: undefined };
      });
    }
  } else {
    // admin: may edit everything, including status/branch/year/aadhaar
    if (body.status) cols.status = body.status;
    if (body.branch) cols.branch = body.branch;
    if (body.currentYear) cols.current_year = body.currentYear;
    if (body.batchYear) cols.batch_year = body.batchYear;
    if (Array.isArray(body.semesters)) patch.semesters = body.semesters;
    const aadhar = String(body.aadharNumber || '').replace(/\D/g, '');
    if (aadhar.length === 12) {
      cols.aadhar_encrypted = encrypt(aadhar);
      cols.aadhar_masked = maskAadhar(aadhar);
    }
  }

  const sets = ['profile = profile || $2::jsonb', 'updated_at = now()'];
  const vals: any[] = [id, JSON.stringify(patch)];
  for (const [c, v] of Object.entries(cols)) {
    vals.push(v);
    sets.push(`${c} = $${vals.length}`);
  }
  const out = await query(`UPDATE students SET ${sets.join(', ')} WHERE id=$1 RETURNING *`, vals);
  await audit(me, `Updated student ${row.profile.aadharName}`, 'STUDENT_MGMT', 'SUCCESS', Object.keys(patch).join(','), clientIp(req));
  return NextResponse.json({ success: true, student: rowToStudent(out[0]) });
});

export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  const { id } = await params;
  await requireUser('admin');
  if (isDemoMode()) {
    demoDeleteStudent(id);
    return NextResponse.json({ success: true });
  }
  const me = await requireUser('admin');
  const row = (await query('SELECT * FROM students WHERE id=$1', [id]))[0];
  if (!row) throw new HttpError(404, 'Student not found.');
  await query('DELETE FROM students WHERE id=$1', [id]);
  if (row.user_id) await query('DELETE FROM users WHERE id=$1', [row.user_id]);
  await audit(me, `Deleted student ${row.profile.aadharName}`, 'STUDENT_MGMT', 'WARNING', `Roll ${row.roll_number}`, clientIp(req));
  return NextResponse.json({ success: true });
});
