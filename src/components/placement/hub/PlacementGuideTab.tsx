'use client';

/**
 * Placement Guidance page (readiness score, placement drive steps, recruiter checks, fake-job warnings, documents)
 * and Salary Guide page (starting pay by branch, government pay, CTC → in-hand calculator, salary terms).
 * The text tables live in src/lib/data/placementGuideData.ts; edit them there.
 */

import React, { useMemo, useState } from 'react';
import { IndianRupee, ListOrdered, TrendingUp, ShieldAlert, Gauge, FileCheck2, Landmark, BookOpen } from 'lucide-react';
import {
  AFTER_JOINING,
  DOCUMENTS,
  GOOD_JOB,
  GOVT_PAY,
  GROWTH,
  RED_FLAGS,
  SALARY_CIVIL,
  SALARY_COMMON,
  SALARY_CSE,
  STEPS,
  TERMS,
  type Band,
} from '../../../lib/data/placementGuideData';
import { useCollege } from '../../../context/CollegeContext';
import { usePlacementTracker } from '../../../hooks/usePlacementTracker';
import { YEAR_BRANCH_STATS } from '../../../lib/data/campusPlacementStats';
import { bankFor, branchOf } from '../../../lib/data/placementQnaBank';

// Two separate pages: Placement Guidance (how to get and judge a job) and Salary Guide (what you will be paid).
// All pay figures are indicative starting ranges for diploma freshers; the offer letter / notification is final.













const box = 'p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3';
const h3 = 'font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2';

