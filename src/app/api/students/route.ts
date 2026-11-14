/**
 * GET/POST /api/students – student list (a student gets only their own record) and adding a new student (staff), with a temporary password.
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, requireUser } from '@/lib/server/auth';
import { encrypt, maskAadhar, randomPassword } from '@/lib/server/secure';
import { rowToStudent, stripSecrets } from '@/lib/server/students';
import { sendSms } from '@/lib/server/sms';
import { demoStudents, isDemoMode } from '@/lib/server/demo';
import { demoAddStudent } from '@/lib/server/demoRoster';
import { rememberPassword } from '@/lib/server/passwordBook';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const me = await requireUser();
  if (isDemoMode()) return NextResponse.json({ success: true, students: demoStudents(me) });
  const rows =
    me.role === 'student'
      ? await query('SELECT * FROM students WHERE user_id=$1', [me.id])
      : await query('SELECT * FROM students ORDER BY batch_year DESC, roll_number');
  return NextResponse.json({ success: true, students: rows.map(rowToStudent) });
});

export const POST = handle(async (req: NextRequest) => {
  // Admin and faculty can add students
  const me = await requireUser('admin', 'faculty');
  const s = await req.json();
  if (isDemoMode()) {
    const student = demoAddStudent(s);
    return NextResponse.json({ success: true, student, tempPassword: '(demo) use DEFAULT_STUDENT_PASSWORD from src/config/credentials.ts' });
  }
  const roll = String(s.ubterRollNumber || '').trim();
  if (!/^\d{6,15}$/.test(roll)) return NextResponse.json({ success: false, error: 'Valid UBTER roll number required.' }, { status: 400 });
  if (!s.aadharName || !s.branch || !s.currentYear) {
    return NextResponse.json({ success: false, error: 'Name, branch and year are required.' }, { status: 400 });
  }
  if ((await query('SELECT 1 FROM students WHERE roll_number=$1', [roll])).length) {
    return NextResponse.json({ success: false, error: 'A student with this roll number already exists.' }, { status: 409 });
  }
  const aadhar = String(s.aadharNumber || '').replace(/\D/g, '');
  const tempPassword = randomPassword();
  const userId = `user_student_${roll}`;
  const studentId = `stu-${roll}`;
  await query(
    `INSERT INTO users (id, role, name, mobile, roll_number, department, password_hash, must_change_password)
     VALUES ($1,'student',$2,$3,$4,$5,$6,TRUE)`,
    [userId, s.aadharName, s.mobileNumber || null, roll, `${s.branch} (${s.currentYear})`, await bcrypt.hash(tempPassword, 12)]
  );
  const profile = { ...stripSecrets(s), semesters: s.semesters ?? [] };
  await query(
    `INSERT INTO students (id,user_id,roll_number,branch,current_year,batch_year,status,aadhar_encrypted,aadhar_masked,profile)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [studentId, userId, roll, s.branch, s.currentYear, s.batchYear ?? new Date().getFullYear(), s.status ?? 'Active',
     aadhar ? encrypt(aadhar) : '', aadhar ? maskAadhar(aadhar) : 'XXXX-XXXX-XXXX', JSON.stringify(profile)]
  );
  await rememberPassword('student', roll, tempPassword, 'new-account'); // v4.21 password book
  if (s.mobileNumber) {
    await sendSms(s.mobileNumber, `UGIP Tanakpur Portal: login with Roll No ${roll} and temporary password ${tempPassword}. Change it after first login.`);
  }
  await audit(me, `Added student ${s.aadharName}`, 'STUDENT_MGMT', 'SUCCESS', `Roll ${roll}`, clientIp(req));
  const row = (await query('SELECT * FROM students WHERE id=$1', [studentId]))[0];
  // temp password is returned once so the admin can hand it over if SMS is not configured
  return NextResponse.json({ success: true, student: rowToStudent(row), tempPassword });
});
