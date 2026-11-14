import { StudentProfile, SemesterRecord, Branch, AcademicYear } from '../types';
import { encryptAES256 } from '../crypto';

/**
 * 1st & 2nd year SAMPLE students (CSE + Civil) with subject-wise marks.
 * Marks are generated from a fixed seed, so they stay the same on every run.
 * Names / mobile / Aadhaar are dummy values – replace with the real class list.
 */

// Small seeded random generator (same numbers every time)
let seed = 20261029;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const between = (lo: number, hi: number) => Math.round(lo + rnd() * (hi - lo));
const gradeFor = (m: number) => (m >= 85 ? 'A+' : m >= 70 ? 'A' : m >= 55 ? 'B+' : m >= 40 ? 'B' : 'F');

type Sub = [code: string, name: string, faculty: string];

const SUBJECTS: Record<'CSE' | 'Civil', Record<number, Sub[]>> = {
  CSE: {
    1: [
      ['ASH-101', 'Applied Mathematics-I', 'Mrs. Richa Khakwal'],
      ['ASH-102', 'Applied Physics-I', 'Mr. Shailendra Kumar'],
      ['ASH-103', 'Applied Chemistry', 'Mrs. Bhawana Verma'],
      ['CSE-101', 'Fundamentals of Computing & C', 'Mrs. Anita'],
      ['GEN-101', 'Communication Skills-I', 'Mr. Vijay Singh Negi'],
      ['LAB-101', 'Computer Programming Lab', 'Mrs. Anita'],
      ['WSP-101', 'General Workshop Practice', 'Mr. Ankit Kumar'],
    ],
    2: [
      ['ASH-201', 'Applied Mathematics-II', 'Mrs. Richa Khakwal'],
      ['ASH-202', 'Applied Physics-II', 'Mr. Shailendra Kumar'],
      ['CSE-201', 'Data Structures using C', 'Mrs. Anita'],
      ['CSE-202', 'Digital Electronics & Logic', 'Mrs. Bhawana Bisht'],
      ['GEN-201', 'Environmental Studies', 'Mrs. Bhawana Verma'],
      ['LAB-201', 'Data Structures Lab', 'Mrs. Anita'],
      ['LAB-202', 'Digital Electronics Lab', 'Mrs. Bhawana Bisht'],
    ],
    3: [
      ['CSE-301', 'Object Oriented Programming (OOPs C++)', 'Mrs. Bhawana Bisht'],
      ['CSE-302', 'Database Management Systems (RDBMS)', 'Mrs. Anita'],
      ['CSE-303', 'Computer Architecture & Org', 'Mrs. Bhawana Bisht'],
      ['CSE-304', 'Web Technology & HTML/CSS/JS', 'Mrs. Anita'],
      ['CSE-305', 'Operating System Concepts (Linux)', 'Mrs. Bhawana Bisht'],
      ['LAB-301', 'OOPs & DBMS Lab', 'Mrs. Anita'],
    ],
  },
  Civil: {
    1: [
      ['ASH-101', 'Applied Mathematics-I', 'Mrs. Richa Khakwal'],
      ['ASH-102', 'Applied Physics-I', 'Mr. Shailendra Kumar'],
      ['ASH-103', 'Applied Chemistry', 'Mrs. Bhawana Verma'],
      ['CE-101', 'Engineering Drawing-I', 'Mr. Virendra Singh Taragi'],
      ['GEN-101', 'Communication Skills-I', 'Mr. Vijay Singh Negi'],
      ['WSP-101', 'General Workshop Practice', 'Mr. Ankit Kumar'],
    ],
    2: [
      ['ASH-201', 'Applied Mathematics-II', 'Mrs. Richa Khakwal'],
      ['CE-201', 'Applied Mechanics', 'Mr. Virendra Singh Taragi'],
      ['CE-202', 'Building Materials', 'Mr. Virendra Singh Taragi'],
      ['CE-203', 'Engineering Drawing-II (AutoCAD)', 'Mr. Ankit Kumar'],
      ['GEN-201', 'Environmental Studies', 'Mrs. Bhawana Verma'],
      ['LAB-CE2', 'Materials Testing Lab', 'Mr. Ankit Kumar'],
    ],
    3: [
      ['CE-301', 'Surveying-I', 'Mr. Virendra Singh Taragi'],
      ['CE-302', 'Building Construction', 'Mr. Virendra Singh Taragi'],
      ['CE-303', 'Concrete Technology', 'Mr. Ankit Kumar'],
      ['CE-304', 'Hydraulics', 'Mr. Virendra Singh Taragi'],
      ['GEN-301', 'Engineering Economics', 'Mr. Virendra Singh Taragi'],
      ['LAB-CE3', 'Surveying Practical', 'Mr. Virendra Singh Taragi'],
    ],
  },
};

