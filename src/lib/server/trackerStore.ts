import fs from 'node:fs';
import path from 'node:path';
import { query } from './db';
import { isDemoMode } from './demo';
import { demoRoster } from './demoRoster';
import type { FacultyNotice, StudentRef } from '@/lib/tracker/types';
import { MAX_NOTICE_REMINDERS } from '@/lib/tracker/types';

/**
 * Storage for the Placement Tracker.
 *  - Real database → table `tracker_items` (see db/schema.sql)
 *  - Demo mode     → .demo-data/tracker.json (+ uploaded files in .demo-data/files)
 */
export type TrackerKind = 'resume' | 'qna' | 'interview' | 'notice' | 'panel' | 'resource' | 'chat' | 'video' | 'staff' | 'question' | 'qtest' | 'jobpost' | 'password';

interface Item {
  id: string;
  kind: TrackerKind;
  ownerId: string | null;
  data: any;
  createdAt: string;
}

const DIR = path.join(process.cwd(), '.demo-data');
const FILE = path.join(DIR, 'tracker.json');

declare global {
  // eslint-disable-next-line no-var
  var __demoTracker: Item[] | undefined;
}

function demoItems(): Item[] {
  if (!globalThis.__demoTracker) {
    try {
      globalThis.__demoTracker = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    } catch {
      globalThis.__demoTracker = [];
    }
  }
  return globalThis.__demoTracker!;
}
function saveDemo() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(globalThis.__demoTracker ?? [], null, 1));
  } catch {
    /* read-only hosting without a database: changes stay in memory only */
  }
}

export async function listItems<T>(kind: TrackerKind, ownerId?: string): Promise<T[]> {
  if (isDemoMode()) {
    return demoItems()
      .filter(i => i.kind === kind && (!ownerId || i.ownerId === ownerId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(i => i.data as T);
  }
  const rows = ownerId
    ? await query('SELECT data FROM tracker_items WHERE kind=$1 AND owner_id=$2 ORDER BY created_at DESC', [kind, ownerId])
    : await query('SELECT data FROM tracker_items WHERE kind=$1 ORDER BY created_at DESC', [kind]);
  return rows.map(r => r.data as T);
}

export async function putItem(kind: TrackerKind, id: string, ownerId: string | null, data: unknown) {
  if (isDemoMode()) {
    const items = demoItems();
    const i = items.findIndex(x => x.id === id);
    const item: Item = { id, kind, ownerId, data, createdAt: i >= 0 ? items[i].createdAt : new Date().toISOString() };
    if (i >= 0) items[i] = item;
    else items.push(item);
    saveDemo();
    return;
  }
  await query(
    `INSERT INTO tracker_items (id,kind,owner_id,data) VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data, updated_at=now()`,
    [id, kind, ownerId, JSON.stringify(data)]
  );
}

export async function getItem<T>(id: string): Promise<T | null> {
  if (isDemoMode()) return (demoItems().find(i => i.id === id)?.data as T) ?? null;
  const r = (await query('SELECT data FROM tracker_items WHERE id=$1', [id]))[0];
  return (r?.data as T) ?? null;
}

/** Demo mode only: synchronous read for code that cannot await (demo login). */
export function demoListSync<T>(kind: TrackerKind): T[] {
  return demoItems().filter(i => i.kind === kind).map(i => i.data as T);
}

export async function deleteItem(id: string) {
  if (isDemoMode()) {
    const items = demoItems();
    const i = items.findIndex(x => x.id === id);
    if (i >= 0) {
      items.splice(i, 1);
      saveDemo();
    }
    return;
  }
  await query('DELETE FROM tracker_items WHERE id=$1', [id]);
}

// ---------- uploaded resume files ----------
export async function saveFile(id: string, buf: Buffer) {
  if (isDemoMode()) {
    fs.mkdirSync(path.join(DIR, 'files'), { recursive: true });
    fs.writeFileSync(path.join(DIR, 'files', id), buf);
    return;
  }
  await query('UPDATE tracker_items SET file=$2 WHERE id=$1', [id, buf]);
}

export async function readFile(id: string): Promise<Buffer | null> {
  if (isDemoMode()) {
    try {
      return fs.readFileSync(path.join(DIR, 'files', path.basename(id)));
    } catch {
      return null;
    }
  }
  const r = (await query('SELECT file FROM tracker_items WHERE id=$1', [id]))[0];
  return r?.file ?? null;
}

// ---------- students a notice is meant for ----------
export interface TargetStudent extends StudentRef {
  branch: string;
  year: string;
}

export async function allStudents(): Promise<TargetStudent[]> {
  if (isDemoMode()) {
    return demoRoster().map(s => ({
      studentUserId: `user_student_${s.ubterRollNumber}`,
      rollNumber: s.ubterRollNumber,
      studentName: s.aadharName,
      department: `${s.branch} (${s.currentYear})`,
      branch: s.branch,
      year: s.currentYear,
    }));
  }
  const rows = await query(
    `SELECT s.user_id, s.roll_number, s.branch, s.current_year, u.name
       FROM students s JOIN users u ON u.id = s.user_id ORDER BY s.roll_number`
  );
  return rows.map(r => ({
    studentUserId: r.user_id,
    rollNumber: r.roll_number,
    studentName: r.name,
    department: `${r.branch} (${r.current_year})`,
    branch: r.branch,
    year: r.current_year,
  }));
}

export const noticeTargets = (n: FacultyNotice, list: TargetStudent[]) =>
  list.filter(s => (n.targetBranch === 'All' || s.branch === n.targetBranch) && (n.targetYear === 'All' || s.year === n.targetYear));

/**
 * Automatic reminders: every `reminderEveryMin` minutes a pending student gets one more reminder,
 * up to 3. Called whenever notices are read, so no cron is needed (the hourly cron also calls it).
 * Returns true if anything changed.
 */
export function applyAutoReminders(n: FacultyNotice, targets: TargetStudent[], now = Date.now()): boolean {
  let changed = false;
  const start = new Date(n.createdAt).getTime();
  const gap = Math.max(1, n.reminderEveryMin) * 60_000;
  for (const s of targets) {
    const st = (n.students[s.studentUserId] ??= { reminders: [] });
    if (st.acknowledgedAt || st.unlockedByFaculty) continue;
    const due = Math.min(MAX_NOTICE_REMINDERS, Math.floor((now - start) / gap));
    while (st.reminders.length < due) {
      st.reminders.push(new Date(start + gap * (st.reminders.length + 1)).toISOString());
      changed = true;
    }
  }
  return changed;
}
