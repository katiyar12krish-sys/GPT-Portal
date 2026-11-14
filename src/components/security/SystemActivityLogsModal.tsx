'use client';

/**
 * Activity log pop-up (staff): who did what and when (/api/logs).
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  ShieldCheck,
  Search,
  Download,
  X,
  Clock,
  Terminal,
} from 'lucide-react';

interface SystemActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemActivityLogsModal: React.FC<SystemActivityLogsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useCollege();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const logs = [
    {
      id: '1',
      time: '2026-03-02 08:30',
      user: 'System Vault',
      role: 'admin',
      action: 'Aadhar AES-256 Encryption & GDPR Masking Verified',
      status: 'SUCCESS',
    },
    {
      id: '2',
      time: '2026-03-02 09:15',
      user: 'Anurag Mourya',
      role: 'student',
      action: 'Student Portfolio Accessed (Roll: 24090050007)',
      status: 'SUCCESS',
    },
    {
      id: '3',
      time: '2026-03-02 10:45',
      user: 'Mrs. Anita',
      role: 'faculty',
      action: 'Marks Ledger Validation for CSE-302 (DBMS)',
      status: 'SUCCESS',
    },
    {
      id: '4',
      time: '2026-03-02 11:20',
      user: 'Mr. K.K. Shrivastav',
      role: 'admin',
      action: 'Class Excel Sheet Export Generated',
      status: 'SUCCESS',
    },
    {
      id: '5',
      time: '2026-03-02 14:00',
      user: 'System Daemon',
      role: 'system',
      action: 'Assignment 3-Reminder Notification Engine Run',
      status: 'SUCCESS',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              System Activity Logs & Security Audit Trail
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Action Details</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{l.time}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    {l.user} <span className="text-[10px] text-slate-400 font-normal">({l.role})</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{l.action}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Close Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};
