import bcrypt from 'bcryptjs';
import { ADMIN_LOGIN, DEFAULT_FACULTY_PASSWORD, DEFAULT_STUDENT_PASSWORD, FACULTY_LOGINS } from '@/config/credentials';
import { INITIAL_ASSIGNMENTS, INITIAL_DOUBT_SESSIONS } from '@/lib/data/academicData';
import { INITIAL_FACULTY_CREDENTIALS, INITIAL_USERS } from '@/lib/data/facultyData';
import type { SessionUser } from './auth';
import { demoRoster, publicStudent } from './demoRoster';
import { demoStaffPasswordOk } from './staffLogins';

/**
 * Demo / preview mode: used automatically when DATABASE_URL is not set.
 * Logins come from src/config/credentials.ts, data from src/lib/data/*.
 * Placement-tracker data (resumes, Q&A, interviews, notices) is kept in .demo-data/ on the server.
 */
export const isDemoMode = () => !process.env.DATABASE_URL;

const DEMO_SECRET = 'gpt-demo-mode-secret-only-for-local-preview-0000';
export const demoSecret = () => process.env.AUTH_SECRET || DEMO_SECRET;

function staffUser(userId: string): SessionUser | null {
  const cred = INITIAL_FACULTY_CREDENTIALS.find(f => f.facultyId === userId);
  const pub = INITIAL_USERS.find(u => u.id === userId);
  if (!cred && !pub) return null;
  return {
    id: userId,
    role: userId === ADMIN_LOGIN.userId ? 'admin' : 'faculty',
    name: cred?.facultyName ?? pub!.name,
    email: (cred?.email ?? pub?.email ?? null)?.toLowerCase() ?? null,
    mobile: cred?.mobile ?? pub?.mobile ?? null,
    rollNumber: null,
    department: pub?.department ?? cred?.department ?? null,
    assignedSubjects: cred?.assignedSubjects ?? pub?.assignedSubjects ?? [],
    mfaEnabled: false,
    avatarUrl: '',
    mustChangePassword: false,
  };
}

/** Returns the user if identifier + password match credentials.ts, else null. */
export function demoLogin(identifier: string, password: string): SessionUser | null {
  const id = identifier.trim().toLowerCase();

  if (id === ADMIN_LOGIN.loginId.toLowerCase() || id === 'principal') {
    return password === ADMIN_LOGIN.password ? staffUser(ADMIN_LOGIN.userId) : null;
  }

  const listed = FACULTY_LOGINS.find(f => f.loginId.toLowerCase() === id);
  if (listed) return demoStaffPasswordOk(listed.userId, password, listed.password) ? staffUser(listed.userId) : null;

  const faculty = INITIAL_FACULTY_CREDENTIALS.find(
    f => f.facultyId !== ADMIN_LOGIN.userId && (f.email.toLowerCase() === id || f.mobile === id)
  );
  if (faculty) return demoStaffPasswordOk(faculty.facultyId, password, DEFAULT_FACULTY_PASSWORD) ? staffUser(faculty.facultyId) : null;

  const st = demoRoster().find(s => s.ubterRollNumber === id || s.mobileNumber === id);
  if (st && (st.passwordHash ? bcrypt.compareSync(password, st.passwordHash) : password === DEFAULT_STUDENT_PASSWORD)) {
    const pub = INITIAL_USERS.find(u => u.rollNumber === st.ubterRollNumber);
    return {
      id: `user_student_${st.ubterRollNumber}`,
      role: 'student',
      name: st.aadharName,
      email: pub?.email?.toLowerCase() ?? null,
      mobile: st.mobileNumber,
      rollNumber: st.ubterRollNumber,
      department: `${st.branch} (${st.currentYear})`,
      assignedSubjects: [],
      mfaEnabled: false,
      avatarUrl: '',
      mustChangePassword: false,
    };
  }
  return null;
}

// ---------- read-only demo data for the existing API routes ----------


export function demoStudents(me: SessionUser) {
  const all = demoRoster();
  const list = me.role === 'student' ? all.filter(s => s.ubterRollNumber === me.rollNumber) : all;
  return list.map(publicStudent);
}

export function demoAssignments(me: SessionUser) {
  if (me.role !== 'student') return INITIAL_ASSIGNMENTS;
  const st = demoRoster().find(s => s.ubterRollNumber === me.rollNumber);
  if (!st) return [];
  return INITIAL_ASSIGNMENTS.filter(a => a.branch === st.branch && a.targetYear === st.currentYear).map(a => ({
    ...a,
    studentSubmissions: a.studentSubmissions.filter(x => x.studentId === st.id),
  }));
}

export function demoDoubts(me: SessionUser) {
  if (me.role !== 'student') return INITIAL_DOUBT_SESSIONS;
  return INITIAL_DOUBT_SESSIONS.filter(d => d.rollNumber === me.rollNumber);
}

export function demoFaculty(isAdmin: boolean) {
  return INITIAL_FACULTY_CREDENTIALS.map(f => ({
    ...f,
    email: isAdmin ? f.email : '',
    mobile: isAdmin ? f.mobile : '',
    passwordPlain: '', passwordEncrypted: '', passwordHash: '',
  }));
}
