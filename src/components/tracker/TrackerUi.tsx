'use client';

import React from 'react';

// Small shared pieces for the Placement Tracker screens (same look as Placement Hub).

export const ScreenHeader: React.FC<{ badge: string; title: string; subtitle: string; children?: React.ReactNode }> = ({ badge, title, subtitle, children }) => (
  <header className="p-6 rounded-3xl bg-[#13294b] text-white border-b-4 border-gold-500 shadow-xl space-y-3">
    <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b]">{badge}</span>
    <h1 className="text-2xl sm:text-3xl font-black">{title}</h1>
    <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{subtitle}</p>
    {children}
  </header>
);

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${className}`}>{children}</section>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone = 'text-slate-800 dark:text-slate-100' }) => (
  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
    <div className={`text-2xl font-black ${tone}`}>{value}</div>
    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</div>
  </div>
);

export const scoreTone = (n: number) =>
  n >= 70 ? 'text-emerald-600 dark:text-emerald-400' : n >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';

export const ScoreBar: React.FC<{ value: number; max?: number }> = ({ value, max = 100 }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Pill: React.FC<{ tone?: 'cyan' | 'green' | 'amber' | 'rose' | 'slate'; children: React.ReactNode }> = ({ tone = 'slate', children }) => {
  const map = {
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    slate: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black ${map[tone]}`}>{children}</span>;
};

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const btn = 'px-4 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
export const btnPrimary = `${btn} bg-[#13294b] text-white hover:opacity-90 dark:bg-cyan-600 `;
export const btnGhost = `${btn} border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800`;
export const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500';
