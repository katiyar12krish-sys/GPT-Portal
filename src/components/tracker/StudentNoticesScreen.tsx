'use client';

import React, { useState } from 'react';
import { BellRing, CheckCircle2, Lock } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { usePlacementTracker } from '../../hooks/usePlacementTracker';
import type { StudentNoticeView } from '../../lib/tracker/types';
import { MAX_NOTICE_REMINDERS } from '../../lib/tracker/types';
import { Card, Pill, ScreenHeader, btnPrimary, fmtDate, input } from './TrackerUi';

/** One notice with its "complete" form. Also used inside the lock overlay. */
export const NoticeCard: React.FC<{ n: StudentNoticeView; onDone: (id: string, response: string) => Promise<void> }> = ({ n, onDone }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Card className={`space-y-2 ${n.locked ? 'border-rose-400 dark:border-rose-700' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-black text-sm text-slate-900 dark:text-white flex-1">{n.title}</h3>
        {n.done ? (
          <Pill tone="green">
            <CheckCircle2 className="w-3 h-3" /> Done
          </Pill>
        ) : n.locked ? (
          <Pill tone="rose">
            <Lock className="w-3 h-3" /> Locked – complete now
          </Pill>
        ) : (
          <Pill tone={n.remindersSent ? 'amber' : 'cyan'}>
            <BellRing className="w-3 h-3" /> Reminder {n.remindersSent}/{MAX_NOTICE_REMINDERS}
          </Pill>
        )}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">{n.message}</p>
      <p className="text-[11px] text-slate-400">
        From {n.createdByName} · {fmtDate(n.createdAt)}
        {n.nextReminderAt && !n.done ? ` · next reminder ${fmtDate(n.nextReminderAt)}` : ''}
      </p>
      {!n.done && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-black text-cyan-700 dark:text-cyan-300">To do: {n.actionRequired}</div>
          <input className={input} placeholder="Reply / confirmation (optional)" value={text} onChange={e => setText(e.target.value)} />
          <button
            disabled={busy}
            className={btnPrimary}
            onClick={async () => {
              setBusy(true);
              await onDone(n.id, text);
              setBusy(false);
            }}
          >
            {busy ? 'Saving…' : 'Mark as done'}
          </button>
        </div>
      )}
    </Card>
  );
};

export const StudentNoticesScreen: React.FC = () => {
  const { language } = useCollege();
  const { data, post } = usePlacementTracker();
  const notices = data.notices as StudentNoticeView[];
  const pending = notices.filter(n => !n.done);

  const done = async (noticeId: string, response: string) => {
    await post({ action: 'notice_ack', noticeId, response });
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        badge={language === 'hi' ? 'फैकल्टी नोटिस' : 'Faculty Notices'}
        title={language === 'hi' ? 'नोटिस – जल्दी से जल्दी पूरा करें' : 'Notices – complete them quickly'}
        subtitle={`If a notice is not completed you get up to ${MAX_NOTICE_REMINDERS} reminders. After the ${MAX_NOTICE_REMINDERS}rd reminder your portal is locked until you complete it, and your faculty is informed.`}
      />
      {notices.length === 0 && (
        <Card>
          <p className="text-xs text-slate-500">No notices right now.</p>
        </Card>
      )}
      {pending.map(n => (
        <NoticeCard key={n.id} n={n} onDone={done} />
      ))}
      {notices
        .filter(n => n.done)
        .map(n => (
          <NoticeCard key={n.id} n={n} onDone={done} />
        ))}
    </div>
  );
};
