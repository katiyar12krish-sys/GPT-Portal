'use client';

/**
 * Interview Q&A tab: common HR and technical interview questions with model answers.
 */
import { usePaged, ShowEntries, Pager } from '../../ui/Pagination';
import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { PlacementQuestionsScreen } from '../PlacementQuestionsScreen';
import { REGIONAL_COMPANIES } from '../../../lib/data/regionalCompaniesData';

const CompanyQuestionCard: React.FC<{ name: string; city: string; questions: string[] }> = ({ name, city, questions }) => {
  const [open, setOpen] = useState(false);
  return (
    <article className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
      <div>
        <h4 className="font-black text-sm text-slate-900 dark:text-white">{name}</h4>
        <span className="text-[11px] text-slate-400">{city}</span>
      </div>
      <ul className="list-disc pl-4 text-xs text-slate-700 dark:text-slate-200 space-y-1">
        {(open ? questions : questions.slice(0, 1)).map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
      {questions.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-xs font-black text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
        >
          <span>{open ? 'Show less' : `Read more (${questions.length - 1} more)`}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}
    </article>
  );
};

export const InterviewQATab: React.FC = () => {
  const [mode, setMode] = useState<'bank' | 'company'>('bank');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REGIONAL_COMPANIES.filter(
      c => !q || c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.sampleQuestions.some(s => s.toLowerCase().includes(q))
    );
  }, [query]);
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
        <button type="button" className={pill(mode === 'bank')} onClick={() => setMode('bank')}>
          Full question bank (260+)
        </button>
        <button type="button" className={pill(mode === 'company')} onClick={() => setMode('company')}>
          Regional company-wise questions
        </button>
      </div>

      {mode === 'bank' ? (
        <PlacementQuestionsScreen />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by company, city or question"
              aria-label="Search company-wise questions"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <ShowEntries pg={pg} label="questions" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            {pg.pageItems.map(c => (
              <CompanyQuestionCard key={c.id} name={c.name} city={c.city} questions={c.sampleQuestions} />
            ))}
          </div>
          <Pager pg={pg} />
          {list.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              No question matches your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
