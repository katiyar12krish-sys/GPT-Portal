import { StudentProfile, Branch } from '../types';
import { encryptAES256 } from '../crypto';

/**
 * 3rd-year students – details as submitted by the students (Anurag & Diya are in studentData.ts).
 * Roll number = YY + institute 090 + branch (05 = CSE, 02 = Civil) + serial.
 * Serial 2xxx = lateral entry (joined directly in 2nd year, so no 1st / 2nd semester).
 *
 * Values ≤ 10 given for a semester are SGPA/CGPA. They are stored in `cgpa` and the percentage
 * is shown as an estimate (SGPA × 9.5) until the exact % is entered by faculty/admin.
 * Empty Aadhaar = not provided yet (add it from the admin "Edit student" form).
 */

type Sem = number | null; // null = N/A
interface Raw {
  name: string;
  mobile: string;
  roll: string;
  tenth: number;
  twelfth: number; // 0 = not provided
  y1: { pct?: number; cgpa?: number } | null;
  y2: { pct?: number; cgpa?: number };
  sems: [Sem, Sem, Sem, Sem];
  address: string;
  mother: string;
  father: string;
  gender?: 'Male' | 'Female';
  aadhar?: string;
}

const RAW: Raw[] = [
  { name: 'Varsha Rana', mobile: '7618486041', roll: '24090050029', tenth: 64.6, twelfth: 57.6, y1: { cgpa: 7.04 }, y2: { cgpa: 8.83 }, sems: [65.0, 67.1, 80.9, 84.7], address: 'Tedaghat Bari Anjaniya, Khatima, Udham Singh Nagar, Uttarakhand', mother: 'Mrs. Shashi Devi', father: 'Mr. Jai Pal Singh', gender: 'Female' },
  { name: 'Raju Garkoti', mobile: '6398202887', roll: '24090020013', tenth: 60.6, twelfth: 75, y1: { cgpa: 7.32 }, y2: { cgpa: 7.83 }, sems: [65.8, 69.7, 74.6, 71.7], address: 'Village Tand Malla, PO Machiyar, Champawat, Uttarakhand', mother: 'Deepa Devi', father: 'Dungar Dev', gender: 'Male' },
  { name: 'Jayant Balmiki', mobile: '7505677649', roll: '25090052001', tenth: 60.8, twelfth: 43.6, y1: null, y2: { cgpa: 7.54 }, sems: [null, null, 71, 70.6], address: 'Ghasiyara Mandi, Ward No. 9, Tanakpur, Champawat, Uttarakhand', mother: 'Rekha Balmiki', father: 'Shyam Balmiki', gender: 'Male' },
  { name: 'Sumit Joshi', mobile: '6399854521', roll: '25090052005', tenth: 68, twelfth: 63.2, y1: null, y2: { cgpa: 6.32 }, sems: [null, null, 6.5, 6.13], address: 'Near Mandi Samiti, Khatima, Udham Singh Nagar, Uttarakhand', mother: 'Mamta Joshi', father: 'Mohan Joshi', gender: 'Male' },
  { name: 'Aaditya Singh Kunwar', mobile: '8979374569', roll: '24090050001', tenth: 74, twelfth: 0, y1: { cgpa: 6.96 }, y2: { cgpa: 8.47 }, sems: [6.69, 6.6, 8.47, 8.23], address: 'Reikot Kunwar, Lohaghat, Champawat, Uttarakhand', mother: 'Seema Kunwar', father: 'Manoj Singh Kunwar', gender: 'Male' },
  { name: 'Neha Samant', mobile: '7505911744', roll: '25090052002', tenth: 75.9, twelfth: 66.2, y1: null, y2: { cgpa: 8.4 }, sems: [null, null, 79.3, 80.2], address: 'Bastiya, Tanakpur, Champawat, Uttarakhand', mother: 'Lalita Devi', father: 'Kheem Singh Samant', gender: 'Female' },
  { name: 'Abdul Ahad', mobile: '9897983201', roll: '24090020001', tenth: 66.2, twelfth: 54, y1: { cgpa: 6.9 }, y2: { cgpa: 7.6 }, sems: [67.6, 70.4, 74, 78], address: 'Opposite Hotel Parwat, Railway Station Road, Tanakpur, Champawat, Uttarakhand', mother: 'Nahid', father: 'Nazrul Samad', gender: 'Male' },
  { name: 'Muskan Singh', mobile: '9760662775', roll: '24090050019', tenth: 69.4, twelfth: 60.4, y1: { pct: 82.08, cgpa: 8.64 }, y2: { pct: 85.69, cgpa: 9.02 }, sems: [77.3, 85, 89.3, 83.9], address: 'Sharda Ghat, Ward No. 01, Tanakpur, Champawat, Uttarakhand', mother: 'Meena', father: 'Rakesh Singh', gender: 'Female' },
  { name: 'Sameer Kumar', mobile: '7817835587', roll: '25090052004', tenth: 87.2, twelfth: 77.6, y1: null, y2: { pct: 83.32, cgpa: 8.77 }, sems: [null, null, 80.7, 84.7], address: 'Vill. Bamanpuri, PO Chandani, Banbasa, Champawat, Uttarakhand', mother: 'Durga Devi', father: 'Kamlesh Kumar', gender: 'Male' },
  { name: 'Uday Kumar', mobile: '8057447759', roll: '24090050028', tenth: 71, twelfth: 0, y1: { cgpa: 7.7 }, y2: { cgpa: 8.72 }, sems: [70.7, 75, 85.8, 80.7], address: 'Bari Anjana, PO Jamour, Khatima, Udham Singh Nagar, Uttarakhand', mother: 'Vandana Devi', father: 'Rajkumar', gender: 'Male' },
  { name: 'Krishna Katiyar', mobile: '8449495147', roll: '24090050016', tenth: 82.6, twelfth: 81.8, y1: { pct: 77.52, cgpa: 8.16 }, y2: { pct: 87.3, cgpa: 9.19 }, sems: [83.56, 86, 87.6, 85.1], address: 'Ward No. 14, near Best View Hotel, Khatima, Udham Singh Nagar, Uttarakhand', mother: 'Anarkali Katiyar', father: 'Ram Sevak Katiyar' },
];

