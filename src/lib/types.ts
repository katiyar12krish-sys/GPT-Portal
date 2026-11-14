/**
 * TypeScript types shared by screens and server: students, faculty, marks, assignments, notifications, resources …
 */
export type Branch =
  | 'Civil Engineering'
  | 'Computer Science & Engineering'
  | 'Mechanical Engineering'
  | 'Electrical Engineering'
  | 'Information Technology';

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year';

export type StudentStatus =
  | 'Active / Verified'
  | 'Enrolled'
  | 'Documents Pending'
  | 'Under Academic Review'
  | 'Graduated'
  | 'Placed';

export interface SemesterRecord {
  semNumber: number; // 1 to 6
  semName: string; // e.g. "1st Semester"
  percentage: number;
  cgpa?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  subjects: Array<{
    subjectCode: string;
    subjectName: string;
    facultyInCharge: string;
    maxMarks: number;
    obtainedMarks: number;
    grade: string;
    lastUpdatedBy?: string;
  }>;
}

export interface VerifiedSkill {
  id: string;
  name: string; // e.g. "Python", "AutoCAD", "React", "STAAD.Pro"
  category: 'Programming & Web' | 'Civil & Design CAD' | 'Core Engineering' | 'Tools & Frameworks';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry Ready';
  isVerified: boolean;
  verifiedBy?: string; // e.g. "Mrs. Anita (Lecturer CSE)"
  verifiedById?: string;
  verifiedAt?: string;
  endorsementRemarks?: string;
}

export interface CareerDocument {
  id: string;
  fileName: string;
  title: string;
  fileSize: string;
  uploadedAt: string;
  isActive: boolean;
  docType: 'Resume' | 'Cover Letter' | 'Diploma Certificate' | 'Internship Letter';
  fileUrl?: string;
  version: string; // e.g. "v1.0", "v2.0"
}

export interface ProfessionalProfile {
  headline: string;
  bio: string;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
  targetRoles: string[];
}

export interface StudentProfile {
  id: string;
  aadharName: string;
  mobileNumber: string;
  ubterRollNumber: string;
  tenthPercentage: number;
  twelfthPercentage: number;
  firstYearPercentage: number;
  firstYearCGPA: number;
  secondYearPercentage: number;
  secondYearCGPA: number;
  semesters: SemesterRecord[];
  address: string;
  motherName: string;
  fatherName: string;
  aadharNumber: string; // Full 12 digit (encrypted in storage)
  aadharEncrypted: string;
  aadharMasked: string; // e.g. "XXXX-XXXX-0184"
  branch: Branch;
  currentYear: AcademicYear;
  currentSemester: number; // e.g. 5
  batchYear: number; // e.g. 2025, 2026, 2027
  section: string; // e.g. "CSE-3A"
  status: StudentStatus;
  avatarUrl: string;
  attendancePercentage: number;
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  caste?: string;
  gender?: 'Female' | 'Male' | 'Other';
  dateOfAdmission?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  careerGoal?: string;
  isPlaced?: boolean;
  placedCompany?: string;
  placedPackageLPA?: number;
  passwordPlain?: string;
  passwordHash?: string;
  /** Encrypted copy of a password issued by staff. Removed when the student sets their own. */
  issuedPassword?: string;
  skills?: VerifiedSkill[];
  resumeHistory?: CareerDocument[];
  professionalProfile?: ProfessionalProfile;
}

export interface GovtJobComparison {
  id: string;
  agencyName: string; // e.g. "UKPSC JE (Uttarakhand Public Service Commission)", "SSC JE"
  branch: 'Civil Engineering' | 'Computer Science & Engineering' | 'Both';
  typicalAnnualSeats: number;
  qualification: string;
  payScale: string;
  examPattern: string;
  officialLink: string;
  departments: string[];
  tipsForDiploma: string;
}

export interface MockInterviewVideo {
  id: string;
  title: string;
  category: 'Technical Mock Interview' | 'HR & Behavioral Interview' | 'Life Transformation & Success Story';
  branch: 'Civil Engineering' | 'Computer Science & Engineering' | 'Common';
  youtubeUrl: string;
  embedId: string;
  duration: string;
  speaker: string;
  highlight: string;
  description: string;
}

