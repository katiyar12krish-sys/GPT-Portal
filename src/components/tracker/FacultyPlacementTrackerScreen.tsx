'use client';

/**
 * Student Placement Tracker (staff): six tabs – all students, top resumes, resumes received, Q&A, interviews, notices.
 * Filters: branch, year, search. `initialTab="resumes"` turns it into the "Student Resumes" page.
 */
import { ExportButtons } from '../ui/ExportButtons';
import React, { useMemo, useState } from 'react';
import { Users, Trophy, FileText, ListChecks, Bot, Megaphone, Download, BellRing, Unlock, Lock, CheckCircle2, Search } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { usePlacementTracker, type TrackerStudent } from '../../hooks/usePlacementTracker';
import type { FacultyNotice, MockInterviewResult, QnaAttempt, ResumeSubmission } from '../../lib/tracker/types';
import { MAX_NOTICE_REMINDERS } from '../../lib/tracker/types';
import { bankFor, branchOf, mcqById } from '../../lib/data/placementQnaBank';
import { Verdict, useFacultyQuestions } from './qna/QnaParts';

// each student practises the common sections + their own branch
const BANK_SIZE = { CSE: bankFor('CSE').length, Civil: bankFor('Civil').length };
const bankTotal = (branch: string) => BANK_SIZE[branchOf(branch)];
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import { FacultyPanelManager } from './FacultyPanelManager';
import { Card, Pill, ScoreBar, ScreenHeader, Stat, btnGhost, btnPrimary, fmtDate, input, scoreTone } from './TrackerUi';

type Tab = 'overview' | 'top' | 'resumes' | 'qna' | 'interviews' | 'notices';

