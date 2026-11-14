'use client';

/**
 * Campus placement record charts (year-wise placed / higher studies). Data: src/lib/data/campusPlacementStats.ts – replace the sample figures with real ones.
 */
import { ExportButtons } from '../../ui/ExportButtons';
import React, { useMemo, useState } from 'react';
import {
  YEAR_BRANCH_STATS,
  PLACEMENT_YEARS,
  CAMPUS_RECRUITER_LOG,
} from '../../../lib/data/campusPlacementStats';

const CSE_COLOR = '#2a4f8a'; // cyan-600
const CIVIL_COLOR = '#d97706'; // amber-600

const formatMoney = (annual: number) =>
  annual >= 100000 ? `₹${(annual / 100000).toFixed(2)} LPA` : `₹${Math.round(annual / 12).toLocaleString('en-IN')}/mo`;

/** Grouped bar chart: placement % per year for CSE vs Civil. */
const PlacementPctChart: React.FC = () => {
  const W = 640;
  const H = 260;
  const pad = { l: 40, r: 12, t: 16, b: 34 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const groupW = innerW / PLACEMENT_YEARS.length;
  const barW = Math.min(34, groupW / 3);
  const y = (v: number) => pad.t + innerH - (v / 100) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Placement percentage by year for CSE and Civil" className="w-full h-auto">
      {[0, 25, 50, 75, 100].map(g => (
        <g key={g}>
          <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="currentColor" opacity={0.12} />
          <text x={pad.l - 6} y={y(g) + 3} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.6}>
            {g}%
          </text>
        </g>
      ))}
      {PLACEMENT_YEARS.map((yr, i) => {
        const cse = YEAR_BRANCH_STATS.find(s => s.year === yr && s.branch === 'CSE');
        const civ = YEAR_BRANCH_STATS.find(s => s.year === yr && s.branch === 'Civil');
        const cx = pad.l + groupW * i + groupW / 2;
        return (
          <g key={yr}>
            {cse && (
              <>
                <rect x={cx - barW - 2} y={y(cse.placementPct)} width={barW} height={innerH - (y(cse.placementPct) - pad.t)} rx={4} fill={CSE_COLOR} />
                <text x={cx - barW / 2 - 2} y={y(cse.placementPct) - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
                  {cse.placementPct.toFixed(0)}%
                </text>
              </>
            )}
            {civ && (
              <>
                <rect x={cx + 2} y={y(civ.placementPct)} width={barW} height={innerH - (y(civ.placementPct) - pad.t)} rx={4} fill={CIVIL_COLOR} />
                <text x={cx + barW / 2 + 2} y={y(civ.placementPct) - 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="currentColor">
                  {civ.placementPct.toFixed(0)}%
                </text>
              </>
            )}
            <text x={cx} y={H - 12} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.75}>
              {yr}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Stacked outcome bar per branch+year (placed / higher edu / not placed). */
const OutcomeBars: React.FC<{ branch: 'CSE' | 'Civil' }> = ({ branch }) => {
  const rows = YEAR_BRANCH_STATS.filter(s => s.branch === branch);
  return (
    <div className="space-y-2">
      {rows.map(r => {
        const pct = (n: number) => `${(n / r.total) * 100}%`;
        return (
          <div key={r.year} className="grid grid-cols-[64px_1fr_56px] items-center gap-2 text-[11px]">
            <span className="font-mono text-slate-500 dark:text-slate-400">{r.year}</span>
            <div
              className="flex h-4 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800"
              role="img"
              aria-label={`${r.year} ${branch}: ${r.placed} placed, ${r.higherEdu} higher education, ${r.notPlaced} not placed out of ${r.total}`}
            >
              <div style={{ width: pct(r.placed), background: '#059669' }} title={`Placed ${r.placed}`} />
              <div style={{ width: pct(r.higherEdu), background: '#3a4a63' }} title={`Higher education ${r.higherEdu}`} />
              <div style={{ width: pct(r.notPlaced), background: '#94a3b8' }} title={`Not placed / others ${r.notPlaced}`} />
            </div>
            <span className="text-right font-semibold text-slate-700 dark:text-slate-200">
              {r.placed}/{r.total}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const CampusRecordPanel: React.FC = () => {
  const [branch, setBranch] = useState<'All' | 'CSE' | 'Civil'>('All');
  const [year, setYear] = useState<'All' | string>('All');

  const totals = useMemo(() => {
    const t = { students: 0, placed: 0, higher: 0 };
    YEAR_BRANCH_STATS.forEach(s => {
      t.students += s.total;
      t.placed += s.placed;
      t.higher += s.higherEdu;
    });
    return t;
  }, []);

  const log = useMemo(
    () =>
      CAMPUS_RECRUITER_LOG.filter(r => (branch === 'All' || r.branch === branch) && (year === 'All' || r.year === year)),
    [branch, year]
  );

  const latestCse = YEAR_BRANCH_STATS.find(s => s.year === '2025-26' && s.branch === 'CSE');
  const latestCivil = YEAR_BRANCH_STATS.find(s => s.year === '2025-26' && s.branch === 'Civil');

  const pill = (active: boolean) =>
    `px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
      active
        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <ExportButtons dataset="campus-record" label="Placement record:" />
        <ExportButtons dataset="campus-recruiters" label="Companies visited:" />
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '5-year students', value: totals.students, sub: 'CSE + Civil (2021-26)' },
          { label: 'Placed in jobs', value: totals.placed, sub: `${((totals.placed / totals.students) * 100).toFixed(0)}% overall` },
          { label: '2025-26 CSE', value: `${latestCse?.placementPct}%`, sub: `${latestCse?.placed}/${latestCse?.total} placed` },
          { label: '2025-26 Civil', value: `${latestCivil?.placementPct}%`, sub: `${latestCivil?.placed}/${latestCivil?.total} placed` },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{k.label}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{k.value}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Placement % by year</h3>
          <div className="flex items-center gap-4 text-[11px] mt-1 mb-2">
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: CSE_COLOR }} /> CSE</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: CIVIL_COLOR }} /> Civil</span>
          </div>
          <PlacementPctChart />
        </section>

        <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Outcome per batch (placed / total)</h3>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-emerald-600" /> Placed</span>
              <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-indigo-500" /> Higher edu</span>
              <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm bg-slate-400" /> Other</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-black text-cyan-700 dark:text-cyan-400 mb-1">Computer Science & Engineering</div>
            <OutcomeBars branch="CSE" />
          </div>
          <div>
            <div className="text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1">Civil Engineering</div>
            <OutcomeBars branch="Civil" />
          </div>
        </section>
      </div>

      {/* Salary table */}
      <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3">Package range by year</h3>
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
              <th className="py-1.5 pr-3">Year</th>
              <th className="py-1.5 pr-3">Branch</th>
              <th className="py-1.5 pr-3">Placed / Total</th>
              <th className="py-1.5 pr-3">Max</th>
              <th className="py-1.5">Min</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-200">
            {YEAR_BRANCH_STATS.map(s => (
              <tr key={`${s.year}-${s.branch}`} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-1.5 pr-3 font-mono">{s.year}</td>
                <td className="py-1.5 pr-3 font-semibold">{s.branch}</td>
                <td className="py-1.5 pr-3">{s.placed}/{s.total} ({s.placementPct}%)</td>
                <td className="py-1.5 pr-3 font-mono">{formatMoney(s.maxAnnual)}</td>
                <td className="py-1.5 font-mono">{formatMoney(s.minAnnual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
          All figures are annual packages (monthly pay × 12). The 2025-26 sheet multiplied by 12 twice; corrected here. Source: TPO placement sheets.
        </p>
      </section>

      {/* Recruiter log */}
      <section className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-black text-sm text-slate-900 dark:text-white">Companies that hired UGIP Tanakpur students</h3>
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'CSE', 'Civil'] as const).map(b => (
              <button key={b} type="button" className={pill(branch === b)} onClick={() => setBranch(b)}>
                {b}
              </button>
            ))}
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              aria-label="Filter by year"
              className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-0"
            >
              <option value="All">All years</option>
              {PLACEMENT_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
                <th className="py-1.5 pr-3">Year</th>
                <th className="py-1.5 pr-3">Branch</th>
                <th className="py-1.5 pr-3">Company</th>
                <th className="py-1.5 pr-3">Location</th>
                <th className="py-1.5 pr-3">Offers</th>
                <th className="py-1.5">Pay</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 dark:text-slate-200">
              {log.map((r, i) => (
                <tr key={`${r.year}-${r.branch}-${r.company}-${i}`} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1.5 pr-3 font-mono">{r.year}</td>
                  <td className="py-1.5 pr-3">{r.branch}</td>
                  <td className="py-1.5 pr-3 font-semibold">{r.company}</td>
                  <td className="py-1.5 pr-3 text-slate-500">{r.location || '—'}</td>
                  <td className="py-1.5 pr-3">{r.students ?? '—'}</td>
                  <td className="py-1.5 font-mono">{r.pay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          In 2025-26 several companies appear under both branches and the "offers" column counts offers, so it can exceed the number of placed students.
        </p>
      </section>
    </div>
  );
};
