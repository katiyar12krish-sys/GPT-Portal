/**
 * Semester-wise "Syllabus Q&A" (v4.23): questions that follow the UBTER / IRDT syllabus subject by subject.
 * - First year (Sem I, II): common to CSE and Civil – syllabusYear1.ts
 * - CSE Sem III: syllabusCseSem3.ts
 * To add a semester (e.g. Civil Sem III or CSE Sem IV): write its SylSpec list in a new file and add it to ALL_SPECS below.
 * Each subject is labelled "Sem N · Subject" so the Placement Q&A and the Mock Test Centre list them in syllabus order.
 */
import type { PlacementMcq } from '../placementQnaBank';
import { fromRows, generate } from './builder';
import { matchedPairs, pairs } from './pairs';
import { SYL, type SylSpec } from './syllabusTypes';
import { YEAR1_SUBJECTS } from './syllabusYear1';
import { CSE_SEM3_SUBJECTS } from './syllabusCseSem3';

const ALL_SPECS: SylSpec[] = [...YEAR1_SUBJECTS, ...CSE_SEM3_SUBJECTS];

export const sylSubjectLabel = (s: Pick<SylSpec, 'sem' | 'name'>) => `Sem ${s.sem} · ${s.name}`;

function build(s: SylSpec): PlacementMcq[] {
  const label = sylSubjectLabel(s);
  const seen = new Set<string>();
  const out: PlacementMcq[] = [];
  const add = (list: PlacementMcq[]) => list.forEach(q => { if (!seen.has(q.question)) { seen.add(q.question); out.push(q); } });
  add(fromRows(`${s.code}-r`, s.seed, SYL, s.rows));
  (s.tables ?? []).forEach((t, k) => {
    add(pairs(`${s.code}-t${k}`, s.seed + 11 * (k + 1), SYL, label, t.facts, t.ask, t.inv));
    add(matchedPairs(`${s.code}-m${k}`, s.seed + 13 * (k + 1), SYL, label, t.facts, t.label));
  });
  const need = (s.target ?? 100) - out.length;
  if (s.make?.length && need > 0) {
    const makers = s.make;
    add(generate(`${s.code}-g`, s.seed + 101, need, (r, id, i) => makers[i % makers.length](r, id)));
  }
  return out.map(q => ({ ...q, category: SYL, subject: label, ...(s.branch ? { branch: s.branch } : {}) }));
}

/** Every syllabus question, in semester and subject order. */
export const SEMESTER_SYLLABUS: PlacementMcq[] = ALL_SPECS.flatMap(build);

/** Subject list with units, for the "Syllabus guide" shown on screen. */
export const SYLLABUS_GUIDE = ALL_SPECS.map(s => ({ sem: s.sem, subject: sylSubjectLabel(s), name: s.name, branch: s.branch ?? null, units: s.units }));
