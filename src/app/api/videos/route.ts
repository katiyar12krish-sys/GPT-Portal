/**
 * GET/POST /api/videos – Video Lectures: list, create an upload, add a YouTube link, finish, delete, mark viewed, toggle download.
 * The file itself is sent in pieces to /api/videos/chunk and played from /api/videos/<id>/file (see src/lib/server/videoStore.ts).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { deleteItem, getItem, listItems, putItem } from '@/lib/server/trackerStore';
import { VIDEO_CHUNK, VIDEO_MAX_BYTES, canSee, removeVideoFile, videoLength } from '@/lib/server/videoStore';
import type { VideoLecture } from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

const Meta = z.object({
  title: z.string().trim().min(3, 'Enter a title (at least 3 letters).').max(150),
  description: z.string().trim().max(1000).default(''),
  subject: z.string().trim().min(2, 'Enter the subject.').max(80),
  branch: z.enum(['All', 'CSE', 'Civil']),
  year: z.enum(['All', '1st Year', '2nd Year', '3rd Year']),
  allowDownload: z.boolean().default(true),
});
const Create = Meta.extend({
  action: z.literal('create'),
  source: z.enum(['recorded', 'uploaded']),
  fileName: z.string().trim().min(1).max(160),
  mimeType: z.string().max(80).default('video/webm'),
  sizeBytes: z.number().int().min(1, 'The video is empty.').max(VIDEO_MAX_BYTES, `Video is larger than ${VIDEO_MAX_BYTES / 1048576} MB.`),
  durationSec: z.number().min(0).max(36000).optional(),
});
const Youtube = Meta.extend({ action: z.literal('youtube'), url: z.string().trim().min(5, 'Paste the YouTube link.').max(300) });
const ById = z.object({ action: z.enum(['finish', 'delete', 'view', 'toggle_download']), id: z.string().min(3).max(80) });

const VIDEO_FILE = /\.(mp4|webm|mov|m4v|ogv)$/i;

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i);
  return m ? m[1] : null;
}

const newId = () => `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Students get the view count only, never the list of who watched. */
const forViewer = (v: VideoLecture, staff: boolean): VideoLecture => ({ ...v, viewCount: v.viewers.length, viewers: staff ? v.viewers : [] });

export const GET = handle(async () => {
  const me = await requireUser();
  const staff = me.role !== 'student';
  const all = await listItems<VideoLecture>('video');
  const videos = all.filter(v => canSee(v, me) && (v.status === 'ready' || v.uploadedById === me.id)).map(v => forViewer(v, staff));
  return NextResponse.json({ success: true, videos, chunkSize: VIDEO_CHUNK, maxBytes: VIDEO_MAX_BYTES });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser();
  const body = await req.json();
  const base = (m: z.infer<typeof Meta>) => ({
    title: m.title,
    description: m.description,
    subject: m.subject,
    branch: m.branch,
    year: m.year,
    allowDownload: m.allowDownload,
    uploadedById: me.id,
    uploadedByName: me.name,
    createdAt: new Date().toISOString(),
    viewers: [],
  });

  if (body?.action === 'create') {
    await requireUser('faculty', 'admin');
    const b = Create.parse(body);
    if (!VIDEO_FILE.test(b.fileName)) throw new HttpError(400, 'Use an MP4 or WebM video (MOV also works on most phones).');
    const v: VideoLecture = { id: newId(), ...base(b), source: b.source, fileName: b.fileName, mimeType: b.mimeType || 'video/mp4', sizeBytes: b.sizeBytes, durationSec: b.durationSec, status: 'uploading' };
    await putItem('video', v.id, me.id, v);
    return NextResponse.json({ success: true, video: v, chunkSize: VIDEO_CHUNK });
  }

  if (body?.action === 'youtube') {
    await requireUser('faculty', 'admin');
    const b = Youtube.parse(body);
    const yid = youtubeId(b.url);
    if (!yid) throw new HttpError(400, 'This is not a YouTube video link. Copy the link from the Share button on YouTube.');
    const v: VideoLecture = { id: newId(), ...base(b), source: 'youtube', youtubeId: yid, allowDownload: false, status: 'ready' };
    await putItem('video', v.id, me.id, v);
    await audit(me, `Added video link: ${v.title}`, 'ACADEMIC', 'SUCCESS', v.id, clientIp(req));
    return NextResponse.json({ success: true, video: forViewer(v, true) });
  }

  const { action, id } = ById.parse(body);
  const v = await getItem<VideoLecture>(id);
  if (!v || !id.startsWith('vid-') || !canSee(v, me)) throw new HttpError(404, 'Video not found.');
  const mayEdit = me.role === 'admin' || (me.role === 'faculty' && v.uploadedById === me.id);

  if (action === 'finish') {
    if (!mayEdit) throw new HttpError(403, 'Only the teacher who added this video can do this.');
    const have = await videoLength(id);
    if (have !== v.sizeBytes) throw new HttpError(400, `Upload incomplete (${have} of ${v.sizeBytes} bytes). Please try again.`);
    const done: VideoLecture = { ...v, status: 'ready' };
    await putItem('video', id, v.uploadedById, done);
    await audit(me, `Added video: ${v.title}`, 'ACADEMIC', 'SUCCESS', id, clientIp(req));
    return NextResponse.json({ success: true, video: forViewer(done, true) });
  }
  if (action === 'delete') {
    if (!mayEdit) throw new HttpError(403, 'Only the teacher who added this video, or the admin, can delete it.');
    await deleteItem(id);
    removeVideoFile(id);
    await audit(me, `Deleted video: ${v.title}`, 'ACADEMIC', 'SUCCESS', id, clientIp(req));
    return NextResponse.json({ success: true });
  }
  if (action === 'toggle_download') {
    if (!mayEdit) throw new HttpError(403, 'Only the teacher who added this video can change this.');
    if (v.source === 'youtube') throw new HttpError(400, 'YouTube videos cannot be downloaded from the portal.');
    const next: VideoLecture = { ...v, allowDownload: !v.allowDownload };
    await putItem('video', id, v.uploadedById, next);
    return NextResponse.json({ success: true, video: forViewer(next, true) });
  }
  // view: count each student once
  if (me.role === 'student' && !v.viewers.some(x => x.id === me.id)) {
    await putItem('video', id, v.uploadedById, { ...v, viewers: [...v.viewers, { id: me.id, name: me.name, at: new Date().toISOString() }] });
  }
  return NextResponse.json({ success: true });
});
