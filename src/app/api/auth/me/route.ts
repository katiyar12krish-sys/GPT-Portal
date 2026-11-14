/**
 * GET /api/auth/me – who is logged in. Called on every page load to restore the session after a refresh.
 */
import { NextResponse } from 'next/server';
import { getUser, handle } from '@/lib/server/auth';
import { isDemoMode } from '@/lib/server/demo';

export const dynamic = 'force-dynamic';
export const GET = handle(async () => {
  const user = await getUser();
  return NextResponse.json({ success: true, user, demo: isDemoMode() });
});
