import { NextRequest, NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { getItem } from '@/lib/server/trackerStore';
import { VIDEO_CHUNK, canSee, readVideoRange, videoLength } from '@/lib/server/videoStore';
import type { VideoLecture } from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/videos/<id>/file – the video, always answered as a Range response of at most 2.5 MB,
 * so the browser player can seek and big files work on hosts with a response-size limit.
 */
export const GET = handle(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const me = await requireUser();
  const { id } = await ctx.params;
  const v = await getItem<VideoLecture>(id);
  if (!v || !id.startsWith('vid-') || v.source === 'youtube' || !canSee(v, me)) throw new HttpError(404, 'Video not found.');
  const total = await videoLength(id);
  if (!total) throw new HttpError(404, 'Video file missing.');

  const m = (req.headers.get('range') ?? '').match(/bytes=(\d*)-(\d*)/);
  let start = m && m[1] ? Number(m[1]) : 0;
  let end = m && m[2] ? Number(m[2]) : total - 1;
  if (m && !m[1] && m[2]) {
    start = Math.max(0, total - Number(m[2])); // suffix range: last N bytes
    end = total - 1;
  }
  if (start >= total || start > end) {
    return new NextResponse(null, { status: 416, headers: { 'content-range': `bytes */${total}` } });
  }
  end = Math.min(end, total - 1, start + VIDEO_CHUNK - 1);
  const part = await readVideoRange(id, start, end - start + 1);
  return new NextResponse(new Uint8Array(part), {
    status: 206,
    headers: {
      'content-type': v.mimeType || 'video/mp4',
      'content-range': `bytes ${start}-${start + part.length - 1}/${total}`,
      'content-length': String(part.length),
      'accept-ranges': 'bytes',
      'cache-control': 'private, max-age=3600',
    },
  });
});
