'use client';

/**
 * Placement Q&A. Students see their own branch (CSE or Civil) automatically; staff pick a branch.
 * Students: Take a test (3 steps) · Tests from faculty · Question bank · Question papers · My results.
 * Staff: Question bank · Add questions · Question papers · Tests & results.
 * Both: Interview Q&A · Company questions · Uttarakhand jobs.
 * Parts live in ./qna/QnaParts.tsx (test runner, picker) and ./qna/QnaPanels.tsx (faculty and server panels).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download, Eye, EyeOff, Search, XCircle } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { usePlacementTracker } from '../../hooks/usePlacementTracker';
import { BRANCH_CATEGORIES, COMMON_CATEGORIES, SYLLABUS_CATEGORY, bankFor, branchOf, mcqById, subjectsOf, type Branch } from '../../lib/data/placementQnaBank';
import { COMPANY_PRACTICE } from '../../lib/data/companyPracticeData';
import { InterviewQATab } from '../placement/hub/InterviewQATab';
import { UTTARAKHAND_JOBS } from '../../lib/data/uttarakhandJobs';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import { DownloadButton } from '../ui/DownloadButton';
import { Card, ScoreBar, ScreenHeader, Stat, btnGhost, btnPrimary, fmtDate, input, scoreTone } from './TrackerUi';
import { QuestionRunner, TestPicker, Verdict, seenFrom, shuffle, useFacultyQuestions, type RunConfig } from './qna/QnaParts';
import { AddQuestionsPanel, FacultyTestsPanel, QuestionPapersPanel, StudentTestsPanel } from './qna/QnaPanels';

type View = 'test' | 'faculty' | 'bank' | 'add' | 'papers' | 'tests' | 'results' | 'interview' | 'company' | 'jobs';
const VIEWS: Array<{ id: View; label: string; who: 'student' | 'staff' | 'both' }> = [
  { id: 'test', label: 'Take a test', who: 'student' },
  { id: 'faculty', label: 'Tests from faculty', who: 'student' },
  { id: 'bank', label: 'Question bank', who: 'both' },
  { id: 'add', label: 'Add questions', who: 'staff' },
  { id: 'papers', label: 'Question papers', who: 'both' },
  { id: 'tests', label: 'Tests & results', who: 'staff' },
  { id: 'results', label: 'My results', who: 'student' },
  { id: 'interview', label: 'Interview Q&A', who: 'both' },
  { id: 'company', label: 'Company questions', who: 'both' },
  { id: 'jobs', label: 'Uttarakhand jobs', who: 'both' },
];

export const PlacementQnaPracticeScreen: React.FC<{ onOpenGovtJobs?: () => void; onOpenMockTests?: () => void }> = ({ onOpenGovtJobs, onOpenMockTests }) => {
  const { language, loggedStudent, loggedInRole, currentUser } = useCollege();
  const isStudent = loggedInRole === 'student';
  const { data, post } = usePlacementTracker(isStudent);
  const faculty = useFacultyQuestions();
  const [branch, setBranch] = useState<Branch>(branchOf(loggedStudent?.branch ?? currentUser.department));
  const [view, setView] = useState<View>(isStudent ? 'test' : 'bank');
  const [run, setRun] = useState<RunConfig | null>(null);
  const [lastPick, setLastPick] = useState<RunConfig | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const showContent = () => setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);

  // bank browser
  const [bankCat, setBankCat] = useState<string>(BRANCH_CATEGORIES[branch][1]);
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isStudent) setBranch(branchOf(loggedStudent?.branch));
  }, [isStudent, loggedStudent?.branch]);
  useEffect(() => {
    if (!([...COMMON_CATEGORIES, ...BRANCH_CATEGORIES[branch], SYLLABUS_CATEGORY] as string[]).includes(bankCat)) {
      setBankCat(BRANCH_CATEGORIES[branch][1]);
      setSubject('All');
    }
  }, [branch, bankCat]);

  // Opened from a Job House "Practise" button: show that section / subject in the bank.
  useEffect(() => {
    try {
      const want = sessionStorage.getItem('qna_open');
      if (!want) return;
      sessionStorage.removeItem('qna_open');
      const [c, sub] = JSON.parse(want) as [string, string];
      const known = (s: string) => bankFor(branch).some(q => q.category === s);
      setBankCat(known(c) ? c : c.startsWith('Civil') || c.startsWith('CSE') ? BRANCH_CATEGORIES[branch][0] : 'Aptitude');
      setSubject(sub && sub !== 'All' && bankFor(branch).some(q => q.subject === sub) ? sub : 'All');
      setView('bank');
      showContent();
    } catch {
      // nothing to open
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bank = useMemo(() => bankFor(branch), [branch]);
  const seen = useMemo(() => seenFrom(data.qna), [data.qna]);
  const totals = useMemo(() => {
    const attempted = data.qna.reduce((s, x) => s + x.attempted, 0);
    const correct = data.qna.reduce((s, x) => s + x.correct, 0);
    return { tests: data.qna.length, correct, wrong: data.qna.reduce((s, x) => s + x.wrong, 0), acc: attempted ? Math.round((correct / attempted) * 100) : 0 };
  }, [data.qna]);
  const doneInBank = useMemo(() => bank.filter(q => seen.has(q.id)).length, [bank, seen]);

  const bankSubjects = useMemo(() => subjectsOf(bankCat, bank), [bankCat, bank]);
  const bankList = useMemo(() => {
    const s = search.trim().toLowerCase();
    const list = bankCat === 'Faculty questions' ? faculty.list : bank.filter(q => q.category === bankCat && (subject === 'All' || q.subject === subject));
    return s ? list.filter(q => q.question.toLowerCase().includes(s) || q.options.some(o => o.toLowerCase().includes(s))) : list;
  }, [bank, bankCat, subject, search, faculty.list]);
  const pg = usePaged(bankList, 25);

  const startRun = (r: RunConfig) => {
    setLastPick(r);
    setRun(r);
    setView('test');
    showContent();
  };
  const again = () => {
    if (!lastPick) return setRun(null);
    const pool = lastPick.category.startsWith('Full placement paper') ? lastPick.questions : bank.filter(q => (lastPick.category.includes(': ') ? `${q.category}: ${q.subject}` : q.category) === lastPick.category);
    setRun({ ...lastPick, questions: shuffle(pool.length > lastPick.questions.length ? pool : lastPick.questions).slice(0, lastPick.questions.length) });
  };

  const pdfHref = (view: boolean) =>
    `/api/qna/pdf?category=${encodeURIComponent(bankCat === 'Faculty questions' ? 'All' : bankCat)}${subject !== 'All' ? `&subject=${encodeURIComponent(subject)}` : ''}&branch=${branch}${view ? '&view=1' : ''}`;

  return (
    <div className="space-y-5">
      <ScreenHeader
        badge={language === 'hi' ? 'ऑनलाइन प्लेसमेंट Q&A' : 'Online Placement Q&A'}
        title={`${branch} placement questions – ${bank.length.toLocaleString('en-IN')} with answers`}
        subtitle={
          isStudent
            ? `Questions for your branch (${branch}): your subjects, ${branch} technical, and aptitude, reasoning, English, HR and GK. Every test shows the correct answer for each wrong one, and your results go to your faculty.`
            : 'Choose a branch to see its questions. Add your own questions, upload question papers, and create tests for a class – every student’s result appears here.'
        }
      >
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!isStudent &&
            (['CSE', 'Civil'] as Branch[]).map(b => (
              <button key={b} onClick={() => setBranch(b)} className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer ${branch === b ? 'bg-gold-300 text-[#13294b]' : 'bg-white/10 text-white'}`}>
                {b === 'CSE' ? 'Computer Science' : 'Civil'}
              </button>
            ))}
          {onOpenMockTests && (
            <button onClick={onOpenMockTests} className="px-3 py-2 rounded-xl text-xs font-black cursor-pointer bg-gold-300 text-[#13294b]">
              Mock Test Centre →
            </button>
          )}
          {onOpenGovtJobs && (
            <button onClick={onOpenGovtJobs} className="px-3 py-2 rounded-xl text-xs font-black cursor-pointer bg-white/10 text-white">
              Job House →
            </button>
          )}
        </div>
      </ScreenHeader>

      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Questions done" value={doneInBank} />
          <Stat label="Not done yet" value={(bank.length - doneInBank).toLocaleString('en-IN')} tone="text-amber-600 dark:text-amber-400" />
          <Stat label="Tests taken" value={totals.tests} />
          <Stat label="Correct" value={totals.correct} tone="text-emerald-600 dark:text-emerald-400" />
          <Stat label="Wrong" value={totals.wrong} tone="text-rose-600 dark:text-rose-400" />
          <Stat label="Accuracy" value={`${totals.acc}%`} tone={scoreTone(totals.acc)} />
        </div>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Q&A sections">
        {VIEWS.filter(v => v.who === 'both' || (v.who === 'student') === isStudent).map(v => (
          <button
            key={v.id}
            onClick={() => {
              setView(v.id);
              if (v.id !== 'test') setRun(null);
              showContent();
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold border cursor-pointer ${view === v.id ? 'bg-[#13294b] text-white border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900'}`}
          >
            {v.label}
          </button>
        ))}
      </nav>

      <div ref={contentRef} className="scroll-mt-32" />

      {view === 'test' && isStudent &&
        (run ? (
          <QuestionRunner key={run.title + run.questions[0]?.id} run={run} post={post} onClose={() => setRun(null)} onAgain={again} />
        ) : (
          <TestPicker branch={branch} seen={seen} facultyQs={faculty.list} onStart={startRun} />
        ))}

      {view === 'faculty' && isStudent && <StudentTestsPanel post={post} facultyReady={faculty.list.length > 0} />}
      {view === 'add' && !isStudent && <AddQuestionsPanel branch={branch} facultyQs={faculty.list} reload={faculty.reload} />}
      {view === 'papers' && <QuestionPapersPanel branch={branch} staff={!isStudent} />}
      {view === 'tests' && !isStudent && <FacultyTestsPanel branch={branch} facultyQs={faculty.list} />}

      {view === 'bank' && (
        <Card className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[...COMMON_CATEGORIES, ...BRANCH_CATEGORIES[branch], SYLLABUS_CATEGORY, ...(faculty.list.length ? ['Faculty questions'] : [])].map(c => (
              <button
                key={c}
                onClick={() => {
                  setBankCat(c);
                  setSubject('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${bankCat === c ? 'bg-[#13294b] text-white border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                {`${c} (${(c === 'Faculty questions' ? faculty.list.length : bank.filter(q => q.category === c).length).toLocaleString('en-IN')})`}
              </button>
            ))}
          </div>
          {bankSubjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[{ subject: 'All', count: bankSubjects.reduce((s, x) => s + x.count, 0) }, ...bankSubjects].map(x => (
                <button
                  key={x.subject}
                  onClick={() => setSubject(x.subject)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-black cursor-pointer ${subject === x.subject ? 'bg-cyan-700 text-white border-cyan-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  {`${x.subject} (${x.count})`}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={`${input} pl-8`} placeholder="Search questions" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowAll(s => !s)} className={`${btnGhost} inline-flex items-center gap-1.5`}>
              {showAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showAll ? 'Hide answers' : 'Show all answers'}
            </button>
            {bankCat !== 'Faculty questions' && (
              <>
                <a href={pdfHref(true)} target="_blank" rel="noopener noreferrer" className={`${btnGhost} inline-flex items-center gap-1.5`}>
                  <Eye className="w-3.5 h-3.5" /> Open PDF
                </a>
                <DownloadButton href={pdfHref(false)} className={`${btnGhost} inline-flex items-center gap-1.5`}>
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </DownloadButton>
                <DownloadButton href={`/api/export/qna?format=xlsx&category=${encodeURIComponent(bankCat)}${subject !== 'All' ? `&subject=${encodeURIComponent(subject)}` : ''}`} className={`${btnGhost} inline-flex items-center gap-1.5`}>
                  <Download className="w-3.5 h-3.5" /> Excel
                </DownloadButton>
              </>
            )}
          </div>
          <ShowEntries pg={pg} label="questions" />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pg.pageItems.map((q, i) => {
              const shown = showAll || open[q.id];
              const st = seen.get(q.id);
              return (
                <div key={q.id} className="py-2.5 space-y-1">
                  <div className="flex gap-2 text-sm">
                    <span className="font-black text-slate-400 w-10 shrink-0">{pg.offset + i + 1}.</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 flex-1">{q.question}</span>
                    {st !== undefined && (st ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-500 shrink-0" />)}
                  </div>
                  <div className="pl-12 grid sm:grid-cols-2 gap-x-4 text-xs text-slate-600 dark:text-slate-300">
                    {q.options.map((o, k) => (
                      <span key={k} className={shown && k === q.correctIndex ? 'font-black text-emerald-600' : ''}>
                        ({String.fromCharCode(65 + k)}) {o}
                      </span>
                    ))}
                  </div>
                  <div className="pl-12">
                    {shown ? (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">{`Answer: (${String.fromCharCode(65 + q.correctIndex)}) ${q.options[q.correctIndex]} – ${q.explanation}`}</p>
                    ) : (
                      <button onClick={() => setOpen(o => ({ ...o, [q.id]: true }))} className="text-xs font-black text-cyan-700 cursor-pointer">
                        Show answer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <Pager pg={pg} />
          {isStudent && bankCat !== 'Faculty questions' && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const pool = bankList.length ? bankList : bank;
                  startRun({ title: `Practice test: ${subject === 'All' ? bankCat : subject}`, category: subject === 'All' ? bankCat : `${bankCat}: ${subject}`, questions: shuffle(pool).slice(0, 10), mode: 'Practice' });
                }}
                className={btnPrimary}
              >
                {`Test me on ${subject === 'All' ? bankCat : subject} (10 questions)`}
              </button>
            </div>
          )}
        </Card>
      )}

      {view === 'results' && isStudent && (
        <Card>
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white mb-3">My results</h3>
          {data.qna.length === 0 ? (
            <p className="text-sm text-slate-500">No tests yet. Start one from "Take a test".</p>
          ) : (
            <div className="space-y-3">
              {data.qna.slice(0, 30).map(a => (
                <div key={a.id} className="grid grid-cols-[1fr_auto] gap-1 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{`${a.category} · ${a.mode ?? 'Practice'} · ${fmtDate(a.createdAt)}`}</span>
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
                          if (!q) return null;
                          return (
                            <div key={x.questionId} className="space-y-1">
                              <p className="font-bold text-slate-800 dark:text-slate-100">{`Q${k + 1}. ${q.question}`}</p>
                              <Verdict q={q} selected={x.selectedIndex} />
                            </div>
                          );
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

      {view === 'interview' && <InterviewQATab />}

      {view === 'company' && (
        <Card className="space-y-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Company interview questions</h3>
            <p className="text-sm text-slate-500">For practice. Most of these companies hire after a degree, so they are not in the diploma job lists.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {COMPANY_PRACTICE.map(c => (
              <article key={c.name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">{c.name}</h4>
                <p className="text-slate-500">{c.process}</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-200">
                  {c.questions.map(q => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Card>
      )}

      {view === 'jobs' && (
        <Card className="space-y-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Uttarakhand government jobs after diploma</h3>
            <p className="text-sm text-slate-500">Posts change with each advertisement. Read the latest notification for vacancies, age and pay.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {UTTARAKHAND_JOBS.map(j => (
              <article key={j.post} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-sm">
                <h4 className="font-bold text-slate-900 dark:text-white">{j.post}</h4>
                <p className="text-slate-600 dark:text-slate-300"><b>Where:</b> {j.departments}</p>
                <p className="text-slate-600 dark:text-slate-300"><b>Who conducts:</b> {j.conductedBy}</p>
                <p className="text-slate-600 dark:text-slate-300"><b>Eligibility:</b> {j.eligibility}</p>
                <p className="text-slate-600 dark:text-slate-300"><b>Selection:</b> {j.selection}</p>
                <p className="text-slate-600 dark:text-slate-300"><b>Prepare:</b> {j.prepare}</p>
                <a href={j.link} target="_blank" rel="noopener noreferrer" className="font-bold text-cyan-700 dark:text-cyan-300">
                  Official website →
                </a>
              </article>
            ))}
          </div>
          {isStudent && (
            <button
              onClick={() => startRun({ title: 'Practice test: Uttarakhand GK', category: 'Uttarakhand GK', questions: shuffle(bank.filter(q => q.category === 'Uttarakhand GK')).slice(0, 20), mode: 'Practice' })}
              className={btnPrimary}
            >
              Start Uttarakhand GK test (20 questions)
            </button>
          )}
        </Card>
      )}
    </div>
  );
};
