/**
 * GET/POST /api/qtests – Q&A tests that faculty create for a branch and year ("Tests from faculty").
 * POST create (faculty/admin): picks the questions once on the server, so every student gets the same paper.
 * GET: staff get every test with each target student's result; students get the tests for their class and their own status.
 * Students submit through /api/tracker action "qna" with `testId` (scored on the server, one attempt only).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { allStudents, deleteItem, getItem, listItems, putItem } from '@/lib/server/trackerStore';
import { testIsFor } from '@/lib/server/qnaTests';
import { PLACEMENT_MCQ_BANK, type PlacementMcq } from '@/lib/data/placementQnaBank';
import type { QnaAttempt, QnaTest } from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

const Create = z.object({
  action: z.literal('create'),
  title: z.string().trim().min(3, 'Give the test a title.').max(120),
  branch: z.enum(['CSE', 'Civil', 'All']),
  year: z.enum(['All', '1st Year', '2nd Year', '3rd Year']),
  category: z.string().max(40), // a bank section, or "Faculty questions"
  subject: z.string().max(80).optional(),
  count: z.number().int().min(5).max(100),
  durationMin: z.number().int().min(5).max(180),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a last date.'),
});
const Del = z.object({ action: z.literal('delete'), id: z.string().startsWith('qt-') });

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const GET = handle(async () => {
  const me = await requireUser();
  const tests = (await listItems<QnaTest>('qtest')).filter(t => testIsFor(t, me));
  if (me.role === 'student') {
    const mine = await listItems<QnaAttempt>('qna', me.id);
    return NextResponse.json({ success: true, tests: tests.map(t => ({ ...t, myAttempt: mine.find(a => a.testId === t.id) ?? null })) });
  }
  // staff: who has and has not taken each test
  const [students, attempts] = await Promise.all([allStudents(), listItems<QnaAttempt>('qna')]);
  const withResults = tests.map(t => {
    const targets = students.filter(s => (t.branch === 'All' || (t.branch === 'Civil') === /civil/i.test(s.branch)) && (t.year === 'All' || t.year === s.year));
    const rows = targets.map(s => {
      const a = attempts.find(x => x.testId === t.id && x.studentUserId === s.studentUserId);
      return { studentUserId: s.studentUserId, studentName: s.studentName, rollNumber: s.rollNumber, branch: s.branch, year: s.year, attempt: a ?? null };
    });
    // how many students got each question right – shows which questions the class finds hard
    const perQuestion = t.questionIds.map(id => {
      const answered = rows.map(r => r.attempt?.answers.find(x => x.questionId === id)).filter(Boolean);
      return { id, answered: answered.length, correct: answered.filter(x => x!.correct).length };
    });
    return { ...t, results: rows, perQuestion };
  });
  return NextResponse.json({ success: true, tests: withResults });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser('faculty', 'admin');
  const body = await req.json();
  if (body?.action === 'delete') {
    const { id } = Del.parse(body);
    const t = await getItem<QnaTest>(id);
    if (!t) throw new HttpError(404, 'Test not found.');
    if (me.role !== 'admin' && t.createdById !== me.id) throw new HttpError(403, 'Only the teacher who made the test, or the admin, can delete it.');
    await deleteItem(id);
    return NextResponse.json({ success: true });
  }
  const b = Create.parse(body);
  let pool: PlacementMcq[];
  if (b.category === 'Faculty questions') {
    pool = (await listItems<PlacementMcq>('question')).filter(q => b.branch === 'All' || !q.branch || q.branch === b.branch);
  } else {
    pool = PLACEMENT_MCQ_BANK.filter(q => q.category === b.category && (!b.subject || q.subject === b.subject) && (b.branch === 'All' || !q.branch || q.branch === b.branch));
  }
  if (pool.length < 5) throw new HttpError(400, 'Not enough questions in this section for a test (at least 5 needed).');
  const t: QnaTest = {
    id: `qt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: b.title,
    branch: b.branch,
    year: b.year,
    source: b.subject ? `${b.category}: ${b.subject}` : b.category,
    questionIds: shuffle(pool).slice(0, b.count).map(q => q.id),
    durationMin: b.durationMin,
    dueDate: b.dueDate,
    createdById: me.id,
    createdByName: me.name,
    createdAt: new Date().toISOString(),
  };
  await putItem('qtest', t.id, null, t);
  await audit(me, `Created Q&A test: ${t.title}`, 'ACADEMIC', 'SUCCESS', `${t.questionIds.length} questions`, clientIp(req));
  return NextResponse.json({ success: true, test: t });
});