export interface GovtExamQuestion {
  id: string;
  subject:
    | 'History of Computer & IT'
    | 'History of India & Uttarakhand'
    | 'Quantitative Aptitude'
    | 'Reasoning Ability'
    | 'General Knowledge & Current Affairs'
    | 'English & Hindi Grammar'
    | 'Interview & Personality';
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examBadge: string; // e.g. "UKPSC JE", "SSC JE", "Sarkari Tech"
}

export interface StudentQuizStats {
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyPercentage: number;
  lastUpdated: string;
}

export type JobSector =
  | 'Government/PSU'
  | 'Private/MNC'
  | 'State Dept/PWD'
  | 'Infrastructure & Construction'
  | 'IT & Software';

export type JobType = 'Government' | 'Private';

export type PlacementStatus =
  | 'Offer Accepted'
  | 'Offer Released'
  | 'Joining Completed'
  | 'Under Background Verification';

export interface CompanyDetailProfile {
  id: string;
  name: string;
  branch: 'Civil Engineering' | 'Computer Science & Engineering';
  sector: JobSector;
  jobType: JobType;
  packageRange: string;
  stipendDuringTraining: string;
  eligibility: string;
  selectionProcess: string;
  location: string;
  about: string;
  hiringRoles: string[];
  sampleQuestions: string[];
  careersUrl: string;
  keyProjectsOrClients: string;
}

export interface PlacementRecord {
  id: string;
  year: number; // 2022 to 2027
  studentName: string;
  rollNumber: string;
  branch: Branch;
  companyName: string;
  sector: JobSector;
  jobType: JobType;
  designation: string;
  packageLPA: number;
  location: string;
  status: PlacementStatus;
  verificationRef: string;
  dateAdded: string;
  notes?: string;
  studentEmail?: string;
}

export interface CompanyVisitLog {
  id: string;
  companyName: string;
  visitDate: string;
  batchYear: number;
  targetBranches: Branch[];
  sector: string;
  jobType?: JobType;
  packageRange: string;
  startingSalaryStipend?: string;
  confirmedCTC?: string;
  eligibilityCriteria: string;
  interviewRounds: string;
  venue: string;
  driveType: 'On-Campus' | 'Pool Campus' | 'Off-Campus';
  status: 'Upcoming' | 'Completed' | 'Registration Open';
  shortlistedCount: number;
  offeredCount: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  regionalOfficeUttarakhand?: string;
  companyReview?: string;
  companyRating?: number;
  studentBenefitAnalysis?: {
    isBeneficialForDiploma: boolean;
    careerGrowthVerdict: string;
    higherEducationSupported: boolean;
    pros: string[];
    cons: string[];
    alumniFeedbackRating: number;
    alumniTestimonial: string;
  };
}

export interface InterviewQA {
  id: string;
  question: string;
  answer: string;
  category: 'Civil Engineering' | 'Computer Science' | 'General Aptitude' | 'HR & Behavioral' | 'Govt/PSU Exams';
  subCategory?: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  companyTags: string[];
  keyConcepts: string[];
  views: number;
  upvotes: number;
  answeredBy: string;
  roleDesignation: string;
  keyTakeaway: string;
  date: string;
}

export interface AlumniMentor {
  id: string;
  name: string;
  graduationYear: number;
  branch: Branch;
  companyName: string;
  designation: string;
  location: string;
  avatarUrl: string;
  linkedInUrl?: string;
  contactEmail: string;
  availability: 'Weekend Mentorship' | 'Evening Q&A' | 'Mock Interviews';
  domainExpertise: string[];
  bio: string;
  totalMenteesHelped: number;
  rating: number;
}

