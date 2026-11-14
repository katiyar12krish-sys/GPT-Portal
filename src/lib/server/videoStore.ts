import fs from 'node:fs';
import path from 'node:path';
import { query } from './db';
import { isDemoMode } from './demo';
import type { SessionUser } from './auth';
import type { VideoLecture } from '@/lib/tracker/types';

/**
 * Video files are moved in small pieces so they also work on hosts with a ~4.5 MB request / response limit (Vercel):
 * upload = many PUTs of CHUNK bytes appended in order; playback and download = Range requests of at most CHUNK bytes.
 * Demo mode keeps the file in .demo-data/files/<id>; with a database it is the `file` column of tracker_items.
 */
export const VIDEO_CHUNK = 2.5 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 300 * 1024 * 1024;

const DIR = path.join(process.cwd(), '.demo-data', 'files');
const demoPath = (id: string) => path.join(DIR, path.basename(id));

export async function videoLength(id: string): Promise<number> {
  if (isDemoMode()) {
    try {
      return fs.statSync(demoPath(id)).size;
    } catch {
      return 0;
    }
  }
  const r = (await query('SELECT COALESCE(length(file), 0) AS n FROM tracker_items WHERE id=$1', [id]))[0];
  return Number(r?.n ?? 0);
}

/** Appends a piece at `offset`. A repeated piece (retry after a lost reply) is ignored. Returns the new length. */
export async function appendVideoChunk(id: string, offset: number, buf: Buffer): Promise<number> {
  const have = await videoLength(id);
  if (offset + buf.length <= have) return have; // already stored
  if (offset !== have) throw new Error(`Expected piece at ${have}, got ${offset}.`);
  if (isDemoMode()) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.appendFileSync(demoPath(id), buf);
  } else {
    await query("UPDATE tracker_items SET file = COALESCE(file, ''::bytea) || $2 WHERE id=$1", [id, buf]);
  }
  return have + buf.length;
}

export async function readVideoRange(id: string, start: number, length: number): Promise<Buffer> {
  if (isDemoMode()) {
    const fd = fs.openSync(demoPath(id), 'r');
    try {
      const out = Buffer.alloc(length);
      const n = fs.readSync(fd, out, 0, length, start);
      return out.subarray(0, n);
    } finally {
      fs.closeSync(fd);
    }
  }
  const r = (await query('SELECT substring(file from $2 for $3) AS part FROM tracker_items WHERE id=$1', [id, start + 1, length]))[0];
  return r?.part ?? Buffer.alloc(0);
}

export function removeVideoFile(id: string) {
  if (isDemoMode()) {
    try {
      fs.unlinkSync(demoPath(id));
    } catch {
      /* already gone */
    }
  }
  // With a database the file is deleted together with its row.
}

/** Student department looks like "Computer Science & Engineering (3rd Year)". */
export function studentBranchYear(me: SessionUser): { branch: 'CSE' | 'Civil'; year: string } {
  const d = me.department ?? '';
  return { branch: /civil/i.test(d) ? 'Civil' : 'CSE', year: d.match(/(1st|2nd|3rd) Year/)?.[0] ?? '' };
}

export function canSee(v: VideoLecture, me: SessionUser): boolean {
  if (me.role !== 'student') return true;
  if (v.status !== 'ready') return false;
  const { branch, year } = studentBranchYear(me);
  return (v.branch === 'All' || v.branch === branch) && (v.year === 'All' || v.year === year);
}
