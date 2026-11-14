'use client';

/**
 * Panel interview booking (student side): request a face-to-face or video-call interview with faculty and see the grades.
 */
import React, { useState } from 'react';
import { CalendarClock, Users, MapPin, Video } from 'lucide-react';
import { INTERVIEW_TRACK_NAMES } from '../../lib/data/mockInterviewBank';
import type { PanelInterview } from '../../lib/tracker/types';
import { Card, Pill, ScoreBar, btnPrimary, fmtDate, input, scoreTone } from './TrackerUi';

const SLOTS = ['10:00 – 11:00 AM', '11:00 AM – 12:00 PM', '2:00 – 3:00 PM', '3:00 – 4:00 PM'];
export const RUBRIC_LABELS: Array<[keyof NonNullable<PanelInterview['rubric']>, string]> = [
  ['technical', 'Technical knowledge'],
  ['communication', 'Communication'],
  ['confidence', 'Confidence'],
  ['bodyLanguage', 'Body language & eye contact'],
  ['grooming', 'Dress & grooming'],
];

export const statusTone = (s: PanelInterview['status']) => (s === 'Completed' ? 'green' : s === 'Scheduled' ? 'cyan' : 'amber');

/** Student side: ask for a face-to-face / video-call mock interview with a faculty panel. */
export const PanelInterviewSection: React.FC<{
  panels: PanelInterview[];
  defaultTrack: string;
  post: (b: Record<string, unknown>) => Promise<any>;
}> = ({ panels, defaultTrack, post }) => {
  const today = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({ track: defaultTrack, mode: 'In person (college)', preferredDate: today, preferredSlot: SLOTS[0], note: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const request = async () => {
    setBusy(true);
    const r = await post({ action: 'panel_request', ...form });
    setBusy(false);
    setMsg(r.success ? 'Request sent. Your faculty will confirm the time.' : r.error);
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-700" /> Book a panel mock interview
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          A real interview with faculty (HOD / TPO) – in the college or on a video call. Faculty score you on technical knowledge, communication, confidence,
          body language and grooming, and write remarks.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <select className={input} value={form.track} onChange={e => setForm({ ...form, track: e.target.value })}>
            {INTERVIEW_TRACK_NAMES.map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select className={input} value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
            <option>In person (college)</option>
            <option>Online (video call)</option>
          </select>
          <input type="date" min={today} className={input} value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} />
          <select className={input} value={form.preferredSlot} onChange={e => setForm({ ...form, preferredSlot: e.target.value })}>
            {SLOTS.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <input className={input} placeholder="Anything the panel should know? (e.g. preparing for L&T DET / TCS)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        <div className="flex items-center gap-3">
          <button className={btnPrimary} disabled={busy} onClick={request}>
            {busy ? 'Sending…' : 'Request interview'}
          </button>
          {msg && <span className="text-sm text-slate-600 dark:text-slate-300">{msg}</span>}
        </div>
      </Card>

      {panels.map(p => (
        <Card key={p.id} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white flex-1">
              {p.track} · {p.mode}
            </span>
            <Pill tone={statusTone(p.status)}>{p.status}</Pill>
            {p.overall !== undefined && <span className={`font-bold text-lg ${scoreTone(p.overall)}`}>{p.overall}%</span>}
          </div>
          <p className="text-sm text-slate-500">
            Asked for {p.preferredDate}, {p.preferredSlot}
            {p.scheduledAt && (
              <>
                {' '}· <CalendarClock className="inline w-4 h-4" /> Scheduled {fmtDate(p.scheduledAt)} with {p.interviewer}
              </>
            )}
          </p>
          {p.venueOrLink && (
            <p className="text-sm text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5">
              {p.mode.startsWith('Online') ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              {/^https?:\/\//.test(p.venueOrLink) ? (
                <a href={p.venueOrLink} target="_blank" rel="noopener noreferrer" className="underline text-cyan-700">
                  Join link
                </a>
              ) : (
                p.venueOrLink
              )}
            </p>
          )}
          {p.rubric && (
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 pt-1">
              {RUBRIC_LABELS.map(([k, l]) => (
                <div key={k} className="text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{l}</span>
                    <b>{p.rubric![k]}/10</b>
                  </div>
                  <ScoreBar value={p.rubric![k]} max={10} />
                </div>
              ))}
            </div>
          )}
          {p.remarks && <p className="text-sm text-slate-700 dark:text-slate-200 italic">“{p.remarks}”</p>}
        </Card>
      ))}
    </div>
  );
};
