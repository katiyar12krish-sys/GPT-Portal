'use client';

/**
 * Mentorship tab: book a session with an alumni mentor (sample mentors; bookings are not yet saved in the database).
 */
import React, { useMemo, useState } from 'react';
import { useCollege } from '../../../context/CollegeContext';
import { AlumniMentor, MentorshipBooking } from '../../../lib/types';
import { Calendar, CheckCircle2, X, Star, Clock, Video, Phone, Building, Search } from 'lucide-react';

const SLOTS = ['10:00 AM - 11:00 AM', '04:00 PM - 05:00 PM', '06:00 PM - 07:00 PM', '08:00 PM - 09:00 PM'];
const MODES: MentorshipBooking['mode'][] = ['Video Call', 'Phone Call', 'In-Person (Campus)'];
const TOPICS = [
  'Campus interview preparation & technical viva',
  'Resume / ATS review',
  'Career path: private job vs government exam',
  'Higher studies (B.Tech lateral entry)',
  'Mock HR interview',
  'Other (describe below)',
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const statusStyle: Record<MentorshipBooking['status'], string> = {
  Requested: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  Confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  Completed: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
};

export const MentorshipTab: React.FC = () => {
  const { alumniMentors, bookMentorshipSession, mentorshipBookings, cancelMentorshipBooking } = useCollege();

  const [query, setQuery] = useState('');
  const [mentor, setMentor] = useState<AlumniMentor | null>(null);
  const [topicChoice, setTopicChoice] = useState(TOPICS[0]);
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(todayISO());
  const [slot, setSlot] = useState(SLOTS[2]);
  const [mode, setMode] = useState<MentorshipBooking['mode']>('Video Call');
  const [success, setSuccess] = useState<MentorshipBooking | null>(null);

  const mentors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return alumniMentors;
    return alumniMentors.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.companyName.toLowerCase().includes(q) ||
        m.domainExpertise.some(d => d.toLowerCase().includes(q))
    );
  }, [alumniMentors, query]);

  const openBooking = (m: AlumniMentor) => {
    setMentor(m);
    setSuccess(null);
    setDetails('');
    setTopicChoice(TOPICS[0]);
    setDate(todayISO());
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentor) return;
    const topic = details.trim() ? `${topicChoice} – ${details.trim()}` : topicChoice;
    const booking = bookMentorshipSession(mentor.id, topic, { preferredDate: date, preferredSlot: slot, mode });
    if (booking) setSuccess(booking);
  };

  const closeModal = () => {
    setMentor(null);
    setSuccess(null);
  };

  const field =
    'w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white';

  return (
    <div className="space-y-6">
      {/* My bookings */}
      <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="font-black text-sm text-slate-900 dark:text-white">My mentorship bookings ({mentorshipBookings.length})</h3>
        {mentorshipBookings.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No bookings yet. Pick an alumni mentor below and choose a date and time slot.
          </p>
        ) : (
          <ul className="space-y-2">
            {mentorshipBookings.map(b => (
              <li
                key={b.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-black text-slate-900 dark:text-white">
                    {b.mentorName} <span className="font-semibold text-slate-500">· {b.mentorCompany}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{b.topic}</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{b.preferredDate}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{b.preferredSlot}</span>
                    <span>{b.mode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${statusStyle[b.status]}`}>{b.status}</span>
                  {(b.status === 'Requested' || b.status === 'Confirmed') && (
                    <button
                      type="button"
                      onClick={() => cancelMentorshipBooking(b.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Mentor search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search mentors by name, company or domain"
          aria-label="Search mentors"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
        />
      </div>

      {/* Mentor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mentors.map(m => (
          <article
            key={m.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-emerald-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {m.name.replace(/^Er\.\s*/i, '').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{m.name}</h4>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Building className="w-3 h-3 shrink-0" />
                    <span className="truncate">{m.designation} · {m.companyName}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Batch {m.graduationYear} · {m.location}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3" />
                {m.rating}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{m.bio}</p>
            <div className="flex flex-wrap gap-1.5">
              {m.domainExpertise.map((d, i) => (
                <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {d}
                </span>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                {m.availability} · {m.totalMenteesHelped} mentees
              </span>
              <button
                type="button"
                onClick={() => openBooking(m)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book session</span>
              </button>
            </div>
          </article>
        ))}
        {mentors.length === 0 && (
          <div className="md:col-span-2 p-8 text-center text-sm text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            No mentor matches your search.
          </div>
        )}
      </div>

      {/* Booking modal */}
      {mentor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Book mentorship session"
        >
          <div className="w-full max-w-md my-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Book a 1-on-1 session</h3>
                <p className="text-xs text-slate-500">
                  {mentor.name} · {mentor.companyName}
                </p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Close" className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-black text-base text-slate-900 dark:text-white">Request sent!</h4>
                <p className="text-xs text-slate-500">
                  {success.preferredDate} · {success.preferredSlot} · {success.mode}
                  <br />
                  You will get the meeting link via email / portal notification.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3 text-xs">
                <label className="block">
                  <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Topic</span>
                  <select value={topicChoice} onChange={e => setTopicChoice(e.target.value)} className={field}>
                    {TOPICS.map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your question / details (optional)</span>
                  <textarea
                    rows={2}
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="e.g. I have an L&T interview next week and want to practise BBS questions."
                    className={field}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</span>
                    <input type="date" required min={todayISO()} value={date} onChange={e => setDate(e.target.value)} className={field} />
                  </label>
                  <label className="block">
                    <span className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time slot</span>
                    <select value={slot} onChange={e => setSlot(e.target.value)} className={field}>
                      {SLOTS.map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <fieldset>
                  <legend className="font-bold text-slate-700 dark:text-slate-300 mb-1">Mode</legend>
                  <div className="flex flex-wrap gap-2">
                    {MODES.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        aria-pressed={mode === m}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer ${
                          mode === m
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {m === 'Video Call' ? <Video className="w-3 h-3" /> : m === 'Phone Call' ? <Phone className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                        {m}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black inline-flex items-center gap-1.5 cursor-pointer">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm booking</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
