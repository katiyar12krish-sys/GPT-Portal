// Fills a NEW database with the first data: staff, students, assignments … and writes their temporary
// passwords to seed-credentials.txt (read it once, then DELETE it).  Run: npm run db:seed  (or db:setup = migrate + seed).
import './env';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import { pool, tx } from '../src/lib/server/db';
import { encrypt, maskAadhar } from '../src/lib/server/secure';
import { ADMIN_LOGIN, DEFAULT_FACULTY_PASSWORD, DEFAULT_STUDENT_PASSWORD, FACULTY_LOGINS } from '../src/config/credentials';
import { INITIAL_STUDENTS_ROSTER } from '../src/lib/data/studentData';
import { INITIAL_USERS, INITIAL_FACULTY_CREDENTIALS } from '../src/lib/data/facultyData';
import { INITIAL_ASSIGNMENTS, INITIAL_DOUBT_SESSIONS } from '../src/lib/data/academicData';

/**
 * Idempotent seed: only inserts what is missing, never overwrites live data or passwords.
 * First passwords come from src/config/credentials.ts and are also written to seed-credentials.txt (git-ignored). Everyone must change theirs at first login.
 */
async function main() {
  const lines: string[] = [];
  const hash = async (p: string) => bcrypt.hash(p, 12);

  await tx(async c => {
    // ---- staff ----
    for (const f of INITIAL_FACULTY_CREDENTIALS) {
      const isAdmin = f.facultyId === 'user_admin_principal';
      const exists = (await c.query('SELECT 1 FROM users WHERE id=$1', [f.facultyId])).rowCount;
      if (exists) continue;
      // First passwords come from src/config/credentials.ts (must be changed at first login).
      const pwd = isAdmin
        ? process.env.ADMIN_INITIAL_PASSWORD || ADMIN_LOGIN.password
        : FACULTY_LOGINS.find(l => l.userId === f.facultyId)?.password ?? DEFAULT_FACULTY_PASSWORD;
      await c.query(
        `INSERT INTO users (id,role,name,email,mobile,department,assigned_subjects,password_hash,mfa_enabled,sms_alerts)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [f.facultyId, isAdmin ? 'admin' : 'faculty', f.facultyName, f.email.toLowerCase(), f.mobile, f.department, f.assignedSubjects, await hash(pwd), f.mfaEnabled, f.smsAlertsActive]
      );
      lines.push(`${isAdmin ? 'ADMIN  ' : 'FACULTY'}  ${f.facultyName}  login: ${f.email}  password: ${pwd}`);
    }

    // ---- students ----
    const rollToUser = new Map<string, string>();
    for (const s of INITIAL_STUDENTS_ROSTER) {
      const userId = `user_student_${s.ubterRollNumber}`;
      rollToUser.set(s.id, userId);
      if ((await c.query('SELECT 1 FROM students WHERE id=$1', [s.id])).rowCount) continue;
      const pub = INITIAL_USERS.find(u => u.rollNumber === s.ubterRollNumber);
      const pwd = DEFAULT_STUDENT_PASSWORD;
      await c.query(
        `INSERT INTO users (id,role,name,email,mobile,roll_number,department,password_hash,mfa_enabled,must_change_password)
         VALUES ($1,'student',$2,$3,$4,$5,$6,$7,FALSE,FALSE) ON CONFLICT (id) DO NOTHING`,
        [userId, s.aadharName, pub?.email?.toLowerCase() ?? null, s.mobileNumber, s.ubterRollNumber, `${s.branch} (${s.currentYear})`, await hash(pwd)]
      );
      const { aadharNumber, aadharEncrypted, aadharMasked, passwordPlain, passwordHash, id, ...profile } = s as any;
      const digits = String(aadharNumber || '').replace(/\D/g, '');
      await c.query(
        `INSERT INTO students (id,user_id,roll_number,branch,current_year,batch_year,status,aadhar_encrypted,aadhar_masked,profile)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [s.id, userId, s.ubterRollNumber, s.branch, s.currentYear, s.batchYear, s.status, digits ? encrypt(digits) : '', digits ? maskAadhar(digits) : 'XXXX-XXXX-XXXX', JSON.stringify({ ...profile, issuedPassword: encrypt(pwd) })]
      );
      lines.push(`STUDENT  ${s.aadharName}  login: ${s.ubterRollNumber}  password: ${pwd}`);
    }

    // ---- assignments & doubts ----
    for (const a of INITIAL_ASSIGNMENTS) {
      await c.query(
        `INSERT INTO assignments (id,branch,target_year,subject_code,deadline,data) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [a.id, a.branch, a.targetYear, a.subjectCode, new Date(a.deadlineDate), JSON.stringify(a)]
      );
    }
    for (const d of INITIAL_DOUBT_SESSIONS) {
      const uid = rollToUser.get(d.studentId) ?? d.studentId;
      await c.query(`INSERT INTO doubts (id,student_id,data) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`, [d.id, uid, JSON.stringify({ ...d, studentId: uid })]);
    }
    await c.query(
      `INSERT INTO notifications (id,target_user_id,data) VALUES ('notif-welcome',NULL,$1) ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify({ title: 'Welcome to UGIP Tanakpur Portal', message: 'Your data is now stored securely on the college server.', type: 'general' })]
    );
  });

  if (lines.length) {
    fs.writeFileSync('seed-credentials.txt', lines.join('\n') + '\n', { mode: 0o600 });
    console.log(`✔ Seeded. ${lines.length} temporary logins written to seed-credentials.txt (keep private, then delete it).`);
  } else {
    console.log('✔ Nothing to seed – data already present.');
  }
  await pool().end();
}
main().catch(e => {
  console.error('Seed failed:', e);
  process.exit(1);
});
