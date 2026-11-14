'use client';

/**
 * Quiz statistics tab: accuracy and attempts of the student's practice tests.
 */
import React from 'react';
import { useCollege } from '../../../context/CollegeContext';
import { Target, CheckCircle2, XCircle, TrendingUp, Award } from 'lucide-react';

interface Props {
  onOpenMockTests?: () => void;
  onOpenGovtJobs?: () => void;
}

const levelFor = (acc: number, attempted: number) => {
  if (attempted < 5) return { label: 'Just started', tone: 'text-slate-600 dark:text-slate-300', tip: 'Attempt at least 10 questions to get a meaningful accuracy score.' };
  if (acc >= 85) return { label: 'Interview ready', tone: 'text-emerald-600 dark:text-emerald-400', tip: 'Great accuracy. Move to timed mock tests and company-specific questions.' };
  if (acc >= 65) return { label: 'On track', tone: 'text-cyan-600 dark:text-cyan-400', tip: 'Revise the explanations of wrong answers, then retry the same subject.' };
  return { label: 'Needs practice', tone: 'text-amber-600 dark:text-amber-400', tip: 'Go back to basics: study the concept first, then solve 10 questions daily.' };
};

export const QuizStatsTab: React.FC<Props> = ({ onOpenMockTests, onOpenGovtJobs }) => {
  const { quizStats } = useCollege();
  const { totalAttempted, totalCorrect, totalWrong, accuracyPercentage, lastUpdated } = quizStats;
  const level = levelFor(accuracyPercentage, totalAttempted);

  // Ring gauge
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, accuracyPercentage)) / 100) * c;

  const tiles = [
    { label: 'Attempted', value: totalAttempted, icon: Target, tone: 'text-slate-700 dark:text-slate-200' },
    { label: 'Correct', value: totalCorrect, icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Wrong', value: totalWrong, icon: XCircle, tone: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <svg viewBox="0 0 120 120" className="w-40 h-40" role="img" aria-label={`Accuracy ${accuracyPercentage} percent`}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#2a4f8a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="58" textAnchor="middle" fontSize="24" fontWeight="800" fill="currentColor">
              {accuracyPercentage}%
            </text>
            <text x="60" y="76" textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>
              ACCURACY
            </text>
          </svg>
          <span className={`text-sm font-black ${level.tone}`}>{level.label}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</span>
        </section>

        <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {tiles.map(t => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <Icon className={`w-4 h-4 ${t.tone}`} />
                  <div className={`text-2xl font-black mt-1 ${t.tone}`}>{t.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t.label}</div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
              <span>Correct vs wrong</span>
              <span>
                {totalCorrect} / {totalAttempted}
              </span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div style={{ width: totalAttempted ? `${(totalCorrect / totalAttempted) * 100}%` : 0, background: '#059669' }} />
              <div style={{ width: totalAttempted ? `${(totalWrong / totalAttempted) * 100}%` : 0, background: '#e11d48' }} />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 text-xs text-cyan-900 dark:text-cyan-200">
            <TrendingUp className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{level.tip}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {onOpenGovtJobs && (
              <button
                type="button"
                onClick={onOpenGovtJobs}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Practise govt-exam quiz</span>
              </button>
            )}
            {onOpenMockTests && (
              <button
                type="button"
                onClick={onOpenMockTests}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Open 6-domain mock tests</span>
              </button>
            )}
          </div>
        </section>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        These numbers update every time you answer a question in the govt-exam quiz (Govt Jobs & Video Hub).
      </p>
    </div>
  );
};
