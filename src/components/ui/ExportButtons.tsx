'use client';

import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { DownloadButton } from './DownloadButton';

/** Excel + PDF download buttons for any list. `params` are the filters shown on screen. */
export const ExportButtons: React.FC<{ dataset: string; params?: Record<string, string | number | undefined>; label?: string }> = ({ dataset, params, label }) => {
  const url = (format: 'xlsx' | 'pdf') => {
    const q = new URLSearchParams({ format });
    Object.entries(params ?? {}).forEach(([k, v]) => v !== undefined && v !== '' && q.set(k, String(v)));
    return `/api/export/${dataset}?${q}`;
  };
  const cls = 'px-3 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800';
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {label && <span className="text-xs font-bold text-slate-500">{label}</span>}
      <DownloadButton href={url('xlsx')} className={cls}>
        <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Excel
      </DownloadButton>
      <DownloadButton href={url('pdf')} className={cls}>
        <FileText className="w-4 h-4 text-rose-700" /> PDF
      </DownloadButton>
    </div>
  );
};
