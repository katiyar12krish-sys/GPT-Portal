import { INITIAL_ACADEMIC_RESOURCES } from '@/lib/data/resourceLibraryData';
import type { AcademicResource } from '@/lib/types';
import { HttpError, type SessionUser } from './auth';
import { getItem, listItems, putItem } from './trackerStore';

/** A library item. Built-in entries are overridden by a stored copy with the same id. */
export type StoredResource = AcademicResource & { hasFile?: boolean; deleted?: boolean; mimeType?: string };

export async function allResources(): Promise<StoredResource[]> {
  const stored = await listItems<StoredResource>('resource');
  const byId = new Map(stored.map(r => [r.id, r]));
  const seeds: StoredResource[] = INITIAL_ACADEMIC_RESOURCES.map(r => byId.get(r.id) ?? r);
  const uploaded = stored.filter(r => !INITIAL_ACADEMIC_RESOURCES.some(s => s.id === r.id));
  return [...uploaded, ...seeds].filter(r => !r.deleted);
}

/** Students see approved items and their own pending uploads. */
export const visibleTo = (r: StoredResource, me: SessionUser) => me.role !== 'student' || r.isVerifiedByHOD !== false || r.facultyId === me.id;

export async function findResource(id: string): Promise<StoredResource> {
  const r = (await getItem<StoredResource>(id)) ?? INITIAL_ACADEMIC_RESOURCES.find(x => x.id === id);
  if (!r || (r as StoredResource).deleted) throw new HttpError(404, 'Resource not found.');
  return r;
}

export const saveResource = (r: StoredResource) => putItem('resource', r.id, r.facultyId, r);

export function assertCanDelete(r: StoredResource, me: SessionUser) {
  if (me.role === 'admin' || r.facultyId === me.id) return;
  if (me.role === 'faculty' && (me.assignedSubjects.includes(r.subjectCode) || me.assignedSubjects.includes('ALL'))) return;
  throw new HttpError(403, 'You can remove only your own uploads or resources of your subjects.');
}
