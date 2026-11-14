// Placement Tracker: resumes, placement Q&A attempts, AI mock interviews and faculty notices.
// Students write; faculty + admin see everything automatically.

export interface StudentRef {
  studentUserId: string;
  rollNumber: string;
  studentName: string;
  department: string;
}

export interface ResumeAnalysis {
  score: number; // 0-100 overall
  atsScore: number; // 0-100 keyword / format match
  wordCount: number;
  sectionsFound: string[];
  sectionsMissing: string[];
  skillsFound: string[];
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  actionVerbs: number;
  strengths: string[];
  suggestions: string[];
  textExtracted: boolean;
}

export interface ResumeSubmission extends StudentRef {
  id: string;
  fileName: string;
  fileType: string;
  sizeKb: number;
  submittedAt: string; // ISO
  version: number; // 1 = first upload by this student
  analysis: ResumeAnalysis;
  hasFile: boolean;
}

export interface QnaAnswer {
  questionId: string;
  selectedIndex: number | null; // null = skipped
  correct: boolean;
}

export interface QnaAttempt extends StudentRef {
  id: string;
  category: string; // 'Mixed' | 'Aptitude' | ...
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  scorePct: number; // correct / total
  durationSec: number;
  answers: QnaAnswer[];
  createdAt: string;
  /** Practice (default), a timed Mock test, or a Faculty test (then testId names it). */
  mode?: 'Practice' | 'Mock test' | 'Faculty test';
  testId?: string;
}

/** A Q&A test a teacher creates for a branch/year; every student gets the same questions. */
export interface QnaTest {
  id: string;
  title: string;
  branch: 'CSE' | 'Civil' | 'All';
  year: 'All' | '1st Year' | '2nd Year' | '3rd Year';
  source: string; // e.g. "CSE Subjects: DBMS & SQL" or "Questions added by faculty"
  questionIds: string[];
  durationMin: number;
  dueDate: string; // YYYY-MM-DD
  createdById: string;
  createdByName: string;
  createdAt: string;
}

export interface InterviewAnswerResult {
  question: string;
  answer: string;
  score: number; // 0-10
  feedback: string;
}

export interface MockInterviewResult extends StudentRef {
  id: string;
  track: string; // 'CSE Technical' | 'Civil Technical' | 'HR & Communication'
  answers: InterviewAnswerResult[];
  overallScore: number; // 0-100
  technical: number; // 0-10
  communication: number; // 0-10
  confidence: number; // 0-10
  verdict: 'Ready' | 'Almost ready' | 'Needs practice';
  evaluator: 'Auto-scorer';
  durationSec: number;
  createdAt: string;
  /** 'Typed' = online text answers; 'Voice & video' = spoken answers with camera on */
  mode?: 'Typed' | 'Voice & video';
  speaking?: { wordsPerMinute: number; fillerWords: number; avgAnswerSec: number };
}

export interface PanelRubric {
  technical: number; // 1-10
  communication: number;
  confidence: number;
  bodyLanguage: number;
  grooming: number;
}

/** Face-to-face / online interview taken by a faculty panel (not an online Q&A). */
export interface PanelInterview extends StudentRef {
  id: string;
  track: string;
  mode: 'In person (college)' | 'Online (video call)';
  preferredDate: string;
  preferredSlot: string;
  note: string;
  status: 'Requested' | 'Scheduled' | 'Completed';
  scheduledAt?: string;
  venueOrLink?: string;
  interviewer?: string;
  rubric?: PanelRubric;
  overall?: number; // 0-100
  remarks?: string;
  createdAt: string;
}

export interface NoticeStudentStatus {
  acknowledgedAt?: string;
  response?: string;
  /** Reminder timestamps (max 3). After the 3rd the student's panel is locked until done. */
  reminders: string[];
  unlockedByFaculty?: boolean;
}

export interface FacultyNotice {
  id: string;
  title: string;
  message: string;
  actionRequired: string; // what the student must do, e.g. "Upload updated resume"
  createdById: string;
  createdByName: string;
  targetBranch: 'All' | string;
  targetYear: 'All' | string;
  /** Auto reminder gap in minutes (1 = demo, 60 = hourly, 1440 = daily) */
  reminderEveryMin: number;
  createdAt: string;
  students: Record<string, NoticeStudentStatus>; // key = studentUserId
}

export const MAX_NOTICE_REMINDERS = 3;

/** Notice as one student sees it (computed on the server). */
export interface StudentNoticeView {
  id: string;
  title: string;
  message: string;
  actionRequired: string;
  createdByName: string;
  createdAt: string;
  done: boolean;
  remindersSent: number;
  locked: boolean;
  nextReminderAt?: string;
}

export interface TrackerSnapshot {
  resumes: ResumeSubmission[];
  qna: QnaAttempt[];
  interviews: MockInterviewResult[];
  notices: FacultyNotice[];
  panels: PanelInterview[];
}

/** A video lecture: recorded in the browser, uploaded as a file, or a YouTube link. Added by faculty / admin. */
export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  subject: string;
  branch: 'All' | 'CSE' | 'Civil';
  year: 'All' | '1st Year' | '2nd Year' | '3rd Year';
  source: 'recorded' | 'uploaded' | 'youtube';
  youtubeId?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  durationSec?: number;
  allowDownload: boolean;
  status: 'uploading' | 'ready';
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
  /** Students who opened the video (once each). Only staff receive the names. */
  viewers: Array<{ id: string; name: string; at: string }>;
  viewCount?: number;
}

/** A job opening posted by the TPO / faculty in Job House → Latest openings. */
export interface JobPost {
  id: string;
  title: string;
  organisation: string;
  branch: 'CSE' | 'Civil' | 'Both';
  type: 'Government' | 'PSU' | 'Private' | 'Apprenticeship' | 'Internship';
  location: string;
  lastDate: string; // YYYY-MM-DD
  link: string; // official notification or apply page (https)
  eligibility: string;
  salary: string;
  postedById: string;
  postedByName: string;
  createdAt: string;
}
