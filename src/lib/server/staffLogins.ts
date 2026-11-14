import bcrypt from 'bcryptjs';
import { ADMIN_LOGIN, DEFAULT_FACULTY_PASSWORD, FACULTY_LOGINS } from '@/config/credentials';
import { INITIAL_FACULTY_CREDENTIALS } from '@/lib/data/facultyData';
import { query } from './db';
import { isDemoMode } from './demo';
import { decrypt, encrypt } from './secure';
import { demoListSync, getItem, putItem } from './trackerStore';
import { rememberPassword, savedPassword, SOURCE_NOTE } from './passwordBook';

/**
 * Faculty login records the admin can see.
 * v4.21: every password (set by the admin, changed by the faculty member, or used at login) is kept
 * encrypted in the password book (passwordBook.ts), so the admin always sees the current one – the admin's own too.
 * Demo mode also keeps the new password hash here, because credentials.ts is read-only.
 */
interface StaffPassword {
  facultyId: string;
  passwordHash?: string; // demo mode only
  issuedPassword?: string; // encrypted, set by admin
  changedBySelf?: boolean;
  updatedAt: string;
}

const key = (facultyId: string) => `staffpw-${facultyId}`;
const read = (facultyId: string) => getItem<StaffPassword>(key(facultyId));

export interface FacultyLogin {
  facultyId: string;
  name: string;
  department: string;
  email: string;
  mobile: string;
  role: 'faculty' | 'admin';
  subjects: string[];
  loginId: string;
  password: string | null;
  passwordNote: string; // e.g. 'Set by admin', 'Changed by the user', 'Default password' (see SOURCE_NOTE)
  updatedAt: string;
}

/** Demo-mode check used by demoLogin(): a password changed through the portal wins over credentials.ts. */
export function demoStaffPasswordOk(facultyId: string, password: string, fallback: string): boolean {
  const rec = demoOverrides().find(r => r.facultyId === facultyId);
  if (rec?.passwordHash) return bcrypt.compareSync(password, rec.passwordHash);
  return password === fallback;
}

// demoLogin is synchronous, so demo overrides are read without awaiting.
const demoOverrides = () => demoListSync<StaffPassword>('staff');

export async function setStaffPassword(facultyId: string, password: string, bySelf: boolean) {
  const rec: StaffPassword = {
    facultyId,
    issuedPassword: bySelf ? undefined : encrypt(password),
    changedBySelf: bySelf,
    updatedAt: new Date().toISOString(),
  };
  if (isDemoMode()) rec.passwordHash = await bcrypt.hash(password, 10);
  else {
    await query('UPDATE users SET password_hash=$2, must_change_password=FALSE, token_version=token_version+1, updated_at=now() WHERE id=$1', [
      facultyId,
      await bcrypt.hash(password, 12),
    ]);
  }
  await putItem('staff', key(facultyId), null, rec);
  if (!bySelf) await rememberPassword('faculty', facultyId, password, 'admin'); // v4.21 password book
}

export async function facultyLogins(): Promise<FacultyLogin[]> {
  type Row = Omit<FacultyLogin, 'loginId' | 'password' | 'passwordNote'>;
  let rows: Row[];
  if (isDemoMode()) {
    rows = INITIAL_FACULTY_CREDENTIALS.map(f => ({
      facultyId: f.facultyId,
      name: f.facultyName,
      department: f.department,
      email: f.email,
      mobile: f.mobile,
      role: f.facultyId === ADMIN_LOGIN.userId ? 'admin' : 'faculty',
      subjects: f.assignedSubjects ?? [],
      updatedAt: f.lastUpdated,
    }));
  } else {
    rows = (await query("SELECT * FROM users WHERE role IN ('faculty','admin') ORDER BY role DESC, name")).map(r => ({
      facultyId: r.id,
      name: r.name,
      department: r.department ?? '',
      email: r.email ?? '',
      mobile: r.mobile ?? '',
      role: r.role,
      subjects: r.assigned_subjects ?? [],
      updatedAt: new Date(r.updated_at).toISOString().replace('T', ' ').slice(0, 16),
    }));
  }

  const out: FacultyLogin[] = [];
  for (const r of rows) {
    const rec = await read(r.facultyId);
    const listed = FACULTY_LOGINS.find(l => l.userId === r.facultyId);
    const loginId = r.role === 'admin' ? ADMIN_LOGIN.loginId : listed?.loginId ?? r.email;
    let password: string | null = null;
    let passwordNote: string;
    const book = await savedPassword(r.role, r.facultyId); // v4.21: the password book has the latest copy
    if (book) {
      password = book.password;
      passwordNote = SOURCE_NOTE[book.source];
    } else if (rec?.issuedPassword) {
      password = decrypt(rec.issuedPassword);
      passwordNote = 'Set by admin';
    } else if (isDemoMode() && r.role === 'admin') {
      password = ADMIN_LOGIN.password; // demo admin password comes from credentials.ts
      passwordNote = 'Default password';
    } else if (isDemoMode() && !rec?.changedBySelf) {
      password = listed?.password ?? DEFAULT_FACULTY_PASSWORD;
      passwordNote = 'Default password';
    } else {
      passwordNote = 'Saved at the next login'; // older password: it is saved the next time they log in
    }
    out.push({ ...r, loginId, password, passwordNote, updatedAt: book?.updatedAt ?? (rec?.updatedAt ? rec.updatedAt.replace('T', ' ').slice(0, 16) : r.updatedAt) });
  }
  return out;
}
