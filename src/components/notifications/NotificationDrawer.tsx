'use client';

/**
 * Notification drawer opened from the bell icon or the Notices strip: alerts for this user, mark as read.
 */
import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  Bell,
  CheckCheck,
  GraduationCap,
  FileText,
  Clock,
  X,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, language, currentUser } = useCollege();

  if (!isOpen) return null;

  // Filter: show notifications targeting all OR specifically this user
  const relevantNotifications = notifications.filter(
    n => !n.targetStudentId || n.targetStudentId === currentUser.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'hi' ? 'सूचनाएं एवं रिमाइंडर' : 'Notifications & Reminders'}
              </h3>
              <p className="text-xs text-slate-500">
                {relevantNotifications.filter(n => !n.read).length} unread alerts
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Timeline Alerts
            </span>
            <button
              onClick={markAllNotificationsRead}
              className="text-emerald-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {relevantNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.read
                    ? 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-500'
                    : 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 mt-0.5">
                    {notif.type === 'assignment_reminder' ? (
                      <Clock className="w-4 h-4 text-amber-500" />
                    ) : notif.type === 'security' ? (
                      <Lock className="w-4 h-4 text-indigo-500" />
                    ) : notif.type === 'placement' ? (
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Bell className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {relevantNotifications.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                No notifications right now.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
