import { NextRequest, NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { getItem, readFile } from '@/lib/server/trackerStore';
import type { ResumeSubmission } from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

/** Download a submitted resume: the student who sent it, or any faculty / admin. */
export const GET = handle(async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const me = await requireUser();
  const { id } = await ctx.params;
  const r = await getItem<ResumeSubmission>(id);
  if (!r) throw new HttpError(404, 'Resume not found.');
  if (me.role === 'student' && r.studentUserId !== me.id) throw new HttpError(403, 'Not your resume.');
  const buf = await readFile(id);
  if (!buf) throw new HttpError(404, 'File missing.');
  const safeName = `${r.rollNumber}_${r.fileName}`.replace(/[^\w.\-]/g, '_');
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'content-type': r.fileType || 'application/octet-stream',
      'content-disposition': `attachment; filename="${safeName}"`,
    },
  });
});