const SEM_NAMES = ['', '1st Semester', '2nd Semester', '3rd Semester'];

function semesters(branchKey: 'CSE' | 'Civil', completed: number, level: number): SemesterRecord[] {
  const out: SemesterRecord[] = [];
  for (let sem = 1; sem <= completed; sem++) {
    const subjects = SUBJECTS[branchKey][sem].map(([subjectCode, subjectName, facultyInCharge]) => {
      const obtainedMarks = Math.min(98, Math.max(38, between(level - 14, level + 12)));
      return { subjectCode, subjectName, facultyInCharge, maxMarks: 100, obtainedMarks, grade: gradeFor(obtainedMarks) };
    });
    const obtained = subjects.reduce((s, x) => s + x.obtainedMarks, 0);
    const percentage = Math.round((obtained / (subjects.length * 100)) * 1000) / 10;
    out.push({
      semNumber: sem,
      semName: SEM_NAMES[sem],
      percentage,
      cgpa: Math.round((percentage / 9.5) * 10) / 10,
      totalMarks: subjects.length * 100,
      obtainedMarks: obtained,
      subjects,
    });
  }
  return out;
}

interface Seed {
  name: string;
  father: string;
  mother: string;
  gender: 'Male' | 'Female';
  place: string;
  category: StudentProfile['category'];
}

const NAMES: Seed[] = [
  { name: 'Aman Bisht', father: 'Mohan Singh Bisht', mother: 'Lata Bisht', gender: 'Male', place: 'Tanakpur', category: 'General' },
  { name: 'Kavita Joshi', father: 'Prakash Joshi', mother: 'Meena Joshi', gender: 'Female', place: 'Champawat', category: 'General' },
  { name: 'Rohit Chand', father: 'Bhupal Chand', mother: 'Kamla Chand', gender: 'Male', place: 'Lohaghat', category: 'OBC' },
  { name: 'Neha Bhatt', father: 'Girish Bhatt', mother: 'Rekha Bhatt', gender: 'Female', place: 'Banbasa', category: 'General' },
  { name: 'Sachin Arya', father: 'Ramesh Arya', mother: 'Pushpa Arya', gender: 'Male', place: 'Khatima', category: 'SC' },
  { name: 'Priyanka Mehta', father: 'Dinesh Mehta', mother: 'Asha Mehta', gender: 'Female', place: 'Pithoragarh', category: 'General' },
  { name: 'Deepak Kalakoti', father: 'Harish Kalakoti', mother: 'Basanti Devi', gender: 'Male', place: 'Champawat', category: 'General' },
  { name: 'Anjali Rana', father: 'Surendra Rana', mother: 'Sarita Rana', gender: 'Female', place: 'Tanakpur', category: 'ST' },
  { name: 'Vikas Pandey', father: 'Naveen Pandey', mother: 'Usha Pandey', gender: 'Male', place: 'Khatima', category: 'General' },
  { name: 'Shivani Kapri', father: 'Kailash Kapri', mother: 'Hema Kapri', gender: 'Female', place: 'Lohaghat', category: 'OBC' },
  { name: 'Ankit Mahara', father: 'Gopal Mahara', mother: 'Jaya Mahara', gender: 'Male', place: 'Banbasa', category: 'General' },
  { name: 'Ritu Tamta', father: 'Mahesh Tamta', mother: 'Geeta Tamta', gender: 'Female', place: 'Champawat', category: 'SC' },
  { name: 'Himanshu Pant', father: 'Lalit Pant', mother: 'Kusum Pant', gender: 'Male', place: 'Tanakpur', category: 'General' },
  { name: 'Pooja Dhami', father: 'Bhagwan Dhami', mother: 'Radha Dhami', gender: 'Female', place: 'Pithoragarh', category: 'General' },
  { name: 'Mohit Saun', father: 'Kundan Saun', mother: 'Mamta Saun', gender: 'Male', place: 'Lohaghat', category: 'OBC' },
  { name: 'Sneha Karki', father: 'Hayat Karki', mother: 'Tulsi Karki', gender: 'Female', place: 'Khatima', category: 'General' },
  { name: 'Nitin Gahtori', father: 'Jagdish Gahtori', mother: 'Parvati Devi', gender: 'Male', place: 'Champawat', category: 'General' },
  { name: 'Komal Adhikari', father: 'Mohan Adhikari', mother: 'Leela Adhikari', gender: 'Female', place: 'Tanakpur', category: 'EWS' },
  { name: 'Gaurav Tiwari', father: 'Shankar Tiwari', mother: 'Nirmala Tiwari', gender: 'Male', place: 'Banbasa', category: 'General' },
  { name: 'Bhawna Negi', father: 'Pratap Negi', mother: 'Kiran Negi', gender: 'Female', place: 'Lohaghat', category: 'General' },
];

