'use client';

import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';

/** Blocks the app until a user with a temporary password chooses their own. */
export const ForcePasswordChange: React.FC = () => {
  const { isLoggedIn, mustChangePassword, changeMyPassword, logout } = useCollege();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isLoggedIn || !mustChangePassword) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) {
      setError('New password must be at least 8 characters with letters and numbers.');
      return;
    }
    if (next !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const r = await changeMyPassword(current, next);
    setBusy(false);
    if (!r.success) setError(r.error || 'Could not change password.');
  };

  const inputCls =
    'w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Set a new password</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          You are using a temporary password. Choose your own password to continue.
        </p>
        {error && <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">{error}</div>}
        <input type="password" required placeholder="Temporary / current password" value={current} onChange={e => setCurrent(e.target.value)} className={inputCls} autoComplete="current-password" />
        <input type="password" required placeholder="New password (8+ chars, letters + numbers)" value={next} onChange={e => setNext(e.target.value)} className={inputCls} autoComplete="new-password" />
        <input type="password" required placeholder="Confirm new password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} autoComplete="new-password" />
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="flex-1 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold disabled:opacity-60 cursor-pointer">
            {busy ? 'Saving…' : 'Save password'}
          </button>
          <button type="button" onClick={logout} className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-sm font-bold cursor-pointer">
            Log out
          </button>
        </div>
      </form>
    </div>
  );
};
