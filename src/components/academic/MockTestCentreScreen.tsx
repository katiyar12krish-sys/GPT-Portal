'use client';

/**
 * Mock Test Centre: timed tests for the student's own branch (CSE or Civil).
 * - Full placement paper: 60 questions in 60 minutes (aptitude, reasoning, English, technical).
 * - Mock test of any subject or section: 25 / 50 / 100 questions with a timer.
 * After submitting, every wrong answer shows the correct one. Results are saved (mode "Mock test") and faculty see them.
 * Uses the same parts as Placement Q&A (src/components/tracker/qna/QnaParts.tsx). Staff can preview either branch.
 */
import React, { useMemo, useRef, useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { usePlacementTracker } from '../../hooks/usePlacementTracker';
import { bankFor, branchOf, mcqById, type Branch } from '../../lib/data/placementQnaBank';
import { Card, ScoreBar, ScreenHeader, Stat, fmtDate, scoreTone } from '../tracker/TrackerUi';
import { QuestionRunner, TestPicker, Verdict, seenFrom, useFacultyQuestions, type RunConfig } from '../tracker/qna/QnaParts';

export const MockTestCentreScreen: React.FC<{ onOpenQna?: () => void }> = ({ onOpenQna }) => {
  const { language, loggedStudent, loggedInRole, currentUser } = useCollege();
  const isStudent = loggedInRole === 'student';
  const { data, post } = usePlacementTracker(isStudent);
  const faculty = useFacultyQuestions();
  const [branch, setBranch] = useState<Branch>(branchOf(loggedStudent?.branch ?? currentUser.department));
  const [run, setRun] = useState<RunConfig | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const seen = useMemo(() => seenFrom(data.qna), [data.qna]);
  const mocks = data.qna.filter(a => a.mode === 'Mock test');
  const best = mocks.reduce((m, a) => Math.max(m, a.scorePct), 0);
  const avg = mocks.length ? Math.round(mocks.reduce((s, a) => s + a.scorePct, 0) / mocks.length) : 0;
  const hi = language === 'hi';

  const start = (r: RunConfig) => {
    if (!isStudent) return window.alert('Mock tests are taken by students. Staff can see results in the Student Placement Tracker.');
    setRun(r);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  return (
    <div className="space-y-5">
      <ScreenHeader
        badge={hi ? 'मॉक टेस्ट सेंटर' : 'Mock Test Centre'}
        title={`${branch} mock tests – ${bankFor(branch).length.toLocaleString('en-IN')} questions`}
        subtitle="Timed tests like the real written round. Take a full placement paper, or a mock test of any subject. After you submit, every wrong answer shows the correct one, and your faculty see your score."
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {!isStudent &&
            (['CSE', 'Civil'] as Branch[]).map(b => (
              <button key={b} onClick={() => setBranch(b)} className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer ${branch === b ? 'bg-gold-300 text-[#13294b]' : 'bg-white/10 text-white'}`}>
                {b === 'CSE' ? 'Computer Science' : 'Civil'}
              </button>
            ))}
          {onOpenQna && (
            <button onClick={onOpenQna} className="px-3 py-2 rounded-xl text-xs font-black cursor-pointer bg-white/10 text-white">
              Placement Q&A (practice, question bank) →
            </button>
          )}
        </div>
      </ScreenHeader>

      {isStudent && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Mock tests taken" value={mocks.length} />
          <Stat label="Best score" value={`${best}%`} tone={scoreTone(best)} />
          <Stat label="Average score" value={`${avg}%`} tone={scoreTone(avg)} />
          <Stat label="Last test" value={mocks[0] ? `${mocks[0].scorePct}%` : '—'} />
        </div>
      )}

      <div ref={topRef} className="scroll-mt-32" />
      {run ? (
        <QuestionRunner key={run.title + run.questions[0]?.id} run={run} post={post} onClose={() => setRun(null)} />
      ) : (
        <TestPicker branch={branch} seen={seen} facultyQs={faculty.list} mock onStart={start} />
      )}

      {isStudent && !run && (
        <Card>
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-3">My mock test results</h3>
          {mocks.length === 0 ? (
            <p className="text-sm text-slate-500">No mock tests yet.</p>
          ) : (
            <div className="space-y-3">
              {mocks.slice(0, 20).map(a => (
                <div key={a.id} className="grid grid-cols-[1fr_auto] gap-1 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{`${a.category} · ${fmtDate(a.createdAt)} · ${Math.round(a.durationSec / 60)} min`}</span>
                  <span className={`font-black ${scoreTone(a.scorePct)}`}>{`${a.correct}/${a.totalQuestions} (${a.scorePct}%)`}</span>
                  <div className="col-span-2">
                    <ScoreBar value={a.scorePct} />
                  </div>
                  <div className="col-span-2">
                    <button onClick={() => setReview(r => (r === a.id ? null : a.id))} className="text-xs font-black text-cyan-700 cursor-pointer">
                      {review === a.id ? 'Hide answers' : 'See right and wrong answers'}
                    </button>
                    {review === a.id && (
                      <div className="mt-2 space-y-2">
                        {a.answers.map((x, k) => {
                          const q = mcqById(x.questionId);
                          return q ? (
                            <div key={x.questionId} className="space-y-1">
                              <p className="font-bold">{`Q${k + 1}. ${q.question}`}</p>
                              <Verdict q={q} selected={x.selectedIndex} />
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
