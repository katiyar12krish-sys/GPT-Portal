'use client';

/**
 * Placement Companies tab: regional recruiters by zone with the college's record. Data: src/lib/data/regionalCompaniesData.ts.
 */
import { usePaged, ShowEntries, Pager } from '../../ui/Pagination';
import React, { useMemo, useState } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Building2,
  Landmark,
  Factory,
  Laptop,
  BadgeCheck,
  Briefcase,
} from 'lucide-react';
import {
  REGIONAL_COMPANIES,
  REGIONAL_ZONES,
  RegionalCompany,
  RegionalZone,
  RegionalBranch,
} from '../../../lib/data/regionalCompaniesData';
import { CampusRecordPanel } from './CampusRecordPanel';

/** First sentence of a paragraph (keeps "approx. ₹12,000" together). */
export const firstLine = (text: string): string => {
  const trimmed = text.trim();
  const idx = trimmed.search(/[.!?]\s+(?=[A-Z])/);
  return idx === -1 ? trimmed : trimmed.slice(0, idx + 1);
};

interface DetailRowProps {
  label: string;
  expanded: boolean;
  /** Text shown when collapsed (always the first line). */
  preview: string;
  /** Full content shown when expanded. */
  full: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, expanded, preview, full }) => (
  <div className="text-xs leading-relaxed">
    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {label}
    </span>
    {expanded ? (
      <div className="text-slate-700 dark:text-slate-200">{full}</div>
    ) : (
      <p className="text-slate-700 dark:text-slate-200 line-clamp-2">{preview}</p>
    )}
  </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="list-disc pl-4 space-y-0.5">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
);

const orgIcon = (c: RegionalCompany) => {
  if (c.orgType === 'Government / PSU') return Landmark;
  if (c.orgType === 'Private (IT / Services)') return Laptop;
  if (c.orgType === 'Private (Manufacturing)') return Factory;
  return Building2;
};

const zoneStyle: Record<RegionalZone, string> = {
  Uttarakhand: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  'Delhi-NCR': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
  'Nearby Cities': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
};

const CompanyCard: React.FC<{ company: RegionalCompany }> = ({ company: c }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = orgIcon(c);

  return (
    <article className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-cyan-500/50 transition-colors flex flex-col gap-3">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${zoneStyle[c.zone]}`}>
            {c.zone}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {c.branch === 'Both' ? 'Civil + CSE' : c.branch}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300">
            {c.orgType}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">{c.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{c.city}</span>
            </div>
            <span className="text-[11px] text-slate-400">{c.sector}</span>
          </div>
        </div>
      </header>

      {c.gptRecord && (
        <div className="flex items-start gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-200">
          <BadgeCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>UGIP Tanakpur record:</strong> {c.gptRecord}
          </span>
        </div>
      )}

      <div className="space-y-2.5">
        <DetailRow label="Overview" expanded={expanded} preview={c.tagline} full={<p>{c.about}</p>} />
        <DetailRow
          label="Roles for diploma holders"
          expanded={expanded}
          preview={c.rolesForDiploma[0]}
          full={<BulletList items={c.rolesForDiploma} />}
        />
        <DetailRow label="Eligibility" expanded={expanded} preview={firstLine(c.eligibility)} full={<p>{c.eligibility}</p>} />
        <DetailRow
          label="Selection process"
          expanded={expanded}
          preview={firstLine(c.selectionProcess)}
          full={<p>{c.selectionProcess}</p>}
        />
        <DetailRow
          label="Salary (indicative)"
          expanded={expanded}
          preview={firstLine(c.salaryRange)}
          full={<p className="font-semibold text-emerald-700 dark:text-emerald-400">{c.salaryRange}</p>}
        />

        {expanded && (
          <>
            <DetailRow label="Career growth" expanded preview="" full={<p>{c.careerGrowth}</p>} />
            <DetailRow label="Pros" expanded preview="" full={<BulletList items={c.pros} />} />
            <DetailRow label="Cons / things to know" expanded preview="" full={<BulletList items={c.cons} />} />
            <DetailRow label="How to apply" expanded preview="" full={<p>{c.howToApply}</p>} />
            <DetailRow label="Preparation tips" expanded preview="" full={<p>{c.prepTips}</p>} />
            <DetailRow
              label="Sample interview questions"
              expanded
              preview=""
              full={<BulletList items={c.sampleQuestions} />}
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {c.careersUrl && (
              <a
                href={c.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1"
              >
                <span>Careers page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              )}
              <a
                href={c.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
              >
                <span>Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>{c.email}</span>
                </a>
              )}
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="mt-auto self-start inline-flex items-center gap-1 text-xs font-black text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
      >
        {expanded ? (
          <>
            <span>Show less</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <span>Read more</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </article>
  );
};

interface Props {
  onOpenCoreRecruiters?: () => void;
}

export const RegionalCompaniesTab: React.FC<Props> = ({ onOpenCoreRecruiters }) => {
  const [view, setView] = useState<'regional' | 'record'>('regional');
  const [zone, setZone] = useState<'All' | RegionalZone>('All');
  const [branch, setBranch] = useState<'All' | RegionalBranch>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REGIONAL_COMPANIES.filter(c => {
      if (zone !== 'All' && c.zone !== zone) return false;
      if (branch !== 'All' && c.branch !== branch && c.branch !== 'Both') return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.rolesForDiploma.some(r => r.toLowerCase().includes(q))
      );
    });
  }, [zone, branch, query]);
  const pg = usePaged(filtered, 10);

  const counts = useMemo(() => {
    const out: Record<string, number> = { All: REGIONAL_COMPANIES.length };
    REGIONAL_ZONES.forEach(z => {
      out[z] = REGIONAL_COMPANIES.filter(c => c.zone === z).length;
    });
    return out;
  }, []);

  const pill = (active: boolean) =>
    `px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
      active
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button type="button" className={pill(view === 'regional')} onClick={() => setView('regional')}>
            Uttarakhand · Delhi-NCR · Nearby ({REGIONAL_COMPANIES.length})
          </button>
          <button type="button" className={pill(view === 'record')} onClick={() => setView('record')}>
            UGIP Tanakpur Placement Record
          </button>
        </div>
        {onOpenCoreRecruiters && (
          <button
            type="button"
            onClick={onOpenCoreRecruiters}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open the 24 core national recruiters</span>
          </button>
        )}
      </div>

      {view === 'record' ? (
        <CampusRecordPanel />
      ) : (
        <>
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by company, city (Pantnagar, Noida…), sector or role"
                aria-label="Search regional companies"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Region</span>
              {(['All', ...REGIONAL_ZONES] as const).map(z => (
                <button key={z} type="button" className={pill(zone === z)} onClick={() => setZone(z)}>
                  {z} ({counts[z]})
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Branch</span>
              {(['All', 'Civil', 'CSE'] as const).map(b => (
                <button key={b} type="button" className={pill(branch === b)} onClick={() => setBranch(b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Each card shows the first line of every detail. Tap <strong>Read more</strong> to open the full profile.
            Salary figures are indicative – always confirm on the official careers page and never pay money to get a job.
          </p>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              No company matches these filters.
            </div>
          ) : (
            <>
            <ShowEntries pg={pg} label="companies" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
              {pg.pageItems.map(c => (
                <CompanyCard key={c.id} company={c} />
              ))}
            </div>
            <Pager pg={pg} />
            </>
          )}
        </>
      )}
    </div>
  );
};
