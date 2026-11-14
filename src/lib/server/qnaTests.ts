import type { SessionUser } from './auth';
import type { QnaTest } from '@/lib/tracker/types';
import { branchOf } from '@/lib/data/placementQnaBank';

/** Is this faculty test meant for this student? (branch and year from the student's department, e.g. "Civil Engineering (3rd Year)") */
export function testIsFor(t: QnaTest, me: SessionUser): boolean {
  if (me.role !== 'student') return true;
  const dept = me.department ?? '';
  const year = dept.match(/(1st|2nd|3rd) Year/)?.[0] ?? '';
  return (t.branch === 'All' || t.branch === branchOf(dept)) && (t.year === 'All' || t.year === year);
}
