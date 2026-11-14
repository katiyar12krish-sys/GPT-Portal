'use client';

import React, { useState } from 'react';
import { CalendarClock, ClipboardCheck } from 'lucide-react';
import type { PanelInterview, PanelRubric } from '../../lib/tracker/types';
import { Card, Pill, btnGhost, btnPrimary, fmtDate, input, scoreTone } from './TrackerUi';
import { RUBRIC_LABELS, statusTone } from './PanelInterviewSection';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';

/** Faculty / admin: schedule requested panel interviews and score them with the rubric. */
export const FacultyPanelManager: React.FC<{ panels: PanelInterview[]; post: (b: Record<string, unknown>) => Promise<any> }> = ({ panels, post }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [when, setWhen] = useState('');
  const [venue, setVenue] = useState('');
  const [rubric, setRubric] = useState<PanelRubric>({ technical: 6, communication: 6, confidence: 6, bodyLanguage: 6, grooming: 6 });
  const [remarks, setRemarks] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const pg = usePaged(panels, 10);

  const open = (p: PanelInterview) => {
    setOpenId(openId === p.id ? null : p.id);
    setWhen(p.scheduledAt ?? `${p.preferredDate}T10:00`);
    setVenue(p.venueOrLink ?? (p.mode.startsWith('Online') ? '' : 'Placement Cell, Room No. ___'));
    setRubric(p.rubric ?? { technical: 6, communication: 6, confidence: 6, bodyLanguage: 6, grooming: 6 });
    setRemarks(p.remarks ?? '');
    setMsg(null);
  };

  const act = async (body: Record<string, unknown>) => {
    const r = await post(body);
    setMsg(r.success ? 'Saved.' : r.error);
  };

  return (
    <Card className="space-y-3">
      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Panel interview requests ({panels.length})</h3>
      {panels.length === 0 ? (
        <p className="text-sm text-slate-500">No requests yet. Students book them from Mock Interview → Panel interview.</p>
      ) : (
        <>
          <ShowEntries pg={pg} label="requests" />
          {pg.pageItems.map(p => (
            <div key={p.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">{p.studentName}</span>
                <span className="font-mono text-slate-400">{p.rollNumber}</span>
                <span className="text-slate-500">
                  {p.track} · {p.mode} · wants {p.preferredDate}, {p.preferredSlot}
                </span>
                <Pill tone={statusTone(p.status)}>{p.status}</Pill>
                {p.overall !== undefined && <b className={scoreTone(p.overall)}>{p.overall}%</b>}
                <button onClick={() => open(p)} className={`${btnGhost} ml-auto`}>
                  {openId === p.id ? 'Close' : p.status === 'Completed' ? 'View / edit' : 'Schedule & score'}
                </button>
              </div>
              {p.note && <p className="text-sm text-slate-500 italic">Student note: {p.note}</p>}
              {p.scheduledAt && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Scheduled {fmtDate(p.scheduledAt)} · {p.venueOrLink}
                </p>
              )}

              {openId === p.id && (
                <div className="grid lg:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <CalendarClock className="w-4 h-4" /> 1. Schedule
                    </h4>
                    <input type="datetime-local" className={input} value={when} onChange={e => setWhen(e.target.value)} />
                    <input className={input} placeholder={p.mode.startsWith('Online') ? 'Video call link' : 'Venue (room)'} value={venue} onChange={e => setVenue(e.target.value)} />
                    <button className={btnPrimary} onClick={() => act({ action: 'panel_schedule', id: p.id, scheduledAt: when, venueOrLink: venue })}>
                      Confirm schedule
                    </button>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4" /> 2. Score after the interview
                    </h4>
                    {RUBRIC_LABELS.map(([k, l]) => (
                      <label key={k} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                        <span>
                          {l}: <b>{rubric[k]}/10</b>
                        </span>
                        <input type="range" min={1} max={10} value={rubric[k]} onChange={e => setRubric({ ...rubric, [k]: Number(e.target.value) })} />
                      </label>
                    ))}
                    <textarea className={input} rows={2} placeholder="Remarks for the student" value={remarks} onChange={e => setRemarks(e.target.value)} />
                    <button className={btnPrimary} onClick={() => act({ action: 'panel_grade', id: p.id, rubric, remarks })}>
                      Save score
                    </button>
                  </div>
                  {msg && <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{msg}</p>}
                </div>
              )}
            </div>
          ))}
          <Pager pg={pg} />
        </>
      )}
    </Card>
  );
};
