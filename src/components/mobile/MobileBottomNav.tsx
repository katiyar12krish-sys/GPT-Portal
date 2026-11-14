'use client';

/**
 * Bottom navigation bar shown on phones (Home, Placements, Student, Jobs, App).
 */
import React from 'react';
import { ActiveScreen } from '../layout/Navbar';
import { useCollege } from '../../context/CollegeContext';
import {
  Home,
  Briefcase,
  GraduationCap,
  Sparkles,
  Smartphone,
  Video,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  onOpenMobileHub: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeScreen,
  onSelectScreen,
  onOpenMobileHub,
}) => {
  const { language, notifications, currentUser } = useCollege();

  const unreadCount = notifications.filter(
    (n) => !n.read && (!n.targetStudentId || n.targetStudentId === currentUser.id)
  ).length;

  const navTabs: Array<{
    id: ActiveScreen | 'mobile_hub';
    labelEn: string;
    labelHi: string;
    icon: React.ComponentType<{ className?: string }>;
    isAction?: boolean;
    badge?: number;
  }> = [
    {
      id: 'overview',
      labelEn: 'Home',
      labelHi: 'होम',
      icon: Home,
    },
    {
      id: 'placement_hub',
      labelEn: 'Placements',
      labelHi: 'प्लेसमेंट',
      icon: Briefcase,
    },
    {
      id: 'student',
      labelEn: 'Student',
      labelHi: 'छात्र',
      icon: GraduationCap,
    },
    {
      id: 'govt_jobs',
      labelEn: 'Jobs',
      labelHi: 'जॉब्स',
      icon: Video,
    },
    {
      id: 'mobile_hub',
      labelEn: 'App Studio',
      labelHi: 'ऐप हब',
      icon: Smartphone,
      isAction: true,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 pt-2 pb-safe transition-colors"
      style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0.6rem))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeScreen;
          const isMobileHubTab = tab.id === 'mobile_hub';

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isMobileHubTab) {
                  onOpenMobileHub();
                } else {
                  onSelectScreen(tab.id as ActiveScreen);
                }
              }}
              className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isMobileHubTab
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                  : isActive
                  ? 'text-cyan-700 dark:text-cyan-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Highlight background pill for active or special button */}
              {isMobileHubTab ? (
                <div className="w-10 h-7 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-0.5 relative">
                  <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              ) : (
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center mb-0.5 transition-all relative ${
                    isActive
                      ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300'
                      : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  {tab.id === 'overview' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
              )}

              <span className="text-[10px] leading-tight font-medium tracking-tight">
                {language === 'hi' ? tab.labelHi : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
