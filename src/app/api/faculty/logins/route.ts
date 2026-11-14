import { NextRequest, NextResponse } from 'next/server';
import { audit, clientIp, handle, requireUser } from '@/lib/server/auth';
import { facultyLogins } from '@/lib/server/staffLogins';

export const dynamic = 'force-dynamic';

/** Admin only: every faculty member with details, login ID and the password the admin can see. */
export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser('admin');
  const faculty = await facultyLogins();
  await audit(me, 'Viewed faculty list & logins', 'SECURITY', 'SUCCESS', '', clientIp(req));
  return NextResponse.json({ success: true, faculty });
});
