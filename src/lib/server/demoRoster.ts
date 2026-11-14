import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_STUDENTS_ROSTER } from '@/lib/data/studentData';
import type { StudentProfile } from '@/lib/types';
import { encrypt, maskAadhar } from './secure';
import { gradeFor } from './students';
import { HttpError, type SessionUser } from './auth';

/**
 * Demo mode (no DATABASE_URL): the student roster lives in .demo-data/students.json so that
 * add / edit / delete / marks changes made by admin or faculty are kept across restarts.
 * Same permission rules as the database routes.
 */
const FILE = path.join(process.cwd(), '.demo-data', 'students.json');

declare global {
  // eslint-disable-next-line no-var
  var __demoRoster: StudentProfile[] | undefined;
}

export function demoRoster(): StudentProfile[] {
  if (!globalThis.__demoRoster) {
    try {
      globalThis.__demoRoster = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    } catch {
      globalThis.__demoRoster = structuredClone(INITIAL_STUDENTS_ROSTER);
    }
  }
  return globalThis.__demoRoster!;
}

function save() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(globalThis.__demoRoster ?? [], null, 1));
  } catch {
    /* read-only hosting without a database: changes stay in memory only */
  }
}

/** What the browser receives – never the full Aadhaar or passwords. */
export const publicStudent = (s: StudentProfile): StudentProfile => ({
  ...s,
  aadharNumber: '',
  aadharEncrypted: '',
  passwordPlain: undefined,
  passwordHash: undefined,
  issuedPassword: undefined,
});

const STUDENT_EDITABLE = ['avatarUrl', 'resumeUrl', 'resumeFileName', 'resumeUploadedAt', 'careerGoal', 'skills', 'resumeHistory', 'professionalProfile'];
const FACULTY_EDITABLE = ['skills'];
const SECRET = ['aadharNumber', 'aadharEncrypted', 'aadharMasked', 'passwordPlain', 'passwordHash', 'issuedPassword', 'id'];

function setAadhar(s: StudentProfile, raw: unknown) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 12) {
    s.aadharEncrypted = encrypt(d);
    s.aadharMasked = maskAadhar(d);
  }
}

export function demoAddStudent(body: any): StudentProfile {
  const roll = String(body.ubterRollNumber || '').trim();
  if (!/^\d{6,15}$/.test(roll)) throw new HttpError(400, 'Valid UBTER roll number required.');
  if (!body.aadharName || !body.branch || !body.currentYear) throw new HttpError(400, 'Name, branch and year are required.');
  const list = demoRoster();
  if (list.some(s => s.ubterRollNumber === roll)) throw new HttpError(409, 'A student with this roll number already exists.');
  const clean = Object.fromEntries(Object.entries(body).filter(([k]) => !SECRET.includes(k)));
  const s: StudentProfile = {
    tenthPercentage: 0, twelfthPercentage: 0, firstYearPercentage: 0, firstYearCGPA: 0, secondYearPercentage: 0, secondYearCGPA: 0,
    address: '', motherName: '', fatherName: '', mobileNumber: '', section: '', avatarUrl: '', attendancePercentage: 0,
    currentSemester: 1, batchYear: new Date().getFullYear(), status: 'Active / Verified',
    ...(clean as Partial<StudentProfile>),
    semesters: Array.isArray(body.semesters) ? body.semesters : [],
    id: `stu-${roll}`,
    ubterRollNumber: roll,
    aadharName: String(body.aadharName),
    branch: body.branch,
    currentYear: body.currentYear,
    aadharNumber: '',
    aadharEncrypted: '',
    aadharMasked: 'Not provided',
  };
  setAadhar(s, body.aadharNumber);
  list.unshift(s);
  save();
  return publicStudent(s);
}

export function demoPatchStudent(me: SessionUser, id: string, body: any): StudentProfile {
  const list = demoRoster();
  const s = list.find(x => x.id === id);
  if (!s) throw new HttpError(404, 'Student not found.');
  if (me.role === 'student' && s.ubterRollNumber !== me.rollNumber) throw new HttpError(403, 'You can only edit your own profile.');
  let patch: Record<string, any> = Object.fromEntries(Object.entries(body).filter(([k]) => !SECRET.includes(k)));
  if (me.role === 'student') patch = Object.fromEntries(Object.entries(patch).filter(([k]) => STUDENT_EDITABLE.includes(k)));
  else if (me.role === 'faculty') patch = Object.fromEntries(Object.entries(patch).filter(([k]) => FACULTY_EDITABLE.includes(k)));
  else setAadhar(s, body.aadharNumber);
  if (me.role !== 'admin') delete patch.semesters;
  Object.assign(s, patch);
  save();
  return publicStudent(s);
}

export function demoSetPassword(id: string, hash: string, encrypted: string | undefined) {
  const s = demoRoster().find(x => x.id === id);
  if (!s) throw new HttpError(404, 'Student not found.');
  s.passwordHash = hash;
  s.issuedPassword = encrypted;
  save();
}

export function demoDeleteStudent(id: string) {
  const list = demoRoster();
  const i = list.findIndex(x => x.id === id);
  if (i < 0) throw new HttpError(404, 'Student not found.');
  list.splice(i, 1);
  save();
}

export function demoUpdateMarks(me: SessionUser, id: string, semNumber: number, subjectCode: string, obtainedMarks: number): StudentProfile {
  if (me.role !== 'admin' && !me.assignedSubjects.includes(subjectCode) && !me.assignedSubjects.includes('ALL')) {
    throw new HttpError(403, `Access denied: you can only edit marks for your assigned subjects (${me.assignedSubjects.join(', ') || 'none'}).`);
  }
  const s = demoRoster().find(x => x.id === id);
  if (!s) throw new HttpError(404, 'Student not found.');
  const sem = s.semesters.find(x => x.semNumber === semNumber);
  const sub = sem?.subjects.find(x => x.subjectCode === subjectCode);
  if (!sem || !sub) throw new HttpError(404, 'Subject not found for this semester.');
  if (obtainedMarks > sub.maxMarks) throw new HttpError(400, `Marks cannot exceed ${sub.maxMarks}.`);
  sub.obtainedMarks = obtainedMarks;
  sub.grade = gradeFor((obtainedMarks / sub.maxMarks) * 100);
  sub.lastUpdatedBy = `${me.name} (${me.role})`;
  const tot = sem.subjects.reduce((a, x) => a + x.obtainedMarks, 0);
  const max = sem.subjects.reduce((a, x) => a + x.maxMarks, 0);
  sem.obtainedMarks = tot;
  sem.totalMarks = max;
  sem.percentage = max ? Number(((tot / max) * 100).toFixed(1)) : sem.percentage;
  save();
  return publicStudent(s);
}
