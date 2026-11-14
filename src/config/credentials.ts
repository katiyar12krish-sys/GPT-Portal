/**
 * ============================================================
 *  PORTAL LOGIN CREDENTIALS  (Admin / Faculty / Student)
 * ============================================================
 *  Passwords are changed HERE ONLY – nowhere else in the code.
 *
 *  - Demo / preview mode (no DATABASE_URL): login is checked against this file.
 *  - Real database: `npm run db:seed` gives every NEW account these passwords,
 *    and the user is forced to change it at first login.
 *
 *  SERVER-ONLY FILE: import it only from src/lib/server/* and scripts/*,
 *  never from a component, so passwords never reach the browser.
 * ============================================================
 */

export interface StaffLogin {
  /** What is typed in the "Login ID" box */
  loginId: string;
  password: string;
  /** Matches facultyId / user id in src/lib/data/facultyData.ts */
  userId: string;
}

/** Admin / Principal dashboard → Login ID: admin */
export const ADMIN_LOGIN: StaffLogin = {
  loginId: 'admin',
  password: 'Admin@GPT2026',
  userId: 'user_admin_principal',
};

/** Faculty dashboards. Add one line per faculty member. */
export const FACULTY_LOGINS: StaffLogin[] = [
  { loginId: 'jitendra.cse@ugip.gov.in', password: 'Faculty@GPT2026', userId: 'user_faculty_jitendra_hod' },
];

/** Faculty not listed above log in with their email + this password. */
export const DEFAULT_FACULTY_PASSWORD = 'Faculty@GPT2026';

/** Students log in with their UBTER roll number (e.g. 24090050007) + this password. */
export const DEFAULT_STUDENT_PASSWORD = 'Student@GPT2026';
