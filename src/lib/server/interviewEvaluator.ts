import { INTERVIEW_TRACKS } from '@/lib/data/mockInterviewBank';
import type { InterviewAnswerResult, MockInterviewResult } from '@/lib/tracker/types';

type Scored = Pick<MockInterviewResult, 'answers' | 'overallScore' | 'technical' | 'communication' | 'confidence' | 'verdict' | 'evaluator'>;

const clamp = (n: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, Math.round(n)));
const verdictFor = (score: number): MockInterviewResult['verdict'] => (score >= 70 ? 'Ready' : score >= 45 ? 'Almost ready' : 'Needs practice');

/** Scores each answer on key points covered and length. */
function autoScore(track: string, answers: string[]): Scored {
  const qs = INTERVIEW_TRACKS[track];
  let commTotal = 0;
  const results: InterviewAnswerResult[] = qs.map((q, i) => {
    const a = (answers[i] || '').trim();
    const lower = a.toLowerCase();
    const words = a ? a.split(/\s+/).length : 0;
    const hits = q.keywords.filter(k => lower.includes(k)).length;
    const content = Math.min(6, (hits / Math.max(3, Math.ceil(q.keywords.length / 2))) * 6);
    const length = words >= 40 ? 4 : words >= 20 ? 3 : words >= 8 ? 2 : words > 0 ? 1 : 0;
    const score = clamp(content + length);
    commTotal += Math.min(10, words / 6 + (/[.!?]/.test(a) ? 2 : 0));
    const feedback = !a
      ? `Skipped. ${q.tip}`
      : score >= 8
      ? 'Strong answer – clear and covers the key points.'
      : score >= 5
      ? `Good start. Improve: ${q.tip}`
      : `Too short / missing key points. ${q.tip}`;
    return { question: q.q, answer: a, score, feedback };
  });
  const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
  const answered = results.filter(r => r.answer).length;
  const technical = clamp(avg);
  const communication = clamp(commTotal / results.length);
  const confidence = clamp((answered / results.length) * 10 * 0.6 + avg * 0.4);
  const overallScore = Math.round(((technical * 0.5 + communication * 0.3 + confidence * 0.2) / 10) * 100);
  return { answers: results, overallScore, technical, communication, confidence, verdict: verdictFor(overallScore), evaluator: 'Auto-scorer' };
}

export async function evaluateInterview(track: string, answers: string[]): Promise<Scored> {
  return autoScore(track, answers);
}
