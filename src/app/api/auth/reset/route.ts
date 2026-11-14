/**
 * POST /api/auth/reset – "forgot password" step 2: checks the SMS OTP (hashed, 10 minutes, 5 tries) and sets the new password.
 * Step 1 (sending the OTP) is /api/auth/forgot.
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle } from '@/lib/server/auth';
import { PasswordRule } from '@/lib/server/validate';
import { rememberPassword } from '@/lib/server/passwordBook';

const Body = z.object({
  identifier: z.string().trim().min(3).max(120),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits.'),
  newPassword: PasswordRule,
});

export const POST = handle(async (req: NextRequest) => {
  const { identifier, otp, newPassword } = Body.parse(await req.json());
  const id = identifier.toLowerCase();
  const u = (await query('SELECT * FROM users WHERE lower(email)=$1 OR mobile=$1 OR roll_number=$1 LIMIT 1', [id]))[0];
  const bad = NextResponse.json({ success: false, error: 'Invalid or expired OTP.' }, { status: 400 });
  if (!u) return bad;

  const rec = (
    await query(
      'SELECT * FROM otp_codes WHERE user_id=$1 AND used=FALSE AND expires_at > now() ORDER BY id DESC LIMIT 1',
      [u.id]
    )
  )[0];
  if (!rec || rec.attempts >= 5) return bad;
  const ok = await bcrypt.compare(otp, rec.code_hash);
  if (!ok) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id=$1', [rec.id]);
    return bad;
  }
  await query('UPDATE otp_codes SET used=TRUE WHERE id=$1', [rec.id]);
  await query(
    'UPDATE users SET password_hash=$2, must_change_password=FALSE, token_version=token_version+1, updated_at=now() WHERE id=$1',
    [u.id, await bcrypt.hash(newPassword, 12)]
  );
  await rememberPassword(u.role, u.role === 'student' ? u.roll_number : u.id, newPassword, 'otp'); // v4.21 password book
  await audit({ id: u.id, name: u.name, role: u.role }, 'Password reset via OTP', 'SECURITY', 'SUCCESS', '', clientIp(req));
  return NextResponse.json({ success: true });
});
