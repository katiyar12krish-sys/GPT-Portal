/**
 * Shared helpers for the semester-wise "Syllabus Q&A" section (v4.23).
 * Each subject of the UBTER / IRDT 2026–27 syllabus is one SylSpec: hand-written rows (unit by unit),
 * term tables (asked both ways + "correctly matched"), and formula generators that fill the subject up to its target.
 * Used by syllabusYear1.ts (Sem I–II, common to CSE and Civil) and syllabusCseSem3.ts (Sem III CSE).
 */
import type { PlacementMcq, QnaCategory } from '../placementQnaBank';
import { fmt, mcq, numDistractors, type Rng } from './builder';
import type { Fact } from './pairs';
import type { Branch } from './branchSubjects';

export const SYL: QnaCategory = 'Semester Syllabus';
export type Make = (r: Rng, id: string) => PlacementMcq | null;
export type Row = [string, string, string, string, string, string?];

export interface Table {
  facts: Fact[];
  ask: (a: string) => string;
  inv: (b: string) => string;
  label: string;
}

export interface SylSpec {
  sem: number; // 1 – 6
  name: string; // official subject name
  code: string; // id prefix, never change (question ids depend on it)
  seed: number;
  branch?: Branch; // empty = common to CSE and Civil (first year)
  units: string; // unit list from the syllabus, shown in the guide
  rows: Row[];
  tables?: Table[];
  make?: Make[];
  target?: number; // default 100
}

/** Numeric answer with three nearby wrong answers. */
export const num = (r: Rng, id: string, q: string, a: number, why: string, unit = '', step?: number) =>
  mcq(r, id, SYL, q, `${fmt(a)}${unit}`, numDistractors(r, a, step ?? Math.max(1, Math.round(Math.abs(a) * 0.15))).map(v => `${fmt(v)}${unit}`), why);
/** Text answer with given wrong answers. */
export const str = (r: Rng, id: string, q: string, a: string, wrong: string[], why: string) => mcq(r, id, SYL, q, a, wrong, why);
export const r2 = (n: number) => Math.round(n * 100) / 100;
