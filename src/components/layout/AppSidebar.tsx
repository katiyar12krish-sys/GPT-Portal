'use client';

/**
 * Side menu, grouped into folders (Home, Resume, Guidance & Salary, Placement Tracker, Placement, Academics, Administration, System).
 * Each role has its own list: studentNavItems, facultyNavItems, adminNavItems. GROUP_OF decides the folder of each screen.
 * To add a menu item: add it to the role's list and give its screen a folder in GROUP_OF.
 */
import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { ActiveScreen } from './Navbar';
import {
  GraduationCap,
  FileSpreadsheet,
  Briefcase,
  BookOpen,
  HelpCircle,
  Award,
  Clock,
  BarChart3,
  Users,
  ShieldCheck,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BellRing,
  FileText,
  Bookmark,
  CalendarDays,
  Bell,
  Code2,
  FolderTree,
  Sparkles,
  Video,
  Building2,
  LayoutGrid,
  Folder,
  FolderOpen,
  Upload,
  ListChecks,
  Bot,
  Megaphone,
  MessageCircle,
  Activity,
  Compass,
  IndianRupee,
  PlayCircle,
  KeyRound,
} from 'lucide-react';

// Sidebar is grouped like a project folder tree (src/…) – each item belongs to one folder.
type NavGroup = 'home' | 'resume' | 'guide' | 'placement' | 'tracker' | 'academics' | 'admin' | 'system';
const GROUPS: Array<{ id: NavGroup; en: string; hi: string }> = [
  { id: 'home', en: 'Home', hi: 'होम' },
  { id: 'resume', en: 'Resume', hi: 'रिज्यूमे' },
  { id: 'guide', en: 'Guidance & Salary', hi: 'गाइडेंस व सैलरी' },
  { id: 'tracker', en: 'Placement Tracker', hi: 'प्लेसमेंट ट्रैकर' },
  { id: 'placement', en: 'Placement', hi: 'प्लेसमेंट' },
  { id: 'academics', en: 'Academics', hi: 'अकादमिक' },
  { id: 'admin', en: 'Administration', hi: 'प्रशासन' },
  { id: 'system', en: 'System', hi: 'सिस्टम' },
];
const GROUP_OF: Partial<Record<ActiveScreen, NavGroup>> = {
  overview: 'home',
  placement_hub: 'placement', companies: 'placement', govt_jobs: 'placement', questions: 'placement', resume: 'resume',
  resume_submit: 'resume', placement_qna: 'tracker', mock_interview: 'tracker', notices_board: 'tracker', placement_tracker: 'tracker', resume_desk: 'resume', placement_guide: 'guide', salary_guide: 'guide', chat: 'home', video_lectures: 'home',
  student: 'academics', mocktests: 'academics', notes: 'academics',
  assignments: 'academics', reminders: 'academics', doubts: 'academics', excel: 'academics',
  admin: 'admin', faculty: 'admin', faculty_logins: 'admin', student_logins: 'admin',
  notifications: 'system', code_explorer: 'system',
};