export interface DoubtSession {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  branch: Branch;
  subject: string;
  title: string;
  questionText: string;
  codeSnippetOrEquation?: string;
  assignedFacultyOrExpert: string;
  status: 'Open' | 'In Discussion' | 'Resolved';
  createdAt: string;
  resolvedAt?: string;
  replies: Array<{
    id: string;
    senderName: string;
    senderRole: 'student' | 'faculty' | 'expert' | 'ai';
    messageText: string;
    timestamp: string;
    avatarUrl?: string;
  }>;
}

export interface AssignmentRecord {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  branch: Branch;
  targetYear: AcademicYear;
  assignedDate: string;
  deadlineDate: string; // ISO string
  totalMarks: number;
  description: string;
  remindersSentCount: number; // 0, 1, 2, 3
  reminderTimestamps: string[];
  studentSubmissions: Array<{
    studentId: string;
    studentName: string;
    rollNumber: string;
    isSubmitted: boolean;
    submittedAt?: string;
    obtainedMarks?: number;
    autoGradeScore?: number;
    feedback?: string;
    submissionUrlOrText?: string;
  }>;
  isOverdueForUnsubmitted: boolean;
  facultyAlertTriggered: boolean;
}

export interface AttendanceRecord {
  studentId: string;
  subjectCode: string;
  subjectName: string;
  facultyInCharge: string;
  totalClassesHeld: number;
  classesAttended: number;
  attendancePercentage: number;
  monthlyTrend: Array<{ month: string; percentage: number }>;
  academicYear?: AcademicYear;
  semester?: number;
}

export type UserRole = 'admin' | 'faculty' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  department?: string;
  rollNumber?: string;
  email: string;
  mobile: string;
  avatarUrl: string;
  mfaEnabled: boolean;
  assignedSubjects?: string[]; // RBAC: Faculty can only edit marks for their assigned subjects
}

export interface FacultyCredential {
  facultyId: string;
  facultyName: string;
  email: string;
  mobile: string;
  department: string;
  assignedSubjects: string[];
  passwordPlain?: string; // never sent to the browser any more
  passwordEncrypted?: string;
  passwordHash?: string;
  lastUpdated: string;
  mfaEnabled: boolean;
  smsAlertsActive: boolean;
}

export interface SystemActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'AUTH' | 'SECURITY' | 'SMS' | 'FACULTY_MGMT' | 'STUDENT_MGMT' | 'PLACEMENTS' | 'MARKS_RBAC';
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  type: 'assignment_reminder' | 'deadline_alert' | 'placement' | 'doubt' | 'security' | 'general';
  targetStudentId?: string; // If set, only visible to this student!
  targetFacultyId?: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
  urgencyLevel?: 'info' | 'warning' | 'urgent';
}

export type TechnicalBoard =
  | 'UBTER (Uttarakhand Board of Technical Education)'
  | 'AICTE (Model National Curriculum)'
  | 'BTEUP (Uttar Pradesh Technical Board)'
  | 'MSBTE (Maharashtra State Board)'
  | 'HSBTE (Haryana Board of Technical Education)';

export type ResourceCategory =
  | 'Syllabus PDF'
  | 'Lecture Notes'
  | 'Study Material'
  | 'Lab Manual'
  | 'Previous Year Paper (PYQ)'
  | 'Model Question Paper'
  | 'Reference E-Book';

export interface AcademicResource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  board: TechnicalBoard;
  department: Branch | 'General / Applied Sciences';
  semester: number; // 1 to 6
  academicYear: AcademicYear; // '1st Year', '2nd Year', '3rd Year'
  subjectCode: string; // e.g. "CSE-302", "CSE-501", "ASH-101"
  subjectName: string; // e.g. "Database Management Systems (RDBMS)"
  unitModule?: string; // e.g. "Unit 1: Normalization & Relational Algebra"
  facultyId: string;
  facultyName: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  downloadCount: number;
  tags: string[];
  isVerifiedByHOD?: boolean;
}



export interface MentorshipBooking {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorCompany: string;
  topic: string;
  preferredDate: string; // YYYY-MM-DD
  preferredSlot: string; // e.g. "06:00 PM - 07:00 PM"
  mode: 'Video Call' | 'Phone Call' | 'In-Person (Campus)';
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}
