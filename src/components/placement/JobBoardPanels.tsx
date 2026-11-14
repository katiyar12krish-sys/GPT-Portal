'use client';

/**
 * Job House panels that keep jobs current:
 * - LatestOpenings: jobs the TPO / faculty post (/api/jobposts) with official link and last date; staff add or delete.
 * - FindJobsOnline: pick a role and a city → ready-made searches on Naukri, LinkedIn, Indeed, foundit, Shine and Google Jobs,
 *   which always show that portal's current openings.
 * - JobWebsites: official recruitment sites (Uttarakhand, central govt, PSUs, apprenticeship) and private portals.
 * Data: src/lib/data/jobSources.ts.
 */
import React, { useEffect, useState } from 'react';
import { ExternalLink, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../../lib/client/api';
import { JOB_SITES, SEARCH_PLACES, SEARCH_ROLES, SITE_GROUPS, searchLinks } from '../../lib/data/jobSources';
import type { JobPost } from '../../lib/tracker/types';
import { Card, Pill, btnGhost, btnPrimary, input } from '../tracker/TrackerUi';

type B = 'All' | 'CSE' | 'Civil';
const fits = (b: string, want: B) => want === 'All' || b === 'Both' || b === want;
const daysLeft = (d: string) => Math.ceil((new Date(`${d}T23:59:59`).getTime() - Date.now()) / 86400000);

export const LatestOpenings: React.FC<{ branch: B; staff: boolean }> = ({ branch, staff }) => {
  const week = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const blank = { title: '', organisation: '', branch: (branch === 'All' ? 'Both' : branch) as JobPost['branch'], type: 'Private' as JobPost['type'], location: '', lastDate: week, link: '', eligibility: '', salary: '' };
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [f, setF] = useState(blank);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await api('/api/jobposts');
    if (r.success) setPosts(r.posts);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    setBusy(true);
    const r = await api('/api/jobposts', { body: { action: 'add', ...f } });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Not posted.' });
    setMsg({ ok: true, text: 'Posted. Students of that branch see it here and in the Notices strip at the top.' });
    setF(blank);
    setShow(false);
    load();
  };
  const del = async (id: string) => {
    if (!window.confirm('Remove this opening?')) return;
    await api('/api/jobposts', { body: { action: 'delete', id } });
    load();
  };

  const list = posts.filter(p => fits(p.branch, branch));
  const open = list.filter(p => daysLeft(p.lastDate) >= 0);
  const closed = list.filter(p => daysLeft(p.lastDate) < 0);

  return (
    <div className="space-y-4">
      {staff && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Post a new opening</h3>
            <button onClick={() => setShow(s => !s)} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
              <Plus className="w-4 h-4" /> {show ? 'Close form' : 'Add opening'}
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Found a vacancy in a newspaper, on a government site or from a company? Post it here with the official link – students see it at once.</p>
          {show && (
            <div className="grid sm:grid-cols-2 gap-2">
              <input className={input} placeholder="Post, e.g. Junior Engineer (Civil)" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
              <input className={input} placeholder="Organisation, e.g. UKSSSC / L&T" value={f.organisation} onChange={e => setF({ ...f, organisation: e.target.value })} />
              <select className={input} value={f.branch} onChange={e => setF({ ...f, branch: e.target.value as JobPost['branch'] })} aria-label="Branch">
                <option value="Both">Both branches</option>
                <option value="CSE">Computer Science</option>
                <option value="Civil">Civil</option>
              </select>
              <select className={input} value={f.type} onChange={e => setF({ ...f, type: e.target.value as JobPost['type'] })} aria-label="Type">
                {['Government', 'PSU', 'Private', 'Apprenticeship', 'Internship'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input className={input} placeholder="Location, e.g. Dehradun" value={f.location} onChange={e => setF({ ...f, location: e.target.value })} />
              <label className="text-sm flex items-center gap-2">
                Last date
                <input type="date" className={input} value={f.lastDate} onChange={e => setF({ ...f, lastDate: e.target.value })} />
              </label>
              <input className={`${input} sm:col-span-2`} placeholder="Official link (https://…)" value={f.link} onChange={e => setF({ ...f, link: e.target.value })} />
              <input className={input} placeholder="Eligibility, e.g. Diploma Civil, age 18–42" value={f.eligibility} onChange={e => setF({ ...f, eligibility: e.target.value })} />
              <input className={input} placeholder="Pay (optional)" value={f.salary} onChange={e => setF({ ...f, salary: e.target.value })} />
              <button onClick={add} disabled={busy} className={`${btnPrimary} sm:col-span-2 justify-self-start`}>
                {busy ? 'Posting…' : 'Post opening'}
              </button>
            </div>
          )}
          {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}
        </Card>
      )}

      {open.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">
            {staff ? 'No open postings yet. Add the first one above.' : 'No new openings posted by your TPO right now. Use "Find jobs online" to see today’s jobs on job portals.'}
          </p>
        </Card>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        {open.map(p => {
          const left = daysLeft(p.lastDate);
          return (
            <article key={p.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <Pill tone={p.type === 'Government' || p.type === 'PSU' ? 'cyan' : p.type === 'Private' ? 'slate' : 'green'}>{p.type}</Pill>
                <Pill>{p.branch === 'Both' ? 'CSE + Civil' : p.branch}</Pill>
                <Pill tone={left <= 3 ? 'rose' : left <= 7 ? 'amber' : 'green'}>{left === 0 ? 'Last day today' : `${left} days left`}</Pill>
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">{p.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">{`${p.organisation}${p.location ? ` · ${p.location}` : ''} · last date ${p.lastDate}`}</p>
              {p.eligibility && <p className="text-xs text-slate-600 dark:text-slate-300">{`Eligibility: ${p.eligibility}`}</p>}
              {p.salary && <p className="text-xs text-slate-600 dark:text-slate-300">{`Pay: ${p.salary}`}</p>}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a href={p.link} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} inline-flex items-center gap-1.5`}>
                  Apply / notification <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-slate-400">{`Posted by ${p.postedByName}`}</span>
                {staff && (
                  <button onClick={() => del(p.id)} className={`${btnGhost} !px-2 text-rose-600 ml-auto`} aria-label="Remove opening">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {closed.length > 0 && <p className="text-xs text-slate-500">{`${closed.length} recently closed opening(s) are hidden after their last date.`}</p>}
    </div>
  );
};

export const FindJobsOnline: React.FC<{ branch: B }> = ({ branch }) => {
  const b: 'CSE' | 'Civil' = branch === 'Civil' ? 'Civil' : 'CSE';
  const [role, setRole] = useState(SEARCH_ROLES[b][0]);
  const [place, setPlace] = useState('Uttarakhand');
  const [custom, setCustom] = useState('');
  useEffect(() => setRole(SEARCH_ROLES[b][0]), [b]);
  const q = custom.trim() || role;
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`Find today’s ${b === 'CSE' ? 'Computer Science' : 'Civil'} jobs online`}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">Pick a job and a place. Each button opens that website’s own search, so you always see the jobs open today.</p>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">1. Job</p>
          <div className="flex flex-wrap gap-1.5">
            {SEARCH_ROLES[b].map(r => (
              <button key={r} onClick={() => { setRole(r); setCustom(''); }} className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${role === r && !custom ? 'bg-[#13294b] text-white border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="relative max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={`${input} pl-8`} placeholder="…or type any job, e.g. Python developer" value={custom} onChange={e => setCustom(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">2. Place</p>
          <div className="flex flex-wrap gap-1.5">
            {SEARCH_PLACES.map(p => (
              <button key={p} onClick={() => setPlace(p)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer ${place === p ? 'bg-[#13294b] text-white border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {p === 'India' ? 'All India' : p}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">{`3. Open "${q}" in ${place === 'India' ? 'all India' : place} on:`}</p>
          <div className="flex flex-wrap gap-2">
            {searchLinks(q, place).map(l => (
              <a key={l.portal} href={l.url} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} inline-flex items-center gap-1.5`}>
                {l.portal} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </Card>
      <Card className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
        <p className="font-bold text-slate-800 dark:text-slate-100">Before you apply</p>
        <p>• Read the eligibility: many posts ask for a diploma, some only for a degree. • Never pay money to get a job. • Keep your resume ready in Resume → Send Resume & Analysis. • Tell your TPO when you apply, so the college can help.</p>
      </Card>
    </div>
  );
};

export const JobWebsites: React.FC<{ branch: B }> = ({ branch }) => (
  <div className="space-y-4">
    {SITE_GROUPS.map(g => {
      const sites = JOB_SITES.filter(s => s.group === g && fits(s.branch, branch));
      if (!sites.length) return null;
      return (
        <Card key={g} className="space-y-3">
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`${g} (${sites.length})`}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {sites.map(s => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#13294b] block space-y-1">
                <span className="flex items-center justify-between gap-2 font-black text-sm text-slate-900 dark:text-white">
                  {s.name} <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </span>
                <span className="block text-xs text-slate-500">{s.what}</span>
                <span className="block text-[11px] font-bold text-cyan-700">{s.branch === 'Both' ? 'CSE + Civil' : s.branch}</span>
              </a>
            ))}
          </div>
        </Card>
      );
    })}
    <p className="text-xs text-slate-500">Links checked in November 2026. Government sites sometimes load slowly; vacancies appear in their Recruitment / Careers section.</p>
  </div>
);
