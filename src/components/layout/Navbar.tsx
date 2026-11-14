'use client';

/**
 * Header: government ribbon, college masthead (crest + name), language / contrast / theme buttons, notifications, user card
 * and the scrolling Notices strip. Also exports ActiveScreen (every screen id) and the URL <-> screen helpers.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { Menu } from 'lucide-react';
import { CollegeCrest } from './CollegeCrest';
import { api } from '../../lib/client/api';
import {
  GraduationCap,
  Sun,
  Moon,
  Contrast,
  Bell,
  Cloud,
  CloudOff,
  RefreshCw,
  Home,
  LogOut,
  LogIn,
  Key,
  ShieldCheck,
  Users,
  ChevronLeft,
  Smartphone,
} from 'lucide-react';

export type ActiveScreen =
  | 'overview'
  | 'student'
  | 'excel'
  | 'companies'
  | 'placement_hub'
  | 'questions'
  | 'doubts'
  | 'mocktests'
  | 'assignments'
  | 'faculty'
  | 'admin'
  | 'reminders'
  | 'resume'
  | 'notes'
  | 'library'
  | 'govt_jobs'
  | 'notifications'
  | 'code_explorer'
  // Placement Tracker
  | 'resume_submit'
  | 'placement_qna'
  | 'mock_interview'
  | 'notices_board'
  | 'placement_tracker'
  | 'chat'
  | 'resume_desk'
  | 'placement_guide'
  | 'salary_guide'
  | 'video_lectures'
  | 'faculty_logins'
  | 'student_logins'; // v4.21

/** Every screen – used to map the browser URL (/placement-hub) back to a screen. */
export const ALL_SCREENS: ActiveScreen[] = [
  'overview', 'student', 'excel', 'companies', 'placement_hub', 'questions', 'doubts', 'mocktests', 'assignments',
  'faculty', 'admin', 'reminders', 'resume', 'notes', 'library', 'govt_jobs', 'notifications', 'code_explorer',
  'resume_submit', 'placement_qna', 'mock_interview', 'notices_board', 'placement_tracker', 'chat', 'resume_desk', 'placement_guide', 'salary_guide', 'video_lectures', 'faculty_logins', 'student_logins',
];
export const screenToPath = (s: ActiveScreen) => (s === 'overview' ? '/' : `/${s.replace(/_/g, '-')}`);
export const pathToScreen = (path: string): ActiveScreen => {
  const slug = path.replace(/^\/+|\/+$/g, '').replace(/-/g, '_');
  return (ALL_SCREENS as string[]).includes(slug) ? (slug as ActiveScreen) : 'overview';
};

