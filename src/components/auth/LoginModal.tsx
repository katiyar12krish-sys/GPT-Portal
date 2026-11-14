'use client';

/**
 * Login pop-up. The `role` prop changes the fields: student = roll number or mobile, faculty = email or mobile,
 * admin = password only. Error messages come from the server (wrong password) or src/lib/client/api.ts (internet problems).
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Lock,
  User,
  Key,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForgot?: () => void;
  /** Which button opened the box: admin logs in with the password only. */
  role?: 'student' | 'faculty' | 'admin';
}

const ID_FIELD = {
  student: { en: 'Roll number or mobile number', hi: 'रोल नंबर या मोबाइल नंबर', ph: 'e.g. 24090050007' },
  faculty: { en: 'Email or mobile number', hi: 'ईमेल या मोबाइल नंबर', ph: 'e.g. name@college.in' },
  any: { en: 'Roll number, email or mobile number', hi: 'रोल नंबर, ईमेल या मोबाइल नंबर', ph: 'Roll number, email or mobile' },
};

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onOpenForgot, role }) => {
  const { loginWithPassword, loginAdmin, currentUser, language } = useCollege();
  const isAdmin = role === 'admin';
  const field = ID_FIELD[role === 'student' || role === 'faculty' ? role : 'any'];
  const hi = language === 'hi';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isAdmin && !identifier.trim()) || !password.trim()) {
      setErrorMessage(
        isAdmin ? (hi ? 'पासवर्ड दर्ज करें।' : 'Enter the password.') : hi ? `${field.hi} और पासवर्ड दोनों दर्ज करें।` : `Enter your ${field.en.toLowerCase()} and password.`
      );
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = isAdmin ? await loginAdmin(password.trim()) : await loginWithPassword(identifier.trim(), password.trim());
      if (res.success) {
        onClose();
        setIdentifier('');
        setPassword('');
      } else {
        setErrorMessage(res.error || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isAdmin
                  ? hi ? 'एडमिन (प्रिंसिपल) लॉगिन' : 'Admin (Principal) Login'
                  : role === 'faculty'
                    ? hi ? 'फैकल्टी लॉगिन' : 'Faculty Login'
                    : role === 'student'
                      ? hi ? 'छात्र लॉगिन' : 'Student Login'
                      : hi ? 'संस्थान सुरक्षित लॉगिन' : 'Institutional Secure Login'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin ? (hi ? 'केवल एडमिन पासवर्ड दर्ज करें' : 'Enter the admin password only') : hi ? `${field.hi} और पासवर्ड दर्ज करें` : `Enter your ${field.en.toLowerCase()} and password`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          {!isAdmin && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {hi ? field.hi : field.en} *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={field.ph}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {isAdmin ? (hi ? 'एडमिन पासवर्ड *' : 'Admin password *') : hi ? 'पासवर्ड *' : 'Password *'}
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus={isAdmin}
                autoComplete="current-password"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={hi ? 'पासवर्ड दर्ज करें' : 'Enter password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
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

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Current: <strong>{currentUser.name}</strong>
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
