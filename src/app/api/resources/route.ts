/**
 * GET/POST /api/resources – Academic Resource Library: list notes/papers, upload (max 8 MB), approve and delete.
 * Files are stored with saveFile() from src/lib/server/trackerStore.ts.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { audit, clientIp, handle, HttpError, requireUser } from '@/lib/server/auth';
import { saveFile } from '@/lib/server/trackerStore';
import { allResources, assertCanDelete, findResource, saveResource, visibleTo, type StoredResource } from '@/lib/server/resourceStore';
import type { AcademicYear } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|jpg|jpeg|png)$/i;

const Upload = z.object({
  action: z.literal('upload'),
  title: z.string().trim().min(3, 'Enter a title.').max(200),
  description: z.string().max(1000).default(''),
  category: z.string().max(60),
  board: z.string().max(120),
  department: z.string().max(80),
  semester: z.number().int().min(1).max(6),
  subjectCode: z.string().trim().min(2, 'Enter the subject code.').max(20),
  subjectName: z.string().max(120).default(''),
  unitModule: z.string().max(120).optional(),
  tags: z.array(z.string().max(40)).max(20).default([]),
  fileName: z.string().trim().min(1, 'Choose a file.').max(160),
  mimeType: z.string().max(120).default(''),
  base64: z.string().min(1, 'Choose a file.'),
});

export const GET = handle(async () => {
  const me = await requireUser();
  const resources = (await allResources()).filter(r => visibleTo(r, me));
  return NextResponse.json({ success: true, resources });
});

export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser();
  const body = await req.json();

  if (body?.action === 'upload') {
    const b = Upload.parse(body);
    if (!ALLOWED.test(b.fileName)) throw new HttpError(400, 'Allowed files: PDF, Word, PowerPoint, Excel, TXT, ZIP, JPG, PNG.');
    const buf = Buffer.from(b.base64.replace(/^data:[^,]*,/, ''), 'base64');
    if (!buf.length) throw new HttpError(400, 'The file is empty.');
    if (buf.length > MAX_BYTES) throw new HttpError(400, 'File is larger than 8 MB.');
    const year: AcademicYear = b.semester <= 2 ? '1st Year' : b.semester <= 4 ? '2nd Year' : '3rd Year';
    const item: StoredResource = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: b.title,
      description: b.description || `${b.category} for ${b.subjectCode}.`,
      category: b.category as StoredResource['category'],
      board: b.board as StoredResource['board'],
      department: b.department as StoredResource['department'],
      semester: b.semester,
      academicYear: year,
      subjectCode: b.subjectCode.toUpperCase(),
      subjectName: b.subjectName,
      unitModule: b.unitModule,
      facultyId: me.id,
      facultyName: me.name,
      fileName: b.fileName,
      fileSize: buf.length >= 1048576 ? `${(buf.length / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(buf.length / 1024))} KB`,
      fileType: b.fileName.split('.').pop()!.toLowerCase(),
      uploadedAt: new Date().toISOString().slice(0, 10),
      downloadCount: 0,
      tags: b.tags,
      isVerifiedByHOD: me.role !== 'student', // student uploads wait for faculty approval
      hasFile: true,
      mimeType: b.mimeType,
    };
    await saveResource(item);
    await saveFile(item.id, buf);
    await audit(me, `Uploaded resource: ${item.title}`, 'ACADEMIC', 'SUCCESS', item.fileName, clientIp(req));
    return NextResponse.json({ success: true, resource: item });
  }

  const r = await findResource(String(body?.id ?? ''));
  if (body?.action === 'approve') {
    await requireUser('faculty', 'admin');
    await saveResource({ ...r, isVerifiedByHOD: true });
    return NextResponse.json({ success: true });
  }
  if (body?.action === 'delete') {
    assertCanDelete(r, me);
    await saveResource({ ...r, deleted: true });
    await audit(me, `Removed resource: ${r.title}`, 'ACADEMIC', 'WARNING', '', clientIp(req));
    return NextResponse.json({ success: true });
  }
  throw new HttpError(400, 'Unknown action.');
});
