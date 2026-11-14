'use client';

import React, { useMemo, useState } from 'react';
import { Briefcase, Building2, ExternalLink, Globe, Landmark, MapPin, Megaphone, PlayCircle, Search } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { branchOf } from '../../lib/data/placementQnaBank';
import { FindJobsOnline, JobWebsites, LatestOpenings } from './JobBoardPanels';
import { UTTARAKHAND_JOBS } from '../../lib/data/uttarakhandJobs';
import { ALL_INDIA_GOVT_JOBS } from '../../lib/data/allIndiaGovtJobs';
import { CITY_COMPANIES, UTTARAKHAND_CITIES, type CityCompany } from '../../lib/data/cityCompaniesData';
import { ScreenHeader, btnGhost, input } from '../tracker/TrackerUi';
import { GovtVsPrivateJobsScreen } from './GovtVsPrivateJobsScreen';

// Job House: every job after diploma in one place, split so a student finds the right kind quickly.
//   Uttarakhand govt · All-India govt · Private (Uttarakhand, New Delhi, Noida) · Videos & old guides

type Tab = 'openings' | 'search' | 'uk' | 'india' | 'private' | 'sites' | 'more';
type Branch = 'All' | 'CSE' | 'Civil';
const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'openings', label: 'Latest openings', icon: Megaphone },
  { id: 'search', label: 'Find jobs online', icon: Search },
  { id: 'uk', label: 'Uttarakhand Govt Jobs', icon: Landmark },
  { id: 'india', label: 'All-India Govt Jobs', icon: Building2 },
  { id: 'private', label: 'Private Jobs', icon: Briefcase },
  { id: 'sites', label: 'Job websites', icon: Globe },
  { id: 'more', label: 'Videos & Exam Guides', icon: PlayCircle },
];

const isGovt = (x: CityCompany) => x.mode === 'Govt exam' || x.mode === 'Apprenticeship (merit)';
const inUk = (x: CityCompany) => UTTARAKHAND_CITIES.includes(x.city);
const fits = (b: string, want: Branch) => want === 'All' || b === 'Both' || b === want;
const has = (q: string, ...parts: string[]) => !q || parts.join(' ').toLowerCase().includes(q.toLowerCase());

const Row: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <p className="text-xs text-slate-600 dark:text-slate-300">
    <b className="text-slate-800 dark:text-slate-100">{k}:</b> {v}
  </p>
);

const Official: React.FC<{ href: string }> = ({ href }) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-700 dark:text-cyan-300">
      Official website <ExternalLink className="w-3 h-3" />
    </a>
  ) : null;

const card = 'p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5';
const branchLabel = (b: string) => (b === 'Both' ? 'CSE + Civil' : b);

const CompanyCard: React.FC<{ x: CityCompany }> = ({ x }) => (
  <article className={card}>
    <h4 className="font-black text-sm text-slate-900 dark:text-white">{x.name}</h4>
    <p className="text-[11px] text-slate-500 flex items-center gap-1">
      <MapPin className="w-3 h-3" /> {x.city} · {x.sector} · {branchLabel(x.branch)}
    </p>
    <Row k="Jobs for diploma" v={x.roles} />
    <Row k="How you get selected" v={x.howSelected} />
    <Row k="Starting pay" v={x.salary} />
    {x.note && <p className="text-[11px] text-amber-700 dark:text-amber-300">{x.note}</p>}
    <Official href={x.website} />
  </article>
);

