'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Shared pagination for every long list:
 *   const pg = usePaged(items, 10);
 *   <ShowEntries pg={pg} />          ← top: "Show 10 / 25 / 50 / 100"
 *   {pg.pageItems.map(...)}
 *   <Pager pg={pg} />                ← bottom: Prev 1 2 3 … Next
 */
export function usePaged<T>(items: T[], defaultSize = 10) {
  const [size, setSizeRaw] = useState(defaultSize);
  const [page, setPage] = useState(0);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));

  // Back to page 1 when the list changes (filter / search) or page size changes.
  useEffect(() => setPage(0), [total, size]);
  const safePage = Math.min(page, pages - 1);

  const pageItems = useMemo(() => items.slice(safePage * size, safePage * size + size), [items, safePage, size]);
  const setSize = (n: number) => setSizeRaw(n);
  return { pageItems, page: safePage, setPage, size, setSize, pages, total, offset: safePage * size };
}
export type Paged = ReturnType<typeof usePaged<unknown>>;

const SIZES = [10, 25, 50, 100];

export const ShowEntries: React.FC<{ pg: Pick<Paged, 'size' | 'setSize' | 'total' | 'offset' | 'pageItems'>; label?: string }> = ({ pg, label = 'entries' }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
    <label className="inline-flex items-center gap-2 font-semibold">
      Show
      <select
        value={pg.size}
        onChange={e => pg.setSize(Number(e.target.value))}
        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
      >
        {SIZES.map(n => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {label}
    </label>
    <span className="text-slate-500">
      {pg.total === 0 ? 'No records' : `Showing ${pg.offset + 1}–${pg.offset + pg.pageItems.length} of ${pg.total}`}
    </span>
  </div>
);

export const Pager: React.FC<{ pg: Pick<Paged, 'page' | 'pages' | 'setPage'> }> = ({ pg }) => {
  if (pg.pages <= 1) return null;
  // compact page list: 1 … p-1 p p+1 … last
  const nums: Array<number | '…'> = [];
  for (let i = 0; i < pg.pages; i++) {
    if (i === 0 || i === pg.pages - 1 || Math.abs(i - pg.page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  const btn = 'min-w-8 h-8 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 pt-2" aria-label="Pagination">
      <button className={`${btn} border-slate-200 dark:border-slate-700 inline-flex items-center gap-1`} disabled={pg.page === 0} onClick={() => pg.setPage(pg.page - 1)}>
        <ChevronLeft className="w-3.5 h-3.5" /> Prev
      </button>
      {nums.map((n, i) =>
        n === '…' ? (
          <span key={`e${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => pg.setPage(n)}
            className={`${btn} ${n === pg.page ? 'bg-[#13294b] text-[#ffffff] border-[#13294b] dark:bg-cyan-700 dark:border-cyan-700' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}
          >
            {n + 1}
          </button>
        )
      )}
      <button className={`${btn} border-slate-200 dark:border-slate-700 inline-flex items-center gap-1`} disabled={pg.page >= pg.pages - 1} onClick={() => pg.setPage(pg.page + 1)}>
        Next <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
};
