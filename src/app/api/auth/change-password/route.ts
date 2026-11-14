/**
 * POST /api/auth/change-password – the logged-in user changes their own password (needs the current one).
 * v4.21: the new password is also saved (encrypted) in the password book, so the admin / faculty can still see it.
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/server/db';
import { audit, clientIp, createSession, handle, requireUser } from '@/lib/server/auth';
import { PasswordRule } from '@/lib/server/validate';
import { demoLogin, isDemoMode } from '@/lib/server/demo';
import { demoRoster, demoSetPassword } from '@/lib/server/demoRoster';
import { FACULTY_LOGINS } from '@/config/credentials';
import { setStaffPassword } from '@/lib/server/staffLogins';
import { putItem } from '@/lib/server/trackerStore';
import { rememberPassword, whoOf } from '@/lib/server/passwordBook';

const Body = z.object({ currentPassword: z.string().min(1), newPassword: PasswordRule });

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser();
  const { currentPassword, newPassword } = Body.parse(await req.json());
  const remember = () => rememberPassword(me.role, whoOf(me), newPassword, 'self');
  if (isDemoMode()) {
    if (me.role === 'faculty') {
      const loginId = FACULTY_LOGINS.find(l => l.userId === me.id)?.loginId ?? me.email ?? '';
      if (!demoLogin(loginId, currentPassword)) return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
      await setStaffPassword(me.id, newPassword, true);
      await remember();
      return NextResponse.json({ success: true });
    }
    const s = demoRoster().find(x => x.ubterRollNumber === me.rollNumber);
    if (!s) return NextResponse.json({ success: false, error: 'The admin password is set in src/config/credentials.ts in demo mode.' }, { status: 400 });
    if (!demoLogin(s.ubterRollNumber, currentPassword)) return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
    demoSetPassword(s.id, await bcrypt.hash(newPassword, 12), undefined);
    await remember();
    return NextResponse.json({ success: true });
  }
  const row = (await query('SELECT password_hash FROM users WHERE id=$1', [me.id]))[0];
  if (!(await bcrypt.compare(currentPassword, row.password_hash))) {
    return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
  }
  const upd = await query(
    'UPDATE users SET password_hash=$2, must_change_password=FALSE, token_version=token_version+1, updated_at=now() WHERE id=$1 RETURNING token_version',
    [me.id, await bcrypt.hash(newPassword, 12)]
  );
  // The old issued copy is replaced by the password-book copy (v4.21).
  await query(`UPDATE students SET profile = profile - 'issuedPassword' WHERE user_id=$1`, [me.id]);
  await remember();
  if (me.role === 'faculty') await putItem('staff', `staffpw-${me.id}`, null, { facultyId: me.id, changedBySelf: true, updatedAt: new Date().toISOString() });
  const res = NextResponse.json({ success: true });
  await createSession(res, me.id, upd[0].token_version); // keep this device logged in, kick the others
  await audit(me, 'Password changed', 'SECURITY', 'SUCCESS', '', clientIp(req));
  return res;
});
