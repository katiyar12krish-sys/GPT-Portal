import type { StudentProfile } from '@/lib/types';

/** Shape a DB row into the StudentProfile the UI expects. Secrets never leave the server. */
export function rowToStudent(r: any): StudentProfile {
  return {
    ...(r.profile as StudentProfile),
    id: r.id,
    ubterRollNumber: r.roll_number,
    branch: r.branch,
    currentYear: r.current_year,
    batchYear: r.batch_year,
    status: r.status,
    aadharNumber: '',
    aadharEncrypted: '',
    aadharMasked: r.aadhar_masked,
    passwordPlain: undefined,
    passwordHash: undefined,
    issuedPassword: undefined,
  };
}

/** Remove fields that must never be stored inside the JSON profile. */
export function stripSecrets(p: Partial<StudentProfile>): Record<string, unknown> {
  const { aadharNumber, aadharEncrypted, aadharMasked, passwordPlain, passwordHash, issuedPassword, id, ...rest } = p as any;
  return rest;
}

export function gradeFor(marks: number): string {
  return marks >= 85 ? 'A+' : marks >= 70 ? 'A' : marks >= 55 ? 'B+' : marks >= 40 ? 'B' : 'F';
}