interface NavbarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  openLoginModal: (role?: 'student' | 'faculty' | 'admin') => void;
  openNotificationDrawer: () => void;
  openCodeExplorer?: () => void;
  openMobileHub?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onSelectScreen,
  openLoginModal,
  openNotificationDrawer,
  openCodeExplorer,
  openMobileHub,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMenu,
}) => {
  const {
    currentUser,
    isLoggedIn,
    loggedInRole,
    loggedStudent,
    primaryStudent,
    logout,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    highContrast,
    toggleHighContrast,
    cloudSyncStatus,
    triggerManualSync,
    lastSyncedTime,
    isOnline,
    notifications,
  } = useCollege();

  const unreadCount = notifications.filter(
    n => !n.read && (!n.targetStudentId || n.targetStudentId === currentUser.id)
  ).length;

  const activeRoll = loggedStudent?.ubterRollNumber || primaryStudent.ubterRollNumber;
  const [showMe, setShowMe] = useState(false);
  const meRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showMe) return;
    const close = (e: MouseEvent) => {
      if (!meRef.current?.contains(e.target as Node)) setShowMe(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showMe]);
  const roleLabel =
    loggedInRole === 'admin'
      ? language === 'hi' ? 'एडमिन (प्रिंसिपल)' : 'Admin (Principal)'
      : loggedInRole === 'faculty'
        ? language === 'hi' ? 'फैकल्टी' : 'Faculty'
        : language === 'hi' ? 'छात्र' : 'Student';
  // Newest job openings posted by the TPO (Job House → Latest openings) also run in the Notices strip.
  const [jobLines, setJobLines] = useState<string[]>([]);
  useEffect(() => {
    if (!isLoggedIn) return setJobLines([]);
    const today = new Date().toISOString().slice(0, 10);
    api('/api/jobposts').then(r => {
      if (r.success)
        setJobLines(
          (r.posts as Array<{ title: string; organisation: string; lastDate: string }>)
            .filter(p => p.lastDate >= today)
            .slice(0, 5)
            .map(p => `${language === 'hi' ? 'नई नौकरी' : 'New job'}: ${p.title} – ${p.organisation} (${language === 'hi' ? 'अंतिम तिथि' : 'last date'} ${p.lastDate})`)
        );
    });
  }, [isLoggedIn, currentUser.id, language]);

  // Newest notices visible to this user; general college lines when there are none.
  const tickerItems = (() => {
    const mine = [
      ...jobLines,
      ...notifications
        .filter(n => !n.targetStudentId || n.targetStudentId === currentUser.id)
        .slice(0, 6)
        .map(n => n.title),
    ];
    if (mine.length) return mine;
    return language === 'hi'
      ? ['प्लेसमेंट ड्राइव और सरकारी नौकरियों की जानकारी जॉब हाउस में', 'अपना रिज्यूमे अपलोड करें और उसका एनालिसिस देखें', 'मॉक इंटरव्यू: 18 प्रश्न पत्र उपलब्ध']
      : ['Placement drives and government jobs are listed in Job House', 'Upload your resume and see its analysis', 'Mock interview: 18 question papers available'];
  })();
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 shadow-sm transition-colors">
      {/* Government ribbon */}
      <div className="px-4 py-1 text-[11px] bg-[#0c1a31] text-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gold-200 truncate">
            {language === 'hi' ? 'उत्तराखंड शासन · प्राविधिक शिक्षा विभाग' : 'Government of Uttarakhand · Department of Technical Education'}
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300 truncate">
            {language === 'hi' ? 'उत्तराखंड प्राविधिक शिक्षा परिषद (UBTER), रुड़की से संबद्ध · AICTE अनुमोदित' : 'Affiliated to UBTER, Roorkee · AICTE approved'}
          </span>
        </div>
        <button
          onClick={triggerManualSync}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
          title={`Data sync: ${cloudSyncStatus} (${lastSyncedTime})`}
        >
          {cloudSyncStatus === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-gold-300" />
          ) : isOnline ? (
            <Cloud className="w-3.5 h-3.5 text-gold-300" />
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="hidden lg:inline">{isOnline ? (language === 'hi' ? 'ऑनलाइन' : 'Online') : language === 'hi' ? 'ऑफ़लाइन' : 'Offline'}</span>
        </button>
      </div>

      {/* College masthead */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {isLoggedIn && (
            <button type="button" onClick={onOpenMenu} aria-label="Open menu" className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onSelectScreen('overview')}
            className="flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer text-left"
            title={language === 'hi' ? 'होम पेज' : 'Home page'}
          >
            <CollegeCrest size={40} className="shrink-0 sm:hidden" />
            <CollegeCrest size={50} className="shrink-0 hidden sm:block" />
            <span className="min-w-0 block">
              <span className="block font-serif font-bold text-[14px] sm:text-base lg:text-lg xl:text-xl text-[#13294b] dark:text-white leading-tight">
                <span className="xl:hidden">{language === 'hi' ? 'UGIP टनकपुर' : 'UGIP Tanakpur'}</span>
                <span className="hidden xl:inline">Uttarakhand Government Institute of Polytechnic, Tanakpur</span>
              </span>
              <span className="hidden xl:block font-serif text-[13px] text-gold-700 dark:text-gold-300 leading-tight truncate">
                उत्तराखंड राजकीय पॉलीटेक्निक संस्थान, टनकपुर (चम्पावत)
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                {language === 'hi' ? 'प्रशिक्षण एवं प्लेसमेंट सेल · संस्थान कोड 090' : 'Training & Placement Cell · Institute Code 090'}
              </span>
            </span>
          </button>

        </div>

        {/* Right Actions: Language, Contrast, Theme, Notifications, User Details & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector */}
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle Language: English / हिंदी"
          >
            {language === 'hi' ? 'English' : 'हिंदी'}
          </button>

          {/* High Contrast */}
          <button
            onClick={toggleHighContrast}
            className={`hidden sm:block p-2 rounded-xl border transition-colors cursor-pointer ${
              highContrast
                ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle High Contrast Mode"
          >
            <Contrast className="w-4 h-4" />
          </button>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={toggleDarkMode}
            className="hidden sm:block p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Notifications Bell with Badge */}
          <button
            onClick={openNotificationDrawer}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications & Academic Reminders"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Details & Logout (When Logged In) */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-700">
              {/* User Avatar & Info */}
              <div ref={meRef} className="relative flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowMe(v => !v)}
                  title={currentUser.name}
                  aria-label={`Logged in as ${currentUser.name}`}
                  aria-expanded={showMe}
                  className="w-9 h-9 rounded-xl bg-[#13294b] text-white flex items-center justify-center font-black text-xs shadow-xs border border-cyan-400/40 cursor-pointer"
                >
                  {userInitials}
                </button>
                {showMe && (
                  <div className="absolute right-0 top-11 z-50 w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl text-left space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">{language === 'hi' ? 'लॉगिन किया है' : 'Logged in as'}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white break-words">{currentUser.name}</p>
                    <p className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{roleLabel}</p>
                    {loggedInRole === 'student' && <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">{`Roll: ${activeRoll}`}</p>}
                    {currentUser.department && <p className="text-xs text-slate-600 dark:text-slate-300">{currentUser.department}</p>}
                    {loggedInRole !== 'student' && currentUser.email && <p className="text-xs text-slate-500 break-all">{currentUser.email}</p>}
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                    {loggedInRole === 'student' ? `${roleLabel} (${activeRoll})` : roleLabel}
                  </span>
                </div>
              </div>

              {/* Distinctive Logout Button */}
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Logout of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            </div>
          ) : (
            /* When NOT Logged In: Role login triggers */
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openLoginModal('student')}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'छात्र लॉगिन' : 'Student Login'}</span>
              </button>
              <button
                onClick={() => openLoginModal('faculty')}
                className="flex px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#13294b] border border-[#13294b] dark:bg-slate-800 dark:text-white text-xs font-bold shadow-xs items-center gap-1 cursor-pointer transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'फैकल्टी लॉगिन' : 'Faculty'}</span>
              </button>
              <button
                onClick={() => openLoginModal('admin')}
                className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-[#13294b] text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'एडमिन' : 'Admin'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gold rule and latest-notices strip, like a college website */}
      <div className="h-[3px] bg-gold-500" />
      <div className="flex items-stretch text-xs bg-cyan-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <span className="shrink-0 px-3 py-1.5 bg-[#13294b] text-gold-200 font-bold uppercase tracking-wide text-[11px] flex items-center">
          {language === 'hi' ? 'सूचनाएँ' : 'Notices'}
        </span>
        <button type="button" onClick={openNotificationDrawer} className="relative flex-1 overflow-hidden text-left cursor-pointer" title={language === 'hi' ? 'सभी सूचनाएँ देखें' : 'Open all notices'}>
          <span className="college-ticker py-1.5 text-[#13294b] dark:text-slate-200 font-semibold">
            {[0, 1].map(copy => (
              <span key={copy} aria-hidden={copy === 1} className="inline-flex">
                {tickerItems.map((t, i) => (
                  <span key={`${copy}-${i}`} className="px-6 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                    {t}
                  </span>
                ))}
              </span>
            ))}
          </span>
        </button>
      </div>
    </header>
  );
};
