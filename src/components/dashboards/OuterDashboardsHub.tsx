'use client';

/**
 * Front page before login: college hero, the three login portals (student, faculty, admin) and links to public resources.
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { ActiveScreen } from '../layout/Navbar';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  ArrowRight,
  Briefcase,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Award,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  HelpCircle,
  Clock,
  Key,
  ExternalLink,
} from 'lucide-react';

interface OuterDashboardsHubProps {
  onNavigateToScreen: (screen: ActiveScreen) => void;
  openLoginModal: (role?: 'student' | 'faculty' | 'admin') => void;
}

export const OuterDashboardsHub: React.FC<OuterDashboardsHubProps> = ({
  onNavigateToScreen,
  openLoginModal,
}) => {
  const {
    language,
    students,
    primaryStudent,
    civilCompanies,
    cseCompanies,
    loginStudent,
    loginFaculty,
    loginAdmin,
    isLoggedIn,
    loggedInRole,
    currentUser,
    logout,
  } = useCollege();

  // Student Form State (Strictly secure - no pre-filled credentials or hints)
  const [stuRoll, setStuRoll] = useState('');
  const [stuPwd, setStuPwd] = useState('');
  const [showStuPwd, setShowStuPwd] = useState(false);
  const [stuError, setStuError] = useState('');
  const [stuLoading, setStuLoading] = useState(false);

  // Faculty Form State (Strictly secure - no pre-filled credentials or hints)
  const [facEmail, setFacEmail] = useState('');
  const [facPwd, setFacPwd] = useState('');
  const [showFacPwd, setShowFacPwd] = useState(false);
  const [facError, setFacError] = useState('');
  const [facLoading, setFacLoading] = useState(false);

  // Admin Form State (Strictly secure - no pre-filled credentials or hints)
  const [adminPwd, setAdminPwd] = useState('');
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStuError('');
    setStuLoading(true);
    const res = await loginStudent(stuRoll, stuPwd);
    setStuLoading(false);
    if (res.success) {
      onNavigateToScreen('student');
    } else {
      setStuError(res.error || 'Student authentication failed.');
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacError('');
    setFacLoading(true);
    const res = await loginFaculty(facEmail, facPwd);
    setFacLoading(false);
    if (res.success) {
      onNavigateToScreen('faculty');
    } else {
      setFacError(res.error || 'Faculty authentication failed.');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    const res = await loginAdmin(adminPwd);
    setAdminLoading(false);
    if (res.success) {
      onNavigateToScreen('admin');
    } else {
      setAdminError(res.error || 'Invalid administrator password.');
    }
  };

  const handleExploreClick = (screen: ActiveScreen) => {
    if (!isLoggedIn) {
      openLoginModal();
    } else {
      onNavigateToScreen(screen);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Prestigious Hero Section: Training & Placement Cell Portal */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[#13294b] text-white border-b-4 border-gold-500 shadow-2xl overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b] shadow-sm">
                TRAINING & PLACEMENT CELL (TPO PORTAL)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
                UBTER ROORKEE CODE: 090 • AICTE APPROVED
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                90.6% PLACED IN 2025-26
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {language === 'hi'
                ? 'प्रशिक्षण एवं प्लेसमेंट सेल (T&P Cell) — उत्तराखंड राजकीय पॉलीटेक्निक संस्थान, टनकपुर'
                : 'Training & Placement Cell (TPO Hub) — UGIP Tanakpur'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {language === 'hi'
                ? 'डिप्लोमा फ्रेशर्स के लिए समर्पित प्लेसमेंट पोर्टल: 24 शीर्ष रिक्रूटर्स (12 सिविल + 12 CS), यूकेपीएससी व एसएससी जेई सरकारी नौकरियां, 2 Q&A ट्रैक (सरकारी व प्राइवेट), 9 मॉक इंटरव्यू वीडियो मास्टरक्लास, एवं एटीएस रिज्यूमे प्रबंधन।'
                : 'Dedicated Campus Placement & Career Portal for Polytechnic Engineers: 24 core recruiters (12 Civil + 12 CS), UKPSC/SSC JE government vacancies, dual Sarkari vs Private Q&A tracks, mock interview video masterclasses, and ATS resume hub.'}
            </p>

            {/* TWO CRITICAL PROMINENT BUTTONS DIRECTLY IN HERO BANNER */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://govtjobguru.in/jobs-by-qualification/diploma-freshers/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-5 py-3 rounded-2xl bg-gold-400 hover:bg-gold-300 text-[#13294b] font-black text-xs shadow-lg flex items-center gap-2.5 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>डिप्लोमा के बाद गवर्नमेंट जॉब (GovtJobGuru)</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="https://ssc.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-cyan-200" />
                <span>SSC Official (central govt jobs)</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                onClick={() => handleExploreClick('questions')}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-300" />
                <span>2 Q&A ट्रैक (सरकारी vs प्राइवेट)</span>
              </button>
            </div>

            {/* Quick Stat Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>₹3.60 LPA highest package</span>
              </div>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Building2 className="w-4 h-4" />
                <span>24 core recruiters (L&T, Tata Motors, HCLTech, PWD)</span>
              </div>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <Award className="w-4 h-4" />
                <span>90.6% placed in 2025-26</span>
              </div>
            </div>
          </div>

          {/* If already logged in, show quick return badge */}
          {isLoggedIn && (
            <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 space-y-3 min-w-[260px] text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400">Current Candidate Session</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div>
                <h4 className="font-black text-base text-white">{currentUser.name}</h4>
                <p className="text-xs text-slate-300 capitalize">{loggedInRole} Portal Active</p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onNavigateToScreen('overview')}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-gold-300 text-[#13294b] text-xs font-black transition-colors cursor-pointer"
                >
                  Enter Placement Hub
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. THREE SEPARATE, BEAUTIFUL LOGIN PORTALS (Right on Overview!) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'hi' ? '3 सुरक्षित लॉगिन पोर्टल: छात्र • शिक्षक • एडमिन' : '3 Dedicated Login Portals: Student • Faculty • Admin'}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                SECURE AUTHENTICATION
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'प्रत्येक छात्र, फैकल्टी एवं एडमिन का अलग पासवर्ड है। छात्र का डेटा केवल उसके व्यक्तिगत पासवर्ड से ही खुलेगा।'
                : 'Each portal enforces isolated passwords. Student records are completely private to the authenticated candidate.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CARD 1: Student Login Portal */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  STUDENT PORTAL
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? 'छात्र लॉगिन (प्राइवेट डेटा)' : 'Student Login (Private Data)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Access your personal dossier, 1st to 4th Sem marks, Aadhar & assignments.
                </p>
              </div>

              {stuError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{stuError}</span>
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    UBTER Roll Number / Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={stuRoll}
                    onChange={(e) => setStuRoll(e.target.value)}
                    placeholder={language === 'hi' ? 'रोल नंबर या मोबाइल दर्ज करें' : 'Enter UBTER Roll No or Mobile'}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showStuPwd ? 'text' : 'password'}
                      required
                      value={stuPwd}
                      onChange={(e) => setStuPwd(e.target.value)}
                      placeholder={language === 'hi' ? 'अपना पासवर्ड दर्ज करें' : 'Enter your password'}
                      className="w-full p-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStuPwd(!showStuPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showStuPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={stuLoading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{stuLoading ? 'Verifying...' : 'Unlock Student Dashboard'}</span>
                </button>
              </form>
            </div>

            {/* Institutional Security Notice (Strictly zero password exposure) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'hi' ? 'व्यक्तिगत गोपनीय डेटा' : 'Confidential Student Profile'}</span>
              </span>
              <span className="tabular-nums text-[10px] text-slate-400">AES-256</span>
            </div>
          </div>

          {/* CARD 2: Faculty Login Portal */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  FACULTY CONSOLE
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? 'फैकल्टी लॉगिन (अंक व मूल्यांकन)' : 'Faculty Login (RBAC Marks)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update marks for assigned subjects, review doubts, and broadcast circulars.
                </p>
              </div>

              {facError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{facError}</span>
                </div>
              )}

              <form onSubmit={handleFacultySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Email or Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={facEmail}
                    onChange={(e) => setFacEmail(e.target.value)}
                    placeholder={language === 'hi' ? 'फैकल्टी ईमेल या मोबाइल' : 'Faculty Email or Mobile'}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showFacPwd ? 'text' : 'password'}
                      required
                      value={facPwd}
                      onChange={(e) => setFacPwd(e.target.value)}
                      placeholder={language === 'hi' ? 'फैकल्टी पासवर्ड दर्ज करें' : 'Enter faculty password'}
                      className="w-full p-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFacPwd(!showFacPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showFacPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={facLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{facLoading ? 'Verifying...' : 'Unlock Faculty Portal'}</span>
                </button>
              </form>
            </div>

            {/* Institutional Security Notice */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>{language === 'hi' ? 'फैकल्टी एवं एचओडी प्रमाणीकरण' : 'Faculty & HOD Authentication'}</span>
              </span>
              <span className="tabular-nums text-[10px] text-slate-400">RBAC</span>
            </div>
          </div>

          {/* CARD 3: Master Admin Directorate Portal */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/50 shadow-lg space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  DIRECTORATE MASTER
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? 'एडमिन सुरक्षा वॉल्ट' : 'Master Admin Directorate Vault'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AES-256 faculty password keys, GDPR student ledger & full system controls.
                </p>
              </div>

              {adminError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Master Admin Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPwd ? 'text' : 'password'}
                      required
                      value={adminPwd}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      onChange={(e) => setAdminPwd(e.target.value)}
                      placeholder={language === 'hi' ? 'एडमिन पासवर्ड दर्ज करें' : 'Enter admin password'}
                      className="w-full p-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums text-slate-900 dark:text-white font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPwd(!showAdminPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px]">
                  Master Key unlocks full CRUD, encrypted keys, and class CSV generators.
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3 rounded-xl bg-[#13294b] hover:bg-[#1a345e] text-gold-200 font-black text-xs shadow-md border border-gold-500/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-300" />
                  <span>{adminLoading ? 'Verifying...' : 'Unlock Directorate Vault'}</span>
                </button>
              </form>
            </div>

            {/* Institutional Security Notice */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'hi' ? 'निदेशालय स्तर सुरक्षा' : 'Directorate Level Access'}</span>
              </span>
              <span className="tabular-nums text-[10px] text-slate-400">Master Key Enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE PLACEMENT & CAREER MODULES EXPLORER */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{language === 'hi' ? 'कैंपस प्लेसमेंट एवं करियर हब सेवाएं' : 'Placement dashboards'}</span>
          </h2>
          <span className="text-xs text-slate-500">Click any card to explore</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 24 Core Companies */}
          <div
            onClick={() => handleExploreClick('companies')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
              24 Core Recruiters (Civil & CS)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              12 Civil (L&T, NHPC, THDC) + 12 CS (HCLTech, VVDN, Airtel) detailed company dossiers.
            </p>
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 pt-1">
              <span>View Recruiters</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: 2 Q&A Tracks (Sarkari vs Private) */}
          <div
            onClick={() => handleExploreClick('questions')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
              2 Q&A ट्रैक: सरकारी vs प्राइवेट
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              UKPSC, SSC JE व RRB सरकारी परीक्षा ट्रैक और TCS NQT व L&T कॉर्पोरेट इंटरव्यू प्रश्न।
            </p>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
              <span>Open Dual Q&A Track</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Mock Interview & Success Videos */}
          <div
            onClick={() => handleExploreClick('questions')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
              मॉक इंटरव्यू व सफलता वीडियो
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              9 वीडियो मास्टरक्लास: सिविल व CS लाइव मॉक इंटरव्यू एवं नौकरी के बाद जीवन में बदलाव।
            </p>
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 pt-1">
              <span>Watch Video Hub</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Resume Hub & ATS */}
          <div
            onClick={() => handleExploreClick('resume')}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 shadow-xs hover:shadow-lg transition-all cursor-pointer space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
              एटीएस रिज्यूमे व स्किल वेरिफिकेशन
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              फैकल्टी द्वारा डिजिटली एंडोर्स्ड स्किल्स (Python, AutoCAD) व करियर डॉक्यूमेंट वर्जनिंग।
            </p>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1">
              <span>Resume Management</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
