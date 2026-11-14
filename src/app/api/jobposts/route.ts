/**
 * GET/POST /api/jobposts – "Latest openings" in Job House: jobs the TPO / faculty post with the official link and last date.
 * GET: everyone logged in (students get their branch + "Both"; closed posts older than 30 days are left out).
 * POST (faculty/admin): action add | delete. Links must be https. The newest posts also run in the header Notices strip.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { deleteItem, getItem, listItems, putItem } from '@/lib/server/trackerStore';
import { branchOf } from '@/lib/data/placementQnaBank';
import type { JobPost } from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

const Add = z.object({
  action: z.literal('add'),
  title: z.string().trim().min(3, 'Write the post / job title.').max(150),
  organisation: z.string().trim().min(2, 'Write the organisation.').max(120),
  branch: z.enum(['CSE', 'Civil', 'Both']),
  type: z.enum(['Government', 'PSU', 'Private', 'Apprenticeship', 'Internship']),
  location: z.string().trim().max(100).default(''),
  lastDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick the last date.'),
  link: z.string().trim().url('Paste the full link (https://…).').refine(u => u.startsWith('https://'), 'Use an https:// link.'),
  eligibility: z.string().trim().max(400).default(''),
  salary: z.string().trim().max(100).default(''),
});
const Del = z.object({ action: z.literal('delete'), id: z.string().startsWith('job-') });

export const GET = handle(async () => {
  const me = await requireUser();
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  let posts = (await listItems<JobPost>('jobpost')).filter(p => p.lastDate >= cutoff);
  if (me.role === 'student') {
    const b = branchOf(me.department);
    posts = posts.filter(p => p.branch === 'Both' || p.branch === b);
  }
  posts.sort((a, b) => a.lastDate.localeCompare(b.lastDate));
  return NextResponse.json({ success: true, posts });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser('faculty', 'admin');
  const body = await req.json();
  if (body?.action === 'delete') {
    const { id } = Del.parse(body);
    const p = await getItem<JobPost>(id);
    if (!p) throw new HttpError(404, 'Post not found.');
    if (me.role !== 'admin' && p.postedById !== me.id) throw new HttpError(403, 'Only the person who posted it, or the admin, can delete it.');
    await deleteItem(id);
    return NextResponse.json({ success: true });
  }
  const b = Add.parse(body);
  const post: JobPost = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: b.title,
    organisation: b.organisation,
    branch: b.branch,
    type: b.type,
    location: b.location,
    lastDate: b.lastDate,
    link: b.link,
    eligibility: b.eligibility,
    salary: b.salary,
    postedById: me.id,
    postedByName: me.name,
    createdAt: new Date().toISOString(),
  };
  await putItem('jobpost', post.id, null, post);
  await audit(me, `Posted job: ${post.title}`, 'PLACEMENTS', 'SUCCESS', post.organisation, clientIp(req));
  return NextResponse.json({ success: true, post });
});
