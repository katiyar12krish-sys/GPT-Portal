import { NextRequest, NextResponse } from 'next/server';
import { handle, requireUser } from '@/lib/server/auth';
import { buildPdf, type PdfLine } from '@/lib/server/simplePdf';
import { PLACEMENT_MCQ_BANK, QNA_CATEGORIES, type PlacementMcq } from '@/lib/data/placementQnaBank';

export const dynamic = 'force-dynamic';

const cache = new Map<string, Buffer>();

/**
 * GET /api/qna/pdf?category=All|Aptitude|…&subject=…&branch=CSE|Civil&view=1 → placement question bank with answers as a PDF.
 * branch keeps the common sections + that branch only; view=1 opens it in the browser instead of downloading.
 */
export const GET = handle(async (req: NextRequest) => {
  await requireUser();
  const want = req.nextUrl.searchParams.get('category') || 'All';
  const cats = want === 'All' ? QNA_CATEGORIES : QNA_CATEGORIES.filter(c => c === want);
  const subject = req.nextUrl.searchParams.get('subject') || '';
  const branch = req.nextUrl.searchParams.get('branch') || '';
  const inScope = (q: PlacementMcq) => (!subject || q.subject === subject) && (!branch || !q.branch || q.branch === branch);
  const key = `${cats.join('|')}#${subject}#${branch}`;

  let pdf = cache.get(key);
  if (!pdf) {
    const total = PLACEMENT_MCQ_BANK.filter(q => cats.includes(q.category) && inScope(q)).length;
    const lines: PdfLine[] = [
      { text: 'Uttarakhand Government Institute of Polytechnic, Tanakpur (Institute Code 090) - Training & Placement Cell', bold: true, size: 13 },
      { text: `Placement Question Bank with Answers - ${subject || (want === 'All' ? 'All sections' : want)} (${total} questions)`, bold: true, size: 11, gapBefore: 4 },
      { text: 'Each question shows four options, the correct answer and a short explanation. Practise online in the portal: Placement Tracker > Placement Q&A.', size: 8.5, gapBefore: 4, color: [0.35, 0.35, 0.35] },
    ];
    for (const c of cats) {
      const qs = PLACEMENT_MCQ_BANK.filter(q => q.category === c && inScope(q));
      if (!qs.length) continue;
      lines.push({ text: `${subject || c} (${qs.length} questions)`, bold: true, size: 12, gapBefore: 14, color: [0.55, 0.42, 0.25] });
      qs.forEach((q, i) => {
        lines.push({ text: `Q${i + 1}. ${q.question}`, bold: true, gapBefore: 6 });
        lines.push({ text: q.options.map((o, k) => `(${String.fromCharCode(65 + k)}) ${o}`).join('    '), indent: 14 });
        lines.push({ text: `Answer: (${String.fromCharCode(65 + q.correctIndex)}) ${q.options[q.correctIndex]}  -  ${q.explanation}`, indent: 14, color: [0.05, 0.45, 0.2] });
      });
    }
    pdf = buildPdf(lines, 'UGIP Tanakpur Placement Q&A Bank');
    cache.set(key, pdf);
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `${req.nextUrl.searchParams.get('view') ? 'inline' : 'attachment'}; filename="UGIP_Placement_QnA_${(subject || want).replace(/[^\w]+/g, '_')}.pdf"`,
    },
  });
});
