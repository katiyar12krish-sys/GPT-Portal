'use client';

/**
 * Shared parts of Placement Q&A and the Mock Test Centre:
 * - Verdict: after a test, says Correct / Wrong / Skipped and shows the correct answer for every wrong one.
 * - QuestionRunner: one question at a time, number palette, optional timer, submit, then a full review.
 * - TestPicker: three clear steps – 1 choose a group, 2 choose a section or subject, 3 choose size and timer.
 * - useFacultyQuestions(): loads questions added by faculty (/api/questions) and registers them for scoring/history.
 * Attempts are saved through /api/tracker (action "qna"), so faculty see every result.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Play, Send, XCircle } from 'lucide-react';
import { api } from '../../../lib/client/api';
import {
  BRANCH_CATEGORIES,
  COMMON_CATEGORIES,
  SYLLABUS_CATEGORY,
  bankFor,
  registerQuestions,
  subjectsOf,
  type Branch,
  type PlacementMcq,
} from '../../../lib/data/placementQnaBank';
import type { QnaAttempt } from '../../../lib/tracker/types';
import { SYLLABUS_GUIDE } from '../../../lib/data/qna/semesterSyllabus';
import { Card, ScoreBar, btnGhost, btnPrimary, scoreTone } from '../TrackerUi';

export const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const optionText = (q: PlacementMcq, i: number) => `(${String.fromCharCode(65 + i)}) ${q.options[i]}`;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;

/** Every question a student has answered, with whether the latest answer was right. */
export const seenFrom = (attempts: QnaAttempt[]) => {
  const m = new Map<string, boolean>();
  [...attempts].reverse().forEach(a => a.answers.forEach(x => x.selectedIndex !== null && m.set(x.questionId, x.correct)));
  return m;
};