export const JobHouseScreen: React.FC<{ onPractice?: (section: string, subject: string) => void }> = ({ onPractice }) => {
  const { loggedInRole, loggedStudent } = useCollege();
  const staff = loggedInRole !== 'student';
  const [tab, setTab] = useState<Tab>('openings');
  // students start on their own branch; staff see all
  const [branch, setBranch] = useState<Branch>(staff ? 'All' : branchOf(loggedStudent?.branch));
  const [q, setQ] = useState('');

  const ukPosts = UTTARAKHAND_JOBS.filter(j => fits(j.branch, branch) && has(q, j.post, j.departments, j.prepare));
  const ukEmployers = CITY_COMPANIES.filter(x => inUk(x) && isGovt(x) && fits(x.branch, branch) && has(q, x.name, x.roles, x.sector, x.city));
  const central = ALL_INDIA_GOVT_JOBS.filter(j => fits(j.branch, branch) && has(q, j.post, j.where, j.conductedBy, j.prepare));
  const centralEmployers = CITY_COMPANIES.filter(x => !inUk(x) && isGovt(x) && fits(x.branch, branch) && has(q, x.name, x.roles, x.sector, x.city));
  const privateJobs = useMemo(
    () =>
      CITY_COMPANIES.filter(x => !isGovt(x) && fits(x.branch, branch) && has(q, x.name, x.roles, x.sector, x.city)).sort(
        (a, b) => Number(inUk(b)) - Number(inUk(a))
      ),
    [branch, q]
  );

  const count: Record<Tab, number> = {
    uk: UTTARAKHAND_JOBS.length + CITY_COMPANIES.filter(x => inUk(x) && isGovt(x)).length,
    india: ALL_INDIA_GOVT_JOBS.length + CITY_COMPANIES.filter(x => !inUk(x) && isGovt(x)).length,
    private: CITY_COMPANIES.filter(x => !isGovt(x)).length,
    more: 0,
    openings: 0,
    search: 0,
    sites: 0,
  };

  const Practice: React.FC<{ list: Array<[string, string]> }> = ({ list }) =>
    onPractice ? (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {list.map(([c, s]) => (
          <button key={c + s} onClick={() => onPractice(c, s)} className={`${btnGhost} !px-2.5 !py-1 text-[11px]`}>
            {`Practise: ${s === 'All' ? c : s}`}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-5">
      <ScreenHeader
        badge="Job House"
        title="Job House – every job after diploma"
        subtitle="Latest openings posted by your TPO, ready-made searches that show today’s jobs on job portals, official recruitment websites, and the Uttarakhand, All-India government and private jobs open to diploma holders."
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer inline-flex items-center gap-1.5 ${tab === t.id ? 'bg-white text-slate-900' : 'bg-white/10 text-white'}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {count[t.id] > 0 && <span className="opacity-70">({count[t.id]})</span>}
            </button>
          ))}
        </div>
      </ScreenHeader>

      {tab === 'more' ? (
        <GovtVsPrivateJobsScreen />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'CSE', 'Civil'] as Branch[]).map(b => (
              <button
                key={b}
                onClick={() => setBranch(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${branch === b ? 'bg-[#13294b] text-white border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                {b === 'All' ? 'All branches' : b === 'CSE' ? 'Computer Science' : 'Civil'}
              </button>
            ))}
            {(tab === 'uk' || tab === 'india' || tab === 'private') && (
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${input} pl-8`} placeholder="Search a post, department or company" value={q} onChange={e => setQ(e.target.value)} />
              </div>
            )}
          </div>

          {tab === 'openings' && <LatestOpenings branch={branch} staff={staff} />}
          {tab === 'search' && <FindJobsOnline branch={branch} />}
          {tab === 'sites' && <JobWebsites branch={branch} />}

          {tab === 'uk' && (
            <>
              <h3 className="font-black text-slate-900 dark:text-white">State posts after diploma</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {ukPosts.map(j => (
                  <article key={j.post} className={card}>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{j.post}</h4>
                    <p className="text-[11px] text-slate-500">{branchLabel(j.branch)}</p>
                    <Row k="Where" v={j.departments} />
                    <Row k="Who conducts" v={j.conductedBy} />
                    <Row k="Eligibility" v={j.eligibility} />
                    <Row k="Selection" v={j.selection} />
                    <Row k="Prepare" v={j.prepare} />
                    <Practice list={j.practice} />
                    <Official href={j.link} />
                  </article>
                ))}
              </div>
              <h3 className="font-black text-slate-900 dark:text-white pt-2">{`Government and PSU employers in Uttarakhand (${ukEmployers.length})`}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {ukEmployers.map(x => (
                  <CompanyCard key={x.name} x={x} />
                ))}
              </div>
            </>
          )}

          {tab === 'india' && (
            <>
              <h3 className="font-black text-slate-900 dark:text-white">Central exams and schemes after diploma</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {central.map(j => (
                  <article key={j.post} className={card}>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">{j.post}</h4>
                    <p className="text-[11px] text-slate-500">{branchLabel(j.branch)}</p>
                    <Row k="Who conducts" v={j.conductedBy} />
                    <Row k="Eligibility" v={j.eligibility} />
                    <Row k="Selection" v={j.selection} />
                    <Row k="Pay" v={j.pay} />
                    <Row k="Where you work" v={j.where} />
                    <Row k="Prepare" v={j.prepare} />
                    <Practice list={j.practice} />
                    <Official href={j.link} />
                  </article>
                ))}
              </div>
              {centralEmployers.length > 0 && (
                <>
                  <h3 className="font-black text-slate-900 dark:text-white pt-2">{`Central government employers in New Delhi and Noida (${centralEmployers.length})`}</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {centralEmployers.map(x => (
                      <CompanyCard key={x.name} x={x} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'private' && (
            <>
              <h3 className="font-black text-slate-900 dark:text-white">{`Private companies hiring diploma holders – Uttarakhand first, then New Delhi and Noida (${privateJobs.length})`}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {privateJobs.map(x => (
                  <CompanyCard key={`${x.city}-${x.name}`} x={x} />
                ))}
              </div>
            </>
          )}

          <p className="text-[11px] text-slate-500">Posts, vacancies, age limits and pay change with every notification. Always read the latest advertisement on the official website before applying.</p>
        </>
      )}
    </div>
  );
};
