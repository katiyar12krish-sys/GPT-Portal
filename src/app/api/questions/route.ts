/**
 * GET/POST /api/questions – questions that faculty add to the Placement Q&A bank from the portal.
 * GET: everyone (students get the common ones + their own branch). POST (faculty/admin): action add | import | delete.
 * `import` takes rows already read from a CSV file in the browser (see CSV_HELP in the Q&A screen).
 * Stored as tracker items of kind "question"; ids start with "cq-" so the scorer can find them (src/app/api/tracker/route.ts).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { deleteItem, getItem, listItems, putItem } from '@/lib/server/trackerStore';
import { branchOf, QNA_CATEGORIES, type PlacementMcq } from '@/lib/data/placementQnaBank';

export const dynamic = 'force-dynamic';

const Q = z.object({
  category: z.string().refine(c => (QNA_CATEGORIES as string[]).includes(c), 'Pick a section.'),
  subject: z.string().trim().max(80).optional(),
  question: z.string().trim().min(5, 'Write the question.').max(600),
  options: z.array(z.string().trim().min(1, 'Fill all four options.').max(200)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().max(600).default(''),
});
const Add = Q.extend({ action: z.literal('add') });
const Import = z.object({ action: z.literal('import'), rows: z.array(Q).min(1).max(500) });
const Del = z.object({ action: z.literal('delete'), id: z.string().startsWith('cq-') });

const branchFor = (category: string) => (category.startsWith('Civil') ? 'Civil' : category.startsWith('CSE') ? 'CSE' : undefined);

export const GET = handle(async () => {
  const me = await requireUser();
  const all = await listItems<PlacementMcq>('question');
  const mine = me.role === 'student' ? branchOf(me.department) : null;
  const questions = mine ? all.filter(q => !q.branch || q.branch === mine) : all;
  return NextResponse.json({ success: true, questions });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser('faculty', 'admin');
  const body = await req.json();
  const make = (b: z.infer<typeof Q>): PlacementMcq => {
    if (new Set(b.options.map(o => o.toLowerCase())).size !== 4) throw new HttpError(400, `Options must be different: "${b.question.slice(0, 60)}"`);
    return {
      id: `cq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      category: b.category as PlacementMcq['category'],
      subject: b.subject || undefined,
      branch: branchFor(b.category),
      question: b.question,
      options: b.options,
      correctIndex: b.correctIndex,
      explanation: b.explanation || `Answer: ${b.options[b.correctIndex]}`,
      addedBy: me.name,
    };
  };

  if (body?.action === 'add') {
    const q = make(Add.parse(body));
    await putItem('question', q.id, me.id, q);
    await audit(me, 'Added a Q&A question', 'ACADEMIC', 'SUCCESS', q.category, clientIp(req));
    return NextResponse.json({ success: true, question: q });
  }
  if (body?.action === 'import') {
    const { rows } = Import.parse(body);
    const list = rows.map(make);
    for (const q of list) await putItem('question', q.id, me.id, q);
    await audit(me, `Imported ${list.length} Q&A questions`, 'ACADEMIC', 'SUCCESS', '', clientIp(req));
    return NextResponse.json({ success: true, added: list.length });
  }
  if (body?.action === 'delete') {
    const { id } = Del.parse(body);
    const q = await getItem<PlacementMcq>(id);
    if (!q) throw new HttpError(404, 'Question not found.');
    if (me.role !== 'admin' && q.addedBy !== me.name) throw new HttpError(403, 'Only the teacher who added it, or the admin, can delete it.');
    await deleteItem(id);
    return NextResponse.json({ success: true });
  }
  throw new HttpError(400, 'Unknown action.');
});