interface AppSidebarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCodeExplorer?: () => void;
  /** Phones: the sidebar is a slide-in menu instead of a fixed column. */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeScreen,
  onSelectScreen,
  collapsed: collapsedProp,
  onToggleCollapse,
  onOpenCodeExplorer,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const collapsed = collapsedProp && !mobileOpen;
  const { currentUser, logout, language, loggedInRole, loggedStudent, primaryStudent } = useCollege();

  const activeRoll = loggedStudent?.ubterRollNumber || primaryStudent.ubterRollNumber;
  const activeYear = loggedStudent?.currentYear || primaryStudent.currentYear;
  const activeBranch = (loggedStudent?.branch || primaryStudent.branch).split(' ')[0] || 'CSE';

  // Role-based sidebar menu items covering all requested LMS modules
  const studentNavItems: Array<{ id: ActiveScreen; labelHi: string; labelEn: string; icon: any; highlight?: boolean }> = [
    { id: 'overview', labelHi: 'डैशबोर्ड', labelEn: 'Dashboard', icon: Home, highlight: true },
    { id: 'chat', labelHi: 'कॉलेज चैट (ग्रुप व मैसेज)', labelEn: 'College Chat', icon: MessageCircle, highlight: true },
    { id: 'video_lectures', labelHi: 'वीडियो लेक्चर', labelEn: 'Video Lectures', icon: PlayCircle, highlight: true },
    { id: 'placement_guide', labelHi: 'प्लेसमेंट गाइडेंस', labelEn: 'Placement Guidance', icon: Compass, highlight: true },
    { id: 'salary_guide', labelHi: 'सैलरी गाइड', labelEn: 'Salary Guide', icon: IndianRupee, highlight: true },
    { id: 'placement_hub', labelHi: 'प्लेसमेंट हब (कंपनी • Q&A • मेंटर)', labelEn: 'Placement Hub', icon: LayoutGrid, highlight: true },
    { id: 'companies', labelHi: '24 कोर रिक्रूटर्स ड्राइव्स', labelEn: '24 Core Recruiters', icon: Briefcase, highlight: true },
    { id: 'govt_jobs', labelHi: 'जॉब हाउस (सरकारी • प्राइवेट)', labelEn: 'Job House (Govt • Private)', icon: Briefcase, highlight: true },
    { id: 'resume', labelHi: 'रिज्यूमे हब व एटीएस', labelEn: 'Resume Hub & ATS', icon: FileText, highlight: true },
    { id: 'resume_submit', labelHi: 'रिज्यूमे भेजें व एनालिसिस', labelEn: 'Send Resume & Analysis', icon: Upload, highlight: true },
    { id: 'placement_qna', labelHi: 'प्लेसमेंट Q&A', labelEn: 'Placement Q&A', icon: ListChecks, highlight: true },
    { id: 'mock_interview', labelHi: 'मॉक इंटरव्यू (वॉइस • वीडियो • पैनल)', labelEn: 'Mock Interview (Voice • Video • Panel)', icon: Bot, highlight: true },
    { id: 'notices_board', labelHi: 'फैकल्टी नोटिस', labelEn: 'Faculty Notices', icon: Megaphone, highlight: true },
    { id: 'student', labelHi: 'छात्र प्रोफाइल', labelEn: 'Student Profile', icon: GraduationCap },
    { id: 'mocktests', labelHi: 'मॉक टेस्ट सेंटर', labelEn: 'Mock Test Centre', icon: Award, highlight: true },
    { id: 'notes', labelHi: 'अकादमिक रिसोर्स लाइब्रेरी', labelEn: 'Resource Library', icon: Bookmark },
    { id: 'assignments', labelHi: 'असाइनमेंट ट्रैकर', labelEn: 'Assignments & Reminders', icon: Clock },
    { id: 'doubts', labelHi: 'ऑनलाइन Q&A एवं डाउट्स', labelEn: 'Online Q&A', icon: HelpCircle },
    { id: 'notifications', labelHi: 'नोटिस व अलर्ट्स', labelEn: 'Notifications', icon: Bell },
  ];

  const facultyNavItems: Array<{ id: ActiveScreen; labelHi: string; labelEn: string; icon: any; highlight?: boolean }> = [
    { id: 'overview', labelHi: 'डैशबोर्ड', labelEn: 'Dashboard', icon: Home, highlight: true },
    { id: 'chat', labelHi: 'कॉलेज चैट (ग्रुप व मैसेज)', labelEn: 'College Chat', icon: MessageCircle, highlight: true },
    { id: 'video_lectures', labelHi: 'वीडियो लेक्चर', labelEn: 'Video Lectures', icon: PlayCircle, highlight: true },
    { id: 'placement_guide', labelHi: 'प्लेसमेंट गाइडेंस', labelEn: 'Placement Guidance', icon: Compass, highlight: true },
    { id: 'salary_guide', labelHi: 'सैलरी गाइड', labelEn: 'Salary Guide', icon: IndianRupee, highlight: true },
    { id: 'placement_hub', labelHi: 'प्लेसमेंट हब (कंपनी • Q&A • मेंटर)', labelEn: 'Placement Hub', icon: LayoutGrid, highlight: true },
    { id: 'companies', labelHi: 'प्लेसमेंट व रिक्रूटर्स ड्राइव्स', labelEn: 'Recruiters & Drives', icon: Briefcase, highlight: true },
    { id: 'govt_jobs', labelHi: 'जॉब हाउस (सरकारी • प्राइवेट)', labelEn: 'Job House (Govt • Private)', icon: Briefcase, highlight: true },
    { id: 'placement_tracker', labelHi: 'छात्र प्लेसमेंट ट्रैकर', labelEn: 'Student Placement Tracker', icon: Activity, highlight: true },
    { id: 'resume_desk', labelHi: 'छात्रों के रिज्यूमे', labelEn: 'Student Resumes', icon: Upload, highlight: true },
    { id: 'student_logins', labelHi: 'छात्र सूची व लॉगिन', labelEn: 'Student List & Logins', icon: KeyRound, highlight: true },
    { id: 'resume', labelHi: 'रिज्यूमे हब व सैंपल', labelEn: 'Resume Hub & Samples', icon: FileText, highlight: true },
    { id: 'placement_qna', labelHi: 'प्लेसमेंट Q&A', labelEn: 'Placement Q&A', icon: ListChecks, highlight: true },
    { id: 'faculty', labelHi: 'फैकल्टी अंक प्रबंधन (RBAC)', labelEn: 'Subject Marks (RBAC)', icon: Users, highlight: true },
    { id: 'student', labelHi: 'छात्र प्रोफाइल व स्किल सत्यापन', labelEn: 'Student Verification', icon: GraduationCap, highlight: true },
    { id: 'notes', labelHi: 'अकादमिक रिसोर्स लाइब्रेरी', labelEn: 'Resource Library', icon: Bookmark },
    { id: 'assignments', labelHi: 'असाइनमेंट डेडलाइन', labelEn: 'Assignments & Reminders', icon: Clock },
    { id: 'excel', labelHi: 'क्लास एक्सेल शीट्स', labelEn: 'Class Excel Sheets', icon: FileSpreadsheet },
    { id: 'doubts', labelHi: 'छात्र डाउट्स Q&A', labelEn: 'Online Q&A', icon: HelpCircle },
    { id: 'notifications', labelHi: 'विभागीय नोटिस', labelEn: 'Notifications', icon: Bell },
  ];

  const adminNavItems: Array<{ id: ActiveScreen; labelHi: string; labelEn: string; icon: any; highlight?: boolean }> = [
    { id: 'overview', labelHi: 'डैशबोर्ड', labelEn: 'Dashboard', icon: Home, highlight: true },
    { id: 'chat', labelHi: 'कॉलेज चैट (ग्रुप व मैसेज)', labelEn: 'College Chat', icon: MessageCircle, highlight: true },
    { id: 'video_lectures', labelHi: 'वीडियो लेक्चर', labelEn: 'Video Lectures', icon: PlayCircle, highlight: true },
    { id: 'admin', labelHi: 'एडमिन सेटिंग्स', labelEn: 'Admin Settings', icon: ShieldCheck, highlight: true },
    { id: 'placement_tracker', labelHi: 'छात्र प्लेसमेंट ट्रैकर', labelEn: 'Student Placement Tracker', icon: Activity, highlight: true },
    { id: 'resume_desk', labelHi: 'छात्रों के रिज्यूमे', labelEn: 'Student Resumes', icon: Upload, highlight: true },
    { id: 'resume', labelHi: 'रिज्यूमे हब व सैंपल', labelEn: 'Resume Hub & Samples', icon: FileText, highlight: true },
    { id: 'placement_qna', labelHi: 'प्लेसमेंट Q&A', labelEn: 'Placement Q&A', icon: ListChecks, highlight: true },
    { id: 'placement_guide', labelHi: 'प्लेसमेंट गाइडेंस', labelEn: 'Placement Guidance', icon: Compass, highlight: true },
    { id: 'salary_guide', labelHi: 'सैलरी गाइड', labelEn: 'Salary Guide', icon: IndianRupee, highlight: true },
    { id: 'placement_hub', labelHi: 'प्लेसमेंट हब (कंपनी • Q&A • मेंटर)', labelEn: 'Placement Hub', icon: LayoutGrid, highlight: true },
    { id: 'companies', labelHi: '24 रिक्रूटर्स व ड्राइव्स', labelEn: 'Recruiters & Drives', icon: Briefcase, highlight: true },
    { id: 'govt_jobs', labelHi: 'जॉब हाउस (सरकारी • प्राइवेट)', labelEn: 'Job House (Govt • Private)', icon: Briefcase, highlight: true },
    { id: 'student', labelHi: 'सभी छात्र प्रोफाइल', labelEn: 'Student Profiles', icon: GraduationCap },
    { id: 'excel', labelHi: 'कक्षा एक्सेल शीट जनरेटर', labelEn: 'Class Excel Sheets', icon: FileSpreadsheet, highlight: true },
    { id: 'student_logins', labelHi: 'छात्र सूची व लॉगिन', labelEn: 'Student List & Logins', icon: KeyRound, highlight: true },
    { id: 'faculty_logins', labelHi: 'फैकल्टी सूची व लॉगिन', labelEn: 'Faculty List & Logins', icon: KeyRound, highlight: true },
    { id: 'faculty', labelHi: 'फैकल्टी रोस्टर व RBAC', labelEn: 'Faculty Roster', icon: Users },
    { id: 'notes', labelHi: 'अकादमिक रिसोर्स लाइब्रेरी', labelEn: 'Resource Library', icon: Bookmark },
    { id: 'assignments', labelHi: 'असाइनमेंट अलर्ट्स', labelEn: 'Assignments & Reminders', icon: Clock },
    { id: 'notifications', labelHi: 'ब्रॉडकास्ट नोटिस', labelEn: 'Notifications', icon: Bell },
    { id: 'code_explorer', labelHi: 'प्रोजेक्ट कोड एक्सप्लोरर', labelEn: 'Code & Folders Hub', icon: FolderTree, highlight: true },
  ];

  // Compact: only the folder of the current page is open; others open on click.
  const activeGroup: NavGroup = GROUP_OF[activeScreen] ?? 'home';
  const [openGroups, setOpenGroups] = React.useState<NavGroup[]>(['home', 'resume', 'guide', activeGroup]);
  React.useEffect(() => {
    setOpenGroups(g => (g.includes(activeGroup) ? g : [...g, activeGroup]));
  }, [activeGroup]);

  const renderItem = (item: { id: ActiveScreen; labelHi: string; labelEn: string; icon: any; highlight?: boolean }) => {
    const Icon = item.icon;
    const isActive = activeScreen === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onSelectScreen(item.id)}
        className={`w-full px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-3 ${
          isActive
            ? 'bg-[#13294b] text-[#ffffff] font-bold dark:bg-cyan-900/60'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`}
        title={language === 'hi' ? item.labelHi : item.labelEn}
      >
        <div
          className={`p-1 rounded-md transition-colors shrink-0 ${
            isActive
              ? 'bg-white/20 text-cyan-300'
              : item.highlight
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {!collapsed && (
          <div className="text-left flex-1 truncate">
            <span className="block truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
          </div>
        )}

      </button>
    );
  };

  const navItems = loggedInRole === 'admin'
    ? adminNavItems
    : loggedInRole === 'faculty'
    ? facultyNavItems
    : studentNavItems;

  return (
    <>
    {mobileOpen && <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" onClick={onCloseMobile} aria-hidden="true" />}
    <aside
      className={`shrink-0 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${mobileOpen ? 'fixed inset-y-0 left-0 z-[70] flex shadow-xl' : 'hidden md:flex z-40'} flex-col justify-between select-none ${
        collapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* Sidebar Top: User Role Card & Collapse Toggle */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-600 dark:text-cyan-400">
                {loggedInRole === 'admin'
                  ? 'ADMINISTRATION'
                  : loggedInRole === 'faculty'
                  ? 'FACULTY'
                  : 'STUDENT PORTAL'}
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </h4>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer mx-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && loggedInRole === 'student' && (
          <div className="p-2.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-800/40 text-[11px] space-y-0.5">
            <div className="font-mono font-bold text-slate-900 dark:text-white">
              Roll: {activeRoll}
            </div>
            <div className="text-cyan-800 dark:text-cyan-300 font-semibold truncate">
              {activeYear} • {activeBranch}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin text-[14px] font-semibold">
        {GROUPS.map(group => {
          const items = navItems.filter(i => (GROUP_OF[i.id] ?? 'system') === group.id);
          if (!items.length) return null;
          const isOpen = openGroups.includes(group.id);
          return (
            <div key={group.id} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => setOpenGroups(g => (isOpen ? g.filter(x => x !== group.id) : [...g, group.id]))}
                  className="w-full px-2.5 py-2 rounded-lg flex items-center gap-2 text-[15px] font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isOpen ? <FolderOpen className="w-5 h-5 text-cyan-600" /> : <Folder className="w-5 h-5 text-cyan-600" />}
                  <span>{language === 'hi' ? group.hi : group.en}</span>
                  <span className="ml-auto text-xs font-semibold text-slate-400">{items.length} {isOpen ? '▾' : '▸'}</span>
                </button>
              )}
              {(isOpen || collapsed) && (
                <div className={collapsed ? 'space-y-1' : 'ml-4 pl-2 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 pb-1'}>
                  {items.map(renderItem)}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Bottom: Return to Home / Logout Button */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          onClick={() => onSelectScreen('overview')}
          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-cyan-600" />
          {!collapsed && <span>{language === 'hi' ? 'डैशबोर्ड होम' : 'Dashboard Home'}</span>}
        </button>

        <button
          onClick={logout}
          className="w-full p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && <span>{language === 'hi' ? 'लॉगआउट करें' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

