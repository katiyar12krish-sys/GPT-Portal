import { NextRequest, NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { findResource, saveResource, visibleTo } from '@/lib/server/resourceStore';
import { readFile } from '@/lib/server/trackerStore';
import { buildPdf, type PdfLine } from '@/lib/server/simplePdf';

export const dynamic = 'force-dynamic';

/** Downloads the uploaded file. Entries with no file yet give a one-page subject sheet instead. */
export const GET = handle(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const me = await requireUser();
  const { id } = await ctx.params;
  const r = await findResource(id);
  if (!visibleTo(r, me)) throw new HttpError(403, 'This resource is waiting for faculty approval.');

  await saveResource({ ...r, downloadCount: r.downloadCount + 1 });

  const stored = r.hasFile ? await readFile(id) : null;
  if (r.hasFile && !stored) throw new HttpError(404, 'File missing.');
  const data =
    stored ??
    buildPdf(
      ([
        { text: r.title, bold: true, size: 15 },
        { text: `${r.subjectCode} ${r.subjectName}`, bold: true, size: 11, gapBefore: 6 },
        { text: `${r.category} | Semester ${r.semester} | ${r.department}`, gapBefore: 4 },
        { text: `Board: ${r.board}`, gapBefore: 2 },
        { text: `Teacher: ${r.facultyName}`, gapBefore: 2 },
        { text: r.unitModule ?? '', gapBefore: 2 },
        { text: r.description, size: 10.5, gapBefore: 12 },
        { text: r.tags.length ? `Topics: ${r.tags.join(', ')}` : '', gapBefore: 8 },
        { text: 'The full document has not been uploaded yet. Please ask your subject teacher.', bold: true, gapBefore: 18, color: [0.46, 0.14, 0.22] },
      ] as PdfLine[]).filter(l => l.text),
      'UGIP Tanakpur Resource Library'
    );
  const name = stored ? r.fileName : `${r.subjectCode}_${r.category}.pdf`;
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'content-type': stored ? r.mimeType || 'application/octet-stream' : 'application/pdf',
      // ?view=1 opens the file in the browser (PDF viewer) instead of downloading it
      'content-disposition': `${req.nextUrl.searchParams.get('view') ? 'inline' : 'attachment'}; filename="${name.replace(/[^\w.\-]/g, '_')}"`,
    },
  });
});
