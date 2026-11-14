/**
 * GET/POST /api/tracker – the Placement Tracker API used by most student/faculty screens.
 * GET returns resumes, Q&A attempts, interviews, notices and panels (students: only their own).
 * POST `action` = resume | qna | interview | panel_request | panel_schedule | panel_grade | notice_create | notice_ack | notice_remind | notice_unlock.
 * To add a new action: add a zod schema for its body, then a branch in POST that validates, saves with putItem() and returns JSON.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { audit, clientIp, handle, HttpError, requireUser, type SessionUser } from '@/lib/server/auth';
import { allStudents, applyAutoReminders, getItem, listItems, noticeTargets, putItem, saveFile } from '@/lib/server/trackerStore';
import { analyseResume, extractResumeText } from '@/lib/server/resumeAnalyzer';
import { evaluateInterview } from '@/lib/server/interviewEvaluator';
import { mcqById, type PlacementMcq } from '@/lib/data/placementQnaBank';
import { testIsFor } from '@/lib/server/qnaTests';
import { INTERVIEW_TRACKS } from '@/lib/data/mockInterviewBank';
import {
  MAX_NOTICE_REMINDERS,
  type FacultyNotice,
  type MockInterviewResult,
  type PanelInterview,
  type QnaAttempt,
  type QnaTest,
  type ResumeSubmission,
  type StudentNoticeView,
  type StudentRef,
} from '@/lib/tracker/types';

export const dynamic = 'force-dynamic';

const MAX_RESUME_BYTES = 2 * 1024 * 1024;
const uid = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const ref = (me: SessionUser): StudentRef => ({
  studentUserId: me.id,
  rollNumber: me.rollNumber ?? '',
  studentName: me.name,
  department: me.department ?? '',
});

/** Notices with automatic reminders applied (and saved if a new reminder became due). */
async function liveNotices() {
  const [notices, students] = await Promise.all([listItems<FacultyNotice>('notice'), allStudents()]);
  for (const n of notices) {
    if (applyAutoReminders(n, noticeTargets(n, students))) await putItem('notice', n.id, null, n);
  }
  return { notices, students };
}

function studentView(n: FacultyNotice, studentUserId: string): StudentNoticeView {
  const st = n.students[studentUserId] ?? { reminders: [] };
  const done = !!st.acknowledgedAt;
  const sent = st.reminders.length;
  const next = new Date(new Date(n.createdAt).getTime() + (sent + 1) * Math.max(1, n.reminderEveryMin) * 60_000);
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    actionRequired: n.actionRequired,
    createdByName: n.createdByName,
    createdAt: n.createdAt,
    done,
    remindersSent: sent,
    locked: !done && !st.unlockedByFaculty && sent >= MAX_NOTICE_REMINDERS,
    nextReminderAt: !done && sent < MAX_NOTICE_REMINDERS ? next.toISOString() : undefined,
  };
}

export const GET = handle(async () => {
  const me = await requireUser();
  const { notices, students } = await liveNotices();

  if (me.role === 'student') {
    const mine = notices.filter(n => noticeTargets(n, students).some(s => s.studentUserId === me.id));
    return NextResponse.json({
      success: true,
      resumes: await listItems<ResumeSubmission>('resume', me.id),
      qna: await listItems<QnaAttempt>('qna', me.id),
      interviews: await listItems<MockInterviewResult>('interview', me.id),
      notices: mine.map(n => studentView(n, me.id)),
      panels: await listItems<PanelInterview>('panel', me.id),
    });
  }

  return NextResponse.json({
    success: true,
    resumes: await listItems<ResumeSubmission>('resume'),
    qna: await listItems<QnaAttempt>('qna'),
    interviews: await listItems<MockInterviewResult>('interview'),
    notices,
    panels: await listItems<PanelInterview>('panel'),
    students: students.map(({ branch, year, ...s }) => ({ ...s, branch, year })),
  });
});

