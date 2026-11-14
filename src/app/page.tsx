'use client';

/**
 * The main page of the portal. It shows the header (Navbar), side menu (AppSidebar) and ONE screen at a time, chosen by `activeScreen`.
 * The URL follows the screen (/job-house style paths, see screenToPath in Navbar.tsx).
 * To add a new screen: 1) add its id to ActiveScreen + ALL_SCREENS in Navbar.tsx, 2) add a menu item in AppSidebar.tsx,
 * 3) render it below with `{isLoggedIn && activeScreen === 'my_screen' && <MyScreen />}`.
 */
import React, { useState, useEffect } from 'react';
import { CollegeProvider, useCollege } from '../context/CollegeContext';
import { Navbar, ActiveScreen, pathToScreen, screenToPath } from '../components/layout/Navbar';
import { AppSidebar } from '../components/layout/AppSidebar';
import { OuterDashboardsHub } from '../components/dashboards/OuterDashboardsHub';
import { StudentPortfolioScreen } from '../components/student/StudentPortfolioScreen';
import { ClassExcelGeneratorScreen } from '../components/excel/ClassExcelGeneratorScreen';
import { PlacementCompaniesScreen } from '../components/placement/PlacementCompaniesScreen';
import { PlacementQuestionsScreen } from '../components/placement/PlacementQuestionsScreen';
import { PlacementHubScreen } from '../components/placement/PlacementHubScreen';
import { PlacementGuideScreen } from '../components/placement/PlacementGuideScreen';
import { CollegeCrest } from '../components/layout/CollegeCrest';
import { VideoLecturesScreen } from '../components/academic/VideoLecturesScreen';
import { FacultyCredentialsManager } from '../components/auth/FacultyCredentialsManager';
import { StudentLoginsScreen } from '../components/auth/StudentLoginsScreen';
import { JobHouseScreen } from '../components/placement/JobHouseScreen';
import { OnlineQnADoubtsScreen } from '../components/academic/OnlineQnADoubtsScreen';
import { MockTestCentreScreen } from '../components/academic/MockTestCentreScreen';
import { AssignmentReminderTrackerScreen } from '../components/academic/AssignmentReminderTrackerScreen';
import { FacultyPortalScreen } from '../components/faculty/FacultyPortalScreen';
import { AdminVaultScreen } from '../components/admin/AdminVaultScreen';
import { PostLoginDashboard } from '../components/dashboards/PostLoginDashboard';
import { AcademicResourceLibraryScreen } from '../components/academic/AcademicResourceLibraryScreen';
import { ResumeHubScreen } from '../components/student/ResumeHubScreen';
import { ProjectCodeExplorerModal } from '../components/code/ProjectCodeExplorerModal';
import { MobileAppHubModal } from '../components/mobile/MobileAppHubModal';
import { MobileBottomNav } from '../components/mobile/MobileBottomNav';

// Modals
import { LoginModal } from '../components/auth/LoginModal';
import { ForcePasswordChange } from '../components/auth/ForcePasswordChange';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import { KeyboardShortcutsModal } from '../components/accessibility/KeyboardShortcutsModal';
import { SystemActivityLogsModal } from '../components/security/SystemActivityLogsModal';
import { SystemIntegrationsDocModal } from '../components/docs/SystemIntegrationsDocModal';
import { StudentResumeSubmitScreen } from '../components/tracker/StudentResumeSubmitScreen';
import { PlacementQnaPracticeScreen } from '../components/tracker/PlacementQnaPracticeScreen';
import { AiMockInterviewScreen } from '../components/tracker/AiMockInterviewScreen';
import { StudentNoticesScreen } from '../components/tracker/StudentNoticesScreen';
import { ChatScreen } from '../components/tracker/ChatScreen';
import { FacultyPlacementTrackerScreen } from '../components/tracker/FacultyPlacementTrackerScreen';
import { LanguageSync } from '../components/ui/LanguageSync';
import { NoticeLockGuard } from '../components/tracker/NoticeLockGuard';
import { ArrowLeft, Lock, GraduationCap, Users, ShieldCheck, FolderTree } from 'lucide-react';