const BandTable: React.FC<{ title: string; rows: Band[]; payHead?: string }> = ({ title, rows, payHead = 'Starting pay' }) => (
  <section className={box}>
    <h3 className={h3}>
      <IndianRupee className="w-5 h-5 text-cyan-700" /> {title}
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400 text-left">
          <tr>
            <th className="py-2 pr-3">Role</th>
            <th className="pr-3">{payHead}</th>
            <th>Where</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map(([r, p, e]) => (
            <tr key={r}>
              <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-100">{r}</td>
              <td className="pr-3 min-w-[160px]">{p}</td>
              <td className="text-slate-500">{e}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

/** Salary Guide: starting pay by branch, government pay, growth, CTC → in-hand calculator and salary terms. */
export const SalaryGuideTab: React.FC = () => {
  const [ctc, setCtc] = useState(2.4);

  // CTC → in-hand (approximate): employer PF is inside CTC, employee PF is deducted, ESI applies up to ₹21,000 gross.
  const pay = useMemo(() => {
    const monthlyCtc = (ctc * 100000) / 12;
    const basic = monthlyCtc * 0.45;
    const pf = Math.min(1800, Math.round(basic * 0.12));
    const gross = monthlyCtc - pf;
    const esi = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const inHand = gross - pf - esi - 200;
    return { monthlyCtc: Math.round(monthlyCtc), pf, gross: Math.round(gross), esi, inHand: Math.round(inHand) };
  }, [ctc]);

  const latest = YEAR_BRANCH_STATS.filter(s => s.year === '2025-26');

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <BandTable title="Computer Science – starting salary" rows={SALARY_CSE} />
        <BandTable title="Civil – starting salary" rows={SALARY_CIVIL} />
      </div>
      <BandTable title="Both branches – plants and apprenticeship" rows={SALARY_COMMON} />

      <section className={box}>
        <h3 className={h3}>
          <Landmark className="w-5 h-5 text-cyan-700" /> Government and PSU pay after diploma
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400 text-left">
              <tr>
                <th className="py-2 pr-3">Post</th>
                <th className="pr-3">Pay</th>
                <th>Recruited by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {GOVT_PAY.map(([r, p, e]) => (
                <tr key={r}>
                  <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-100">{r}</td>
                  <td className="pr-3 min-w-[160px]">{p}</td>
                  <td className="text-slate-500">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">DA is revised twice a year, so the total changes. Always read the pay level in the latest notification.</p>
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className={box}>
          <h3 className={h3}>CTC vs in-hand salary calculator</h3>
          <label className="flex items-center gap-3 text-sm">
            Offer CTC (lakh per year)
            <input
              type="number"
              step={0.1}
              min={1}
              max={20}
              value={ctc}
              onChange={e => setCtc(Math.max(1, Number(e.target.value) || 1))}
              className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </label>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">CTC per month</dt>
            <dd className="font-bold">₹{pay.monthlyCtc.toLocaleString('en-IN')}</dd>
            <dt className="text-slate-500">Employer PF (inside CTC)</dt>
            <dd>– ₹{pay.pf.toLocaleString('en-IN')}</dd>
            <dt className="text-slate-500">Gross salary</dt>
            <dd>₹{pay.gross.toLocaleString('en-IN')}</dd>
            <dt className="text-slate-500">Your PF deduction</dt>
            <dd>– ₹{pay.pf.toLocaleString('en-IN')}</dd>
            <dt className="text-slate-500">ESI (0.75%, if gross ≤ ₹21,000)</dt>
            <dd>– ₹{pay.esi.toLocaleString('en-IN')}</dd>
            <dt className="text-slate-500">Other deductions (approx.)</dt>
            <dd>– ₹200</dd>
            <dt className="font-bold">Approx. in-hand</dt>
            <dd className="font-bold text-emerald-700 text-lg">₹{pay.inHand.toLocaleString('en-IN')}</dd>
          </dl>
          <p className="text-xs text-slate-500">Estimate only – the exact split is in the offer letter's salary annexure. PF is your savings, not a loss.</p>
        </section>

        <section className={box}>
          <h3 className={h3}>
            <TrendingUp className="w-5 h-5 text-cyan-700" /> How salary grows
          </h3>
          <dl className="space-y-2 text-sm">
            {GROWTH.map(([k, p, v]) => (
              <div key={k} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <dt className="font-bold text-slate-800 dark:text-slate-100">{`${k}: ${p} / month`}</dt>
                <dd className="text-slate-600 dark:text-slate-300">{v}</dd>
              </div>
            ))}
          </dl>
          {latest.length > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {`UGIP Tanakpur 2025-26: ${latest.map(s => `${s.branch} ${s.placed}/${s.total} placed (${s.placementPct}%), highest ₹${(s.maxAnnual / 100000).toFixed(2)} LPA`).join(' · ')}.`}
            </p>
          )}
        </section>
      </div>

      <section className={box}>
        <h3 className={h3}>
          <BookOpen className="w-5 h-5 text-cyan-700" /> Salary words in an offer letter
        </h3>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          {TERMS.map(([k, v]) => (
            <div key={k} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <dt className="font-bold text-slate-800 dark:text-slate-100">{k}</dt>
              <dd className="text-slate-600 dark:text-slate-300">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-slate-500">All figures are usual starting ranges for diploma freshers, not promises. The offer letter or the official notification is final.</p>
      </section>
    </div>
  );
};

/** Placement Guidance: readiness, how a drive works, what recruiters check, choosing a job, documents and after joining. */
export const PlacementGuidanceTab: React.FC = () => {
  const { loggedInRole, loggedStudent } = useCollege();
  const { data } = usePlacementTracker(loggedInRole === 'student');

  // Student readiness from their own tracker data
  const readiness = useMemo(() => {
    if (loggedInRole !== 'student') return null;
    const resume = data.resumes[0]?.analysis.score ?? 0;
    const attempted = data.qna.reduce((s, a) => s + a.attempted, 0);
    const correct = data.qna.reduce((s, a) => s + a.correct, 0);
    const acc = attempted ? (correct / attempted) * 100 : 0;
    const done = new Set(data.qna.flatMap(a => a.answers.filter(x => x.selectedIndex !== null).map(x => x.questionId))).size;
    const coverage = Math.min(100, (done / 300) * 100); // 300 questions = well practised
    const interview = data.interviews.reduce((m, x) => Math.max(m, x.overallScore), 0);
    const panel = data.panels.reduce((m, p) => Math.max(m, p.overall ?? 0), 0);
    const score = Math.round(resume * 0.3 + acc * 0.25 + coverage * 0.1 + interview * 0.25 + panel * 0.1);
    const tips: string[] = [];
    if (resume < 70) tips.push('Improve your resume to 70+ (Send Resume & Analysis shows what is missing).');
    if (acc < 70) tips.push('Raise Q&A accuracy to 70% – read the explanations of wrong answers.');
    if (done < 300) tips.push(`Practise at least 300 questions (done: ${done} of ${bankFor(branchOf(loggedStudent?.branch)).length}).`);
    if (interview < 70) tips.push('Do a live voice & video mock interview until you score 70%+.');
    if (!panel) tips.push('Book one panel interview with faculty before the drive.');
    return { score, resume, acc: Math.round(acc), done, interview, panel, tips };
  }, [data, loggedInRole]);

  return (
    <div className="space-y-5">
      {readiness && (
        <section className="p-5 rounded-2xl bg-[#13294b] text-[#ffffff] space-y-3">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-300" /> {`Your placement readiness: ${readiness.score}%`}
          </h3>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${readiness.score}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            <span>Resume: <b>{readiness.resume}</b></span>
            <span>Q&A accuracy: <b>{readiness.acc}%</b></span>
            <span>Questions done: <b>{readiness.done}</b></span>
            <span>Best practice interview: <b>{readiness.interview}%</b></span>
            <span>Panel interview: <b>{readiness.panel || '—'}</b></span>
          </div>
          {readiness.tips.length > 0 && (
            <ul className="list-disc pl-5 text-sm text-[#f1dca4] space-y-0.5">
              {readiness.tips.map(t => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <section className={box}>
          <h3 className={h3}>
            <ListOrdered className="w-5 h-5 text-cyan-700" /> How a placement drive works
          </h3>
          <ol className="space-y-2 text-sm">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full bg-[#13294b] text-[#ffffff] grid place-items-center text-xs font-bold">{i + 1}</span>
                <span>
                  <b className="text-slate-800 dark:text-slate-100">{t}.</b> <span className="text-slate-600 dark:text-slate-300">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={box}>
          <h3 className={h3}>
            <FileCheck2 className="w-5 h-5 text-cyan-700" /> What recruiters check
          </h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>Most private companies ask for 55–60%+ in diploma and no active backlog.</li>
            <li>A 1-page resume with 2 projects, training and skills (AutoCAD / Python etc.).</li>
            <li>Clear basics of your branch – they ask simple questions deeply.</li>
            <li>Communication and confidence in the HR round.</li>
            <li>Willingness to relocate and work in shifts / on site.</li>
          </ul>
          <h4 className="font-bold text-rose-700 flex items-center gap-1.5 pt-1">
            <ShieldAlert className="w-4 h-4" /> Fake-job red flags
          </h4>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {RED_FLAGS.map(r => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className={box}>
        <h3 className={h3}>
          <FileCheck2 className="w-5 h-5 text-cyan-700" /> How to choose a good job after diploma
        </h3>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          {GOOD_JOB.map(([k, v]) => (
            <div key={k} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <dt className="font-bold text-slate-800 dark:text-slate-100">{k}</dt>
              <dd className="text-slate-600 dark:text-slate-300">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className={box}>
          <h3 className={h3}>
            <FileCheck2 className="w-5 h-5 text-cyan-700" /> Documents to keep ready
          </h3>
          <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
            {DOCUMENTS.map(d => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>

        <section className={box}>
          <h3 className={h3}>
            <TrendingUp className="w-5 h-5 text-cyan-700" /> After joining – how your performance is judged
          </h3>
          <dl className="space-y-2 text-sm">
            {AFTER_JOINING.map(([k, v]) => (
              <div key={k}>
                <dt className="font-bold text-slate-800 dark:text-slate-100">{k}</dt>
                <dd className="text-slate-600 dark:text-slate-300">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
};
