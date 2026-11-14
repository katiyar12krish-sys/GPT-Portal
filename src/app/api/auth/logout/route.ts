/**
 * POST /api/auth/logout – clears the session cookie.
 */
import { NextResponse } from 'next/server';
import { clearSession, handle } from '@/lib/server/auth';

export const POST = handle(async () => {
  const res = NextResponse.json({ success: true });
  clearSession(res);
  return res;
});
