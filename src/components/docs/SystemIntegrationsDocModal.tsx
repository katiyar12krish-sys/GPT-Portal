'use client';

/**
 * Pop-up explaining security and deployment (opened from the footer link "Security & deployment").
 */
import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { FileText, ShieldCheck, Lock, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface SystemIntegrationsDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemIntegrationsDocModal: React.FC<SystemIntegrationsDocModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useCollege();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Technical Specifications & GDPR Encryption Protocols
              </h3>
              <p className="text-xs text-slate-500">Uttarakhand Government Institute of Polytechnic, Tanakpur Portal Standards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300 max-h-[460px] overflow-y-auto pr-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>1. Aadhar Card Number Encryption & GDPR Privacy</span>
            </h4>
            <p>
              In compliance with UIDAI regulations and GDPR privacy mandates, student Aadhar Card numbers are never stored in raw readable format. They are encrypted using symmetric AES-256-GCM cipher envelopes and masked in public views (e.g., <code>XXXX-XXXX-0184</code>). Only authenticated administrators with master access can reveal decrypted credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>2. Subject-Level Role-Based Access Control (RBAC)</span>
            </h4>
            <p>
              Marks editing is strictly bound to teacher assignments. A faculty member logged into their departmental account is cryptographically restricted from altering marks outside their assigned subject syllabus (e.g. Mrs. Anita cannot edit Civil Surveying marks).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>3. SMS Gateway & 3-Reminder Deadline Engine</span>
            </h4>
            <p>
              Assignment deadlines are actively monitored. Students with unsubmitted tasks receive three automated timed notifications. In the event of missed deadlines, an alert notification is delivered to the assigning faculty, while submissions trigger immediate auto-grading score calculation.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
