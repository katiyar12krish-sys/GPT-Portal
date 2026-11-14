'use client';

/**
 * Resources tab of the Placement Hub: preparation links, books and the resume hub shortcut.
 */
import { usePaged, ShowEntries, Pager } from '../../ui/Pagination';

import React, { useMemo, useState } from 'react';
import { Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { AcademicResourceLibraryScreen } from '../../academic/AcademicResourceLibraryScreen';
import { PLACEMENT_RESOURCES, PLACEMENT_CLUB_PLAN } from '../../../lib/data/campusPlacementStats';

interface Props {
  onOpenResumeHub?: () => void;
}

export const ResourcesTab: React.FC<Props> = ({ onOpenResumeHub }) => {
  const [mode, setMode] = useState<'placement' | 'academic'>('placement');
  const [type, setType] = useState<string>('All');
  const [branch, setBranch] = useState<'All' | 'Civil' | 'CSE'>('All');
  const [query, setQuery] = useState('');
  const [clubOpen, setClubOpen] = useState(false);

  const types = useMemo(() => ['All', ...Array.from(new Set(PLACEMENT_RESOURCES.map(r => r.type)))], []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLACEMENT_RESOURCES.filter(r => {
      if (type !== 'All' && r.type !== type) return false;
      if (branch !== 'All' && r.branch !== branch && r.branch !== 'Common') return false;
      return !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    });
  }, [type, branch, query]);
  const pg = usePaged(list, 10);

  const pill = (active: boolean) =>
    `px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
      active
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
    }`;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 overflow-x-auto">
        <button type="button" className={pill(mode === 'placement')} onClick={() => setMode('placement')}>
          Placement resources
        </button>
        <button type="button" className={pill(mode === 'academic')} onClick={() => setMode('academic')}>
          Academic library (notes, PYQs, syllabus)
        </button>
      </div>

      {mode === 'academic' ? (
        <AcademicResourceLibraryScreen />
      ) : (
        <>
          {/* Placement Club plan */}
          <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">The Placement Club – master plan</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{PLACEMENT_CLUB_PLAN.vision}</p>
            {clubOpen && (
              <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <h4 className="font-black text-[10px] uppercase tracking-wider text-slate-400 mb-1">Core committees</h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {PLACEMENT_CLUB_PLAN.committees.map(c => (
                      <li key={c.name}>
                        <strong>{c.name}:</strong> {c.focus}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PLACEMENT_CLUB_PLAN.phases.map(p => (
                    <div key={p.phase} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="font-black text-slate-900 dark:text-white">{p.phase}</div>
                      <div className="text-[10px] text-slate-400 mb-1">{p.months}</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {p.actions.map(a => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-black text-[10px] uppercase tracking-wider text-slate-400 mb-1">Success metrics</h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {PLACEMENT_CLUB_PLAN.metrics.map(m => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Target recruiters:</strong> {PLACEMENT_CLUB_PLAN.targetCompanies.join(', ')}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setClubOpen(v => !v)}
              aria-expanded={clubOpen}
              className="inline-flex items-center gap-1 text-xs font-black text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <span>{clubOpen ? 'Show less' : 'Read more'}</span>
              {clubOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </section>

          {/* Filters */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search resources (NATS, SQL, aptitude, SSC JE…)"
                aria-label="Search placement resources"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {types.map(t => (
                <button key={t} type="button" className={pill(type === t)} onClick={() => setType(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Civil', 'CSE'] as const).map(b => (
                <button key={b} type="button" className={pill(branch === b)} onClick={() => setBranch(b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <ShowEntries pg={pg} label="resources" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pg.pageItems.map(r => {
              const isInternal = r.url.startsWith('#');
              return (
                <article key={r.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">{r.type}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{r.branch}</span>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white leading-snug">{r.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{r.description}</p>
                  {isInternal ? (
                    <button
                      type="button"
                      onClick={onOpenResumeHub}
                      className="self-start px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Open Resume Hub
                    </button>
                  ) : (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-start px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
          <Pager pg={pg} />
          {list.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              No resource matches these filters.
            </div>
          )}
        </>
      )}
    </div>
  );
};
