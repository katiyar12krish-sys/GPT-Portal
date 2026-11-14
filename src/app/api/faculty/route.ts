import { NextResponse } from 'next/server';
import { query } from '@/lib/server/db';
import { getUser, handle } from '@/lib/server/auth';
import { demoFaculty, isDemoMode } from '@/lib/server/demo';

export const dynamic = 'force-dynamic';

/** Public: names/departments only (needed for the faculty picker). Admin additionally gets email + mobile. */
export const GET = handle(async () => {
  const me = await getUser();
  if (isDemoMode()) return NextResponse.json({ success: true, faculty: demoFaculty(me?.role === 'admin') });
  const rows = await query("SELECT * FROM users WHERE role IN ('faculty','admin') ORDER BY role DESC, name");
  const isAdmin = me?.role === 'admin';
  return NextResponse.json({
    success: true,
    faculty: rows.map(r => ({
      facultyId: r.id,
      facultyName: r.name,
      department: r.department ?? '',
      assignedSubjects: r.assigned_subjects,
      email: isAdmin ? r.email ?? '' : '',
      mobile: isAdmin ? r.mobile ?? '' : '',
      mfaEnabled: r.mfa_enabled,
      smsAlertsActive: r.sms_alerts,
      lastUpdated: new Date(r.updated_at).toISOString().replace('T', ' ').slice(0, 16),
      passwordPlain: '', passwordEncrypted: '', passwordHash: '', // secrets never leave the server
    })),
  });
});
