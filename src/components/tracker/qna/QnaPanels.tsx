'use client';

/**
 * Panels of the Placement Q&A screen that talk to the server:
 * - AddQuestionsPanel (faculty/admin): write one question, or import many from a CSV file; list and delete own questions.
 * - QuestionPapersPanel (everyone): question papers / PDFs uploaded by faculty – open in the browser or download; faculty upload.
 * - FacultyTestsPanel (faculty/admin): create a test for a branch + year and see every student's result and the hard questions.
 * - StudentTestsPanel (students): tests from faculty for their class – take once, then see the result.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, FileUp, Play, Plus, Trash2, Upload } from 'lucide-react';
import { api } from '../../../lib/client/api';
import { BRANCH_CATEGORIES, COMMON_CATEGORIES, SYLLABUS_CATEGORY, PLACEMENT_MCQ_BANK, mcqById, subjectsOf, type Branch, type PlacementMcq } from '../../../lib/data/placementQnaBank';
import type { QnaAttempt, QnaTest } from '../../../lib/tracker/types';
import { Card, Pill, btnGhost, btnPrimary, fmtDate, input, scoreTone } from '../TrackerUi';
import { QuestionRunner, Verdict, type RunConfig } from './QnaParts';

const sectionsFor = (branch: Branch) => [...COMMON_CATEGORIES, ...BRANCH_CATEGORIES[branch], SYLLABUS_CATEGORY]; // v4.23: syllabus too

// ---------------- add questions ----------------
export const CSV_HELP = 'question,option A,option B,option C,option D,answer (A/B/C/D),explanation,section,subject';

/** Small CSV reader: commas, quotes ("a, b") and doubled quotes inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(x => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some(x => x.trim())) rows.push(row);
  return rows;
}

export const AddQuestionsPanel: React.FC<{ branch: Branch; facultyQs: PlacementMcq[]; reload: () => void }> = ({ branch, facultyQs, reload }) => {
  const blank = { category: BRANCH_CATEGORIES[branch][1] as string, subject: '', question: '', a: '', b: '', c: '', d: '', correct: 0, explanation: '' };
  const [f, setF] = useState(blank);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const subjects = subjectsOf(f.category);

  useEffect(() => setF(x => ({ ...x, category: BRANCH_CATEGORIES[branch][1], subject: '' })), [branch]);

  const add = async () => {
    setBusy(true);
    const r = await api('/api/questions', {
      body: { action: 'add', category: f.category, subject: f.subject || undefined, question: f.question, options: [f.a, f.b, f.c, f.d], correctIndex: f.correct, explanation: f.explanation },
    });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Question not added.' });
    setMsg({ ok: true, text: 'Question added. Students can practise it now.' });
    setF({ ...blank, category: f.category, subject: f.subject });
    reload();
  };

  const importFile = async (file: File) => {
    setMsg(null);
    const rows = parseCsv(await file.text());
    if (rows.length && /question/i.test(rows[0][0])) rows.shift(); // header row
    const bad: number[] = [];
    const list = rows.map((r, i) => {
      const ans = 'ABCD'.indexOf((r[5] ?? '').trim().toUpperCase());
      const category = (r[7] ?? '').trim() || f.category;
      if (r.length < 6 || ans < 0 || !(sectionsFor('CSE').includes(category as never) || sectionsFor('Civil').includes(category as never))) bad.push(i + 2);
      return { category, subject: (r[8] ?? '').trim() || undefined, question: (r[0] ?? '').trim(), options: [1, 2, 3, 4].map(k => (r[k] ?? '').trim()), correctIndex: Math.max(0, ans), explanation: (r[6] ?? '').trim() };
    });
    if (!list.length) return setMsg({ ok: false, text: 'The file has no question rows.' });
    if (bad.length) return setMsg({ ok: false, text: `Fix these lines first (missing columns, answer not A–D, or unknown section): ${bad.slice(0, 15).join(', ')}` });
    setBusy(true);
    const r = await api('/api/questions', { body: { action: 'import', rows: list } });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Import failed.' });
    setMsg({ ok: true, text: `${r.added} questions imported.` });
    reload();
  };

  const del = async (id: string) => {
    if (!window.confirm('Delete this question?')) return;
    const r = await api('/api/questions', { body: { action: 'delete', id } });
    if (!r.success) setMsg({ ok: false, text: r.error || 'Not deleted.' });
    reload();
  };

  const sample = `${CSV_HELP}\n"Unit of plastering work?",m²,m³,kg,running metre,A,"Plaster is measured by area.",Civil Subjects,Estimating & Costing\n`;

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Write a new question</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          <select className={input} value={f.category} onChange={e => setF({ ...f, category: e.target.value, subject: '' })} aria-label="Section">
            {sectionsFor(branch).map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {subjects.length > 0 ? (
            <select className={input} value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} aria-label="Subject">
              <option value="">Choose subject</option>
              {subjects.map(s => (
                <option key={s.subject}>{s.subject}</option>
              ))}
            </select>
          ) : (
            <input className={input} placeholder="Topic (optional)" value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} />
          )}
          <textarea className={`${input} sm:col-span-2`} rows={2} placeholder="Question" value={f.question} onChange={e => setF({ ...f, question: e.target.value })} />
          {(['a', 'b', 'c', 'd'] as const).map((k, i) => (
            <label key={k} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={f.correct === i} onChange={() => setF({ ...f, correct: i })} aria-label={`Option ${k.toUpperCase()} is correct`} />
              <input className={input} placeholder={`Option ${k.toUpperCase()}`} value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />
            </label>
          ))}
          <input className={`${input} sm:col-span-2`} placeholder="Explanation (shown after the test)" value={f.explanation} onChange={e => setF({ ...f, explanation: e.target.value })} />
        </div>
        <p className="text-xs text-slate-500">Tick the circle beside the correct option.</p>
        <button onClick={add} disabled={busy || f.question.trim().length < 5 || ![f.a, f.b, f.c, f.d].every(x => x.trim())} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <Plus className="w-4 h-4" /> Add question
        </button>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Add many questions from a CSV file</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Make the file in Excel or Google Sheets with these columns, then save as CSV:</p>
        <code className="block text-xs bg-slate-100 dark:bg-slate-800 rounded-lg p-2 break-all">{CSV_HELP}</code>
        <p className="text-xs text-slate-500">Section must be one of: {sectionsFor('CSE').concat(BRANCH_CATEGORIES.Civil).join(', ')}. Up to 500 rows per file.</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${btnPrimary} inline-flex items-center gap-1.5 cursor-pointer`}>
            <FileUp className="w-4 h-4" /> Choose CSV file
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => e.target.files?.[0] && importFile(e.target.files[0])} />
          </label>
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(sample)}`} download="question-template.csv" className={`${btnGhost} inline-flex items-center gap-1.5`}>
            <Download className="w-4 h-4" /> Sample CSV
          </a>
        </div>
      </Card>

      {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}

      <Card className="space-y-2">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Questions added by faculty (${facultyQs.length})`}</h3>
        {facultyQs.length === 0 && <p className="text-sm text-slate-500">None yet.</p>}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {facultyQs.slice(0, 200).map(q => (
            <div key={q.id} className="py-2 flex gap-3 items-start text-sm">
              <div className="flex-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">{q.question}</p>
                <p className="text-xs text-slate-500">{`${q.category}${q.subject ? ` · ${q.subject}` : ''} · Answer: ${q.options[q.correctIndex]} · by ${q.addedBy ?? 'faculty'}`}</p>
              </div>
              <button onClick={() => del(q.id)} className={`${btnGhost} !px-2 text-rose-600`} aria-label="Delete question">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ---------------- question papers ----------------
interface Paper {
  id: string;
  title: string;
  category: string;
  department: string;
  semester: number;
  subjectName: string;
  fileName: string;
  fileSize: string;
  facultyName: string;
  uploadedAt: string;
  hasFile?: boolean;
  tags: string[];
}
const PAPER_CATS = ['Model Question Paper', 'Previous Year Paper (PYQ)'];
const deptOf = (b: Branch) => (b === 'Civil' ? 'Civil Engineering' : 'Computer Science & Engineering');
const readAsDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error('Could not read the file.'));
    r.readAsDataURL(f);
  });

export const QuestionPapersPanel: React.FC<{ branch: Branch; staff: boolean }> = ({ branch, staff }) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [f, setF] = useState({ title: '', category: PAPER_CATS[0], semester: 5, subjectName: '' });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    const r = await api('/api/resources');
    if (r.success) setPapers((r.resources as Paper[]).filter(p => PAPER_CATS.includes(p.category) && p.hasFile && (p.department === deptOf(branch) || p.department === 'General / Applied Sciences')));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch]);

  const upload = async () => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return setMsg({ ok: false, text: 'File is larger than 8 MB.' });
    setBusy(true);
    setMsg(null);
    const r = await api('/api/resources', {
      body: {
        action: 'upload',
        title: f.title,
        description: `${f.category} for placement and exam practice.`,
        category: f.category,
        board: 'UBTER (Uttarakhand Board of Technical Education)',
        department: deptOf(branch),
        semester: f.semester,
        subjectCode: 'QP',
        subjectName: f.subjectName,
        tags: ['Placement Q&A'],
        fileName: file.name,
        mimeType: file.type,
        base64: await readAsDataUrl(file),
      },
    });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Upload failed.' });
    setMsg({ ok: true, text: 'Uploaded. Students can open and download it now.' });
    setF({ ...f, title: '', subjectName: '' });
    setFile(null);
    load();
  };

  return (
    <div className="space-y-4">
      {staff && (
        <Card className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Upload a question paper for ${branch}`}</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <input className={input} placeholder="Title, e.g. Surveying model paper 2026" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
            <input className={input} placeholder="Subject" value={f.subjectName} onChange={e => setF({ ...f, subjectName: e.target.value })} />
            <select className={input} value={f.category} onChange={e => setF({ ...f, category: e.target.value })} aria-label="Type">
              {PAPER_CATS.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select className={input} value={f.semester} onChange={e => setF({ ...f, semester: Number(e.target.value) })} aria-label="Semester">
              {[1, 2, 3, 4, 5, 6].map(s => (
                <option key={s} value={s}>{`Semester ${s}`}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={e => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
            <button onClick={upload} disabled={busy || !file || f.title.trim().length < 3} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
              <Upload className="w-4 h-4" /> {busy ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          <p className="text-xs text-slate-500">PDF, Word, JPG/PNG or TXT, up to 8 MB.</p>
          {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}
        </Card>
      )}
      <Card className="space-y-2">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Question papers – ${branch} (${papers.length})`}</h3>
        {papers.length === 0 && <p className="text-sm text-slate-500">No question papers uploaded yet.</p>}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {papers.map(p => (
            <div key={p.id} className="py-2.5 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex-1 min-w-[200px]">
                <p className="font-bold text-slate-900 dark:text-white">{p.title}</p>
                <p className="text-xs text-slate-500">{`${p.category} · ${p.subjectName || 'All subjects'} · Sem ${p.semester} · ${p.fileSize} · ${p.facultyName} · ${p.uploadedAt}`}</p>
              </div>
              <a href={`/api/resources/${p.id}/file?view=1`} target="_blank" rel="noopener noreferrer" className={`${btnGhost} inline-flex items-center gap-1.5`}>
                <Eye className="w-4 h-4" /> Open
              </a>
              <a href={`/api/resources/${p.id}/file`} className={`${btnGhost} inline-flex items-center gap-1.5`}>
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ---------------- faculty tests ----------------
type StaffTest = QnaTest & {
  results: Array<{ studentUserId: string; studentName: string; rollNumber: string; branch: string; year: string; attempt: QnaAttempt | null }>;
  perQuestion: Array<{ id: string; answered: number; correct: number }>;
};

export const FacultyTestsPanel: React.FC<{ branch: Branch; facultyQs: PlacementMcq[] }> = ({ branch, facultyQs }) => {
  const week = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [f, setF] = useState({ title: '', year: 'All', category: BRANCH_CATEGORIES[branch][1] as string, subject: '', count: 20, durationMin: 20, dueDate: week });
  const [tests, setTests] = useState<StaffTest[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [student, setStudent] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const subjects = f.category === 'Faculty questions' ? [] : subjectsOf(f.category);

  const load = async () => {
    const r = await api('/api/qtests');
    if (r.success) setTests(r.tests);
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => setF(x => ({ ...x, category: BRANCH_CATEGORIES[branch][1], subject: '' })), [branch]);

  const create = async () => {
    setBusy(true);
    setMsg(null);
    const r = await api('/api/qtests', { body: { action: 'create', title: f.title, branch, year: f.year, category: f.category, subject: f.subject || undefined, count: f.count, durationMin: f.durationMin, dueDate: f.dueDate } });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Test not created.' });
    setMsg({ ok: true, text: `Test created with ${r.test.questionIds.length} questions. Students of ${branch}${f.year === 'All' ? '' : `, ${f.year}`} see it under "Tests from faculty".` });
    setF({ ...f, title: '' });
    load();
  };
  const del = async (id: string) => {
    if (!window.confirm('Delete this test? Its results stay in the tracker.')) return;
    await api('/api/qtests', { body: { action: 'delete', id } });
    load();
  };

  const mine = tests.filter(t => t.branch === branch || t.branch === 'All');

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Create a test for ${branch} students`}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <input className={`${input} lg:col-span-3`} placeholder="Test title, e.g. DBMS weekly test 1" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
          <select className={input} value={f.year} onChange={e => setF({ ...f, year: e.target.value })} aria-label="Year">
            {['All', '1st Year', '2nd Year', '3rd Year'].map(y => (
              <option key={y} value={y}>{y === 'All' ? 'All years' : y}</option>
            ))}
          </select>
          <select className={input} value={f.category} onChange={e => setF({ ...f, category: e.target.value, subject: '' })} aria-label="Section">
            {[...sectionsFor(branch), ...(facultyQs.length ? ['Faculty questions'] : [])].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {subjects.length > 0 ? (
            <select className={input} value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })} aria-label="Subject">
              <option value="">All subjects of this section</option>
              {subjects.map(s => (
                <option key={s.subject}>{s.subject}</option>
              ))}
            </select>
          ) : (
            <span />
          )}
          <label className="text-sm flex items-center gap-2">
            Questions
            <input type="number" min={5} max={100} className={input} value={f.count} onChange={e => setF({ ...f, count: Number(e.target.value) })} />
          </label>
          <label className="text-sm flex items-center gap-2">
            Minutes
            <input type="number" min={5} max={180} className={input} value={f.durationMin} onChange={e => setF({ ...f, durationMin: Number(e.target.value) })} />
          </label>
          <label className="text-sm flex items-center gap-2">
            Last date
            <input type="date" className={input} value={f.dueDate} onChange={e => setF({ ...f, dueDate: e.target.value })} />
          </label>
        </div>
        <button onClick={create} disabled={busy || f.title.trim().length < 3} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <Plus className="w-4 h-4" /> Create test
        </button>
        {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}
      </Card>

      {mine.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">No tests yet for this branch.</p>
        </Card>
      )}
      {mine.map(t => {
        const done = t.results.filter(r => r.attempt);
        const avg = done.length ? Math.round(done.reduce((s, r) => s + r.attempt!.scorePct, 0) / done.length) : 0;
        const hard = [...t.perQuestion].filter(p => p.answered).sort((a, b) => a.correct / a.answered - b.correct / b.answered).slice(0, 5);
        return (
          <Card key={t.id} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">{t.title}</h4>
                <p className="text-xs text-slate-500">{`${t.source} · ${t.questionIds.length} questions · ${t.durationMin} min · ${t.year === 'All' ? 'All years' : t.year} · last date ${t.dueDate} · by ${t.createdByName}`}</p>
              </div>
              <Pill tone="cyan">{`Taken ${done.length}/${t.results.length}`}</Pill>
              <Pill tone={avg >= 70 ? 'green' : avg >= 40 ? 'amber' : 'rose'}>{`Average ${avg}%`}</Pill>
              <button onClick={() => setOpen(o => (o === t.id ? null : t.id))} className={btnGhost}>
                {open === t.id ? 'Hide results' : 'See results'}
              </button>
              <button onClick={() => del(t.id)} className={`${btnGhost} !px-2 text-rose-600`} aria-label="Delete test">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {open === t.id && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-slate-400">
                      <tr>
                        <th className="py-2 pr-3">Student</th>
                        <th className="pr-3">Status</th>
                        <th className="pr-3">Score</th>
                        <th className="pr-3">Correct / Wrong / Skipped</th>
                        <th className="pr-3">Time</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {t.results.map(r => (
                        <tr key={r.studentUserId}>
                          <td className="py-2 pr-3">
                            <div className="font-bold">{r.studentName}</div>
                            <div className="text-xs text-slate-400">{`${r.rollNumber} · ${r.year}`}</div>
                          </td>
                          <td className="pr-3">{r.attempt ? <Pill tone="green">Done</Pill> : <Pill tone="amber">Not taken</Pill>}</td>
                          <td className={`pr-3 font-black ${r.attempt ? scoreTone(r.attempt.scorePct) : ''}`}>{r.attempt ? `${r.attempt.correct}/${r.attempt.totalQuestions} (${r.attempt.scorePct}%)` : '—'}</td>
                          <td className="pr-3">{r.attempt ? `${r.attempt.correct} / ${r.attempt.wrong} / ${r.attempt.skipped}` : '—'}</td>
                          <td className="pr-3">{r.attempt ? `${Math.round(r.attempt.durationSec / 60)} min` : '—'}</td>
                          <td>
                            {r.attempt && (
                              <button onClick={() => setStudent(s => (s === `${t.id}|${r.studentUserId}` ? null : `${t.id}|${r.studentUserId}`))} className="text-xs font-black text-cyan-700 cursor-pointer">
                                {student === `${t.id}|${r.studentUserId}` ? 'Hide answers' : 'Answers'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {t.results.filter(r => student === `${t.id}|${r.studentUserId}`).map(r => (
                  <div key={r.studentUserId} className="space-y-2">
                    <p className="text-sm font-bold">{`${r.studentName}'s answers`}</p>
                    {r.attempt!.answers.map((a, k) => {
                      const q = mcqById(a.questionId);
                      return q ? (
                        <div key={a.questionId} className="space-y-1">
                          <p className="text-sm font-semibold">{`Q${k + 1}. ${q.question}`}</p>
                          <Verdict q={q} selected={a.selectedIndex} />
                        </div>
                      ) : null;
                    })}
                  </div>
                ))}
                {hard.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Hardest questions for the class</p>
                    {hard.map(h => {
                      const q = mcqById(h.id);
                      return q ? (
                        <p key={h.id} className="text-xs text-slate-600 dark:text-slate-300">{`${Math.round((h.correct / h.answered) * 100)}% right – ${q.question}`}</p>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ---------------- student: tests from faculty ----------------
type MyTest = QnaTest & { myAttempt: QnaAttempt | null };

export const StudentTestsPanel: React.FC<{ post: (b: Record<string, unknown>) => Promise<any>; facultyReady: boolean }> = ({ post, facultyReady }) => {
  const [tests, setTests] = useState<MyTest[]>([]);
  const [run, setRun] = useState<RunConfig | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const load = async () => {
    const r = await api('/api/qtests');
    if (r.success) setTests(r.tests);
  };
  useEffect(() => {
    load();
  }, [facultyReady]);
  const today = new Date().toISOString().slice(0, 10);
  const list = useMemo(() => [...tests].sort((a, b) => Number(!!a.myAttempt) - Number(!!b.myAttempt) || a.dueDate.localeCompare(b.dueDate)), [tests]);

  if (run) return <QuestionRunner run={run} post={post} onClose={() => { setRun(null); load(); }} />;

  return (
    <Card className="space-y-3">
      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Tests from your faculty</h3>
      {list.length === 0 && <p className="text-sm text-slate-500">No tests for your class right now.</p>}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {list.map(t => {
          const qs = t.questionIds.map(id => mcqById(id)).filter((q): q is PlacementMcq => !!q);
          const late = t.dueDate < today;
          return (
            <div key={t.id} className="py-3 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                  <p className="text-xs text-slate-500">{`${t.source} · ${t.questionIds.length} questions · ${t.durationMin} min · last date ${t.dueDate} · ${t.createdByName}`}</p>
                </div>
                {t.myAttempt ? (
                  <>
                    <Pill tone={t.myAttempt.scorePct >= 70 ? 'green' : t.myAttempt.scorePct >= 40 ? 'amber' : 'rose'}>{`Done: ${t.myAttempt.correct}/${t.myAttempt.totalQuestions}`}</Pill>
                    <button onClick={() => setReview(r => (r === t.id ? null : t.id))} className={btnGhost}>
                      {review === t.id ? 'Hide answers' : 'See answers'}
                    </button>
                  </>
                ) : late ? (
                  <Pill tone="rose">Last date passed</Pill>
                ) : (
                  <button
                    onClick={() => setRun({ title: t.title, category: `Faculty test: ${t.title}`, questions: qs, mode: 'Faculty test', timeLimitSec: t.durationMin * 60, testId: t.id })}
                    disabled={qs.length < t.questionIds.length}
                    className={`${btnPrimary} inline-flex items-center gap-1.5`}
                  >
                    <Play className="w-4 h-4" /> {`Start (${t.durationMin} min)`}
                  </button>
                )}
              </div>
              {review === t.id && t.myAttempt && (
                <div className="space-y-2">
                  {t.myAttempt.answers.map((a, k) => {
                    const q = mcqById(a.questionId);
                    return q ? (
                      <div key={a.questionId} className="space-y-1">
                        <p className="text-sm font-semibold">{`Q${k + 1}. ${q.question}`}</p>
                        <Verdict q={q} selected={a.selectedIndex} />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">{`Each test can be taken once. Your score goes to your faculty. Total bank: ${PLACEMENT_MCQ_BANK.length.toLocaleString('en-IN')} questions.`}</p>
    </Card>
  );
};