const PortalMainContent: React.FC = () => {
  const {
    language,
    darkMode,
    highContrast,
    toggleDarkMode,
    toggleHighContrast,
    isLoggedIn,
    loggedInRole,
    currentUser,
    logout,
    authReady,
  } = useCollege();

  // Active Screen state
  // Read straight from the URL (the first render is the "Loading" screen, so this can't cause a hydration mismatch).
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() =>
    typeof window === 'undefined' ? 'overview' : pathToScreen(window.location.pathname)
  );

  // URL ↔ screen: every page has its own address (/placement-hub, /placement-qna …),
  // so a reload opens the same page and the browser Back / Forward buttons work.
  useEffect(() => {
    const onPop = () => setActiveScreen(pathToScreen(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    const path = screenToPath(activeScreen);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
    document.getElementById('main-content')?.scrollTo({ top: 0 });
    // /notifications is a drawer, not a page
    if (activeScreen === 'notifications') {
      setIsNotifDrawerOpen(true);
      setActiveScreen('overview');
    }
  }, [activeScreen]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRoleTarget, setLoginRoleTarget] = useState<'student' | 'faculty' | 'admin' | undefined>(undefined);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isActivityLogsModalOpen, setIsActivityLogsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isCodeExplorerModalOpen, setIsCodeExplorerModalOpen] = useState(false);
  const [isMobileHubOpen, setIsMobileHubOpen] = useState(false);

  const openLoginForRole = (role?: 'student' | 'faculty' | 'admin') => {
    setLoginRoleTarget(role);
    setIsLoginModalOpen(true);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Escape') {
          setIsLoginModalOpen(false);
          setIsForgotModalOpen(false);
          setIsNotifDrawerOpen(false);
          setIsShortcutsModalOpen(false);
          setIsActivityLogsModalOpen(false);
          setIsDocsModalOpen(false);
          setIsCodeExplorerModalOpen(false);
          setIsMobileHubOpen(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        setIsLoginModalOpen(false);
        setIsForgotModalOpen(false);
        setIsNotifDrawerOpen(false);
        setIsShortcutsModalOpen(false);
        setIsActivityLogsModalOpen(false);
        setIsDocsModalOpen(false);
        setIsCodeExplorerModalOpen(false);
        setIsMobileHubOpen(false);
      } else if (e.altKey && e.key === '0') {
        e.preventDefault();
        setActiveScreen('overview');
      } else if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        toggleDarkMode();
      } else if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        toggleHighContrast();
      } else if (e.altKey && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDarkMode, toggleHighContrast]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-sm font-semibold">
        Loading UGIP Tanakpur Portal…
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        highContrast
          ? 'bg-black text-white'
          : darkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Skip to Main Content Link for WCAG Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-xl"
      >
        Skip to Main Content
      </a>

      {/* Top Navbar */}
      <Navbar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        openLoginModal={openLoginForRole}
        openNotificationDrawer={() => setIsNotifDrawerOpen(true)}
        openCodeExplorer={() => setIsCodeExplorerModalOpen(true)}
        openMobileHub={() => setIsMobileHubOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {/* App Body with Sidebar (Side navigation when logged in or navigating sub-dashboards) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* SIDEBAR NAVIGATION: Only displayed when user is logged in, with role-based navigation */}
        {isLoggedIn && (
          <AppSidebar
            activeScreen={activeScreen}
            mobileOpen={menuOpen}
            onCloseMobile={() => setMenuOpen(false)}
            onSelectScreen={(screen) => {
              setMenuOpen(false);
              if (screen === 'code_explorer') {
                setIsCodeExplorerModalOpen(true);
              } else if (screen === 'notifications') {
                setIsNotifDrawerOpen(true);
              } else {
                setActiveScreen(screen);
              }
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onOpenCodeExplorer={() => setIsCodeExplorerModalOpen(true)}
          />
        )}

        {/* Main Content Viewport */}
        <main id="main-content" className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-y-auto pb-24 md:pb-6">
          {/* Pending-notice banner + 3-reminder portal lock (students only) */}
          {isLoggedIn && loggedInRole === 'student' && <NoticeLockGuard onOpenNotices={() => setActiveScreen('notices_board')} />}

          {/* Universal '← Go to Home Page / Overview' button on top of every sub-screen */}
          {activeScreen !== 'overview' && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setActiveScreen('overview')}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-500" />
                <span>{language === 'hi' ? '← मुख्य होम पेज / ओवरव्यू पर जाएं' : '← Go to Home Page / Overview'}</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                {isLoggedIn ? (
                  <span className="font-bold text-slate-500 hidden sm:inline">
                    Session: <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({loggedInRole?.toUpperCase()})
                  </span>
                ) : (
                  <button
                    onClick={() => openLoginForRole()}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {language === 'hi' ? 'लॉगिन करें' : 'Sign In'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeScreen === 'overview' && (
            isLoggedIn ? (
              <PostLoginDashboard
                onNavigateToScreen={setActiveScreen}
                onOpenCodeExplorer={() => setIsCodeExplorerModalOpen(true)}
              />
            ) : (
              <OuterDashboardsHub
                onNavigateToScreen={setActiveScreen}
                openLoginModal={openLoginForRole}
              />
            )
          )}

          {/* Access Guard: When NOT logged in and attempting to open any internal dashboard, strictly block and show security lock screen! */}
          {!isLoggedIn && activeScreen !== 'overview' && (
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-rose-500/40 shadow-xl text-center space-y-6 max-w-2xl mx-auto my-8 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  {language === 'hi' ? 'गोपनीय डेटा सुरक्षा द्वार' : 'Institutional Security Gate'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {language === 'hi'
                    ? 'कृपया पहले लॉगिन करें (प्रवेश प्रतिबंधित)'
                    : 'Authentication Required (Portal Locked)'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {language === 'hi'
                    ? 'संस्थान सुरक्षा नीति: छात्र डेटा, 1st-4th सेमेस्टर अंक, फैकल्टी मूल्यांकन एवं प्रशासनिक रिकॉर्ड्स पूर्णतः प्राइवेट हैं। बिना लॉगिन के कोई भी डेटा देखना निषिद्ध है।'
                    : 'Institutional Policy: Student dossiers, semester scorecards, faculty evaluations, and administrative ledgers are strictly confidential. Please log in with your credentials to access this dashboard.'}
                </p>
              </div>

              {/* 3 Direct Login Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => openLoginForRole('student')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{language === 'hi' ? 'छात्र लॉगिन करें' : 'Student Login'}</span>
                </button>
                <button
                  onClick={() => openLoginForRole('faculty')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{language === 'hi' ? 'फैकल्टी लॉगिन करें' : 'Faculty Login'}</span>
                </button>
                <button
                  onClick={() => openLoginForRole('admin')}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 text-amber-400 text-xs font-black shadow-md border border-amber-500/30 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'hi' ? 'एडमिन लॉगिन' : 'Admin Login'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveScreen('overview')}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline"
                >
                  {language === 'hi' ? '← मुख्य होम पेज / ओवरव्यू पर वापस जाएं' : '← Return to Main Overview Portal'}
                </button>
              </div>
            </div>
          )}

          {/* Protected Sub-Screens: Render ONLY when user is authenticated! */}
          {isLoggedIn && activeScreen === 'student' && (
            <StudentPortfolioScreen
              onOpenMockTest={() => setActiveScreen('mocktests')}
              onOpenExcelExport={() => setActiveScreen('excel')}
            />
          )}

          {isLoggedIn && activeScreen === 'resume' && (
            <ResumeHubScreen onBackToOverview={() => setActiveScreen('overview')} />
          )}

          {isLoggedIn && (activeScreen === 'notes' || activeScreen === 'library') && (
            <AcademicResourceLibraryScreen />
          )}

          {isLoggedIn && (activeScreen === 'assignments' || activeScreen === 'reminders') && (
            <AssignmentReminderTrackerScreen />
          )}

          {isLoggedIn && activeScreen === 'excel' && loggedInRole !== 'student' && (
            <ClassExcelGeneratorScreen />
          )}

          {isLoggedIn && activeScreen === 'companies' && (
            <PlacementCompaniesScreen onOpenQuestionsHub={() => setActiveScreen('questions')} />
          )}

          {isLoggedIn && activeScreen === 'placement_hub' && (
            <PlacementHubScreen
              onOpenCoreRecruiters={() => setActiveScreen('companies')}
              onOpenMockTests={() => setActiveScreen('mocktests')}
              onOpenGovtJobs={() => setActiveScreen('govt_jobs')}
              onOpenResumeHub={() => setActiveScreen('resume')}
            />
          )}

          {isLoggedIn && activeScreen === 'govt_jobs' && (
            <JobHouseScreen
              onPractice={(section, subject) => {
                try {
                  sessionStorage.setItem('qna_open', JSON.stringify([section, subject]));
                } catch {
                  // storage blocked: the Q&A page just opens at its first section
                }
                setActiveScreen('placement_qna');
              }}
            />
          )}

          {isLoggedIn && activeScreen === 'questions' && (
            <PlacementQuestionsScreen />
          )}

          {isLoggedIn && activeScreen === 'doubts' && (
            <OnlineQnADoubtsScreen />
          )}

          {isLoggedIn && activeScreen === 'mocktests' && (
            <MockTestCentreScreen onOpenQna={() => setActiveScreen('placement_qna')} />
          )}

          {isLoggedIn && activeScreen === 'code_explorer' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/30">
                <div>
                  <h3 className="font-black text-lg text-white">Project Code & Folder Architecture Explorer</h3>
                  <p className="text-xs text-slate-300">Browse through folders inside folders to inspect complete LMS source code.</p>
                </div>
                <button
                  onClick={() => setIsCodeExplorerModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
                >
                  Open Fullscreen Explorer
                </button>
              </div>
              <PostLoginDashboard
                onNavigateToScreen={setActiveScreen}
                onOpenCodeExplorer={() => setIsCodeExplorerModalOpen(true)}
              />
            </div>
          )}

          {isLoggedIn && activeScreen === 'faculty' && (
            <FacultyPortalScreen />
          )}

          {isLoggedIn && activeScreen === 'admin' && (
            <AdminVaultScreen />
          )}

          {/* Placement Tracker */}
          {isLoggedIn && activeScreen === 'resume_submit' && <StudentResumeSubmitScreen />}
          {isLoggedIn && activeScreen === 'placement_qna' && <PlacementQnaPracticeScreen onOpenGovtJobs={() => setActiveScreen('govt_jobs')} onOpenMockTests={() => setActiveScreen('mocktests')} />}
          {isLoggedIn && activeScreen === 'mock_interview' && <AiMockInterviewScreen />}
          {isLoggedIn && activeScreen === 'notices_board' && <StudentNoticesScreen />}
          {isLoggedIn && activeScreen === 'chat' && <ChatScreen />}
          {isLoggedIn && activeScreen === 'video_lectures' && <VideoLecturesScreen />}
          {isLoggedIn && activeScreen === 'faculty_logins' && <FacultyCredentialsManager />}
          {isLoggedIn && activeScreen === 'student_logins' && <StudentLoginsScreen />}
          {isLoggedIn && activeScreen === 'placement_guide' && <PlacementGuideScreen part="guidance" onSwitch={() => setActiveScreen('salary_guide')} />}
          {isLoggedIn && activeScreen === 'salary_guide' && <PlacementGuideScreen part="salary" onSwitch={() => setActiveScreen('placement_guide')} />}
          {isLoggedIn && activeScreen === 'resume_desk' &&
            (loggedInRole !== 'student' ? <FacultyPlacementTrackerScreen key="resume_desk" initialTab="resumes" /> : <StudentResumeSubmitScreen />)}
          {isLoggedIn && activeScreen === 'placement_tracker' &&
            (loggedInRole !== 'student' ? (
              <FacultyPlacementTrackerScreen />
            ) : (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                The Student Placement Tracker is for faculty and admin. Your own progress is in Placement Q&A, Mock Interview and Send Resume.
              </div>
            ))}
        </main>
      </div>

      {/* Official Footer with Governance & Security Specs */}
      <footer className="mt-auto bg-[#13294b] text-slate-300 text-xs border-t-4 border-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CollegeCrest size={44} />
              <div>
                <p className="font-serif font-bold text-base text-white leading-tight">Uttarakhand Government Institute of Polytechnic, Tanakpur</p>
                <p className="font-serif text-gold-200 text-[13px]">उत्तराखंड राजकीय पॉलीटेक्निक संस्थान, टनकपुर</p>
              </div>
            </div>
            <p>Tanakpur, District Champawat, Uttarakhand</p>
            <p>Affiliated to UBTER, Roorkee · AICTE approved · Institute Code 090</p>
            <p className="text-gold-200 font-semibold">Training & Placement Cell</p>
          </div>

          <div className="space-y-2">
            <p className="font-serif font-bold text-sm text-white">{language === 'hi' ? 'त्वरित लिंक' : 'Quick links'}</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {(
                [
                  ['overview', 'Home', 'होम'],
                  ['govt_jobs', 'Job House', 'जॉब हाउस'],
                  ['salary_guide', 'Salary Guide', 'सैलरी गाइड'],
                  ['placement_guide', 'Placement Guidance', 'प्लेसमेंट गाइडेंस'],
                  ['placement_qna', 'Placement Q&A', 'प्लेसमेंट Q&A'],
                  ['chat', 'College Chat', 'कॉलेज चैट'],
                ] as Array<[ActiveScreen, string, string]>
              ).map(([id, en, hi]) => (
                <li key={id}>
                  <button
                    onClick={() => (isLoggedIn || id === 'overview' ? setActiveScreen(id) : openLoginForRole('student'))}
                    className="hover:text-gold-200 hover:underline cursor-pointer"
                  >
                    {language === 'hi' ? hi : en}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-serif font-bold text-sm text-white">{language === 'hi' ? 'आधिकारिक वेबसाइटें' : 'Official websites'}</p>
            <ul className="space-y-1.5">
              {[
                ['UBTER (exams & results)', 'https://ubter.in/'],
                ['AICTE', 'https://www.aicte-india.org/'],
                ['NATS apprenticeship', 'https://nats.education.gov.in/'],
                ['UKSSSC', 'https://sssc.uk.gov.in/'],
                ['UKPSC', 'https://psc.uk.gov.in/'],
              ].map(([l, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-gold-200 hover:underline">
                    {l} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>{`© ${new Date().getFullYear()} Uttarakhand Government Institute of Polytechnic, Tanakpur`}</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {loggedInRole === 'admin' && (
                <button onClick={() => setIsCodeExplorerModalOpen(true)} className="hover:text-white cursor-pointer flex items-center gap-1">
                  <FolderTree className="w-3.5 h-3.5" /> Code & folders
                </button>
              )}
              <button onClick={() => setIsDocsModalOpen(true)} className="hover:text-white cursor-pointer">
                Security & deployment
              </button>
              {isLoggedIn && loggedInRole !== 'student' && (
                <button onClick={() => setIsActivityLogsModalOpen(true)} className="hover:text-white cursor-pointer">
                  Activity log
                </button>
              )}
              <button onClick={() => setIsMobileHubOpen(true)} className="hover:text-white cursor-pointer">
                Mobile app
              </button>
              <button onClick={() => setIsShortcutsModalOpen(true)} className="hover:text-white cursor-pointer">
                Keyboard shortcuts
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Popups */}
      <LoginModal
        key={loginRoleTarget ?? 'any'}
        isOpen={isLoginModalOpen}
        role={loginRoleTarget}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <SystemActivityLogsModal
        isOpen={isActivityLogsModalOpen}
        onClose={() => setIsActivityLogsModalOpen(false)}
      />

      <SystemIntegrationsDocModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* Project Code & Folder Structure Explorer Modal ("sare parts ka folder ke andar folder code") */}
      <ProjectCodeExplorerModal
        isOpen={isCodeExplorerModalOpen}
        onClose={() => setIsCodeExplorerModalOpen(false)}
      />

      {/* Mobile App & Android Studio Hub Modal */}
      <MobileAppHubModal
        isOpen={isMobileHubOpen}
        onClose={() => setIsMobileHubOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Active on Mobile Phones & Touch Devices) */}
      <MobileBottomNav
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        onOpenMobileHub={() => setIsMobileHubOpen(true)}
      />

      <ForcePasswordChange />
    </div>
  );
};

export default function Home() {
  return (
    <CollegeProvider>
      <LanguageSync />
      <PortalMainContent />
    </CollegeProvider>
  );
}
