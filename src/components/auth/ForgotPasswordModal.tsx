'use client';

/**
 * Forgot-password pop-up: asks for mobile/email, sends an OTP (/api/auth/forgot) and sets a new password (/api/auth/reset).
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { requestPasswordResetSms, verifyOtpAndResetPassword, language, facultyCredentials } = useCollege();
  const [step, setStep] = useState<'input_mobile' | 'enter_otp' | 'success'>('input_mobile');
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileOrEmail.trim()) {
      setErrorMsg('Please enter registered phone or email.');
      return;
    }
    setErrorMsg(null);
    const result = await requestPasswordResetSms(mobileOrEmail.trim());
    if (result.success) {
      setStep('enter_otp');
    } else {
      setErrorMsg(result.error || 'Failed to dispatch SMS.');
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      setErrorMsg('Please enter OTP.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setErrorMsg('Password must be at least 8 characters with letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg(null);
    const res = await verifyOtpAndResetPassword(mobileOrEmail, enteredOtp, newPassword);
    if (res.success) {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setStep('input_mobile');
      }, 2000);
    } else {
      setErrorMsg(res.error || 'Invalid OTP code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {language === 'hi' ? 'पासवर्ड भूल गए? (SMS OTP रिकवरी)' : 'Forgot Password? (SMS OTP Recovery)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive 6-digit OTP directly on your registered mobile number
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'input_mobile' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Mobile Number or Email *
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={mobileOrEmail}
                  onChange={(e) => setMobileOrEmail(e.target.value)}
                  placeholder="e.g. 9411322504 or anita.cse@gptanakpur.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send Reset OTP via SMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {step === 'enter_otp' && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold">
              If this account exists, a 6-digit OTP was sent to its registered mobile number. It is valid for 10 minutes.
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-Digit SMS OTP *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="6-digit OTP"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-center font-mono font-black text-sm tracking-widest"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. anita.cse@cse2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('input_mobile')}
                className="text-[11px] text-slate-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Change Mobile</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Verify OTP & Save</span>
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Password Successfully Reset!
            </h4>
            <p className="text-xs text-slate-500">
              Your new password is encrypted with AES-256 and stored in the security vault.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
