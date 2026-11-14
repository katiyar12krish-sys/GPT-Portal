/**
 * Server-side login and security helpers used by every API route:
 * - createSession / clearSession: the signed, httpOnly session cookie (8 hours)
 * - getUser / requireUser(...roles): who is calling; requireUser throws 401/403 when not allowed
 * - handle(): wraps a route so thrown HttpError / zod errors become clean JSON messages
 * - audit(): writes the activity log; assertNotLocked / recordFail / clearFails: 5 wrong tries → 15-minute lock
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';
import { demoSecret, isDemoMode } from './demo';

export type Role = 'student' | 'faculty' | 'admin';
export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string | null;
  mobile: string | null;
  rollNumber: string | null;
  department: string | null;
  assignedSubjects: string[];
  mfaEnabled: boolean;
  avatarUrl: string;
  mustChangePassword: boolean;
}

const COOKIE = 'gpt_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  if (isDemoMode()) return new TextEncoder().encode(demoSecret());
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('AUTH_SECRET missing or shorter than 32 chars. Generate: openssl rand -base64 48');
  return new TextEncoder().encode(s);
}

export async function createSession(res: NextResponse, userId: string, tokenVersion: number, demoUser?: SessionUser) {
  // In demo mode there is no users table, so the profile travels inside the signed token.
  const jwt = await new SignJWT(demoUser ? { tv: tokenVersion, demo: demoUser } : { tv: tokenVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  res.cookies.set(COOKIE, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    // HTTPS-only in production. A college LAN server reached over plain http://192.168.x.x sets COOKIE_SECURE=false
    // (see LAN-SERVER-GUIDE.md), otherwise the browser drops the cookie and nobody can log in.
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function clearSession(res: NextResponse) {
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export function rowToUser(r: any): SessionUser {
  return {
    id: r.id,
    role: r.role,
    name: r.name,
    email: r.email,
    mobile: r.mobile,
    rollNumber: r.roll_number,
    department: r.department,
    assignedSubjects: r.assigned_subjects ?? [],
    mfaEnabled: r.mfa_enabled,
    avatarUrl: r.avatar_url ?? '',
    mustChangePassword: r.must_change_password,
  };
}

/** Returns the logged-in user or null. Verifies signature, expiry and token_version (so password change logs out other devices). */
export async function getUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (isDemoMode()) return (payload.demo as SessionUser) ?? null;
    const rows = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    const u = rows[0];
    if (!u || u.token_version !== payload.tv) return null;
    return rowToUser(u);
  } catch {
    return null;
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireUser(...roles: Role[]): Promise<SessionUser> {
  const u = await getUser();
  if (!u) throw new HttpError(401, 'Please log in.');
  if (roles.length && !roles.includes(u.role)) throw new HttpError(403, 'You do not have permission for this action.');
  return u;
}

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function audit(
  u: Pick<SessionUser, 'id' | 'name' | 'role'> | null,
  action: string,
  category: string,
  status: 'SUCCESS' | 'FAILED' | 'WARNING',
  details = '',
  ip?: string
) {
  if (isDemoMode()) return;
  try {
    await query(
      'INSERT INTO activity_logs (user_id,user_name,user_role,action,category,status,details,ip) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [u?.id ?? null, u?.name ?? null, u?.role ?? null, action, category, status, details, ip ?? null]
    );
  } catch (e) {
    console.error('audit log failed', e);
  }
}

/** Wrap a route handler so HttpError / ZodError / unexpected errors become clean JSON. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<NextResponse>) {
  return async (...args: A): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (e: any) {
      if (e instanceof HttpError) return NextResponse.json({ success: false, error: e.message }, { status: e.status });
      if (e?.name === 'ZodError') {
        return NextResponse.json({ success: false, error: e.issues?.[0]?.message ?? 'Invalid input.' }, { status: 400 });
      }
      console.error('API error', e);
      return NextResponse.json({ success: false, error: 'Server error. Please try again.' }, { status: 500 });
    }
  };
}

// ---- brute-force protection (DB-backed so it works across serverless instances) ----
const MAX_FAILS = 5;
const LOCK_MIN = 15;

export async function assertNotLocked(key: string) {
  const r = (await query('SELECT locked_until FROM login_attempts WHERE key=$1', [key]))[0];
  if (r?.locked_until && new Date(r.locked_until) > new Date()) {
    throw new HttpError(429, `Too many failed attempts. Try again after ${LOCK_MIN} minutes.`);
  }
}
export async function recordFail(key: string) {
  await query(
    `INSERT INTO login_attempts (key,fails,updated_at) VALUES ($1,1,now())
     ON CONFLICT (key) DO UPDATE SET
       fails = CASE WHEN login_attempts.locked_until IS NOT NULL AND login_attempts.locked_until < now() THEN 1 ELSE login_attempts.fails + 1 END,
       locked_until = CASE WHEN login_attempts.fails + 1 >= ${MAX_FAILS} THEN now() + interval '${LOCK_MIN} minutes' ELSE NULL END,
       updated_at = now()`,
    [key]
  );
}
export async function clearFails(key: string) {
  await query('DELETE FROM login_attempts WHERE key=$1', [key]);
}
