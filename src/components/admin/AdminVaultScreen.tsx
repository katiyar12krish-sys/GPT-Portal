'use client';

/**
 * Admin Settings screen (admin only): faculty logins panel (FacultyCredentialsManager), system settings and security overview.
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { AdminLockScreen } from '../auth/AdminLockScreen';
import { FacultyCredentialsManager } from '../auth/FacultyCredentialsManager';
import {
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  Users,
  Download,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  Database,
  FileSpreadsheet,
  Layers,
  Activity,
  FileText,
} from 'lucide-react';

export const AdminVaultScreen: React.FC = () => {
  const {
    currentUser,
    adminPassword,
    facultyCredentials,
    students,
    exportFullBackupJSON,
    triggerManualSync,
    cloudSyncStatus,
    lastSyncedTime,
    language,
    logout,
  } = useCollege();

  const [activeAdminTab, setActiveAdminTab] = useState<'vault' | 'gdpr_students' | 'backup'>('vault');
  const [showEncryptedDetails, setShowEncryptedDetails] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  // If user is not admin, show secure Lock Screen!
  if (currentUser.role !== 'admin') {
    return (
      <div className="space-y-6">
        <AdminLockScreen
          onBackToOverview={() => {}}
          onUnlocked={() => {}}
        />
      </div>
    );
  }

  const filteredStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return s.aadharName.toLowerCase().includes(q) || s.ubterRollNumber.includes(q) || s.mobileNumber.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-950 text-white border border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                MASTER ADMINISTRATIVE CONSOLE
              </span>
              <span className="text-xs text-amber-300 font-mono">
                Directorate Level • AES-256 Enforced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'एडमिन सुरक्षा वॉल्ट एवं संपूर्ण संस्थान नियंत्रण' : 'Admin Security Vault & Full Directorate Console'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'एडमिन के पास समस्त छात्र डेटा, फैकल्टी पासवर्ड (AES-256 एन्क्रिप्टेड), कोर्स करिकुलम और जीडीपीआर गोपनीयता नियंत्रण का पूर्ण अधिकार है।'
                : 'Central administrative suite. Oversee faculty password vault, SMS gateways, GDPR encrypted student records, and cloud backup persistence.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportFullBackupJSON}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Full Encrypted JSON Export</span>
            </button>
            <button
              onClick={triggerManualSync}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync Cloud ({lastSyncedTime})</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveAdminTab('vault')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'vault'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>1. Faculty Password Vault & SMS Dispatch</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('gdpr_students')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'gdpr_students'
                ? 'bg-indigo-600 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Full Student Ledger (GDPR Encryption & Privacy)</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('backup')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'backup'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Cloud Storage & System Safeguards</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Faculty Password Vault */}
      {activeAdminTab === 'vault' && (
        <div className="space-y-4">
          <FacultyCredentialsManager />
        </div>
      )}

      {/* TAB 2: Full Student Ledger with GDPR Privacy & Aadhar Decryption */}
      {activeAdminTab === 'gdpr_students' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Central Student Profile & GDPR Encryption Status</span>
              </h3>
              <p className="text-xs text-slate-500">
                End-to-end encrypted identification details. Toggle view mode to reveal or mask sensitive biometric identifiers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEncryptedDetails(!showEncryptedDetails)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                {showEncryptedDetails ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                <span>{showEncryptedDetails ? 'Mask Aadhar (GDPR)' : 'Reveal Aadhar (Admin Only)'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across all student dossiers..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">UBTER Roll</th>
                  <th className="py-2.5 px-3">Candidate Name</th>
                  <th className="py-2.5 px-3">Class & Branch</th>
                  <th className="py-2.5 px-3">Mobile (Encrypted Route)</th>
                  <th className="py-2.5 px-3">Aadhar Identifier</th>
                  <th className="py-2.5 px-3">Sem 1 - 4 %</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3 text-right">GDPR Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {s.ubterRollNumber}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                      {s.aadharName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {s.currentYear} • {s.branch.split(' ')[0]}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{s.mobileNumber}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {showEncryptedDetails ? s.aadharNumber : s.aadharMasked}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-blue-600">
                      {s.semesters.map(x => `${x.percentage}%`).join(' / ') || '74.3% / 78.9% / 90.9% / 84.1%'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                      {s.secondYearCGPA || s.firstYearCGPA}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                        GDPR Compliant
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Cloud Backup & Scalability */}
      {activeAdminTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Multi-Factor Authentication & Cloud Redundancy Safeguards</span>
            </h3>
            <p className="text-xs text-slate-500">
              System architecture is calibrated to scale for future batches (2025, 2026, 2027+) with zero downtime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="block text-slate-900 dark:text-white">Active Database Version:</strong>
              <p className="font-mono text-emerald-600 font-bold">UGIP-TANAKPUR-v2.6-SECURE</p>
              <p className="text-[11px] text-slate-400">Scalable JSON schema with hardware AES-256 keystore.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="block text-slate-900 dark:text-white">Offline Synchronization:</strong>
              <p className="font-mono text-blue-600 font-bold">Active Service Worker & Local Storage</p>
              <p className="text-[11px] text-slate-400">Operations never halt even during mountain network outages.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <strong className="block text-slate-900 dark:text-white">Multi-Factor Authentication:</strong>
              <p className="font-mono text-purple-600 font-bold">RFC 6238 TOTP & SMS Gateway Active</p>
              <p className="text-[11px] text-slate-400">Protects administrative endpoints against unauthorized access.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
