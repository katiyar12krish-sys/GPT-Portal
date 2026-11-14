import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '@/lib/server/db';
import { demoLogin, isDemoMode } from '@/lib/server/demo';
import { rememberPassword, whoOf } from '@/lib/server/passwordBook';
import { assertNotLocked, audit, clearFails, clientIp, createSession, handle, recordFail, rowToUser } from '@/lib/server/auth';

const Body = z.object({
  identifier: z.string().trim().min(1, 'Enter roll number / email / mobile.').max(120),
  password: z.string().min(1, 'Enter your password.').max(200),
});

// Constant-time-ish dummy hash so unknown users cost the same as wrong passwords.
const DUMMY = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO5x6H5q7e6d0i7yJ7mYb8kQ0K2fQ0qWe';

export const POST = handle(async (req: NextRequest) => {
  const { identifier, password } = Body.parse(await req.json());

  // No database configured → check src/config/credentials.ts
  if (isDemoMode()) {
    const user = demoLogin(identifier, password);
    if (!user) return NextResponse.json({ success: false, error: 'Wrong ID or password. Check and try again.' }, { status: 401 });
    await rememberPassword(user.role, whoOf(user), password, 'login'); // v4.21: keep a readable copy for staff (password book)
    const res = NextResponse.json({ success: true, user, demo: true });
    await createSession(res, user.id, 0, user);
    return res;
  }

  const ip = clientIp(req);
  const id = identifier.toLowerCase();
  const lockKey = `login:${id}`;
  await assertNotLocked(lockKey);
  await assertNotLocked(`ip:${ip}`);

  let rows;
  if (id === 'admin' || id === 'principal') {
    rows = await query("SELECT * FROM users WHERE role='admin' ORDER BY created_at LIMIT 1");
  } else {
    rows = await query(
      'SELECT * FROM users WHERE lower(email)=$1 OR mobile=$1 OR roll_number=$1 OR id=$1 LIMIT 1',
      [id]
    );
  }
  const u = rows[0];
  const ok = await bcrypt.compare(password, u?.password_hash ?? DUMMY);
  if (!u || !ok) {
    await recordFail(lockKey);
    await recordFail(`ip:${ip}`);
    await audit(null, 'Failed login attempt', 'AUTH', 'FAILED', `identifier=${id}`, ip);
    return NextResponse.json({ success: false, error: 'Wrong ID or password. Check and try again.' }, { status: 401 });
  }
  await clearFails(lockKey);

  const user = rowToUser(u);
  await rememberPassword(user.role, whoOf(user), password, 'login'); // v4.21: keep a readable copy for staff (password book)
  const res = NextResponse.json({ success: true, user });
  await createSession(res, u.id, u.token_version);
  await audit(user, `${user.role} logged in`, 'AUTH', 'SUCCESS', '', ip);
  return res;
});