const ResumeBody = z.object({
  action: z.literal('resume'),
  fileName: z.string().trim().min(1).max(160),
  fileType: z.string().max(120).default(''),
  base64: z.string().min(1),
});
const QnaBody = z.object({
  action: z.literal('qna'),
  category: z.string().max(120),
  mode: z.enum(['Practice', 'Mock test', 'Faculty test']).default('Practice'),
  testId: z.string().max(80).optional(),
  durationSec: z.number().int().min(0).max(36000),
  answers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().int().nullable() })).min(1).max(100),
});
const InterviewBody = z.object({
  action: z.literal('interview'),
  track: z.string().refine(t => t in INTERVIEW_TRACKS, 'Unknown interview track.'),
  durationSec: z.number().int().min(0).max(36000),
  answers: z.array(z.string().max(3000)).max(10),
  mode: z.enum(['Typed', 'Voice & video']).default('Typed'),
  speaking: z
    .object({ wordsPerMinute: z.number().min(0).max(400), fillerWords: z.number().int().min(0).max(1000), avgAnswerSec: z.number().min(0).max(3600) })
    .optional(),
});
const PanelRequestBody = z.object({
  action: z.literal('panel_request'),
  track: z.string().refine(t => t in INTERVIEW_TRACKS, 'Unknown interview track.'),
  mode: z.enum(['In person (college)', 'Online (video call)']),
  preferredDate: z.string().min(8, 'Pick a date.').max(10),
  preferredSlot: z.string().min(1).max(40),
  note: z.string().max(500).default(''),
});
const PanelStaffBody = z.object({
  action: z.enum(['panel_schedule', 'panel_grade']),
  id: z.string(),
  scheduledAt: z.string().max(40).optional(),
  venueOrLink: z.string().max(300).optional(),
  rubric: z
    .object({
      technical: z.number().min(1).max(10),
      communication: z.number().min(1).max(10),
      confidence: z.number().min(1).max(10),
      bodyLanguage: z.number().min(1).max(10),
      grooming: z.number().min(1).max(10),
    })
    .optional(),
  remarks: z.string().max(2000).optional(),
});
const NoticeBody = z.object({
  action: z.literal('notice_create'),
  title: z.string().trim().min(3, 'Title is too short.').max(150),
  message: z.string().trim().min(3, 'Write the notice message.').max(3000),
  actionRequired: z.string().trim().max(200).default('Read and acknowledge'),
  targetBranch: z.string().max(80),
  targetYear: z.string().max(20),
  reminderEveryMin: z.number().int().min(1).max(10080),
});
const AckBody = z.object({ action: z.literal('notice_ack'), noticeId: z.string(), response: z.string().max(1000).default('') });
const StaffNoticeBody = z.object({
  action: z.enum(['notice_remind', 'notice_unlock']),
  noticeId: z.string(),
  studentUserId: z.string().optional(),
});

