import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/server/db';
import { assertNotLocked, audit, clientIp, handle, recordFail } from '@/lib/server/auth';
import { randomOtp } from '@/lib/server/secure';
import { sendSms } from '@/lib/server/sms';

const Body = z.object({ identifier: z.string().trim().min(3).max(120) });

// Always returns the same message so attackers cannot discover which accounts exist.
export const POST = handle(async (req: NextRequest) => {
  const { identifier } = Body.parse(await req.json());
  const ip = clientIp(req);
  const id = identifier.toLowerCase();
  await assertNotLocked(`otp:${ip}`);
  await recordFail(`otp:${ip}`); // counts every request; 5 requests / 15 min / IP

  const u = (await query('SELECT * FROM users WHERE lower(email)=$1 OR mobile=$1 OR roll_number=$1 LIMIT 1', [id]))[0];
  if (u && u.mobile) {
    const otp = randomOtp();
    await query('UPDATE otp_codes SET used=TRUE WHERE user_id=$1 AND used=FALSE', [u.id]);
    await query("INSERT INTO otp_codes (user_id, code_hash, expires_at) VALUES ($1,$2, now() + interval '10 minutes')", [
      u.id,
      await bcrypt.hash(otp, 8),
    ]);
    const sent = await sendSms(u.mobile, `UGIP Tanakpur Portal: your password reset OTP is ${otp}. Valid for 10 minutes. Do not share it.`);
    await audit({ id: u.id, name: u.name, role: u.role }, 'Password reset OTP requested', 'SMS', sent ? 'SUCCESS' : 'FAILED', '', ip);
  }
  return NextResponse.json({ success: true, message: 'If this account exists, an OTP has been sent to its registered mobile number.' });
});