function make(i: number, year: AcademicYear, branch: Branch): StudentProfile {
  const s = NAMES[i];
  const isCse = branch === 'Computer Science & Engineering';
  const batchYear = year === '1st Year' ? 2027 : 2026; // same scheme as the 3rd-year roster (2025 = current 3rd year)
  const admitted = year === '1st Year' ? 26 : 25;
  // UBTER roll: YY + institute 090 + branch (05 CSE / 02 Civil) + serial
  const roll = `${admitted}090${isCse ? '05' : '02'}${String(30 + i).padStart(4, '0')}`;
  const completed = year === '1st Year' ? 1 : 3; // 1st yr: sem 1 done; 2nd yr: sem 1-3 done
  const level = between(62, 86);
  const sems = semesters(isCse ? 'CSE' : 'Civil', completed, level);
  const yr1 = sems.filter(x => x.semNumber <= 2);
  const yr1Pct = yr1.length ? Math.round((yr1.reduce((t, x) => t + x.percentage, 0) / yr1.length) * 10) / 10 : 0;
  const aadhar = `${between(2, 9)}${String(between(10000000000, 99999999999)).slice(0, 11)}`;
  return {
    id: `stu-${s.name.toLowerCase().replace(/\s+/g, '-')}-${roll}`,
    aadharName: s.name,
    mobileNumber: `9${String(between(100000000, 999999999))}`,
    ubterRollNumber: roll,
    tenthPercentage: between(58, 92),
    twelfthPercentage: between(55, 90),
    firstYearPercentage: year === '2nd Year' ? yr1Pct : 0,
    firstYearCGPA: year === '2nd Year' ? Math.round((yr1Pct / 9.5) * 10) / 10 : 0,
    secondYearPercentage: 0,
    secondYearCGPA: 0,
    semesters: sems,
    address: `${s.place}, Champawat, Uttarakhand`,
    motherName: s.mother,
    fatherName: s.father,
    aadharNumber: aadhar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3'),
    aadharEncrypted: encryptAES256(aadhar),
    aadharMasked: `XXXX-XXXX-${aadhar.slice(-4)}`,
    branch,
    currentYear: year,
    currentSemester: completed + 1,
    batchYear,
    section: `${isCse ? 'CSE' : 'CE'}-${year[0]}A`,
    status: 'Active / Verified',
    avatarUrl: '',
    attendancePercentage: between(72, 96),
    category: s.category,
    gender: s.gender,
    dateOfAdmission: `20${admitted}-08-01`,
  };
}

const PLAN: Array<[AcademicYear, Branch]> = [
  ['1st Year', 'Computer Science & Engineering'],
  ['1st Year', 'Civil Engineering'],
  ['2nd Year', 'Computer Science & Engineering'],
  ['2nd Year', 'Civil Engineering'],
];

/** 20 students: 5 each in 1st-yr CSE, 1st-yr Civil, 2nd-yr CSE, 2nd-yr Civil */
export const JUNIOR_STUDENTS: StudentProfile[] = NAMES.map((_, i) => make(i, PLAN[Math.floor(i / 5)][0], PLAN[Math.floor(i / 5)][1]));
