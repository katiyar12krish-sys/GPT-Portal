'use client';

/**
 * Student List & Logins (v4.21) – faculty and admin.
 * Every student with branch, year, mobile, username (roll number) and password, from GET /api/students/logins.
 * Filters by branch and year, search, show / copy password, and "Set password" (POST /api/students/<id>/password)
 * when a student forgets theirs. Passwords are kept encrypted on the server (password book); each view is logged.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound, RefreshCw, Search, X } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { api } from '../../lib/client/api';
import { Card, ScreenHeader, btnGhost, btnPrimary, input } from '../tracker/TrackerUi';
import { CopyBtn, PasswordCell } from './FacultyCredentialsManager';

interface StudentLogin {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  year: string;
  batchYear: number;
  mobile: string;
  password: string | null;
  passwordNote: string;
  updatedAt: string;
}

export const StudentLoginsScreen: React.FC = () => {
  const { language, loggedInRole } = useCollege();
  const hi = language === 'hi';
  const [rows, setRows] = useState<StudentLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState('all');
  const [year, setYear] = useState('all');
  const [editing, setEditing] = useState<StudentLogin | null>(null);
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const staff = loggedInRole === 'faculty' || loggedInRole === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api('/api/students/logins');
    setLoading(false);
    if (!r.success) return setError(r.error || 'Could not load the student list.');
    setError(null);
    setRows(r.students);
  }, []);
  useEffect(() => {
    if (staff) load();
  }, [load, staff]);

  const branches = useMemo(() => [...new Set(rows.map(r => r.branch))].sort(), [rows]);
  const years = useMemo(() => [...new Set(rows.map(r => r.year))].sort(), [rows]);

  if (!staff) {
    return (
      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-300">Only faculty and the admin can see student logins.</p>
      </Card>
    );
  }

  const save = async (s: StudentLogin, password?: string) => {
    setBusy(true);
    setMsg(null);
    const r = await api(`/api/students/${s.id}/password`, { body: password ? { newPassword: password } : {} });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Password not changed.' });
    setEditing(null);
    setNewPw('');
    setMsg({ ok: true, text: `New password for ${s.name}: ${r.password}. Tell the student their username and this password.` });
    load();
  };

  const ql = q.trim().toLowerCase();
  const list = rows.filter(
    r =>
      (branch === 'all' || r.branch === branch) &&
      (year === 'all' || r.year === year) &&
      (!ql || `${r.name} ${r.rollNumber} ${r.mobile}`.toLowerCase().includes(ql))
  );

  return (
    <div className="space-y-5">
      <ScreenHeader
        badge={hi ? 'छात्र सूची' : 'Student List'}
        title={hi ? 'सभी छात्र – जानकारी, यूज़रनेम और पासवर्ड' : 'All students – details, username and password'}
        subtitle="Only faculty and the admin see this page. Every student password is saved here in encrypted form: the default one, one you set, one the student changes, and the one used at login. Press the eye to see it."
      >
        <p className="text-sm text-gold-200 font-semibold">{`${rows.length} students`}</p>
      </ScreenHeader>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${input} pl-8`} placeholder="Search name, roll number or mobile" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className={`${input} !w-auto`} value={branch} onChange={e => setBranch(e.target.value)} aria-label="Branch">
          <option value="all">All branches</option>
          {branches.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select className={`${input} !w-auto`} value={year} onChange={e => setYear(e.target.value)} aria-label="Year">
          <option value="all">All years</option>
          {years.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button onClick={load} className={`${btnGhost} inline-flex items-center gap-1.5`}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}
      {!loading && rows.length > 0 && <p className="text-xs text-slate-500">{`Showing ${list.length} of ${rows.length} students`}</p>}

      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Branch and year</th>
              <th className="py-3 px-4">Username (roll number)</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {list.map(s => (
              <tr key={s.id} className="align-top">
                <td className="py-3 px-4 min-w-[180px]">
                  <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.mobile || '—'}</div>
                </td>
                <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 min-w-[170px]">
                  <div>{s.branch}</div>
                  <div>{`${s.year} · Batch ${s.batchYear}`}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded whitespace-nowrap">{s.rollNumber}</span>
                    <CopyBtn text={s.rollNumber} label="Copy username" />
                  </div>
                  {s.mobile && <div className="text-[11px] text-slate-400 mt-1">{`Can also log in with ${s.mobile}`}</div>}
                </td>
                <td className="py-3 px-4 min-w-[200px]">
                  <PasswordCell password={s.password} note={s.passwordNote} hi={hi} />
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(s); setNewPw(''); setMsg(null); }} className={`${btnGhost} !px-2.5 inline-flex items-center gap-1`}>
                    <KeyRound className="w-3.5 h-3.5" /> Set password
                  </button>
                </td>
              </tr>
            ))}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-sm text-slate-500">
                  {rows.length ? 'No student matches this search.' : 'No students found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" role="dialog" aria-modal="true">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Password for ${editing.name}`}</h3>
              <button onClick={() => setEditing(null)} className="p-1 text-slate-400 cursor-pointer" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{`Username: ${editing.rollNumber}`}</p>
            <input
              className={`${input} font-mono`}
              placeholder="New password (8+ letters and numbers)"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button onClick={() => save(editing)} disabled={busy} className={btnGhost}>
                Generate one for me
              </button>
              <button onClick={() => save(editing, newPw.trim())} disabled={busy || newPw.trim().length < 8} className={btnPrimary}>
                Save password
              </button>
            </div>
            {msg && !msg.ok && <p className="text-sm text-rose-600 font-semibold">{msg.text}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