const BRANCHES = ['All', 'Computer Science & Engineering', 'Civil Engineering'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year'];
const REMINDER_GAPS = [
  { v: 1, l: 'Every 1 minute (demo)' },
  { v: 60, l: 'Every hour' },
  { v: 360, l: 'Every 6 hours' },
  { v: 1440, l: 'Every day' },
];

interface Row {
  s: TrackerStudent;
  resume?: ResumeSubmission;
  resumeCount: number;
  qna: QnaAttempt[];
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  uniqueDone: number;
  interviews: MockInterviewResult[];
  bestInterview: number;
  pendingNotices: number;
  lockedNotices: number;
}

export const FacultyPlacementTrackerScreen: React.FC<{ initialTab?: Tab }> = ({ initialTab = 'overview' }) => {
  const { language } = useCollege();
  const { data, post, loading, error } = usePlacementTracker();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState('All');
  const [year, setYear] = useState('All');
  const [qnaOpen, setQnaOpen] = useState<string | null>(null);
  useFacultyQuestions(); // registers faculty-added questions so their answers can be shown

  const notices = data.notices as FacultyNotice[];
  const students = data.students ?? [];

  const rows: Row[] = useMemo(
    () =>
      students.map(s => {
        const myRes = data.resumes.filter(r => r.studentUserId === s.studentUserId);
        const myQ = data.qna.filter(a => a.studentUserId === s.studentUserId);
        const myI = data.interviews.filter(a => a.studentUserId === s.studentUserId);
        const attempted = myQ.reduce((t, a) => t + a.attempted, 0);
        const correct = myQ.reduce((t, a) => t + a.correct, 0);
        const relevant = notices.filter(
          n => (n.targetBranch === 'All' || n.targetBranch === s.branch) && (n.targetYear === 'All' || n.targetYear === s.year)
        );
        const st = relevant.map(n => n.students[s.studentUserId]);
        return {
          s,
          resume: myRes[0],
          resumeCount: myRes.length,
          qna: myQ,
          attempted,
          correct,
          wrong: myQ.reduce((t, a) => t + a.wrong, 0),
          accuracy: attempted ? Math.round((correct / attempted) * 100) : 0,
          uniqueDone: new Set(myQ.flatMap(a => a.answers.filter(x => x.selectedIndex !== null).map(x => x.questionId))).size,
          interviews: myI,
          bestInterview: myI.reduce((m, x) => Math.max(m, x.overallScore), 0),
          pendingNotices: st.filter(x => !x?.acknowledgedAt).length,
          lockedNotices: st.filter(x => x && !x.acknowledgedAt && !x.unlockedByFaculty && x.reminders.length >= MAX_NOTICE_REMINDERS).length,
        };
      }),
    [students, data, notices]
  );

  const filtered = rows.filter(
    r =>
      (branch === 'All' || r.s.branch === branch) &&
      (year === 'All' || r.s.year === year) &&
      (!q || `${r.s.studentName} ${r.s.rollNumber}`.toLowerCase().includes(q.toLowerCase()))
  );

  const studentOf = Object.fromEntries(students.map(s => [s.studentUserId, s]));
  const visibleResumes = data.resumes.filter(r => filtered.some(f => f.s.studentUserId === r.studentUserId));
  const visibleQna = data.qna.filter(a => filtered.some(f => f.s.studentUserId === a.studentUserId));
  const visibleInterviews = data.interviews.filter(a => filtered.some(f => f.s.studentUserId === a.studentUserId));
  const pgStudents = usePaged(filtered, 10);
  const pgResumes = usePaged(visibleResumes, 10);
  const pgQna = usePaged(visibleQna, 10);
  const pgInterviews = usePaged(visibleInterviews, 10);

  const tabs: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'overview', label: 'All students', icon: Users },
    { id: 'top', label: 'Top resumes', icon: Trophy },
    { id: 'resumes', label: 'Resumes received', icon: FileText, badge: data.resumes.length },
    { id: 'qna', label: 'Q&A analysis', icon: ListChecks, badge: data.qna.length },
    { id: 'interviews', label: 'Mock interviews', icon: Bot, badge: data.interviews.length + data.panels.filter(p => p.status !== 'Completed').length || undefined },
    { id: 'notices', label: 'Notices', icon: Megaphone, badge: rows.reduce((t, r) => t + r.lockedNotices, 0) || undefined },
  ];

  const submittedCount = rows.filter(r => r.resume).length;

  return (
    <div className="space-y-6">
      <ScreenHeader
        badge={initialTab === 'resumes' ? (language === 'hi' ? 'छात्रों के रिज्यूमे' : 'Student Resumes') : language === 'hi' ? 'प्लेसमेंट ट्रैकर' : 'Placement Tracker'}
        title={
          initialTab === 'resumes'
            ? language === 'hi' ? 'किस छात्र ने कौन सा रिज्यूमे भेजा – डाउनलोड और एनालिसिस' : 'Who sent which resume – download and analysis'
            : language === 'hi' ? 'हर छात्र की प्रगति – अपने आप' : "Every student's placement progress – automatically"
        }
        subtitle={
          initialTab === 'resumes'
            ? 'Every resume a student uploads arrives here with name, roll number, branch, year, score and suggestions. Click a row for the analysis, or the download button for the file. Filter by branch and year.'
            : 'Resumes, placement Q&A tests, mock interviews and notice compliance arrive here as soon as students submit. Refreshes every 20 seconds.'
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {[
            ['Resumes', `${submittedCount}/${rows.length}`],
            ['Q&A tests', data.qna.length],
            ['Interviews', data.interviews.length],
            ['Locked students', rows.filter(r => r.lockedNotices).length],
          ].map(([l, v]) => (
            <div key={String(l)} className="p-2.5 rounded-xl bg-white/10 border border-white/10">
              <div className="text-lg font-black">{v}</div>
              <div className="text-[10px] uppercase font-black tracking-wider text-slate-300">{l}</div>
            </div>
          ))}
        </div>
      </ScreenHeader>

      <div className="flex flex-wrap gap-4">
        <ExportButtons dataset="progress" label="Progress report:" />
        <ExportButtons dataset="notices" label="Notice status:" />
      </div>

      {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}

      <nav className="flex flex-wrap gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border cursor-pointer ${
                tab === t.id ? 'bg-[#13294b] text-white border-[#13294b] dark:bg-cyan-600 dark:border-cyan-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
              {t.badge ? <span className="px-1.5 rounded-full bg-cyan-500 text-white text-[10px]">{t.badge}</span> : null}
            </button>
          );
        })}
      </nav>

      {tab !== 'notices' && (
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={`${input} pl-8`} placeholder="Search name or roll number" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className={`${input} w-auto`} value={branch} onChange={e => setBranch(e.target.value)}>
            {BRANCHES.map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select className={`${input} w-auto`} value={year} onChange={e => setYear(e.target.value)} aria-label="Year">
            {YEARS.map(y => (
              <option key={y} value={y}>
                {y === 'All' ? 'All years' : y}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <p className="text-xs text-slate-500">Loading…</p>}

      {tab === 'overview' && (
        <Card className="overflow-x-auto space-y-3">
          <ShowEntries pg={pgStudents} label="students" />
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 text-left">
              <tr>
                <th className="py-2 pr-3">Student</th>
                <th className="pr-3">Resume</th>
                <th className="pr-3">Q&A attempted</th>
                <th className="pr-3">Correct / wrong</th>
                <th className="pr-3">Accuracy</th>
                <th className="pr-3">Interviews (best)</th>
                <th>Notices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pgStudents.pageItems.map(r => (
                <tr key={r.s.studentUserId} className="text-slate-700 dark:text-slate-200">
                  <td className="py-2.5 pr-3">
                    <div className="font-black">{r.s.studentName}</div>
                    <div className="text-slate-400 font-mono">
                      {r.s.rollNumber} · {r.s.branch.split(' ')[0]} {r.s.year}
                    </div>
                  </td>
                  <td className="pr-3">{r.resume ? <span className={`font-black ${scoreTone(r.resume.analysis.score)}`}>{r.resume.analysis.score}/100 (v{r.resumeCount})</span> : <Pill tone="rose">Not sent</Pill>}</td>
                  <td className="pr-3">
                    {r.attempted} <span className="text-slate-400">in {r.qna.length} tests</span>
                    <div className="text-[10px] text-slate-400">
                      Bank: {r.uniqueDone}/{bankTotal(r.s.branch)} · <span className="text-amber-600">{bankTotal(r.s.branch) - r.uniqueDone} not done</span>
                    </div>
                  </td>
                  <td className="pr-3">
                    <span className="text-emerald-600 font-black">{r.correct}</span> / <span className="text-rose-600 font-black">{r.wrong}</span>
                  </td>
                  <td className="pr-3 w-28">
                    <span className={`font-black ${scoreTone(r.accuracy)}`}>{r.accuracy}%</span>
                    <ScoreBar value={r.accuracy} />
                  </td>
                  <td className="pr-3">{r.interviews.length ? <span className={`font-black ${scoreTone(r.bestInterview)}`}>{r.interviews.length} ({r.bestInterview}%)</span> : '—'}</td>
                  <td>
                    {r.lockedNotices ? (
                      <Pill tone="rose">
                        <Lock className="w-3 h-3" /> {r.lockedNotices} locked
                      </Pill>
                    ) : r.pendingNotices ? (
                      <Pill tone="amber">{r.pendingNotices} pending</Pill>
                    ) : (
                      <Pill tone="green">OK</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager pg={pgStudents} />
        </Card>
      )}

      {tab === 'top' && (
        <div className="space-y-3">
          {filtered
            .filter(r => r.resume)
            .sort((a, b) => b.resume!.analysis.score - a.resume!.analysis.score)
            .map((r, i) => (
              <Card key={r.s.studentUserId} className="flex flex-wrap items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-700' : 'bg-cyan-700'}`}>#{i + 1}</div>
                <div className="flex-1 min-w-[180px]">
                  <div className="font-black text-sm text-slate-900 dark:text-white">{r.s.studentName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {r.s.rollNumber} · {r.s.department}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">Skills: {r.resume!.analysis.skillsFound.slice(0, 8).join(', ') || '—'}</div>
                </div>
                <div className="w-40 space-y-1">
                  <div className="flex justify-between text-[11px] font-black">
                    <span>Score</span>
                    <span className={scoreTone(r.resume!.analysis.score)}>{r.resume!.analysis.score}</span>
                  </div>
                  <ScoreBar value={r.resume!.analysis.score} />
                  <div className="flex justify-between text-[11px] font-black">
                    <span>ATS</span>
                    <span>{r.resume!.analysis.atsScore}%</span>
                  </div>
                </div>
                <a href={`/api/tracker/file/${r.resume!.id}`} className={`${btnGhost} inline-flex items-center gap-1.5`}>
                  <Download className="w-3.5 h-3.5" /> Resume
                </a>
              </Card>
            ))}
          {!filtered.some(r => r.resume) && (
            <Card>
              <p className="text-xs text-slate-500">No resumes received yet.</p>
            </Card>
          )}
        </div>
      )}

      {tab === 'resumes' && (
        <Card>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <ShowEntries pg={pgResumes} label="resumes" />
            {pgResumes.pageItems.map(r => (
                <details key={r.id} className="py-3 text-xs group">
                  <summary className="flex flex-wrap items-center gap-3 cursor-pointer list-none">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-black text-slate-800 dark:text-slate-100">{r.studentName}</span>
                    <span className="font-mono text-slate-400">{r.rollNumber}</span>
                    {studentOf[r.studentUserId] && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {`${/civil/i.test(studentOf[r.studentUserId].branch) ? 'Civil' : 'CSE'} · ${studentOf[r.studentUserId].year}`}
                      </span>
                    )}
                    <span className="text-slate-500 truncate max-w-[220px]">
                      v{r.version} · {r.fileName}
                    </span>
                    <span className="text-slate-400">{fmtDate(r.submittedAt)}</span>
                    <span className={`ml-auto font-black ${scoreTone(r.analysis.score)}`}>{r.analysis.score}/100</span>
                    <a href={`/api/tracker/file/${r.id}`} onClick={e => e.stopPropagation()} className={btnGhost}>
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </summary>
                  <div className="mt-2 pl-7 space-y-1 text-slate-600 dark:text-slate-300">
                    <div>
                      <b>Sections:</b> {r.analysis.sectionsFound.join(', ') || '—'} {r.analysis.sectionsMissing.length ? <span className="text-rose-600">· missing {r.analysis.sectionsMissing.join(', ')}</span> : null}
                    </div>
                    <div>
                      <b>Skills:</b> {r.analysis.skillsFound.join(', ') || '—'}
                    </div>
                    <div>
                      <b>Suggestions:</b> {r.analysis.suggestions.join(' ') || 'None'}
                    </div>
                  </div>
                </details>
              ))}
            {data.resumes.length === 0 && <p className="text-xs text-slate-500">No resumes received yet.</p>}
            {data.resumes.length > 0 && visibleResumes.length === 0 && <p className="text-xs text-slate-500">No resume matches this search or filter.</p>}
            <Pager pg={pgResumes} />
          </div>
        </Card>
      )}

      {tab === 'qna' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Tests taken" value={data.qna.length} />
            <Stat label="Questions attempted" value={data.qna.reduce((t, a) => t + a.attempted, 0)} />
            <Stat label="Correct" value={data.qna.reduce((t, a) => t + a.correct, 0)} tone="text-emerald-600" />
            <Stat label="Wrong" value={data.qna.reduce((t, a) => t + a.wrong, 0)} tone="text-rose-600" />
          </div>
          <Card>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <ShowEntries pg={pgQna} label="tests" />
              {pgQna.pageItems.map(a => (
                  <div key={a.id} className="py-2.5 grid grid-cols-[1fr_auto] sm:grid-cols-[200px_1fr_auto] gap-2 items-center text-xs">
                    <div>
                      <div className="font-black text-slate-800 dark:text-slate-100">{a.studentName}</div>
                      <div className="text-slate-400">
                        {a.category} · {fmtDate(a.createdAt)}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <ScoreBar value={a.scorePct} />
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Attempted {a.attempted}/{a.totalQuestions} · Correct {a.correct} · Wrong {a.wrong} · Skipped {a.skipped} · {a.durationSec}s
                      </div>
                    </div>
                    <span className={`font-black ${scoreTone(a.scorePct)}`}>{a.scorePct}%</span>
                    <div className="col-span-full">
                      <button onClick={() => setQnaOpen(o => (o === a.id ? null : a.id))} className="text-[11px] font-black text-cyan-700 cursor-pointer">
                        {qnaOpen === a.id ? 'Hide answers' : `See every answer (${a.mode ?? 'Practice'})`}
                      </button>
                      {qnaOpen === a.id && (
                        <div className="mt-2 space-y-2">
                          {a.answers.map((x, k) => {
                            const q = mcqById(x.questionId);
                            return q ? (
                              <div key={x.questionId} className="space-y-1">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{`Q${k + 1}. ${q.question}`}</p>
                                <Verdict q={q} selected={x.selectedIndex} />
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {data.qna.length === 0 && <p className="text-xs text-slate-500">No Q&A attempts yet.</p>}
              <Pager pg={pgQna} />
            </div>
          </Card>
        </div>
      )}

      {tab === 'interviews' && (
        <div className="space-y-3">
          <FacultyPanelManager panels={data.panels.filter(p => filtered.some(f => f.s.studentUserId === p.studentUserId))} post={post} />
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white pt-2">Practice interviews (voice / typed)</h3>
          <ShowEntries pg={pgInterviews} label="interviews" />
          {pgInterviews.pageItems.map(r => (
              <Card key={r.id}>
                <details>
                  <summary className="flex flex-wrap items-center gap-3 cursor-pointer list-none text-xs">
                    <Bot className="w-4 h-4 text-cyan-600" />
                    <span className="font-black text-slate-800 dark:text-slate-100">{r.studentName}</span>
                    <span className="text-slate-400">
                      {r.track} · {r.mode ?? 'Typed'} · {fmtDate(r.createdAt)}
                    </span>
                    <span className="text-slate-500">
                      Tech {r.technical}/10 · Comm {r.communication}/10 · Conf {r.confidence}/10
                    </span>
                    <Pill tone={r.verdict === 'Ready' ? 'green' : r.verdict === 'Almost ready' ? 'amber' : 'rose'}>{r.verdict}</Pill>
                    <span className={`ml-auto font-black text-sm ${scoreTone(r.overallScore)}`}>{r.overallScore}%</span>
                  </summary>
                  <div className="mt-3 space-y-2">
                    {r.answers.map((a, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px]">
                        <div className="flex justify-between font-black text-slate-700 dark:text-slate-200">
                          <span>{a.question}</span>
                          <span>{a.score}/10</span>
                        </div>
                        <p className="text-slate-500 italic">{a.answer || '(no answer)'}</p>
                        <p className="text-cyan-700 dark:text-cyan-300">{a.feedback}</p>
                      </div>
                    ))}
                  </div>
                </details>
              </Card>
            ))}
          <Pager pg={pgInterviews} />
          {data.interviews.length === 0 && (
            <Card>
              <p className="text-xs text-slate-500">No mock interviews yet.</p>
            </Card>
          )}
        </div>
      )}

      {tab === 'notices' && <NoticesPanel notices={notices} students={students} post={post} />}
    </div>
  );
};

const NoticesPanel: React.FC<{
  notices: FacultyNotice[];
  students: TrackerStudent[];
  post: (b: Record<string, unknown>) => Promise<any>;
}> = ({ notices, students, post }) => {
  const [form, setForm] = useState({ title: '', message: '', actionRequired: 'Read and acknowledge', targetBranch: 'All', targetYear: 'All', reminderEveryMin: 60 });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const r = await post({ action: 'notice_create', ...form });
    setBusy(false);
    setMsg(r.success ? 'Notice sent to students.' : r.error);
    if (r.success) setForm(f => ({ ...f, title: '', message: '' }));
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-cyan-600" /> Send a new notice
        </h3>
        <input className={input} placeholder="Title (e.g. Upload updated resume before TCS drive)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea className={input} rows={3} placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input className={input} placeholder="What must students do?" value={form.actionRequired} onChange={e => setForm({ ...form, actionRequired: e.target.value })} />
          <select className={input} value={form.targetBranch} onChange={e => setForm({ ...form, targetBranch: e.target.value })}>
            {BRANCHES.map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select className={input} value={form.targetYear} onChange={e => setForm({ ...form, targetYear: e.target.value })}>
            {YEARS.map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select className={input} value={form.reminderEveryMin} onChange={e => setForm({ ...form, reminderEveryMin: Number(e.target.value) })}>
            {REMINDER_GAPS.map(g => (
              <option key={g.v} value={g.v}>
                {g.l}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-slate-500">
          Students who don&apos;t complete it get up to {MAX_NOTICE_REMINDERS} automatic reminders; after the {MAX_NOTICE_REMINDERS}rd their portal locks until they complete it (you can unlock).
        </p>
        <div className="flex items-center gap-3">
          <button className={btnPrimary} disabled={busy} onClick={send}>
            {busy ? 'Sending…' : 'Send notice'}
          </button>
          {msg && <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{msg}</span>}
        </div>
      </Card>

      {notices.map(n => {
        const targets = students.filter(s => (n.targetBranch === 'All' || s.branch === n.targetBranch) && (n.targetYear === 'All' || s.year === n.targetYear));
        const doneCount = targets.filter(s => n.students[s.studentUserId]?.acknowledgedAt).length;
        return (
          <Card key={n.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex-1">{n.title}</h3>
              <Pill tone="cyan">
                {doneCount}/{targets.length} done
              </Pill>
              <button className={`${btnGhost} inline-flex items-center gap-1.5`} onClick={() => post({ action: 'notice_remind', noticeId: n.id })}>
                <BellRing className="w-3.5 h-3.5" /> Remind all pending now
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {n.targetBranch} · {n.targetYear} · by {n.createdByName} · {fmtDate(n.createdAt)} · auto-reminder every {n.reminderEveryMin >= 60 ? `${n.reminderEveryMin / 60} h` : `${n.reminderEveryMin} min`}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {targets.map(s => {
                    const st = n.students[s.studentUserId] ?? { reminders: [] };
                    const locked = !st.acknowledgedAt && !st.unlockedByFaculty && st.reminders.length >= MAX_NOTICE_REMINDERS;
                    return (
                      <tr key={s.studentUserId} className="text-slate-700 dark:text-slate-200">
                        <td className="py-2 pr-3 font-bold">
                          {s.studentName} <span className="font-mono text-slate-400">{s.rollNumber}</span>
                        </td>
                        <td className="pr-3">
                          {st.acknowledgedAt ? (
                            <Pill tone="green">
                              <CheckCircle2 className="w-3 h-3" /> Done {fmtDate(st.acknowledgedAt)}
                            </Pill>
                          ) : locked ? (
                            <Pill tone="rose">
                              <Lock className="w-3 h-3" /> Locked
                            </Pill>
                          ) : st.unlockedByFaculty ? (
                            <Pill tone="slate">Unlocked by faculty</Pill>
                          ) : (
                            <Pill tone="amber">
                              Reminder {st.reminders.length}/{MAX_NOTICE_REMINDERS}
                            </Pill>
                          )}
                        </td>
                        <td className="pr-3 text-slate-500 truncate max-w-[200px]">{st.response || ''}</td>
                        <td className="text-right">
                          {!st.acknowledgedAt && locked && (
                            <button className={`${btnGhost} inline-flex items-center gap-1`} onClick={() => post({ action: 'notice_unlock', noticeId: n.id, studentUserId: s.studentUserId })}>
                              <Unlock className="w-3 h-3" /> Unlock
                            </button>
                          )}
                          {!st.acknowledgedAt && !locked && !st.unlockedByFaculty && (
                            <button className={`${btnGhost} inline-flex items-center gap-1`} onClick={() => post({ action: 'notice_remind', noticeId: n.id, studentUserId: s.studentUserId })}>
                              <BellRing className="w-3 h-3" /> Remind
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