export const Verdict: React.FC<{ q: PlacementMcq; selected: number | null | undefined }> = ({ q, selected }) => {
  const right = selected === q.correctIndex;
  const skipped = selected === null || selected === undefined;
  return (
    <div className={`text-xs rounded-xl px-3 py-2 space-y-1 border ${right ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'}`}>
      <p className="flex flex-wrap items-center gap-1.5 font-bold">
        {right ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
        <span className={right ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{right ? 'Correct' : skipped ? 'Skipped' : 'Wrong'}</span>
      </p>
      {!right && !skipped && (
        <p className="text-slate-700 dark:text-slate-200">
          <span>Your answer:</span> <span className="line-through">{optionText(q, selected as number)}</span>
        </p>
      )}
      {!right && (
        <p className="text-emerald-700 dark:text-emerald-300 font-bold">
          <span>Correct answer:</span> <span>{optionText(q, q.correctIndex)}</span>
        </p>
      )}
      <p className="text-slate-500">{q.explanation}</p>
    </div>
  );
};

/** Questions added by faculty, loaded once and registered so tests and history can find them. */
export function useFacultyQuestions() {
  const [list, setList] = useState<PlacementMcq[]>([]);
  const reload = useCallback(async () => {
    const r = await api('/api/questions');
    if (r.success) {
      registerQuestions(r.questions);
      setList(r.questions);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { list, reload };
}

export interface RunConfig {
  title: string;
  category: string; // saved with the attempt, e.g. "CSE Subjects: DBMS & SQL"
  questions: PlacementMcq[];
  mode: 'Practice' | 'Mock test' | 'Faculty test';
  timeLimitSec?: number;
  testId?: string;
}

/** Runs one test: one question per screen, palette, timer; after submit a full review with correct answers. */
export const QuestionRunner: React.FC<{
  run: RunConfig;
  post: (b: Record<string, unknown>) => Promise<any>;
  onClose: () => void;
  onAgain?: () => void;
}> = ({ run, post, onClose, onAgain }) => {
  const { questions } = run;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QnaAttempt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyWrong, setOnlyWrong] = useState(false);
  const [left, setLeft] = useState(run.timeLimitSec ?? 0);
  const startedAt = useRef(Date.now());
  const topRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(async () => {
    if (busy || result) return;
    setBusy(true);
    setError(null);
    const r = await post({
      action: 'qna',
      category: run.category,
      mode: run.mode,
      testId: run.testId,
      durationSec: Math.round((Date.now() - startedAt.current) / 1000),
      answers: questions.map(q => ({ questionId: q.id, selectedIndex: picked[q.id] ?? null })),
    });
    setBusy(false);
    if (r.success) {
      setResult(r.attempt);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } else setError(r.error || 'Could not submit. Please try again.');
  }, [busy, result, post, run, questions, picked]);

  // timer: counts down and submits by itself at 0
  useEffect(() => {
    if (!run.timeLimitSec || result) return;
    const t = setInterval(() => setLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [run.timeLimitSec, result]);
  useEffect(() => {
    if (run.timeLimitSec && left <= 0 && !result) submit();
  }, [left, run.timeLimitSec, result, submit]);

  const answered = Object.keys(picked).length;

  if (result) {
    const shown = questions.filter(q => !onlyWrong || picked[q.id] !== q.correctIndex);
    return (
      <div ref={topRef} className="space-y-3 scroll-mt-32">
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{run.title}</h3>
            <span className={`text-2xl font-black ${scoreTone(result.scorePct)}`}>{`${result.correct}/${result.totalQuestions} (${result.scorePct}%)`}</span>
          </div>
          <ScoreBar value={result.scorePct} />
          <div className="flex flex-wrap gap-4 text-sm font-bold">
            <span className="text-emerald-600">{`Correct: ${result.correct}`}</span>
            <span className="text-rose-600">{`Wrong: ${result.wrong}`}</span>
            <span className="text-amber-600">{`Skipped: ${result.skipped}`}</span>
            <span className="text-slate-500">{`Time: ${mmss(result.durationSec)}`}</span>
          </div>
          <p className="text-xs text-slate-500">Your result is saved and your faculty can see it. Read the correct answer under every wrong question below.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setOnlyWrong(v => !v)} className={btnGhost}>
              {onlyWrong ? 'Show all questions' : 'Show only wrong and skipped'}
            </button>
            {onAgain && (
              <button onClick={onAgain} className={btnPrimary}>
                New test
              </button>
            )}
            <button onClick={onClose} className={btnGhost}>
              Close
            </button>
          </div>
        </Card>
        {shown.map(q => {
          const i = questions.indexOf(q);
          return (
            <Card key={q.id} className="space-y-2">
              <p className="text-[11px] font-black text-cyan-700 uppercase">{`Q${i + 1} · ${q.subject ?? q.category}`}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{q.question}</p>
              <Verdict q={q} selected={picked[q.id] ?? null} />
            </Card>
          );
        })}
        {shown.length === 0 && (
          <Card>
            <p className="text-sm text-emerald-700 font-bold">No wrong or skipped questions – well done!</p>
          </Card>
        )}
      </div>
    );
  }

  const q = questions[idx];
  return (
    <div ref={topRef} className="space-y-3 scroll-mt-32">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{run.title}</h3>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="text-slate-500">{`Answered ${answered}/${questions.length}`}</span>
            {run.timeLimitSec ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${left < 60 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                <Clock className="w-4 h-4" /> {mmss(left)}
              </span>
            ) : null}
          </div>
        </div>
        <ScoreBar value={idx + 1} max={questions.length} />
        <p className="text-[11px] font-black text-cyan-700 uppercase">{`Question ${idx + 1} of ${questions.length} · ${q.subject ?? q.category}`}</p>
        <p className="text-base font-bold text-slate-900 dark:text-white">{q.question}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {q.options.map((o, oi) => (
            <button
              key={oi}
              onClick={() => setPicked(p => ({ ...p, [q.id]: oi }))}
              className={`text-left px-3 py-3 rounded-xl border text-sm font-semibold cursor-pointer ${
                picked[q.id] === oi ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-900 dark:text-cyan-100 ring-2 ring-cyan-600/30' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-400'
              }`}
            >
              {String.fromCharCode(65 + oi)}. {o}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className={`${btnGhost} inline-flex items-center gap-1`}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          {picked[q.id] !== undefined && (
            <button onClick={() => setPicked(p => { const n = { ...p }; delete n[q.id]; return n; })} className={btnGhost}>
              Clear answer
            </button>
          )}
          {idx < questions.length - 1 ? (
            <button onClick={() => setIdx(i => i + 1)} className={`${btnPrimary} inline-flex items-center gap-1 ml-auto`}>
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={busy} className={`${btnPrimary} inline-flex items-center gap-1 ml-auto`}>
              <Send className="w-4 h-4" /> {busy ? 'Submitting…' : 'Submit test'}
            </button>
          )}
        </div>
      </Card>
      <Card className="space-y-3">
        <p className="text-xs font-bold text-slate-500">Jump to a question (dark = answered):</p>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setIdx(i)}
              className={`w-9 h-9 rounded-lg text-xs font-black cursor-pointer border ${
                i === idx ? 'ring-2 ring-gold-500 ' : ''
              }${picked[x.id] !== undefined ? 'bg-[#13294b] text-white border-[#13294b]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
              aria-label={`Question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={submit} disabled={busy} className={`${btnPrimary} inline-flex items-center gap-1`}>
            <Send className="w-4 h-4" /> {busy ? 'Submitting…' : `Submit test (${answered}/${questions.length} answered)`}
          </button>
          <button onClick={() => window.confirm('Leave this test? Your answers will not be saved.') && onClose()} className={btnGhost}>
            Cancel
          </button>
        </div>
        {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}
      </Card>
    </div>
  );
};

type Group = 'common' | 'technical' | 'subjects' | 'syllabus' | 'faculty'; // syllabus = semester-wise UBTER subjects (v4.23)

/** Step-by-step test chooser for one branch. */
export const TestPicker: React.FC<{
  branch: Branch;
  seen: Map<string, boolean>;
  facultyQs: PlacementMcq[];
  mock?: boolean;
  onStart: (run: RunConfig) => void;
}> = ({ branch, seen, facultyQs, mock, onStart }) => {
  const bank = useMemo(() => bankFor(branch), [branch]);
  const [group, setGroup] = useState<Group>('subjects');
  const [pick, setPick] = useState<{ category: string; subject?: string } | null>(null);
  const [count, setCount] = useState(mock ? 25 : 10);
  const [timed, setTimed] = useState(!!mock);
  const [onlyNew, setOnlyNew] = useState(!mock);
  const [tech, subj] = BRANCH_CATEGORIES[branch];

  const groups: Array<{ id: Group; title: string; text: string; total: number }> = [
    { id: 'subjects', title: `${branch} subjects`, text: 'Subject-wise questions of your branch (500+ each)', total: bank.filter(q => q.category === subj).length },
    { id: 'technical', title: `${branch} technical`, text: 'Mixed technical questions asked in placement tests', total: bank.filter(q => q.category === tech).length },
    { id: 'syllabus', title: 'Syllabus (semester-wise)', text: branch === 'CSE' ? 'UBTER subjects of Sem I, II and III, unit by unit' : 'UBTER first-year subjects (Sem I and II), unit by unit', total: bank.filter(q => q.category === SYLLABUS_CATEGORY).length },
    { id: 'common', title: 'Placement (all branches)', text: 'Aptitude, reasoning, English, HR and GK', total: bank.filter(q => (COMMON_CATEGORIES as string[]).includes(q.category)).length },
    ...(facultyQs.length ? [{ id: 'faculty' as Group, title: 'Added by faculty', text: 'Questions your teachers added', total: facultyQs.length }] : []),
  ];

  const options = useMemo(() => {
    const card = (category: string, subject: string | undefined, list: PlacementMcq[]) => ({
      category,
      subject,
      total: list.length,
      done: list.filter(q => seen.has(q.id)).length,
      right: list.filter(q => seen.get(q.id)).length,
    });
    if (group === 'subjects') return subjectsOf(subj, bank).map(s => card(subj, s.subject, bank.filter(q => q.subject === s.subject && q.category === subj)));
    if (group === 'syllabus') return subjectsOf(SYLLABUS_CATEGORY, bank).map(s => card(SYLLABUS_CATEGORY, s.subject, bank.filter(q => q.subject === s.subject && q.category === SYLLABUS_CATEGORY)));
    if (group === 'technical') return [card(tech, undefined, bank.filter(q => q.category === tech))];
    if (group === 'faculty') return [card('Faculty questions', undefined, facultyQs)];
    return COMMON_CATEGORIES.map(c => card(c, undefined, bank.filter(q => q.category === c)));
  }, [group, bank, seen, facultyQs, subj, tech]);

  const poolOf = (p: { category: string; subject?: string }) =>
    p.category === 'Faculty questions' ? facultyQs : bank.filter(q => q.category === p.category && (!p.subject || q.subject === p.subject));

  const start = (p = pick) => {
    if (!p) return;
    let pool = poolOf(p);
    if (onlyNew) {
      const fresh = pool.filter(q => !seen.has(q.id));
      if (fresh.length >= Math.min(count, pool.length)) pool = fresh;
    }
    const questions = shuffle(pool).slice(0, count);
    const name = p.subject ?? p.category;
    onStart({
      title: `${mock ? 'Mock test' : 'Practice test'}: ${name}`,
      category: p.subject ? `${p.category}: ${p.subject}` : p.category,
      questions,
      mode: mock ? 'Mock test' : 'Practice',
      timeLimitSec: timed ? questions.length * 60 : undefined,
    });
  };

  // Full placement paper – the usual pattern of a campus written test
  const fullPaper = () => {
    const take = (cat: string, n: number) => shuffle(bank.filter(q => q.category === cat)).slice(0, n);
    const questions = [...take('Aptitude', 20), ...take('Reasoning', 15), ...take('English', 10), ...take(tech, 10), ...shuffle(bank.filter(q => q.category === subj)).slice(0, 5)];
    onStart({ title: `Full placement paper (${branch})`, category: `Full placement paper (${branch})`, questions, mode: 'Mock test', timeLimitSec: 60 * 60 });
  };

  return (
    <div className="space-y-4">
      {mock && (
        <Card className="flex flex-wrap items-center gap-4 border-l-4 border-l-gold-500">
          <div className="flex-1 min-w-[240px]">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Full placement paper – ${branch}`}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">60 questions in 60 minutes, like a campus written test: 20 aptitude, 15 reasoning, 10 English, 15 technical.</p>
          </div>
          <button onClick={fullPaper} className={`${btnPrimary} inline-flex items-center gap-2 !text-sm`}>
            <Play className="w-4 h-4" /> Start full paper
          </button>
        </Card>
      )}

      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">1. What do you want to practise?</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => { setGroup(g.id); setPick(null); }}
              className={`text-left p-3 rounded-xl border cursor-pointer ${group === g.id ? 'border-[#13294b] bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-[#13294b]/20' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <span className="block font-black text-sm text-slate-900 dark:text-white">{g.title}</span>
              <span className="block text-xs text-slate-500">{g.text}</span>
              <span className="block text-xs font-bold text-cyan-700 mt-1">{`${g.total.toLocaleString('en-IN')} questions`}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">2. Choose the section or subject</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {options.map(o => {
            const on = pick?.category === o.category && pick?.subject === o.subject;
            return (
              <button
                key={`${o.category}|${o.subject ?? ''}`}
                onClick={() => setPick({ category: o.category, subject: o.subject })}
                className={`text-left p-3 rounded-xl border cursor-pointer space-y-1.5 ${on ? 'border-[#13294b] bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-[#13294b]/20' : 'border-slate-200 dark:border-slate-700'}`}
              >
                <span className="flex justify-between gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span>{o.subject ?? o.category}</span>
                  <span className="text-slate-400 font-bold">{`${o.done}/${o.total}`}</span>
                </span>
                <ScoreBar value={o.done} max={Math.max(1, o.total)} />
                <span className="block text-[11px] text-slate-500">{`Not done ${o.total - o.done} · Right ${o.right} · Wrong ${o.done - o.right}`}</span>
                {o.category === SYLLABUS_CATEGORY && (
                  <span className="block text-[11px] text-slate-400 leading-snug">{SYLLABUS_GUIDE.find(g => g.subject === o.subject)?.units}</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">3. Number of questions and timer</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
          {(mock ? [25, 50, 100] : [10, 25, 50]).map(n => (
            <button key={n} onClick={() => setCount(n)} className={`px-4 py-2 rounded-lg border cursor-pointer ${count === n ? 'bg-[#13294b] text-white border-transparent' : 'border-slate-200 dark:border-slate-700'}`}>
              {`${n} questions`}
            </button>
          ))}
          <label className="inline-flex items-center gap-1.5 cursor-pointer ml-2">
            <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} /> Timer (1 minute per question)
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} /> Only questions I have not done
          </label>
        </div>
        <button onClick={() => start()} disabled={!pick} className={`${btnPrimary} inline-flex items-center gap-2 !text-sm`}>
          <Play className="w-4 h-4" /> {pick ? `Start: ${pick.subject ?? pick.category}` : 'Choose a section or subject above'}
        </button>
      </Card>
    </div>
  );
};
