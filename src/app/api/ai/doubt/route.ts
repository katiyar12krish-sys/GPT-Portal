import { NextRequest, NextResponse } from 'next/server';
import { PLACEMENT_MCQ_BANK } from '@/lib/data/placementQnaBank';

const STOP = new Set(['what', 'which', 'when', 'where', 'how', 'why', 'does', 'that', 'this', 'with', 'from', 'have', 'kya', 'hai', 'kaise', 'mein', 'the', 'and', 'for']);

/**
 * Quick doubt helper: finds the closest questions in the portal's own question bank.
 * Real doubts are answered by faculty in the Online Q&A thread.
 */
export async function POST(req: NextRequest) {
  const { question, subject } = await req.json();
  if (!question) return NextResponse.json({ success: false, error: 'Question is required.' }, { status: 400 });

  const words = String(question).toLowerCase().match(/[a-z0-9+]{3,}/g)?.filter(w => !STOP.has(w)) ?? [];
  const matches = PLACEMENT_MCQ_BANK.map(q => {
    const text = `${q.question} ${q.options[q.correctIndex]} ${q.explanation}`.toLowerCase();
    return { q, hits: words.filter(w => text.includes(w)).length };
  })
    .filter(m => m.hits >= Math.min(2, words.length) && m.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 3);

  const answer = matches.length
    ? `Related answers from the question bank:\n\n${matches
        .map((m, i) => `${i + 1}. ${m.q.question}\n   Answer: ${m.q.options[m.q.correctIndex]}\n   ${m.q.explanation}`)
        .join('\n\n')}\n\nIf this does not clear your doubt, post it here and your ${subject || 'subject'} teacher will reply.`
    : `No close match in the question bank. Post this doubt here and your ${subject || 'subject'} teacher will reply.`;

  return NextResponse.json({ success: true, answer, source: 'question-bank' });
}
