import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DEFAULT_STUDENT_PASSWORD } from '@/config/credentials';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { isDemoMode } from '@/lib/server/demo';
import { demoRoster, demoSetPassword } from '@/lib/server/demoRoster';
import { decrypt, encrypt, randomPassword } from '@/lib/server/secure';
import { PasswordRule } from '@/lib/server/validate';
import { rememberPassword, savedPassword } from '@/lib/server/passwordBook';

type Ctx = { params: Promise<{ id: string }> };

/** Faculty / admin: see a student's username and password (v4.21: from the password book, so a password the student chose is shown too). */
export const GET = handle(async (req: NextRequest, { params }: Ctx) => {
  const me = await requireUser('faculty', 'admin');
  const { id } = await params;
  let loginId: string;
  let issued: string | null;
  if (isDemoMode()) {
    const s = demoRoster().find(x => x.id === id);
    if (!s) throw new HttpError(404, 'Student not found.');
    loginId = s.ubterRollNumber;
    issued = s.issuedPassword ? decrypt(s.issuedPassword) : s.passwordHash ? null : DEFAULT_STUDENT_PASSWORD;
  } else {
    const r = (await query('SELECT roll_number, profile FROM students WHERE id=$1', [id]))[0];
    if (!r) throw new HttpError(404, 'Student not found.');
    loginId = r.roll_number;
    issued = r.profile?.issuedPassword ? decrypt(r.profile.issuedPassword) : null;
  }
  const book = await savedPassword('student', loginId);
  if (book) issued = book.password;
  await audit(me, `Viewed login of ${loginId}`, 'SECURITY', 'SUCCESS', '', clientIp(req));
  return NextResponse.json({ success: true, loginId, password: issued });
});

/** Faculty / admin: set a new password (or generate one) when a student forgets theirs. */
export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const me = await requireUser('faculty', 'admin');
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const password = body?.newPassword ? PasswordRule.parse(body.newPassword) : randomPassword();
  const hash = await bcrypt.hash(password, 12);
  const enc = encrypt(password);
  let roll: string;
  if (isDemoMode()) {
    demoSetPassword(id, hash, enc);
    roll = demoRoster().find(x => x.id === id)!.ubterRollNumber;
  } else {
    const r = (await query('SELECT user_id, roll_number FROM students WHERE id=$1', [id]))[0];
    if (!r) throw new HttpError(404, 'Student not found.');
    roll = r.roll_number;
    await query('UPDATE users SET password_hash=$2, must_change_password=FALSE, token_version=token_version+1, updated_at=now() WHERE id=$1', [r.user_id, hash]);
    await query(`UPDATE students SET profile = profile || jsonb_build_object('issuedPassword', $2::text), updated_at=now() WHERE id=$1`, [id, enc]);
  }
  await rememberPassword('student', roll, password, me.role === 'admin' ? 'admin' : 'faculty'); // v4.21 password book
  await audit(me, `Reset student password (${id})`, 'SECURITY', 'SUCCESS', '', clientIp(req));
  return NextResponse.json({ success: true, password });
});
