import { NextRequest, NextResponse } from 'next/server';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { getItem } from '@/lib/server/trackerStore';
import { VIDEO_CHUNK, appendVideoChunk } from '@/lib/server/videoStore';
import type { VideoLecture } from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

/** PUT /api/videos/chunk?id=<video>&offset=<byte> with one piece (≤ 2.5 MB) of the video as the raw body. */
export const PUT = handle(async (req: NextRequest) => {
  const me = await requireUser('faculty', 'admin');
  const id = req.nextUrl.searchParams.get('id') ?? '';
  const offset = Number(req.nextUrl.searchParams.get('offset'));
  const v = await getItem<VideoLecture>(id);
  if (!v || !id.startsWith('vid-')) throw new HttpError(404, 'Video not found.');
  if (v.uploadedById !== me.id) throw new HttpError(403, 'This upload belongs to another teacher.');
  if (v.status !== 'uploading') throw new HttpError(400, 'This video is already uploaded.');
  if (!Number.isInteger(offset) || offset < 0) throw new HttpError(400, 'Bad offset.');
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length || buf.length > VIDEO_CHUNK) throw new HttpError(400, 'Bad piece size.');
  if (offset + buf.length > (v.sizeBytes ?? 0)) throw new HttpError(400, 'Piece goes past the end of the video.');
  try {
    const received = await appendVideoChunk(id, offset, buf);
    return NextResponse.json({ success: true, received });
  } catch (e: any) {
    throw new HttpError(409, e?.message || 'Pieces arrived out of order.');
  }
});
