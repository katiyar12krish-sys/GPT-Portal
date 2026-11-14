'use client';

import React from 'react';
import { BellRing, Lock } from 'lucide-react';
import { usePlacementTracker } from '../../hooks/usePlacementTracker';
import type { StudentNoticeView } from '../../lib/tracker/types';
import { MAX_NOTICE_REMINDERS } from '../../lib/tracker/types';
import { NoticeCard } from './StudentNoticesScreen';

/**
 * Student-only. Shows a reminder banner for pending notices and, once a notice has had
 * 3 reminders without being completed, locks the whole portal until it is done
 * (or a faculty member unlocks it from the Placement Tracker).
 */
export const NoticeLockGuard: React.FC<{ onOpenNotices: () => void }> = ({ onOpenNotices }) => {
  const { data, post } = usePlacementTracker();
  const notices = data.notices as StudentNoticeView[];
  const locked = notices.filter(n => n.locked);
  const reminded = notices.filter(n => !n.done && !n.locked && n.remindersSent > 0);

  if (locked.length) {
    return (
      <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
          <div className="p-4 rounded-2xl bg-rose-600 text-white flex gap-3 items-start">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-sm">Portal locked – {MAX_NOTICE_REMINDERS} reminders missed</div>
              <p className="text-xs text-rose-100">Complete the notice below to unlock. Your faculty has been informed.</p>
            </div>
          </div>
          {locked.map(n => (
            <NoticeCard key={n.id} n={n} onDone={async (noticeId, response) => void (await post({ action: 'notice_ack', noticeId, response }))} />
          ))}
        </div>
      </div>
    );
  }

  if (!reminded.length) return null;
  const worst = Math.max(...reminded.map(n => n.remindersSent));
  return (
    <button
      onClick={onOpenNotices}
      className="w-full mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-2 cursor-pointer text-left"
    >
      <BellRing className="w-4 h-4 shrink-0" />
      <span className="flex-1">
        {reminded.length} pending notice{reminded.length > 1 ? 's' : ''} – reminder {worst}/{MAX_NOTICE_REMINDERS}. Complete before the portal gets locked.
      </span>
      <span className="underline">Open</span>
    </button>
  );
};
