import { NextRequest, NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { buildPdf, type PdfLine } from '@/lib/server/simplePdf';
import { SAMPLE_RESUMES } from '@/lib/data/sampleResumes';

export const dynamic = 'force-dynamic';

/** GET /api/resume/sample/<id> → that sample resume as a one-page PDF. */
export const GET = handle(async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  await requireUser();
  const { id } = await ctx.params;
  const r = SAMPLE_RESUMES.find(x => x.id === id);
  if (!r) throw new HttpError(404, 'Sample not found.');
  const lines: PdfLine[] = [
    { text: r.name, bold: true, size: 16 },
    { text: r.contact, size: 9, gapBefore: 2, color: [0.35, 0.35, 0.35] },
  ];
  for (const [heading, rows] of r.sections) {
    lines.push({ text: heading.toUpperCase(), bold: true, size: 10, gapBefore: 10, color: [0.75, 0.33, 0.04] });
    rows.forEach(t => lines.push({ text: t, size: 9.5, gapBefore: 2, indent: t.startsWith('•') ? 10 : 0 }));
  }
  const pdf = buildPdf(lines, `Sample resume – ${r.title} (replace every detail with your own)`);
  return new NextResponse(new Uint8Array(pdf), {
    headers: { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="Sample_Resume_${r.id}.pdf"` },
  });
});
