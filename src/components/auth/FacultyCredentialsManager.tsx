'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff, KeyRound, RefreshCw, Search, X } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { api } from '../../lib/client/api';
import { Card, Pill, ScreenHeader, btnGhost, btnPrimary, input } from '../tracker/TrackerUi';

// Admin only: the admin's own details and every faculty member with details, login ID (username) and password.
// v4.21: passwords come from the password book, so the admin also sees a password the faculty member changed.
// CopyBtn and PasswordCell are shared with StudentLoginsScreen.

interface FacultyLogin {
  facultyId: string;
  name: string;
  department: string;
  email: string;
  mobile: string;
  role: 'faculty' | 'admin';
  subjects: string[];
  loginId: string;
  password: string | null;
  passwordNote: string;
  updatedAt: string;
}

export const NOTE_HI: Record<string, string> = {
  'Set by admin': 'एडमिन ने सेट किया',
  'Set by faculty': 'फैकल्टी ने सेट किया',
  'Default password': 'डिफ़ॉल्ट पासवर्ड',
  'Changed by the user': 'खुद बदला',
  'Reset with OTP': 'OTP से बदला',
  'Saved at login': 'लॉगिन पर सेव हुआ',
  'Given with the new account': 'नए अकाउंट के साथ दिया',
  'Saved at the next login': 'अगले लॉगिन पर सेव होगा',
};

/** Password with show / hide and copy buttons, plus a note on where it came from. */
export const PasswordCell: React.FC<{ password: string | null; note: string; hi: boolean }> = ({ password, note, hi }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      {password ? (
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{show ? password : '••••••••'}</span>
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            aria-label={show ? 'Hide password' : 'Show password'}
            title={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <CopyBtn text={password} label="Copy password" />
        </div>
      ) : (
        <span className="text-xs text-slate-500">—</span>
      )}
      <div className="mt-1">
        <Pill tone={password ? 'green' : 'amber'}>{hi ? NOTE_HI[note] ?? note : note}</Pill>
      </div>
    </div>
  );
};

export const CopyBtn: React.FC<{ text: string; label: string }> = ({ text, label }) => {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
      title={label}
      aria-label={label}
    >
      {done ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export const FacultyCredentialsManager: React.FC = () => {
  const { language, loggedInRole } = useCollege();
  const hi = language === 'hi';
  const [rows, setRows] = useState<FacultyLogin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<FacultyLogin | null>(null);
  const [newPw, setNewPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const r = await api('/api/faculty/logins');
    setLoading(false);
    if (!r.success) return setError(r.error || 'Could not load the faculty list.');
    setError(null);
    setRows(r.faculty);
  }, []);
  useEffect(() => {
    if (loggedInRole === 'admin') load();
  }, [load, loggedInRole]);

  if (loggedInRole !== 'admin') {
    return (
      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-300">Only the admin (Principal) can see faculty logins.</p>
      </Card>
    );
  }

  const save = async (f: FacultyLogin, password?: string) => {
    setBusy(true);
    setMsg(null);
    const r = await api(`/api/faculty/${f.facultyId}/reset-password`, { body: password ? { newPassword: password } : {} });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Password not changed.' });
    setEditing(null);
    setNewPw('');
    setMsg({ ok: true, text: `New password for ${f.name}: ${r.tempPassword}. Tell the faculty member their username and this password.` });
    load();
  };

  const list = rows.filter(r => !q || `${r.name} ${r.department} ${r.email} ${r.mobile} ${r.loginId}`.toLowerCase().includes(q.toLowerCase()));
  const faculty = list.filter(r => r.role === 'faculty');
  const admins = rows.filter(r => r.role === 'admin'); // always shown, whatever the search

  return (
    <div className="space-y-5">
      <ScreenHeader
        badge={hi ? 'फैकल्टी सूची' : 'Faculty List'}
        title={hi ? 'सभी फैकल्टी – जानकारी, यूज़रनेम और पासवर्ड' : 'All faculty – details, username and password'}
        subtitle="Only the admin sees this page. Every password is saved here in encrypted form: one you set, one the faculty member changes, and the one used at login. Press the eye to see it."
      >
        <p className="text-sm text-gold-200 font-semibold">{`${rows.filter(r => r.role === 'faculty').length} faculty members`}</p>
      </ScreenHeader>

      {admins.map(a => (
        <Card key={a.facultyId} className="border-l-4 border-l-gold-500">
          <p className="text-xs font-bold uppercase tracking-wide text-gold-700">{hi ? 'एडमिन – आपकी जानकारी' : 'Admin – your details'}</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Name</div>
              <div className="font-bold text-slate-900 dark:text-white">{a.name}</div>
              <div className="text-xs text-slate-500">{a.department}</div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <div className="text-slate-500">Contact</div>
              <div className="break-words">{a.email || '—'}</div>
              <div>{a.mobile || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Username (login ID)</div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{a.loginId}</span>
                <CopyBtn text={a.loginId} label="Copy username" />
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Password</div>
              <PasswordCell password={a.password} note={a.passwordNote} hi={hi} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">Change your own password from your profile; the new one is saved here automatically.</p>
        </Card>
      ))}

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${input} pl-8`} placeholder="Search name, department, email, mobile or username" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button onClick={load} className={`${btnGhost} inline-flex items-center gap-1.5`}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}

      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-3 px-4">Faculty member</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Username (login ID)</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4 text-right">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {faculty.map(f => (
              <tr key={f.facultyId} className="align-top">
                <td className="py-3 px-4 min-w-[200px]">
                  <div className="font-bold text-slate-900 dark:text-white">{f.name}</div>
                  <div className="text-xs text-slate-500">{f.department}</div>
                  {f.subjects.length > 0 && <div className="text-xs text-slate-400 mt-0.5">{`Subjects: ${f.subjects.join(', ')}`}</div>}
                </td>
                <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 min-w-[180px]">
                  <div className="break-words">{f.email || '—'}</div>
                  <div>{f.mobile || '—'}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded whitespace-nowrap">{f.loginId}</span>
                    <CopyBtn text={f.loginId} label="Copy username" />
                  </div>
                </td>
                <td className="py-3 px-4 min-w-[200px]">
                  <PasswordCell password={f.password} note={f.passwordNote} hi={hi} />
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(f); setNewPw(''); setMsg(null); }} className={`${btnGhost} !px-2.5 inline-flex items-center gap-1`}>
                    <KeyRound className="w-3.5 h-3.5" /> Set password
                  </button>
                </td>
              </tr>
            ))}
            {!loading && faculty.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-sm text-slate-500">
                  {rows.length ? 'No faculty member matches this search.' : 'No faculty found.'}
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
            <p className="text-sm text-slate-600 dark:text-slate-300">{`Username: ${editing.loginId}`}</p>
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