export const POST = handle(async (req: NextRequest) => {
  const body = await req.json();
  const action = String(body?.action ?? '');

  // ---------- student: submit resume ----------
  if (action === 'resume') {
    const me = await requireUser('student');
    const b = ResumeBody.parse(body);
    if (!/\.(pdf|docx|txt)$/i.test(b.fileName)) throw new HttpError(400, 'Upload a PDF, DOCX or TXT file.');
    const buf = Buffer.from(b.base64.replace(/^data:[^,]*,/, ''), 'base64');
    if (buf.length > MAX_RESUME_BYTES) throw new HttpError(400, 'File is larger than 2 MB.');
    const prev = await listItems<ResumeSubmission>('resume', me.id);
    const analysis = analyseResume(extractResumeText(b.fileName, buf), me.department ?? '');
    const item: ResumeSubmission = {
      ...ref(me),
      id: uid('res'),
      fileName: b.fileName,
      fileType: b.fileType,
      sizeKb: Math.round(buf.length / 1024),
      submittedAt: new Date().toISOString(),
      version: prev.length + 1,
      analysis,
      hasFile: true,
    };
    await putItem('resume', item.id, me.id, item);
    await saveFile(item.id, buf);
    await audit(me, `Submitted resume v${item.version} (${b.fileName})`, 'STUDENT_MGMT', 'SUCCESS', `score=${analysis.score}`, clientIp(req));
    return NextResponse.json({ success: true, resume: item });
  }

  // ---------- student: placement Q&A attempt (graded here, not in the browser) ----------
  if (action === 'qna') {
    const me = await requireUser('student');
    const b = QnaBody.parse(body);
    // A faculty test: only its own questions, only once, only for its branch/year.
    let test: QnaTest | null = null;
    if (b.testId) {
      test = await getItem<QnaTest>(b.testId);
      if (!test || !b.testId.startsWith('qt-')) throw new HttpError(404, 'Test not found.');
      if (!testIsFor(test, me)) throw new HttpError(403, 'This test is not for your class.');
      const done = (await listItems<QnaAttempt>('qna', me.id)).some(a => a.testId === test!.id);
      if (done) throw new HttpError(400, 'You have already submitted this test.');
      const allowed = new Set(test.questionIds);
      if (b.answers.some(a => !allowed.has(a.questionId))) throw new HttpError(400, 'Answers do not belong to this test.');
    }
    const answers = [];
    for (const a of b.answers) {
      // built-in bank first, then questions added by faculty (ids "cq-…")
      const q = mcqById(a.questionId) ?? (a.questionId.startsWith('cq-') ? await getItem<PlacementMcq>(a.questionId) : null);
      if (!q) throw new HttpError(400, 'Unknown question.');
      answers.push({ questionId: a.questionId, selectedIndex: a.selectedIndex, correct: a.selectedIndex === q.correctIndex });
    }
    const attempted = answers.filter(a => a.selectedIndex !== null).length;
    const correct = answers.filter(a => a.correct).length;
    const item: QnaAttempt = {
      ...ref(me),
      id: uid('qna'),
      category: b.category,
      totalQuestions: answers.length,
      attempted,
      correct,
      wrong: attempted - correct,
      skipped: answers.length - attempted,
      scorePct: Math.round((correct / answers.length) * 100),
      durationSec: b.durationSec,
      answers,
      createdAt: new Date().toISOString(),
      mode: test ? 'Faculty test' : b.mode,
      testId: test?.id,
    };
    await putItem('qna', item.id, me.id, item);
    return NextResponse.json({ success: true, attempt: item });
  }

  // ---------- student: AI mock interview ----------
  if (action === 'interview') {
    const me = await requireUser('student');
    const b = InterviewBody.parse(body);
    const scored = await evaluateInterview(b.track, b.answers);
    // Spoken answers: speaking pace and filler words also count towards communication.
    if (b.mode === 'Voice & video' && b.speaking) {
      const { wordsPerMinute: wpm, fillerWords } = b.speaking;
      const paceOk = wpm >= 100 && wpm <= 170;
      scored.communication = Math.max(0, Math.min(10, Math.round(scored.communication + (paceOk ? 1 : -1) - Math.min(3, Math.floor(fillerWords / 5)))));
      scored.overallScore = Math.round(((scored.technical * 0.5 + scored.communication * 0.3 + scored.confidence * 0.2) / 10) * 100);
      scored.verdict = scored.overallScore >= 70 ? 'Ready' : scored.overallScore >= 45 ? 'Almost ready' : 'Needs practice';
    }
    const item: MockInterviewResult = {
      ...ref(me),
      id: uid('int'),
      track: b.track,
      durationSec: b.durationSec,
      createdAt: new Date().toISOString(),
      mode: b.mode,
      speaking: b.speaking,
      ...scored,
    };
    await putItem('interview', item.id, me.id, item);
    return NextResponse.json({ success: true, result: item });
  }

  // ---------- panel (faculty-taken) mock interview ----------
  if (action === 'panel_request') {
    const me = await requireUser('student');
    const b = PanelRequestBody.parse(body);
    const item: PanelInterview = {
      ...ref(me),
      id: uid('pnl'),
      track: b.track,
      mode: b.mode,
      preferredDate: b.preferredDate,
      preferredSlot: b.preferredSlot,
      note: b.note,
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };
    await putItem('panel', item.id, me.id, item);
    return NextResponse.json({ success: true, panel: item });
  }
  if (action === 'panel_schedule' || action === 'panel_grade') {
    const me = await requireUser('faculty', 'admin');
    const b = PanelStaffBody.parse(body);
    const p = await getItem<PanelInterview>(b.id);
    if (!p) throw new HttpError(404, 'Interview request not found.');
    if (action === 'panel_schedule') {
      if (!b.scheduledAt) throw new HttpError(400, 'Pick date and time.');
      Object.assign(p, { status: 'Scheduled', scheduledAt: b.scheduledAt, venueOrLink: b.venueOrLink ?? '', interviewer: me.name });
    } else {
      if (!b.rubric) throw new HttpError(400, 'Fill all rubric scores.');
      const r = b.rubric;
      const overall = Math.round(((r.technical * 0.35 + r.communication * 0.25 + r.confidence * 0.2 + r.bodyLanguage * 0.1 + r.grooming * 0.1) / 10) * 100);
      Object.assign(p, { status: 'Completed', rubric: r, overall, remarks: b.remarks ?? '', interviewer: me.name });
    }
    await putItem('panel', p.id, p.studentUserId, p);
    return NextResponse.json({ success: true, panel: p });
  }

  // ---------- student: complete / acknowledge a notice ----------
  if (action === 'notice_ack') {
    const me = await requireUser('student');
    const b = AckBody.parse(body);
    const n = await getItem<FacultyNotice>(b.noticeId);
    if (!n) throw new HttpError(404, 'Notice not found.');
    const st = (n.students[me.id] ??= { reminders: [] });
    st.acknowledgedAt = new Date().toISOString();
    st.response = b.response;
    await putItem('notice', n.id, null, n);
    return NextResponse.json({ success: true, notice: studentView(n, me.id) });
  }

  // ---------- faculty / admin ----------
  if (action === 'notice_create') {
    const me = await requireUser('faculty', 'admin');
    const b = NoticeBody.parse(body);
    const n: FacultyNotice = {
      id: uid('ntc'),
      title: b.title,
      message: b.message,
      actionRequired: b.actionRequired || 'Read and acknowledge',
      createdById: me.id,
      createdByName: me.name,
      targetBranch: b.targetBranch || 'All',
      targetYear: b.targetYear || 'All',
      reminderEveryMin: b.reminderEveryMin,
      createdAt: new Date().toISOString(),
      students: {},
    };
    await putItem('notice', n.id, null, n);
    await audit(me, `Sent notice: ${n.title}`, 'ACADEMIC', 'SUCCESS', `${n.targetBranch} / ${n.targetYear}`, clientIp(req));
    return NextResponse.json({ success: true, notice: n });
  }

  if (action === 'notice_remind' || action === 'notice_unlock') {
    await requireUser('faculty', 'admin');
    const b = StaffNoticeBody.parse(body);
    const n = await getItem<FacultyNotice>(b.noticeId);
    if (!n) throw new HttpError(404, 'Notice not found.');
    const targets = noticeTargets(n, await allStudents()).filter(s => !b.studentUserId || s.studentUserId === b.studentUserId);
    let count = 0;
    for (const s of targets) {
      const st = (n.students[s.studentUserId] ??= { reminders: [] });
      if (st.acknowledgedAt) continue;
      if (action === 'notice_unlock') {
        st.unlockedByFaculty = true;
        count++;
      } else if (st.reminders.length < MAX_NOTICE_REMINDERS) {
        st.reminders.push(new Date().toISOString());
        count++;
      }
    }
    await putItem('notice', n.id, null, n);
    return NextResponse.json({ success: true, count, notice: n });
  }

  throw new HttpError(400, 'Unknown action.');
});
