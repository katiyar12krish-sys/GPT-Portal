'use client';

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { api } from '../../lib/client/api';

/** Faculty / admin only: the student's login, and a reset for forgotten passwords. */
export const StudentPasswordCard: React.FC<{ studentId: string; studentName: string }> = ({ studentId, studentName }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setShow(false);
    setMsg(null);
    setNext('');
    api(`/api/students/${studentId}/password`).then(r => {
      if (r.success) {
        setLoginId(r.loginId);
        setPassword(r.password);
      }
    });
  }, [studentId]);

  const reset = async (generate: boolean) => {
    setBusy(true);
    const r = await api(`/api/students/${studentId}/password`, { body: generate ? {} : { newPassword: next } });
    setBusy(false);
    if (!r.success) return setMsg(r.error || 'Could not change the password.');
    setPassword(r.password);
    setShow(true);
    setNext('');
    setMsg(`Password updated. Give it to ${studentName}.`);
  };

  const field = 'px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm';
  return (
    <section className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h3 className="font-bold text-base text-slate-900 dark:text-white inline-flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-cyan-700" /> Login details: {studentName}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs font-semibold text-slate-500">Login ID</div>
          <div className="font-mono font-semibold">{loginId}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">Password</div>
          {password ? (
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">{show ? password : '••••••••••'}</span>
              <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="p-1 cursor-pointer">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="text-slate-600 dark:text-slate-300">Set by the student (private). Reset it below if forgotten.</div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <input className={`${field} flex-1 min-w-[200px]`} placeholder="New password" value={next} onChange={e => setNext(e.target.value)} aria-label="New password" />
        <button type="button" disabled={busy || !next} onClick={() => reset(false)} className="px-3 py-2 rounded-lg bg-cyan-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-50">
          Update password
        </button>
        <button type="button" disabled={busy} onClick={() => reset(true)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold cursor-pointer disabled:opacity-50">
          Generate new
        </button>
      </div>
      {msg && <p className="text-sm text-slate-700 dark:text-slate-200">{msg}</p>}
    </section>
  );
};
