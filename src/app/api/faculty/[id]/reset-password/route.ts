import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { isDemoMode } from '@/lib/server/demo';
import { INITIAL_FACULTY_CREDENTIALS } from '@/lib/data/facultyData';
import { randomPassword } from '@/lib/server/secure';
import { sendSms } from '@/lib/server/sms';
import { setStaffPassword } from '@/lib/server/staffLogins';
import { PasswordRule } from '@/lib/server/validate';

/** Admin sets (or generates) a faculty password. The admin can see it again in Faculty List & Logins until the faculty member changes it. */
export const POST = handle(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const me = await requireUser('admin');
  let name: string;
  let mobile = '';
  let smsOn = false;
  if (isDemoMode()) {
    const f = INITIAL_FACULTY_CREDENTIALS.find(x => x.facultyId === id);
    if (!f) throw new HttpError(404, 'Faculty not found.');
    name = f.facultyName;
  } else {
    const u = (await query("SELECT * FROM users WHERE id=$1 AND role='faculty'", [id]))[0];
    if (!u) throw new HttpError(404, 'Faculty not found.');
    name = u.name;
    mobile = u.mobile ?? '';
    smsOn = !!u.sms_alerts;
  }
  if (id === me.id) throw new HttpError(400, 'Change your own password from your profile.');
  const body = await req.json().catch(() => ({}));
  const password = body?.newPassword ? PasswordRule.parse(String(body.newPassword)) : randomPassword(10);
  await setStaffPassword(id, password, false);
  let smsSent = false;
  if (body?.sendSms && mobile && smsOn) smsSent = await sendSms(mobile, `UGIP Tanakpur Portal: your new password is ${password}. You can change it after login.`);
  await audit(me, `Set password for ${name}`, 'FACULTY_MGMT', 'SUCCESS', `sms=${smsSent}`, clientIp(req));
  return NextResponse.json({ success: true, tempPassword: password, smsSent });
});
