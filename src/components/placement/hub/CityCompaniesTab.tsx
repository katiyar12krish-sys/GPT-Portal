'use client';

/**
 * City-wise companies tab: Uttarakhand (all), its cities, New Delhi and Noida. Data: CITY_COMPANIES in src/lib/data/cityCompaniesData.ts.
 */
import { ExportButtons } from '../../ui/ExportButtons';
import React, { useMemo, useState } from 'react';
import { MapPin, Search, ExternalLink, AlertTriangle } from 'lucide-react';
import { usePaged, ShowEntries, Pager } from '../../ui/Pagination';
import { ALL_UTTARAKHAND, CITY_COMPANIES, COMPANY_CITIES, HIRING_MODES, UTTARAKHAND_CITIES, companyInsight, type CityBranch } from '../../../lib/data/cityCompaniesData';

const MODE_TONE: Record<string, string> = {
  'Interview based': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'Written test + Interview': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
  'Govt exam': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'Apprenticeship (merit)': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
};

/** City-wise companies: what jobs come, and whether selection is by exam or interview. */
export const CityCompaniesTab: React.FC = () => {
  const [city, setCity] = useState<string>(ALL_UTTARAKHAND);
  const [branch, setBranch] = useState<'All' | CityBranch>('All');
  const [mode, setMode] = useState<string>('All');
  const [q, setQ] = useState('');

  const counts = useMemo<Record<string, number>>(
    () => ({ [ALL_UTTARAKHAND]: CITY_COMPANIES.filter(x => UTTARAKHAND_CITIES.includes(x.city)).length, ...Object.fromEntries(COMPANY_CITIES.map(c => [c, CITY_COMPANIES.filter(x => x.city === c).length])) }),
    []
  );
  const list = CITY_COMPANIES.filter(
    x =>
      (q ? true : city === ALL_UTTARAKHAND ? UTTARAKHAND_CITIES.includes(x.city) : x.city === city) &&
      (branch === 'All' || x.branch === branch || x.branch === 'Both') &&
      (mode === 'All' || x.mode === mode) &&
      (!q || `${x.name} ${x.sector} ${x.roles} ${x.city}`.toLowerCase().includes(q.toLowerCase()))
  );

  const pg = usePaged(list, 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[ALL_UTTARAKHAND, ...COMPANY_CITIES].map(c => (
          <button
            key={c}
            onClick={() => {
              setCity(c);
              setQ('');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border inline-flex items-center gap-1 cursor-pointer ${
              city === c && !q ? 'bg-[#13294b] text-white border-[#13294b] dark:bg-cyan-600 dark:border-cyan-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900'
            }`}
          >
            <MapPin className="w-3 h-3" /> {c} <span className="opacity-60">({counts[c]})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search all cities (company, role, sector)"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
          />
        </div>
        <select value={branch} onChange={e => setBranch(e.target.value as any)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm">
          {['All', 'CSE', 'Civil'].map(b => (
            <option key={b} value={b}>
              {b === 'All' ? 'All branches' : b}
            </option>
          ))}
        </select>
        <select value={mode} onChange={e => setMode(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm">
          <option value="All">Exam + interview (all)</option>
          {HIRING_MODES.map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-black">
        {HIRING_MODES.map(m => (
          <span key={m} className={`px-2 py-0.5 rounded-full border ${MODE_TONE[m]}`}>
            {m}: {list.filter(x => x.mode === m).length}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <ExportButtons dataset="companies" label={`${city}:`} params={{ city }} />
        <ExportButtons dataset="companies" label="All cities:" />
      </div>
      <ShowEntries pg={pg} label="companies" />
      <div className="grid md:grid-cols-2 gap-3">
        {pg.pageItems.map(x => (
          <article key={`${x.city}-${x.name}`} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">{x.name}</h4>
                <p className="text-[11px] text-slate-500">
                  {x.city} · {x.sector} · {x.branch === 'Both' ? 'CSE + Civil' : x.branch}
                </p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-black ${MODE_TONE[x.mode]}`}>{x.mode}</span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-200">
              <b>Jobs for diploma:</b> {x.roles}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <b>How you get selected:</b> {x.howSelected}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <b>Starting pay (indicative):</b> {x.salary}
            </div>
            {x.note && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {x.note}
              </p>
            )}
            <details className="group rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
              <summary className="cursor-pointer text-sm font-bold text-cyan-800 dark:text-cyan-300 list-none flex items-center justify-between">
                Full job details <span className="text-xs text-slate-400 group-open:hidden">▸ open</span>
                <span className="text-xs text-slate-400 hidden group-open:inline">▾ close</span>
              </summary>
              {(() => {
                const d = companyInsight(x);
                const rows: Array<[string, string]> = [
                  ['Type of employer', d.type],
                  ['Work environment', d.workplace],
                  ['What you do in year 1', d.firstYear],
                  ['How your performance is judged', d.performance],
                  ['Growth & salary rise', d.growth],
                  ['Probation / bond', d.probation],
                  ['Documents to carry', d.documents],
                ];
                return (
                  <dl className="mt-2 space-y-2 text-sm">
                    {rows.map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{k}</dt>
                        <dd className="text-slate-700 dark:text-slate-200">{v}</dd>
                      </div>
                    ))}
                  </dl>
                );
              })()}
            </details>
            {x.website && (
              <a href={x.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black text-cyan-600">
                Official website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </article>
        ))}
      </div>
      <Pager pg={pg} />
      {list.length === 0 && <p className="text-xs text-slate-500">No company matches these filters.</p>}
      <p className="text-[11px] text-slate-400">
        Apply: Naukri / Indeed / Apna (search &quot;Diploma Civil&quot; or &quot;Diploma CSE&quot;), company career pages, and the TPO. Pay figures are indicative – confirm with the company.
      </p>
    </div>
  );
};
