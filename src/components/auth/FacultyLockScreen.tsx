'use client';

/**
 * Faculty login prompt shown when a staff-only screen is opened without a faculty session.
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Users,
  Lock,
  Key,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface FacultyLockScreenProps {
  onBackToOverview: () => void;
  onUnlocked?: () => void;
  onOpenForgotSms?: () => void;
}

export const FacultyLockScreen: React.FC<FacultyLockScreenProps> = ({
  onBackToOverview,
  onUnlocked,
}) => {
  const { loginWithPassword, facultyCredentials } = useCollege();
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    facultyCredentials[1]?.facultyId || 'user_faculty_anita'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedCred = facultyCredentials.find((c) => c.facultyId === selectedFacultyId) || facultyCredentials[1];

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter faculty password.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const result = await loginWithPassword(selectedCred?.facultyId ?? selectedFacultyId, password.trim());
    setLoading(false);
    if (result.success) {
      if (onUnlocked) onUnlocked();
    } else {
      setErrorMessage(result.error || 'Incorrect password. Please verify your faculty credentials.');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboards</span>
        </button>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>FACULTY LOCK ACTIVE</span>
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-indigo-900 text-indigo-400 flex items-center justify-center mx-auto shadow-xl border border-indigo-500/30">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Faculty Portal Locked
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Restricted to UGIP Tanakpur faculty lecturers & HODs. Password authentication required for grading and RBAC marks editing.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleUnlock} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Faculty Member
          </label>
          <select
            value={selectedFacultyId}
            onChange={(e) => {
              setSelectedFacultyId(e.target.value);
              setPassword('');
              setErrorMessage('');
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {facultyCredentials.map((cred) => (
              <option key={cred.facultyId} value={cred.facultyId}>
                {cred.facultyName} — {cred.department}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Faculty Password</span>
          </div>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter faculty password"
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>{loading ? 'Verifying...' : 'Unlock Faculty Portal'}</span>
        </button>
      </form>
    </div>
  );
};
