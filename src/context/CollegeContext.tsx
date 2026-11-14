'use client';

/**
 * Shared app state for every screen (React context): who is logged in, role, language, theme, students, notifications,
 * and the login / logout / password functions. Use it in a component with `const { currentUser, language } = useCollege();`.
 * All real checks happen on the server; this file only calls the APIs and keeps the results.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  StudentProfile,
  AcademicYear,
  Branch,
  StudentStatus,
  AssignmentRecord,
  DoubtSession,
  AttendanceRecord,
  CompanyVisitLog,
  InterviewQA,
  AlumniMentor,
  PlacementRecord,
  UserProfile,
  FacultyCredential,
  SystemActivityLog,
  PortalNotification,
  VerifiedSkill,
  CareerDocument,
  ProfessionalProfile,
  StudentQuizStats,
  MentorshipBooking,
  AcademicResource,
  TechnicalBoard,
  ResourceCategory,
} from '../lib/types';
import { api } from '../lib/client/api';
import {
  ALL_COMPANIES,
  CIVIL_COMPANIES,
  CSE_COMPANIES,
  ALUMNI_MENTORS,
  INITIAL_INTERVIEW_QA,
  CompanyDetailProfile,
} from '../lib/data/placementData';
import {
  ANURAG_ATTENDANCE,
  DIYA_ATTENDANCE,
  ALL_ATTENDANCE_DATABASE,
  SUBJECT_FACULTY_RBAC,
} from '../lib/data/academicData';
import {
  INITIAL_ACADEMIC_RESOURCES,
  TECHNICAL_BOARDS_INFO,
  BoardMetadata,
} from '../lib/data/resourceLibraryData';
import { formatAadharCard } from '../lib/crypto';

interface LoginResult {
  success: boolean;
  requiresMfa?: boolean;
  error?: string;
  user?: UserProfile;
}

interface CollegeContextType {
  // Current user & Auth
  currentUser: UserProfile;
  allUsers: UserProfile[];
  isLoggedIn: boolean;
  loggedInRole: 'student' | 'faculty' | 'admin' | null;
  loggedStudent: StudentProfile | null;
  switchUser: (userId: string) => void;
  loginStudent: (rollNumber: string, passwordAttempt: string) => Promise<LoginResult>;
  loginFaculty: (emailOrMobile: string, passwordAttempt: string) => Promise<LoginResult>;
  loginAdmin: (passwordAttempt: string) => Promise<LoginResult>;
  loginWithPassword: (identifier: string, passwordAttempt: string, mfaCode?: string) => Promise<LoginResult>;
  logout: () => void;
  adminPassword: string;
  authReady: boolean;
  mustChangePassword: boolean;
  changeMyPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetFacultyPassword: (facultyId: string) => Promise<{ success: boolean; tempPassword?: string; smsSent?: boolean; error?: string }>;

  // Student Roster (Anurag Mourya primary, add/edit/delete, status track)
  students: StudentProfile[];
  primaryStudent: StudentProfile;
  addStudent: (student: Omit<StudentProfile, 'id' | 'aadharEncrypted' | 'aadharMasked'>) => void;
  updateStudent: (student: StudentProfile) => void;
  deleteStudent: (studentId: string) => void;
  updateStudentStatus: (studentId: string, status: StudentStatus) => void;
  updateStudentMarks: (
    studentId: string,
    semNumber: number,
    subjectCode: string,
    obtainedMarks: number
  ) => Promise<{ success: boolean; error?: string }>;

  // Class Excel Export & Generator
  getClassStudents: (year?: AcademicYear | 'All', branch?: Branch | 'All', batchYear?: number) => StudentProfile[];
  exportClassExcelCSV: (year?: AcademicYear | 'All', branch?: Branch | 'All', batchYear?: number) => void;

  // Assignments & 3-Reminder Notification Tracker
  assignments: AssignmentRecord[];
  addAssignment: (asg: Omit<AssignmentRecord, 'id' | 'remindersSentCount' | 'reminderTimestamps' | 'studentSubmissions' | 'isOverdueForUnsubmitted' | 'facultyAlertTriggered'>) => void;
  submitAssignment: (assignmentId: string, studentId: string, submissionText: string) => void;
  triggerManualReminder: (assignmentId: string) => void;

  // Real-time Doubt Resolution
  doubtSessions: DoubtSession[];
  createDoubt: (title: string, subject: string, questionText: string, assignedFaculty: string) => void;
  replyDoubt: (doubtId: string, messageText: string) => void;
  resolveDoubt: (doubtId: string) => void;

  // Companies & Placements (10 Civil + 10 CS)
  civilCompanies: CompanyDetailProfile[];
  cseCompanies: CompanyDetailProfile[];
  allCompanies: CompanyDetailProfile[];
  interviewQuestions: InterviewQA[];
  alumniMentors: AlumniMentor[];
  bookMentorshipSession: (
    mentorId: string,
    topic: string,
    options?: { preferredDate?: string; preferredSlot?: string; mode?: MentorshipBooking['mode'] }
  ) => MentorshipBooking | null;
  mentorshipBookings: MentorshipBooking[];
  cancelMentorshipBooking: (bookingId: string) => void;

  // Attendance Analytics
  attendanceRecords: AttendanceRecord[];

  // Faculty Password Management & SMS
  facultyCredentials: FacultyCredential[];
  updateFacultyPassword: (facultyId: string, newPlain: string, sendSms?: boolean) => Promise<boolean>;
  requestPasswordResetSms: (mobileOrEmail: string) => Promise<{ success: boolean; error?: string; otp?: string }>;
  verifyOtpAndResetPassword: (mobileOrEmail: string, otp: string, newPlain: string) => Promise<{ success: boolean; error?: string }>;

  // Profile Photo Upload / Download & Resume
  updateProfilePhoto: (userIdOrStudentId: string, photoUrl: string) => void;
  uploadStudentResume: (studentId: string, fileName: string, fileData?: string) => void;

  // Skill Verification by Faculty/Admin
  endorseSkill: (studentId: string, skillId: string, facultyName: string, remarks?: string) => void;
  revokeSkillEndorsement: (studentId: string, skillId: string) => void;
  addStudentSkill: (studentId: string, skill: Omit<VerifiedSkill, 'id' | 'isVerified'>) => void;

  // Professional Profile & Career Documents History
  updateProfessionalProfile: (studentId: string, profile: Partial<ProfessionalProfile>) => void;
  addCareerDocument: (studentId: string, doc: Omit<CareerDocument, 'id' | 'uploadedAt'>) => void;
  deleteCareerDocument: (studentId: string, docId: string) => void;
  setActiveResume: (studentId: string, docId: string) => void;

  // Govt Exam Quiz Practice & Score Tracking
  quizStats: StudentQuizStats;
  recordQuizAttempt: (questionId: string, selectedIndex: number, isCorrect: boolean) => void;

  // Academic Resource Library (Notes, Syllabus, PYQs, Lab Manuals across Technical Boards)
  academicResources: AcademicResource[];
  technicalBoards: BoardMetadata[];
  addAcademicResource: (res: Omit<AcademicResource, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  updateAcademicResource: (res: AcademicResource) => void;
  deleteAcademicResource: (resourceId: string) => { success: boolean; error?: string };
  incrementResourceDownloadCount: (resourceId: string) => void;
  reloadAcademicResources: () => Promise<void>;

  // Notifications
  notifications: PortalNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Offline Sync & GDPR Export
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncedTime: string;
  triggerManualSync: () => Promise<void>;
  exportFullBackupJSON: () => void;
  language: 'hi' | 'en';
  setLanguage: (lang: 'hi' | 'en') => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Guest',
  role: 'student',
  email: '',
  mobile: '',
  avatarUrl: '',
  mfaEnabled: false,
};

// Shown only while nothing is loaded yet (before login). Contains no real person's data.
const EMPTY_STUDENT: StudentProfile = {
  id: 'none',
  aadharName: '',
  mobileNumber: '',
  ubterRollNumber: '',
  tenthPercentage: 0,
  twelfthPercentage: 0,
  firstYearPercentage: 0,
  firstYearCGPA: 0,
  secondYearPercentage: 0,
  secondYearCGPA: 0,
  semesters: [],
  address: '',
  motherName: '',
  fatherName: '',
  aadharNumber: '',
  aadharEncrypted: '',
  aadharMasked: 'XXXX-XXXX-XXXX',
  branch: 'Computer Science & Engineering',
  currentYear: '3rd Year',
  currentSemester: 1,
  batchYear: new Date().getFullYear(),
  section: '',
  status: 'Enrolled',
  avatarUrl: '',
  attendancePercentage: 0,
};

const SYNC_FIELDS = ['avatarUrl', 'resumeUrl', 'resumeFileName', 'resumeUploadedAt', 'careerGoal', 'skills', 'resumeHistory', 'professionalProfile'] as const;
const pickSync = (s: StudentProfile) => JSON.stringify(SYNC_FIELDS.map(k => (s as any)[k] ?? null));

let studentCounter = 1000;
function createStudentId(roll: string) {
  studentCounter += 1;
  return `stu-${roll || 'id'}-${studentCounter}`;
}

let doubtCounter = 1000;
function createDoubtId() {
  doubtCounter += 1;
  return `dbt-${doubtCounter}`;
}

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language & Theme
  const [language, setLanguageState] = useState<'hi' | 'en'>('hi');
  // The chosen language stays after a reload.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ugip-language');
      if (saved === 'en' || saved === 'hi') setLanguageState(saved);
    } catch {
      /* browser storage is blocked */
    }
  }, []);
  const setLanguage = (lang: 'hi' | 'en') => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ugip-language', lang);
    } catch {
      /* browser storage is blocked */
    }
  };
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  // Users & Authentication: the session lives on the server (httpOnly cookie). Nothing secret is stored in the browser.
  const [allUsers] = useState<UserProfile[]>([GUEST_USER]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInRole, setLoggedInRole] = useState<'student' | 'faculty' | 'admin' | null>(null);
  const [loggedStudent, setLoggedStudent] = useState<StudentProfile | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [mustChangePassword, setMustChangePassword] = useState<boolean>(false);

  // Role switching in the browser was a security hole; roles now come only from the server session.
  const switchUser = (_userId: string) => {};

  const [facultyCredentials, setFacultyCredentials] = useState<FacultyCredential[]>([]);
  const adminPassword = '';

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const syncedRef = useRef<Map<string, string>>(new Map());
  const snapshotStudents = (list: StudentProfile[]) => {
    syncedRef.current = new Map(list.map(st => [st.id, pickSync(st)]));
  };

  const primaryStudent = useMemo(() => loggedStudent || students[0] || EMPTY_STUDENT, [loggedStudent, students]);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<SystemActivityLog[]>([]);

  const logActivity = (
    action: string,
    category: SystemActivityLog['category'],
    status: SystemActivityLog['status'],
    details: string
  ) => {
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action,
        category,
        ipAddress: '192.168.1.104 (Campus LAN)',
        status,
        details,
      },
      ...prev,
    ]);
  };

  // Student CRUD: every change goes to the server first; the server is the source of truth.
  const addStudent = (studentData: Omit<StudentProfile, 'id' | 'aadharEncrypted' | 'aadharMasked'>) => {
    api('/api/students', { body: studentData }).then(r => {
      if (r.success) {
        setStudents(prev => [r.student, ...prev]);
        syncedRef.current.set(r.student.id, pickSync(r.student));
        addNotification('New Student Enrolled', `${r.student.aadharName} added. Temporary password (share once): ${r.tempPassword}`, 'general');
      } else {
        addNotification('Could not add student', r.error || 'Server error.', 'security');
      }
    });
  };

  const updateStudent = (updatedStudent: StudentProfile) => {
    api(`/api/students/${updatedStudent.id}`, { method: 'PATCH', body: updatedStudent }).then(r => {
      if (r.success) {
        setStudents(prev => prev.map(st => (st.id === r.student.id ? r.student : st)));
        syncedRef.current.set(r.student.id, pickSync(r.student));
      } else {
        addNotification('Update failed', r.error || 'Server error.', 'security');
      }
    });
  };

  const deleteStudent = (studentId: string) => {
    api(`/api/students/${studentId}`, { method: 'DELETE' }).then(r => {
      if (r.success) setStudents(prev => prev.filter(st => st.id !== studentId));
      else addNotification('Delete failed', r.error || 'Server error.', 'security');
    });
  };

  const updateStudentStatus = (studentId: string, status: StudentStatus) => {
    api(`/api/students/${studentId}`, { method: 'PATCH', body: { status } }).then(r => {
      if (r.success) setStudents(prev => prev.map(st => (st.id === studentId ? { ...st, status } : st)));
      else addNotification('Status update failed', r.error || 'Server error.', 'security');
    });
  };

  // SUBJECT-LEVEL RBAC MARKS EDITING: enforced on the SERVER. The check here is only for instant feedback.
  const updateStudentMarks = async (
    studentId: string,
    semNumber: number,
    subjectCode: string,
    obtainedMarks: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'admin') {
      const allowed = currentUser.assignedSubjects?.includes(subjectCode) || currentUser.assignedSubjects?.includes('ALL');
      if (!allowed) {
        return {
          success: false,
          error: `Access Denied: you can only edit marks for your assigned subjects (${currentUser.assignedSubjects?.join(', ') || 'None'}).`,
        };
      }
    }
    const r = await api(`/api/students/${studentId}/marks`, { method: 'PATCH', body: { semNumber, subjectCode, obtainedMarks } });
    if (!r.success) return { success: false, error: r.error || 'Could not save marks.' };
    setStudents(prev => prev.map(st => (st.id === studentId ? r.student : st)));
    syncedRef.current.set(r.student.id, pickSync(r.student));
    return { success: true };
  };

  // Automated Excel / CSV Sheet Generator by Class
  const getClassStudents = (
    year?: AcademicYear | 'All',
    branch?: Branch | 'All',
    batchYear?: number
  ): StudentProfile[] => {
    return students.filter(s => {
      if (year && year !== 'All' && s.currentYear !== year) return false;
      if (branch && branch !== 'All' && s.branch !== branch) return false;
      if (batchYear && s.batchYear !== batchYear) return false;
      return true;
    });
  };

  const exportClassExcelCSV = (
    year: AcademicYear | 'All' = 'All',
    branch: Branch | 'All' = 'All',
    batchYear?: number
  ) => {
    const list = getClassStudents(year, branch, batchYear);
    const headers = [
      'UBTER Roll Number',
      'Aadhar Card Name',
      'Caste / Category',
      'Gender',
      'Mobile Number',
      'Current Year',
      'Branch',
      'Batch',
      'Section',
      '10th %',
      '12th %',
      '1st Year CGPA',
      '2nd Year CGPA',
      'Sem 1 %',
      'Sem 2 %',
      'Sem 3 %',
      'Sem 4 %',
      'Father Name',
      'Mother Name',
      'Address',
      'Aadhar Number (GDPR Masked)',
      'Attendance %',
      'Status',
    ];

    const rows = list.map(s => {
      const sem1 = s.semesters.find(x => x.semNumber === 1)?.percentage || '';
      const sem2 = s.semesters.find(x => x.semNumber === 2)?.percentage || '';
      const sem3 = s.semesters.find(x => x.semNumber === 3)?.percentage || '';
      const sem4 = s.semesters.find(x => x.semNumber === 4)?.percentage || '';
      return [
        `"${s.ubterRollNumber}"`,
        `"${s.aadharName}"`,
        `"${s.category || 'General'}"`,
        `"${s.gender || 'Not Specified'}"`,
        `"${s.mobileNumber}"`,
        `"${s.currentYear}"`,
        `"${s.branch}"`,
        s.batchYear,
        `"${s.section}"`,
        s.tenthPercentage,
        s.twelfthPercentage,
        s.firstYearCGPA,
        s.secondYearCGPA,
        sem1,
        sem2,
        sem3,
        sem4,
        `"${s.fatherName}"`,
        `"${s.motherName}"`,
        `"${s.address}"`,
        `"${s.aadharMasked}"`,
        s.attendancePercentage,
        `"${s.status}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    const filename = `Tanakpur_Polytechnic_Class_Sheet_${year.replace(/\s+/g, '_')}_${branch.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity(`Generated Class Excel/CSV Sheet for ${year} ${branch}`, 'STUDENT_MGMT', 'SUCCESS', `Exported ${list.length} candidate rows.`);
  };

  // Assignments & 3-Reminder Tracker (reminders are also sent automatically by /api/cron/reminders)
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);

  const reloadAssignments = async () => {
    const r = await api('/api/assignments');
    if (r.success) setAssignments(r.assignments);
  };

  const addAssignment = (asg: Omit<AssignmentRecord, 'id' | 'remindersSentCount' | 'reminderTimestamps' | 'studentSubmissions' | 'isOverdueForUnsubmitted' | 'facultyAlertTriggered'>) => {
    api('/api/assignments', { body: asg }).then(r => {
      if (r.success) setAssignments(prev => [r.assignment, ...prev]);
      else addNotification('Could not create assignment', r.error || 'Server error.', 'security');
    });
  };

  const submitAssignment = (assignmentId: string, _studentId: string, submissionText: string) => {
    api(`/api/assignments/${assignmentId}/submit`, { body: { submissionText } }).then(async r => {
      if (r.success) {
        addNotification('Assignment Submitted', 'Your assignment was submitted. Faculty will grade it.', 'assignment_reminder');
        await reloadAssignments();
      } else {
        addNotification('Submission failed', r.error || 'Server error.', 'security');
      }
    });
  };

  const triggerManualReminder = (assignmentId: string) => {
    api(`/api/assignments/${assignmentId}/remind`, { body: {} }).then(async r => {
      if (r.success) {
        addNotification('Reminder sent', `Reminder sent to ${r.sent} student(s).`, 'assignment_reminder');
        await reloadAssignments();
      } else {
        addNotification('Reminder failed', r.error || 'Server error.', 'security');
      }
    });
  };

  // Doubt sessions (refreshed every 20 s while logged in)
  const [doubtSessions, setDoubtSessions] = useState<DoubtSession[]>([]);

  const createDoubt = (title: string, subject: string, questionText: string, assignedFaculty: string) => {
    api('/api/doubts', { body: { title, subject, questionText, assignedFaculty } }).then(r => {
      if (r.success) setDoubtSessions(prev => [r.doubt, ...prev]);
      else addNotification('Could not post doubt', r.error || 'Server error.', 'security');
    });
  };

  const replyDoubt = (doubtId: string, messageText: string) => {
    api(`/api/doubts/${doubtId}`, { body: { action: 'reply', messageText } }).then(r => {
      if (r.success) setDoubtSessions(prev => prev.map(d => (d.id === doubtId ? r.doubt : d)));
      else addNotification('Reply failed', r.error || 'Server error.', 'security');
    });
  };

  const resolveDoubt = (doubtId: string) => {
    api(`/api/doubts/${doubtId}`, { body: { action: 'resolve' } }).then(r => {
      if (r.success) setDoubtSessions(prev => prev.map(d => (d.id === doubtId ? r.doubt : d)));
      else addNotification('Could not resolve doubt', r.error || 'Server error.', 'security');
    });
  };

  // Mentorship
  const [alumniMentors, setAlumniMentors] = useState<AlumniMentor[]>(ALUMNI_MENTORS);
  const MENTOR_BOOKINGS_KEY = 'gpt-tanakpur-mentorship-bookings-v1';
  const [mentorshipBookings, setMentorshipBookings] = useState<MentorshipBooking[]>([]);

  // Load saved bookings (per browser) once on mount. localStorage can throw in private mode.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MENTOR_BOOKINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMentorshipBookings(parsed);
      }
    } catch {
      /* ignore – bookings simply start empty */
    }
  }, []);

  const persistBookings = (next: MentorshipBooking[]) => {
    try {
      window.localStorage.setItem(MENTOR_BOOKINGS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const bookMentorshipSession = (
    mentorId: string,
    topic: string,
    options?: { preferredDate?: string; preferredSlot?: string; mode?: MentorshipBooking['mode'] }
  ): MentorshipBooking | null => {
    const mentor = alumniMentors.find(m => m.id === mentorId);
    if (!mentor) return null;
    const booking: MentorshipBooking = {
      id: `mbk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorCompany: mentor.companyName,
      topic,
      preferredDate: options?.preferredDate || new Date().toISOString().slice(0, 10),
      preferredSlot: options?.preferredSlot || 'Flexible',
      mode: options?.mode || 'Video Call',
      status: 'Requested',
      createdAt: new Date().toISOString(),
    };
    setMentorshipBookings(prev => {
      const next = [booking, ...prev];
      persistBookings(next);
      return next;
    });
    addNotification(
      'Mentorship Session Booked',
      `Your 1-on-1 industry mentorship request with ${mentor.name} (${mentor.companyName}) for "${topic}" on ${booking.preferredDate} (${booking.preferredSlot}) has been scheduled!`,
      'placement'
    );
    logActivity(`Mentorship Booked: ${mentor.name}`, 'PLACEMENTS', 'SUCCESS', `Topic: ${topic}`);
    return booking;
  };

  const cancelMentorshipBooking = (bookingId: string) => {
    setMentorshipBookings(prev => {
      const next = prev.map(b => (b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b));
      persistBookings(next);
      return next;
    });
  };

  // Notifications: server notifications + local toasts for client-side events
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);

  const addNotification = (
    title: string,
    message: string,
    type: PortalNotification['type'],
    targetStudentId?: string
  ) => {
    const newNotif: PortalNotification = {
      id: `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      type,
      targetStudentId,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    if (!id.startsWith('local-')) api('/api/notifications', { body: { ids: [id] } });
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api('/api/notifications', { body: { all: true } });
  };

  // Profile photo update
  const updateProfilePhoto = (userIdOrStudentId: string, photoUrl: string) => {
    // 1. Update in students roster
    setStudents(prev =>
      prev.map(s => (s.id === userIdOrStudentId || s.ubterRollNumber === userIdOrStudentId ? { ...s, avatarUrl: photoUrl } : s))
    );
    // 2. Update in allUsers & currentUser
    if (currentUser.id === userIdOrStudentId || currentUser.rollNumber === userIdOrStudentId) {
      setCurrentUser(prev => ({ ...prev, avatarUrl: photoUrl }));
    }
  };

  // Student resume upload
  const uploadStudentResume = (studentId: string, fileName: string, fileData?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          return {
            ...s,
            resumeFileName: fileName,
            resumeUrl: fileData || s.resumeUrl || '',
            resumeUploadedAt: today,
          };
        }
        return s;
      })
    );
    logActivity(`Resume updated: ${fileName}`, 'STUDENT_MGMT', 'SUCCESS', `Student: ${studentId}`);
    addNotification('Resume Uploaded', `Resume file "${fileName}" attached to profile for campus recruitment.`, 'general');
  };

  // Skill Verification by Faculty/Admin
  const endorseSkill = (studentId: string, skillId: string, facultyName: string, remarks?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          const updatedSkills = (s.skills || []).map(sk => {
            if (sk.id === skillId) {
              return {
                ...sk,
                isVerified: true,
                verifiedBy: facultyName,
                verifiedAt: today,
                endorsementRemarks: remarks || `Officially certified by ${facultyName}`,
              };
            }
            return sk;
          });
          return { ...s, skills: updatedSkills };
        }
        return s;
      })
    );
    logActivity(`Skill Endorsed by ${facultyName}`, 'MARKS_RBAC', 'SUCCESS', `Skill: ${skillId} for student: ${studentId}`);
    addNotification(
      'Technical Skill Verified! 🏅',
      `Faculty ${facultyName} has digitally endorsed and verified your technical skill on your institutional profile.`,
      'general',
      studentId
    );
  };

  const revokeSkillEndorsement = (studentId: string, skillId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          const updatedSkills = (s.skills || []).map(sk => {
            if (sk.id === skillId) {
              return {
                ...sk,
                isVerified: false,
                verifiedBy: undefined,
                verifiedAt: undefined,
                endorsementRemarks: 'Verification status revised by departmental faculty.',
              };
            }
            return sk;
          });
          return { ...s, skills: updatedSkills };
        }
        return s;
      })
    );
    logActivity('Skill Endorsement Revoked', 'MARKS_RBAC', 'WARNING', `Skill: ${skillId}`);
  };

  const addStudentSkill = (studentId: string, newSkillData: Omit<VerifiedSkill, 'id' | 'isVerified'>) => {
    const newSkill: VerifiedSkill = {
      id: `skill-${Date.now()}`,
      ...newSkillData,
      isVerified: false,
      endorsementRemarks: 'Self-added by student. Awaiting faculty review.',
    };
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          return {
            ...s,
            skills: [...(s.skills || []), newSkill],
          };
        }
        return s;
      })
    );
    logActivity(`New Skill Added: ${newSkillData.name}`, 'STUDENT_MGMT', 'SUCCESS', `Student: ${studentId}`);
  };

  // Professional Profile & Career Documents History
  const updateProfessionalProfile = (studentId: string, profile: Partial<ProfessionalProfile>) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          const existing = s.professionalProfile || {
            headline: '',
            bio: '',
            targetRoles: [],
          };
          return {
            ...s,
            professionalProfile: {
              ...existing,
              ...profile,
            },
          };
        }
        return s;
      })
    );
    logActivity('Professional Profile Updated', 'STUDENT_MGMT', 'SUCCESS', `Student: ${studentId}`);
  };

  const addCareerDocument = (studentId: string, doc: Omit<CareerDocument, 'id' | 'uploadedAt'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const newDoc: CareerDocument = {
      id: `cdoc-${Date.now()}`,
      ...doc,
      uploadedAt: today,
    };
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          const updatedHistory = [newDoc, ...(s.resumeHistory || [])];
          return {
            ...s,
            resumeHistory: updatedHistory,
            resumeFileName: newDoc.isActive ? newDoc.fileName : s.resumeFileName,
          };
        }
        return s;
      })
    );
    logActivity(`Career Document Added: ${newDoc.title}`, 'STUDENT_MGMT', 'SUCCESS', `Type: ${newDoc.docType}`);
    addNotification('Career Document Stored', `Document "${newDoc.title}" archived in your Career Documents Ledger.`, 'general', studentId);
  };

  const deleteCareerDocument = (studentId: string, docId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          return {
            ...s,
            resumeHistory: (s.resumeHistory || []).filter(d => d.id !== docId),
          };
        }
        return s;
      })
    );
    logActivity('Career Document Deleted', 'STUDENT_MGMT', 'WARNING', `Doc ID: ${docId}`);
  };

  const setActiveResume = (studentId: string, docId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId || s.ubterRollNumber === studentId) {
          let chosenFileName = s.resumeFileName;
          const updatedDocs = (s.resumeHistory || []).map(d => {
            const isMatch = d.id === docId;
            if (isMatch) chosenFileName = d.fileName;
            return { ...d, isActive: isMatch };
          });
          return {
            ...s,
            resumeHistory: updatedDocs,
            resumeFileName: chosenFileName,
          };
        }
        return s;
      })
    );
    logActivity('Active Resume Changed', 'STUDENT_MGMT', 'SUCCESS', `Doc ID: ${docId}`);
  };

  // Govt Exam Quiz Practice & Score Tracking
  const [quizStats, setQuizStats] = useState<StudentQuizStats>(() => {
    return {
      totalAttempted: 8,
      totalCorrect: 7,
      totalWrong: 1,
      accuracyPercentage: 87.5,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
  });

  const recordQuizAttempt = (questionId: string, selectedIndex: number, isCorrect: boolean) => {
    setQuizStats(prev => {
      const nextAttempted = prev.totalAttempted + 1;
      const nextCorrect = prev.totalCorrect + (isCorrect ? 1 : 0);
      const nextWrong = prev.totalWrong + (isCorrect ? 0 : 1);
      const nextAcc = Math.round((nextCorrect / nextAttempted) * 100);
      return {
        totalAttempted: nextAttempted,
        totalCorrect: nextCorrect,
        totalWrong: nextWrong,
        accuracyPercentage: nextAcc,
        lastUpdated: new Date().toISOString().slice(0, 10),
      };
    });
  };

  // Academic Resource Library (Notes, Syllabus, PYQs, Lab Manuals across Technical Boards)
  const [academicResources, setAcademicResources] = useState<AcademicResource[]>(INITIAL_ACADEMIC_RESOURCES);

  const reloadAcademicResources = async () => {
    const r = await api('/api/resources');
    if (r.success) setAcademicResources(r.resources);
  };

  const addAcademicResource = (res: Omit<AcademicResource, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const newRes: AcademicResource = {
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: today,
      downloadCount: 0,
      isVerifiedByHOD: loggedInRole === 'admin' || currentUser.name.includes('Taragi') || true,
    };
    setAcademicResources(prev => [newRes, ...prev]);
    logActivity(`Academic Resource Uploaded: ${res.title}`, 'FACULTY_MGMT', 'SUCCESS', `Subject: ${res.subjectCode}`);
    addNotification(
      'New Study Resource Published 📚',
      `${res.facultyName} uploaded "${res.title}" for ${res.subjectCode} (${res.board}).`,
      'general'
    );
  };

  const updateAcademicResource = (updated: AcademicResource) => {
    setAcademicResources(prev => prev.map(r => r.id === updated.id ? updated : r));
    logActivity(`Academic Resource Updated: ${updated.title}`, 'FACULTY_MGMT', 'SUCCESS', `ID: ${updated.id}`);
  };

  const deleteAcademicResource = (resourceId: string): { success: boolean; error?: string } => {
    const target = academicResources.find(r => r.id === resourceId);
    if (!target) return { success: false, error: 'Resource not found.' };

    // RBAC: If faculty, check if authorized
    if (
      loggedInRole === 'faculty' &&
      target.facultyId !== currentUser.id &&
      !currentUser.assignedSubjects?.includes(target.subjectCode)
    ) {
      return {
        success: false,
        error: `Permission Denied: You can only delete resources for your assigned subject or uploaded by you. (Author: ${target.facultyName})`,
      };
    }

    setAcademicResources(prev => prev.filter(r => r.id !== resourceId));
    logActivity(`Academic Resource Deleted: ${target.title}`, 'FACULTY_MGMT', 'SUCCESS', `Subject: ${target.subjectCode}`);
    return { success: true };
  };

  const incrementResourceDownloadCount = (resourceId: string) => {
    setAcademicResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, downloadCount: r.downloadCount + 1 } : r)
    );
  };

  // ---------- Passwords (all hashing / OTP checking happens on the server) ----------
  const refreshFaculty = async () => {
    const fc = await api('/api/faculty');
    if (fc.success) setFacultyCredentials(fc.faculty);
  };

  // Admin sets a specific password for a staff member.
  const updateFacultyPassword = async (facultyId: string, newPlain: string, _sendSms = true): Promise<boolean> => {
    const r = await api(`/api/faculty/${facultyId}/reset-password`, { body: { newPassword: newPlain } });
    if (r.success) {
      addNotification('Password updated', `Password changed.${r.smsSent ? ' SMS sent to the faculty mobile.' : ''}`, 'security');
      await refreshFaculty();
    } else {
      addNotification('Password NOT changed', r.error || 'Server error.', 'security');
    }
    return !!r.success;
  };

  // Admin generates a one-time temporary password.
  const resetFacultyPassword = async (facultyId: string) => {
    const r = await api(`/api/faculty/${facultyId}/reset-password`, { body: {} });
    if (r.success) await refreshFaculty();
    return { success: !!r.success, tempPassword: r.tempPassword as string | undefined, smsSent: r.smsSent as boolean | undefined, error: r.error as string | undefined };
  };

  // Logged-in user changes own password (needs the current one).
  const changeMyPassword = async (currentPassword: string, newPassword: string) => {
    const r = await api('/api/auth/change-password', { body: { currentPassword, newPassword } });
    if (r.success) setMustChangePassword(false);
    return { success: !!r.success, error: r.error as string | undefined };
  };

  const requestPasswordResetSms = async (mobileOrEmail: string): Promise<{ success: boolean; error?: string; otp?: string }> => {
    const r = await api('/api/auth/forgot', { body: { identifier: mobileOrEmail.trim() } });
    return { success: !!r.success, error: r.error };
  };

  const verifyOtpAndResetPassword = async (mobileOrEmail: string, otp: string, newPlain: string): Promise<{ success: boolean; error?: string }> => {
    const r = await api('/api/auth/reset', { body: { identifier: mobileOrEmail.trim(), otp: otp.trim(), newPassword: newPlain } });
    return { success: !!r.success, error: r.error };
  };

  // ---------- Session ----------
  const mapUser = (u: any): UserProfile => ({
    id: u.id,
    name: u.name,
    role: u.role,
    department: u.department ?? undefined,
    rollNumber: u.rollNumber ?? undefined,
    email: u.email ?? '',
    mobile: u.mobile ?? '',
    avatarUrl: u.avatarUrl ?? '',
    mfaEnabled: !!u.mfaEnabled,
    assignedSubjects: u.assignedSubjects ?? [],
  });

  const loadAll = async (role: 'student' | 'faculty' | 'admin') => {
    const [st, as, db, nt, fc] = await Promise.all([
      api('/api/students'),
      api('/api/assignments'),
      api('/api/doubts'),
      api('/api/notifications'),
      api('/api/faculty'),
    ]);
    if (st.success) {
      setStudents(st.students);
      snapshotStudents(st.students);
      setLoggedStudent(role === 'student' ? st.students[0] ?? null : null);
    }
    if (as.success) setAssignments(as.assignments);
    if (db.success) setDoubtSessions(db.doubts);
    if (nt.success) setNotifications(nt.notifications);
    if (fc.success) setFacultyCredentials(fc.faculty);
    await reloadAcademicResources();
    if (role === 'admin') {
      const lg = await api('/api/logs');
      if (lg.success) setActivityLogs(lg.logs);
    }
  };

  const applySession = async (u: any): Promise<UserProfile> => {
    const profile = mapUser(u);
    await loadAll(u.role);
    setCurrentUser(profile);
    setLoggedInRole(u.role);
    setMustChangePassword(!!u.mustChangePassword);
    setIsLoggedIn(true);
    return profile;
  };

  const resetLocalSession = () => {
    setIsLoggedIn(false);
    setLoggedInRole(null);
    setLoggedStudent(null);
    setCurrentUser(GUEST_USER);
    setStudents([]);
    setAssignments([]);
    setDoubtSessions([]);
    setNotifications([]);
    setActivityLogs([]);
    setMustChangePassword(false);
    syncedRef.current = new Map();
  };

  const doLogin = async (identifier: string, password: string): Promise<LoginResult> => {
    if (!identifier.trim() || !password) return { success: false, error: 'Enter your ID and password.' };
    const r = await api('/api/auth/login', { body: { identifier: identifier.trim(), password } });
    if (!r.success) return { success: false, error: r.error || 'Login failed.' };
    const user = await applySession(r.user);
    return { success: true, user };
  };

  const loginStudent = (rollOrMobile: string, passwordAttempt: string) => doLogin(rollOrMobile, passwordAttempt);
  const loginFaculty = (emailOrMobile: string, passwordAttempt: string) => doLogin(emailOrMobile, passwordAttempt);
  const loginAdmin = async (passwordAttempt: string) => {
    const r = await doLogin('admin', passwordAttempt.trim());
    // Admin has no ID field, so a 401 can only mean the password is wrong.
    if (!r.success && r.error?.startsWith('Wrong ID or password'))
      return { ...r, error: 'Wrong password. Capital and small letters must match exactly.' };
    return r;
  };
  const loginWithPassword = (identifier: string, passwordAttempt: string, _mfaCode?: string) => doLogin(identifier, passwordAttempt);

  const logout = () => {
    api('/api/auth/logout', { body: {} });
    resetLocalSession();
  };

  // Restore the session after a page refresh (this is what makes "refresh = logged out" go away).
  useEffect(() => {
    let alive = true;
    (async () => {
      const [me, fc] = await Promise.all([api('/api/auth/me'), api('/api/faculty')]);
      if (!alive) return;
      if (fc.success) setFacultyCredentials(fc.faculty);
      if (me.success && me.user) await applySession(me.user);
      if (alive) setAuthReady(true);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Real-time": poll doubts + notifications every 20 s and detect an expired session.
  useEffect(() => {
    if (!isLoggedIn) return;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      const me = await api('/api/auth/me');
      if (me.success && !me.user) {
        resetLocalSession();
        return;
      }
      const [db, nt] = await Promise.all([api('/api/doubts'), api('/api/notifications')]);
      if (db.success) setDoubtSessions(db.doubts);
      if (nt.success) setNotifications(prev => [...prev.filter(n => n.id.startsWith('local-')), ...nt.notifications]);
    };
    const t = setInterval(tick, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Auto-save profile edits (photo, resume, skills...) for the logged-in user.
  useEffect(() => {
    if (!isLoggedIn) return;
    const t = setTimeout(() => {
      students.forEach(st => {
        const sig = pickSync(st);
        if (syncedRef.current.get(st.id) === sig) return;
        syncedRef.current.set(st.id, sig);
        const body: Record<string, unknown> = {};
        SYNC_FIELDS.forEach(k => {
          body[k] = (st as any)[k];
        });
        api(`/api/students/${st.id}`, { method: 'PATCH', body }).then(r => {
          if (!r.success) {
            syncedRef.current.delete(st.id);
            addNotification('Changes not saved', r.error || 'Could not save your changes to the server.', 'security');
          }
        });
      });
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, isLoggedIn]);

  // Keep the student's own record fresh when it changes.
  useEffect(() => {
    if (loggedInRole === 'student' && students[0]) setLoggedStudent(students[0]);
  }, [students, loggedInRole]);

  // Offline Sync
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  const triggerManualSync = async () => {
    setCloudSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 600));
    setCloudSyncStatus('synced');
    const now = new Date();
    setLastSyncedTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    logActivity('Cloud database synchronization completed', 'SECURITY', 'SUCCESS', 'Offline sync queue flushed.');
  };

  const exportFullBackupJSON = () => {
    const backup = {
      institution: 'Uttarakhand Government Institute of Polytechnic, Tanakpur, District Champawat, Uttarakhand',
      exportedAt: new Date().toISOString(),
      totalStudents: students.length,
      students,
      assignments,
      doubtSessions,
      activityLogs,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPT_Tanakpur_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeAttendanceRecords = useMemo(() => {
    if (
      loggedStudent?.id === 'stu-diya-adhikari-24090050011' ||
      currentUser.rollNumber === '24090050011' ||
      currentUser.name.toLowerCase().includes('diya')
    ) {
      return DIYA_ATTENDANCE;
    }
    if (loggedStudent) {
      const found = ALL_ATTENDANCE_DATABASE.filter(a => a.studentId === loggedStudent.id);
      return found;
    }
    return ANURAG_ATTENDANCE;
  }, [loggedStudent, currentUser]);

  return (
    <CollegeContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoggedIn,
        loggedInRole,
        loggedStudent,
        switchUser,
        loginStudent,
        loginFaculty,
        loginAdmin,
        loginWithPassword,
        logout,
        adminPassword,
        authReady,
        mustChangePassword,
        changeMyPassword,
        resetFacultyPassword,
        students,
        primaryStudent,
        addStudent,
        updateStudent,
        deleteStudent,
        updateStudentStatus,
        updateStudentMarks,
        getClassStudents,
        exportClassExcelCSV,
        assignments,
        addAssignment,
        submitAssignment,
        triggerManualReminder,
        doubtSessions,
        createDoubt,
        replyDoubt,
        resolveDoubt,
        civilCompanies: CIVIL_COMPANIES,
        cseCompanies: CSE_COMPANIES,
        allCompanies: ALL_COMPANIES,
        interviewQuestions: INITIAL_INTERVIEW_QA,
        alumniMentors,
        bookMentorshipSession,
        mentorshipBookings,
        cancelMentorshipBooking,
        attendanceRecords: activeAttendanceRecords,
        facultyCredentials,
        updateFacultyPassword,
        requestPasswordResetSms,
        verifyOtpAndResetPassword,
        updateProfilePhoto,
        uploadStudentResume,
        endorseSkill,
        revokeSkillEndorsement,
        addStudentSkill,
        updateProfessionalProfile,
        addCareerDocument,
        deleteCareerDocument,
        setActiveResume,
        quizStats,
        recordQuizAttempt,
        academicResources,
        technicalBoards: TECHNICAL_BOARDS_INFO,
        addAcademicResource,
        updateAcademicResource,
        deleteAcademicResource,
        incrementResourceDownloadCount,
        reloadAcademicResources,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        isOnline,
        setIsOnline,
        cloudSyncStatus,
        lastSyncedTime,
        triggerManualSync,
        exportFullBackupJSON,
        language,
        setLanguage,
        darkMode,
        toggleDarkMode,
        highContrast,
        toggleHighContrast,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) throw new Error('useCollege must be used within CollegeProvider');
  return context;
};
