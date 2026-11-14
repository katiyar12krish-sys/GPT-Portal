/**
 * Password book (v4.21): the college asked that every login password be saved so that
 *   – the admin can see the admin's own and every faculty member's username and password, and
 *   – faculty (and the admin) can see every student's username and password.
 *
 * How it is kept safe:
 *   – The login itself still checks only the bcrypt hash (users.password_hash / demo hash).
 *   – The readable copy here is encrypted with AES-256-GCM (DATA_ENCRYPTION_KEY, see secure.ts).
 *   – Only the server decrypts it, and only for the roles allowed (see /api/faculty/logins, /api/students/logins).
 *     Every view is written to the activity log.
 *   – The data export (scripts/export-all-data.ts) removes the "password" field.
 *
 * A copy is saved whenever a password is set or used: admin or faculty sets it, the user changes it,
 * "forgot password" with OTP, and at every successful login (so old passwords get saved too).
 * Records are tracker_items of kind 'password' with id pwbook-<staff user id> or pwbook-roll-<roll number>.
 */
import { decrypt, encrypt } from './secure';
import { getItem, putItem } from './trackerStore';

export type PasswordSource = 'admin' | 'faculty' | 'self' | 'otp' | 'login' | 'new-account';

interface BookEntry {
  who: string; // staff user id or student roll number
  role: 'student' | 'faculty' | 'admin';
  password: string; // encrypted
  source: PasswordSource;
  updatedAt: string;
}

export interface SavedPassword {
  password: string;
  source: PasswordSource;
  updatedAt: string;
}

/** Students are kept by roll number (same in demo and database mode); staff by user id. */
const bookId = (role: BookEntry['role'], who: string) => (role === 'student' ? `pwbook-roll-${who}` : `pwbook-${who}`);

/** Saves (or replaces) the readable copy of a password. Never throws: a failure here must not stop a login. */
export async function rememberPassword(role: BookEntry['role'], who: string, password: string, source: PasswordSource) {
  try {
    if (!who || !password) return;
    const old = await getItem<BookEntry>(bookId(role, who));
    // Login with the same password again: nothing to change.
    if (source === 'login' && old && safeDecrypt(old.password) === password) return;
    const entry: BookEntry = { who, role, password: encrypt(password), source, updatedAt: new Date().toISOString() };
    await putItem('password', bookId(role, who), null, entry);
  } catch (e) {
    console.error('[passwordBook] could not save password copy', e);
  }
}

/** The saved password of one user, or null when none is saved yet. */
export async function savedPassword(role: BookEntry['role'], who: string): Promise<SavedPassword | null> {
  const e = await getItem<BookEntry>(bookId(role, who));
  if (!e) return null;
  const password = safeDecrypt(e.password);
  return password ? { password, source: e.source, updatedAt: e.updatedAt.replace('T', ' ').slice(0, 16) } : null;
}

/** Text shown next to a password in the lists. */
export const SOURCE_NOTE: Record<PasswordSource, string> = {
  admin: 'Set by admin',
  faculty: 'Set by faculty',
  self: 'Changed by the user',
  otp: 'Reset with OTP',
  login: 'Saved at login',
  'new-account': 'Given with the new account',
};

function safeDecrypt(v: string): string | null {
  try {
    return decrypt(v);
  } catch {
    return null; // key changed – the copy can no longer be read
  }
}

/** Key of a logged-in user in the book: roll number for students, user id for staff. */
export const whoOf = (u: { role: string; id: string; rollNumber?: string | null }) => (u.role === 'student' ? u.rollNumber ?? '' : u.id);
