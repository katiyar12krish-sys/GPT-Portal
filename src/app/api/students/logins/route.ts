/**
 * GET /api/students/logins (v4.21) – faculty and admin: every student with details, username (login ID) and password.
 * Passwords come from the password book (src/lib/server/passwordBook.ts), decrypted on the server only.
 * Each view is written to the activity log. A student never reaches this route (requireUser refuses).
 */
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_STUDENT_PASSWORD } from '@/config/credentials';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, requireUser } from '@/lib/server/auth';
import { isDemoMode } from '@/lib/server/demo';
import { demoRoster } from '@/lib/server/demoRoster';
import { decrypt } from '@/lib/server/secure';
import { savedPassword, SOURCE_NOTE } from '@/lib/server/passwordBook';

export const dynamic = 'force-dynamic';

export interface StudentLogin {
  id: string; // student record id (used to set a new password)
  name: string;
  rollNumber: string; // also the username
  branch: string;
  year: string;
  batchYear: number;
  mobile: string;
  password: string | null;
  passwordNote: string;
  updatedAt: string;
}

const tryDecrypt = (v?: string) => {
  try {
    return v ? decrypt(v) : null;
  } catch {
    return null;
  }
};

export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser('faculty', 'admin');
  type Base = Omit<StudentLogin, 'password' | 'passwordNote' | 'updatedAt'> & { issued: string | null; usesDefault: boolean };
  let base: Base[];
  if (isDemoMode()) {
    base = demoRoster().map(s => ({
      id: s.id,
      name: s.aadharName,
      rollNumber: s.ubterRollNumber,
      branch: s.branch,
      year: s.currentYear,
      batchYear: s.batchYear,
      mobile: s.mobileNumber ?? '',
      issued: tryDecrypt(s.issuedPassword),
      usesDefault: !s.passwordHash, // demo students without a changed password log in with the default one
    }));
  } else {
    const rows = await query(
      `SELECT s.id, s.roll_number, s.branch, s.current_year, s.batch_year, s.profile, u.name, u.mobile
         FROM students s LEFT JOIN users u ON u.id = s.user_id ORDER BY s.branch, s.current_year, s.roll_number`
    );
    base = rows.map(r => ({
      id: r.id,
      name: r.name ?? r.profile?.aadharName ?? '',
      rollNumber: r.roll_number,
      branch: r.branch,
      year: r.current_year,
      batchYear: r.batch_year,
      mobile: r.mobile ?? '',
      issued: tryDecrypt(r.profile?.issuedPassword),
      usesDefault: false,
    }));
  }

  const students: StudentLogin[] = [];
  for (const b of base) {
    const { issued, usesDefault, ...rest } = b;
    const book = await savedPassword('student', b.rollNumber);
    let password: string | null = null;
    let passwordNote = 'Saved at the next login';
    if (book) {
      password = book.password;
      passwordNote = SOURCE_NOTE[book.source];
    } else if (issued) {
      password = issued;
      passwordNote = 'Set by faculty';
    } else if (usesDefault) {
      password = DEFAULT_STUDENT_PASSWORD;
      passwordNote = 'Default password';
    }
    students.push({ ...rest, password, passwordNote, updatedAt: book?.updatedAt ?? '' });
  }
  await audit(me, 'Viewed student list & logins', 'SECURITY', 'SUCCESS', `${students.length} students`, clientIp(req));
  return NextResponse.json({ success: true, students });
});