const r1 = (n: number) => Math.round(n * 10) / 10;
const asPct = (v: number) => (v <= 10 ? r1(v * 9.5) : v);
const NAMES = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];

function toProfile(s: Raw): StudentProfile {
  const branch: Branch = s.roll.slice(5, 7) === '02' ? 'Civil Engineering' : 'Computer Science & Engineering';
  const lateral = s.roll.slice(7, 8) === '2';
  const semesters = s.sems
    .map((v, i) => (v === null ? null : { semNumber: i + 1, semName: NAMES[i], percentage: asPct(v), cgpa: v <= 10 ? v : undefined, subjects: [] }))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const avg = (a: Sem, b: Sem) => (a !== null && b !== null ? r1((asPct(a) + asPct(b)) / 2) : 0);
  const digits = (s.aadhar ?? '').replace(/\D/g, '');
  return {
    id: `stu-${s.name.toLowerCase().replace(/[^a-z]+/g, '-')}-${s.roll}`,
    aadharName: s.name,
    mobileNumber: s.mobile,
    ubterRollNumber: s.roll,
    tenthPercentage: s.tenth,
    twelfthPercentage: s.twelfth,
    firstYearPercentage: s.y1?.pct ?? avg(s.sems[0], s.sems[1]),
    firstYearCGPA: s.y1?.cgpa ?? 0,
    secondYearPercentage: s.y2.pct ?? avg(s.sems[2], s.sems[3]),
    secondYearCGPA: s.y2.cgpa ?? 0,
    semesters,
    address: s.address,
    motherName: s.mother,
    fatherName: s.father,
    aadharNumber: digits ? digits.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '',
    aadharEncrypted: digits ? encryptAES256(digits) : '',
    aadharMasked: digits ? `XXXX-XXXX-${digits.slice(-4)}` : 'Not provided',
    branch,
    currentYear: '3rd Year',
    currentSemester: 5,
    batchYear: 2025,
    section: branch === 'Civil Engineering' ? 'CE-3A' : 'CSE-3A',
    status: 'Active / Verified',
    avatarUrl: '',
    attendancePercentage: 0,
    gender: s.gender,
    dateOfAdmission: lateral ? '2025-08-01' : '2024-08-01',
  };
}

export const REAL_3RD_YEAR_STUDENTS: StudentProfile[] = RAW.map(toProfile);
