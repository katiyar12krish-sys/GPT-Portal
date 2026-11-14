'use client';

/**
 * Student Profile screen: personal details, semester marks, skills, certificates and verification by faculty.
 * Staff can see every student; a student sees only their own profile.
 */
import { StudentPasswordCard } from './StudentPasswordCard';
import { ExportButtons } from '../ui/ExportButtons';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import React, { useState, useRef, useEffect } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { StudentProfile, AcademicYear, Branch, StudentStatus } from '../../lib/types';
import {
  GraduationCap,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Plus,
  Download,
  Camera,
  CheckCircle2,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  X,
  Save,
  Printer,
  Sparkles,
  ExternalLink,
  Bot,
  Send,
  UploadCloud,
  Check,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentPortfolioScreenProps {
  onOpenMockTest?: () => void;
  onOpenExcelExport?: () => void;
}

export const StudentPortfolioScreen: React.FC<StudentPortfolioScreenProps> = ({
  onOpenMockTest,
  onOpenExcelExport,
}) => {
  const {
    students,
    primaryStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    updateStudentStatus,
    updateProfilePhoto,
    uploadStudentResume,
    currentUser,
    language,
    loggedInRole,
    loggedStudent,
  } = useCollege();

  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'All'>('3rd Year');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(primaryStudent.id);
  const [showFullAadhar, setShowFullAadhar] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [photoTargetId, setPhotoTargetId] = useState<string | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Modals: Student Self-Update, Resume Upload, and AI Career Mentor
  const [isSelfEditModalOpen, setIsSelfEditModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isAiMentorModalOpen, setIsAiMentorModalOpen] = useState(false);
  const [resumeFileInput, setResumeFileInput] = useState('');

  // AI Career Mentor State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active student being inspected: If logged in as student, their data is strictly private!
  const activeStudent = loggedInRole === 'student'
    ? (loggedStudent || students.find(s => s.ubterRollNumber === currentUser.rollNumber) || primaryStudent)
    : (students.find(s => s.id === selectedStudentId) || primaryStudent);

  // Filter students by selected year
  const filteredStudents = students.filter(s => {
    if (selectedYear === 'All') return true;
    return s.currentYear === selectedYear;
  });
  const rosterPg = usePaged(filteredStudents, 10);

  // Staff: switching the year tab opens the first student of that year (never a student of another year).
  useEffect(() => {
    if (loggedInRole === 'student') return;
    if (filteredStudents.length && !filteredStudents.some(s => s.id === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, students.length]);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, studentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      updateProfilePhoto(studentId, url);
    };
    reader.readAsDataURL(file);
  };

  // Self Edit Form State (for student self-service "Update Your Details")
  const [selfEditForm, setSelfEditForm] = useState({
    mobileNumber: activeStudent.mobileNumber,
    address: activeStudent.address,
    category: activeStudent.category || 'General',
    gender: activeStudent.gender || 'Female',
    careerGoal: activeStudent.careerGoal || 'Full-Stack Developer / Junior Engineer',
  });

  const openSelfEditModal = () => {
    setSelfEditForm({
      mobileNumber: activeStudent.mobileNumber,
      address: activeStudent.address,
      category: activeStudent.category || 'General',
      gender: activeStudent.gender || 'Female',
      careerGoal: activeStudent.careerGoal || 'Full-Stack Developer / Junior Engineer',
    });
    setIsSelfEditModalOpen(true);
  };

  const handleSelfUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent({
      ...activeStudent,
      mobileNumber: selfEditForm.mobileNumber,
      address: selfEditForm.address,
      category: selfEditForm.category as any,
      gender: selfEditForm.gender as any,
      careerGoal: selfEditForm.careerGoal,
    });
    setIsSelfEditModalOpen(false);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch (_) {}
  };

  // AI Career Guidance Handler
  const handleAskAiMentor = async (queryOverride?: string) => {
    const questionToAsk = queryOverride || aiQuery || 'How can I get a high-paying job or clear govt JE exam?';
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const semPcts = activeStudent.semesters.map(s => s.percentage);
      const res = await fetch('/api/ai-career-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: activeStudent.aadharName,
          branch: activeStudent.branch,
          currentYear: activeStudent.currentYear,
          cgpa: activeStudent.secondYearCGPA || activeStudent.firstYearCGPA || 8.0,
          semesterPercentages: semPcts,
          category: activeStudent.category || 'General',
          careerGoal: activeStudent.careerGoal || 'Job & Career Growth',
          userQuery: questionToAsk,
        }),
      });
      const data = await res.json();
      if (data.mentorAdvice) {
        setAiResponse(data.mentorAdvice);
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      } else {
        setAiResponse('Unable to generate advice right now. Please try again.');
      }
    } catch {
      setAiResponse('Network error: Unable to load the career plan.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Resume Upload Handler
  const handleResumeFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = resumeFileInput.trim() || `${activeStudent.aadharName.replace(/\s+/g, '_')}_Resume_2026.pdf`;
    uploadStudentResume(activeStudent.id, finalName);
    setIsResumeModalOpen(false);
    setResumeFileInput('');
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch (_) {}
  };

  // Add / Edit Form State
  const [form, setForm] = useState({
    aadharName: '',
    mobileNumber: '',
    ubterRollNumber: '',
    tenthPercentage: 65.0,
    twelfthPercentage: 68.0,
    firstYearCGPA: 8.0,
    secondYearCGPA: 8.5,
    firstYearPercentage: 75.0,
    secondYearPercentage: 80.0,
    address: '',
    motherName: '',
    fatherName: '',
    aadharNumber: '',
    branch: 'Computer Science & Engineering' as Branch,
    currentYear: '3rd Year' as AcademicYear,
    currentSemester: 5,
    batchYear: 2025,
    section: 'CSE-3A',
    status: 'Active / Verified' as StudentStatus,
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setForm({
      aadharName: '',
      mobileNumber: '',
      ubterRollNumber: '',
      tenthPercentage: 65.0,
      twelfthPercentage: 68.0,
      firstYearCGPA: 8.0,
      secondYearCGPA: 8.5,
      firstYearPercentage: 75.0,
      secondYearPercentage: 80.0,
      address: '',
      motherName: '',
      fatherName: '',
      aadharNumber: '',
      branch: 'Computer Science & Engineering',
      currentYear: '3rd Year',
      currentSemester: 5,
      batchYear: 2025,
      section: 'CSE-3A',
      status: 'Active / Verified',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (s: StudentProfile) => {
    setEditingStudent(s);
    setForm({
      aadharName: s.aadharName,
      mobileNumber: s.mobileNumber,
      ubterRollNumber: s.ubterRollNumber,
      tenthPercentage: s.tenthPercentage,
      twelfthPercentage: s.twelfthPercentage,
      firstYearCGPA: s.firstYearCGPA,
      secondYearCGPA: s.secondYearCGPA,
      firstYearPercentage: s.firstYearPercentage,
      secondYearPercentage: s.secondYearPercentage,
      address: s.address,
      motherName: s.motherName,
      fatherName: s.fatherName,
      aadharNumber: s.aadharNumber,
      branch: s.branch,
      currentYear: s.currentYear,
      currentSemester: s.currentSemester,
      batchYear: s.batchYear,
      section: s.section,
      status: s.status,
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.aadharName.trim() || !form.mobileNumber.trim() || !form.ubterRollNumber.trim()) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...form,
      });
    } else {
      addStudent({
        ...form,
        semesters: [
          { semNumber: 1, semName: '1st Semester', percentage: 72.0, subjects: [] },
          { semNumber: 2, semName: '2nd Semester', percentage: 76.0, subjects: [] },
          { semNumber: 3, semName: '3rd Semester', percentage: 80.0, subjects: [] },
          { semNumber: 4, semName: '4th Semester', percentage: 82.0, subjects: [] },
        ],
        avatarUrl: '',
        attendancePercentage: 88.0,
      });
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (_) {}
    }

    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Year Cohort Switcher */}
      <div className="p-6 rounded-3xl bg-emerald-950 text-white border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                STUDENT PROFILE
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                UBTER {activeStudent.ubterRollNumber} | {activeStudent.aadharName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'विद्यार्थी व्यक्तिगत डैशबोर्ड एवं शैक्षणिक प्रोफाइल' : 'Student Profile'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeStudent.branch} · {activeStudent.currentYear} · Semester {activeStudent.currentSemester} · Batch {activeStudent.batchYear}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {loggedInRole !== 'student' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ नया विद्यार्थी जोड़ें' : '+ Add New Student'}</span>
            </button>
            )}
            {onOpenExcelExport && loggedInRole !== 'student' && (
              <button
                onClick={onOpenExcelExport}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hi' ? 'क्लास एक्सेल शीट' : 'Class Excel Sheets'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Year Tabs (staff only – a student sees only their own class) */}
        {loggedInRole !== 'student' && (
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold scrollbar-none">
          {(['3rd Year', '2nd Year', '1st Year', 'All'] as const).map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                selectedYear === yr
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {yr === '3rd Year'
                  ? '3rd Year (Final Year)'
                  : yr === '2nd Year'
                  ? '2nd Year Cohort'
                  : yr === '1st Year'
                  ? '1st Year Foundations'
                  : 'All Enrolled Students'}
              </span>
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Student switcher (staff only) */}
      {loggedInRole !== 'student' && (
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'hi' ? 'सत्यापित छात्र प्रोफाइल चुनें:' : 'Select Verified Student:'}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={activeStudent.id}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 max-w-[320px]"
            >
              {filteredStudents.map(stu => (
                <option key={stu.id} value={stu.id}>
                  {stu.aadharName} – {stu.ubterRollNumber} ({stu.branch.startsWith('Civil') ? 'Civil' : 'CSE'}, {stu.currentYear})
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>
      )}

      {/* Class roster for the selected year (staff only) */}
      {loggedInRole !== 'student' && (
        <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
            {selectedYear === 'All' ? 'All students' : `${selectedYear} students`} ({filteredStudents.length})
          </h3>
          <ExportButtons dataset="students" label="Download:" params={{ year: selectedYear }} />
          <ShowEntries pg={rosterPg} label="students" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 text-left">
                <tr>
                  <th className="py-2 pr-3">#</th>
                  <th className="pr-3">Name</th>
                  <th className="pr-3">Roll No.</th>
                  <th className="pr-3">Branch</th>
                  <th className="pr-3">Year / Sem</th>
                  <th className="pr-3">Latest sem %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rosterPg.pageItems.map((stu, i) => {
                  const last = stu.semesters[stu.semesters.length - 1];
                  return (
                    <tr
                      key={stu.id}
                      onClick={() => setSelectedStudentId(stu.id)}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${stu.id === activeStudent.id ? 'bg-cyan-50 dark:bg-cyan-950/30' : ''}`}
                    >
                      <td className="py-2 pr-3 text-slate-400">{rosterPg.offset + i + 1}</td>
                      <td className="pr-3 font-semibold text-slate-900 dark:text-white">{stu.aadharName}</td>
                      <td className="pr-3 font-mono text-xs">{stu.ubterRollNumber}</td>
                      <td className="pr-3">{stu.branch.startsWith('Civil') ? 'Civil' : 'CSE'}</td>
                      <td className="pr-3">{stu.currentYear} · Sem {stu.currentSemester}</td>
                      <td className="pr-3">{last ? `${last.percentage}%` : '—'}</td>
                      <td className="text-xs">{stu.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager pg={rosterPg} />
        </section>
      )}

      {loggedInRole !== 'student' && <StudentPasswordCard studentId={activeStudent.id} studentName={activeStudent.aadharName} />}

      {/* Active Student Detailed Inspection Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Top Header Row with Actions & Photo */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            {/* Student Photo with Upload/Change Button */}
            <div className="relative group shrink-0">
              {activeStudent.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeStudent.avatarUrl}
                  alt={activeStudent.aadharName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {activeStudent.aadharName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <label
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer transition-transform group-hover:scale-110"
                title="Upload Photo from Device"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, activeStudent.id)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {activeStudent.status}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Batch {activeStudent.batchYear} • {activeStudent.section}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeStudent.aadharName}
              </h2>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3">
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  UBTER Roll No: <strong>{activeStudent.ubterRollNumber}</strong>
                </span>
                <span>•</span>
                <span className="text-slate-700 dark:text-slate-200">
                  {activeStudent.branch} ({activeStudent.currentYear})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Print Card, Update Details, Career Mentor, Resume, Edit, Delete) */}
          <ExportButtons dataset="my-report" label="Marks report:" params={{ roll: activeStudent.ubterRollNumber }} />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAiMentorModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'करियर मेंटर' : 'AI Career Mentor'}</span>
            </button>

            <button
              onClick={openSelfEditModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'अपडेट योर डेटा' : 'Update Your Details'}</span>
            </button>

            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-teal-200 dark:border-teal-800"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'रिज्यूमे अपलोड' : 'Upload Resume'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'hi' ? 'प्रिंट कार्ड' : 'Print Card'}</span>
            </button>

            {loggedInRole === 'admin' && (
            <button
              onClick={() => openEditModal(activeStudent)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'एडिट' : 'Edit'}</span>
            </button>
            )}

            {loggedInRole === 'admin' && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete record for ${activeStudent.aadharName}?`)) {
                    deleteStudent(activeStudent.id);
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Official Portals & Direct External Links Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          {/* Link 1: Sarkari Result */}
          <a
            href="https://ssc.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                
              </div>
              <div>
                <strong className="block text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Sarkari Result (Govt Jobs)
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  ssc.gov.in
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
          </a>

          {/* Link 2: UBTER Student Result Login */}
          <a
            href="https://ubterex.in/student_login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                
              </div>
              <div>
                <strong className="block text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  UBTER Student Portal & Results
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  ubterex.in/student_login
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
          </a>

          {/* Link 3: Resume Status Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                
              </div>
              <div className="min-w-0">
                <strong className="block text-xs font-black text-slate-900 dark:text-white truncate">
                  {activeStudent.resumeFileName || 'Resume Attached (PDF)'}
                </strong>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Verified for Placements
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold cursor-pointer shrink-0"
            >
              Manage
            </button>
          </div>
        </div>

        {/* 14 Standard User Data Points in Rich Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* 1. Aadhar Card Name */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1. Aadhar Card Name
            </span>
            <p className="font-black text-slate-900 dark:text-white text-sm">
              {activeStudent.aadharName}
            </p>
          </div>

          {/* 2. Mobile Number */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              2. Mobile Number
            </span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <Phone className="w-4 h-4" />
              <span>{activeStudent.mobileNumber}</span>
            </div>
          </div>

          {/* 3. UBTER Roll Number */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              3. UBTER Roll Number
            </span>
            <p className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
              {activeStudent.ubterRollNumber}
            </p>
          </div>

          {/* 4. 10th % */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              4. 10th Percentage (%)
            </span>
            <p className="font-mono font-black text-slate-900 dark:text-white text-base">
              {activeStudent.tenthPercentage}%
            </p>
          </div>

          {/* 5. 12th % */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              5. 12th Percentage (%)
            </span>
            <p className="font-mono font-black text-slate-900 dark:text-white text-base">
              {activeStudent.twelfthPercentage}%
            </p>
          </div>

          {/* 6. 1st Year % / CGPA */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              6. 1st Year % / CGPA
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                {activeStudent.firstYearCGPA} CGPA
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({activeStudent.firstYearPercentage}%)
              </span>
            </div>
          </div>

          {/* 7. 2nd Year % / CGPA */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              7. 2nd Year % / CGPA
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                {activeStudent.secondYearCGPA} CGPA
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({activeStudent.secondYearPercentage}%)
              </span>
            </div>
          </div>

          {/* 9. Poora Address */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              9. Poora Address (Permanent Residential)
            </span>
            <div className="flex items-start gap-1.5 text-slate-800 dark:text-slate-200 font-medium">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{activeStudent.address}</span>
            </div>
          </div>

          {/* 10. Mother Name */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              10. Mother Name
            </span>
            <p className="font-bold text-slate-900 dark:text-white">
              {activeStudent.motherName}
            </p>
          </div>

          {/* 11. Father Name */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              11. Father Name
            </span>
            <p className="font-bold text-slate-900 dark:text-white">
              {activeStudent.fatherName}
            </p>
          </div>

          {/* 12. Aadhar Card Number (AES-256 Encrypted + GDPR Masking) */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                12. Aadhar Card Number
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300">
                AES-256 GDPR
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                {showFullAadhar ? activeStudent.aadharNumber : activeStudent.aadharMasked}
              </span>
              <button
                type="button"
                onClick={() => setShowFullAadhar(!showFullAadhar)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                title={showFullAadhar ? 'Mask Aadhar' : 'Reveal Aadhar'}
              >
                {showFullAadhar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Cipher: {activeStudent.aadharEncrypted.slice(0, 22)}...
            </p>
          </div>

          {/* 13. Caste / Category */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              13. Caste / Category (Reservation Class)
            </span>
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-sm">
              <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-mono text-xs">
                {activeStudent.category || 'General'}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                ({activeStudent.category === 'General' ? 'Open Merit' : 'State Reserved'})
              </span>
            </div>
          </div>

          {/* 14. Gender */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 space-y-1">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
              14. Gender
            </span>
            <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-200 text-sm">
              <span className="px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-mono text-xs">
                {activeStudent.gender || (activeStudent.aadharName.includes('Diya') || activeStudent.aadharName.includes('Pooja') ? 'Female' : 'Male')}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {activeStudent.gender === 'Female' ? 'Girl Candidate (State Quota)' : 'Candidate'}
              </span>
            </div>
          </div>
        </div>

        {/* 8. Har Semester ka % (1st se 4th Sem tak) in High-Impact Visual Cards */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>8. Har Semester ka % (1st se 4th Sem tak UBTER Scorecard)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Cumulative CGPA: {activeStudent.secondYearCGPA}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activeStudent.semesters.map(sem => {
              const semColors = [
                'bg-blue-600 ',
                'bg-teal-600 ',
                'bg-amber-500 ',
                'bg-purple-600 ',
              ];
              const bgGrad = semColors[(sem.semNumber - 1) % semColors.length];
              return (
                <div
                  key={sem.semNumber}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {sem.semName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sem #{sem.semNumber}
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {sem.percentage}%
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      style={{ width: `${sem.percentage}%` }}
                      className={`h-full ${bgGrad} rounded-full`}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>Pass with Honors</span>
                    <span>UBTER Marks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Subject Marks & Subject-Level RBAC Indicator */}
        {activeStudent.semesters.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center justify-between">
              <span>Subject-Wise Marks Ledger (Faculty RBAC Enforced)</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Faculty can only edit their assigned subject
              </span>
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-3">Subject Code & Name</th>
                    <th className="py-2.5 px-3">Faculty In-Charge</th>
                    <th className="py-2.5 px-3">Max Marks</th>
                    <th className="py-2.5 px-3">Obtained Marks</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(activeStudent.semesters[2]?.subjects || []).map(sub => (
                    <tr key={sub.subjectCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">{sub.subjectCode}</span> - {sub.subjectName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {sub.facultyInCharge}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{sub.maxMarks}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {sub.obtainedMarks}
                      </td>
                      <td className="py-2.5 px-3 font-bold">{sub.grade}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-400">
                        Encrypted
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>{editingStudent ? 'Edit Student Record' : 'Add New Student Record'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aadhar Card Name *</label>
                  <input
                    type="text"
                    required
                    value={form.aadharName}
                    onChange={(e) => setForm({ ...form, aadharName: e.target.value })}
                    placeholder="e.g. Anurag Mourya"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                    placeholder="e.g. 9068768351"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">UBTER Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={form.ubterRollNumber}
                    onChange={(e) => setForm({ ...form, ubterRollNumber: e.target.value })}
                    placeholder="e.g. 24090050007"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value as Branch })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <select
                    value={form.currentYear}
                    onChange={(e) => setForm({ ...form, currentYear: e.target.value as AcademicYear })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year (Final Year)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">10th %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.tenthPercentage}
                    onChange={(e) => setForm({ ...form, tenthPercentage: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">12th %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.twelfthPercentage}
                    onChange={(e) => setForm({ ...form, twelfthPercentage: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">1st Year CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.firstYearCGPA}
                    onChange={(e) => setForm({ ...form, firstYearCGPA: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">2nd Year CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.secondYearCGPA}
                    onChange={(e) => setForm({ ...form, secondYearCGPA: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Father Name</label>
                  <input
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    placeholder="e.g. Om Prakash"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    placeholder="e.g. Sushila Devi"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Bhindara, Majhola, Pilibhit, Uttar Pradesh"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aadhar Card Number (12 Digits)
                  </label>
                  <input
                    type="text"
                    value={form.aadharNumber}
                    onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })}
                    placeholder="e.g. 4829 3819 0184"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as StudentStatus })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Active / Verified">Active / Verified</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Under Academic Review">Under Academic Review</option>
                    <option value="Placed">Placed</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. STUDENT SELF-SERVICE MODAL ("Update Your Details") */}
      {isSelfEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Update Your Details
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeStudent.aadharName} (UBTER: {activeStudent.ubterRollNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSelfEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSelfUpdateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={selfEditForm.mobileNumber}
                  onChange={(e) => setSelfEditForm({ ...selfEditForm, mobileNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Caste / Category *
                  </label>
                  <select
                    value={selfEditForm.category}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={selfEditForm.gender}
                    onChange={(e) => setSelfEditForm({ ...selfEditForm, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Poora Address (Permanent Residential) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={selfEditForm.address}
                  onChange={(e) => setSelfEditForm({ ...selfEditForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Career Goal & Target Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, UKPSC Junior Engineer, B.Tech LEET"
                  value={selfEditForm.careerGoal}
                  onChange={(e) => setSelfEditForm({ ...selfEditForm, careerGoal: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSelfEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Profile Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RESUME UPLOAD & MANAGEMENT MODAL */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Placement Resume Upload
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Candidate: {activeStudent.aadharName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResumeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <FileText className="w-4 h-4" />
                <span>Currently Attached Resume:</span>
              </div>
              <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold truncate">
                {activeStudent.resumeFileName || 'Anurag_Mourya_Resume_2026.pdf'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Last updated: {activeStudent.resumeUploadedAt || '2026-10-01'} • Available for 24+ Recruiters
              </div>
            </div>

            <form onSubmit={handleResumeFileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Replacement Resume (PDF / DOCX)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diya_Adhikari_Updated_CV_2026.pdf"
                  value={resumeFileInput}
                  onChange={(e) => setResumeFileInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Upload your ATS-compliant resume with contact info and project links.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    const dummyPdf = `data:text/plain;charset=utf-8,${encodeURIComponent(
                      `RESUME\nName: ${activeStudent.aadharName}\nRoll: ${activeStudent.ubterRollNumber}\nBranch: ${activeStudent.branch}\n10th: ${activeStudent.tenthPercentage}%\n12th: ${activeStudent.twelfthPercentage}%\n1st Yr CGPA: ${activeStudent.firstYearCGPA}\n2nd Yr CGPA: ${activeStudent.secondYearCGPA}\nAddress: ${activeStudent.address}`
                    )}`;
                    const a = document.createElement('a');
                    a.href = dummyPdf;
                    a.download = activeStudent.resumeFileName || `${activeStudent.aadharName}_Resume.txt`;
                    a.click();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Current</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsResumeModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload & Save</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. AI CAREER & PLACEMENT MENTOR MODAL */}
      {isAiMentorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-1.5">
                    <span>Career Mentor</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Personalized career roadmaps for {activeStudent.aadharName} ({activeStudent.branch}, {activeStudent.secondYearCGPA} CGPA)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiMentorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Career Topic Prompts */}
            <div className="space-y-1.5 shrink-0 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Career Question Buttons (Click for Instant Advice):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: '6-10 LPA Tech Placement Plan',
                    query: `How can a 3rd year ${activeStudent.branch} polytechnic student get a 6-10 LPA software/engineering job?`,
                  },
                  {
                    label: 'UKPSC / SSC JE Sarkari Guide',
                    query: `What is the complete exam strategy for UKPSC JE and SSC JE from Uttarakhand Polytechnic?`,
                  },
                  {
                    label: 'B.Tech Lateral Entry Roadmap',
                    query: `Should I do B.Tech Lateral Entry (direct 2nd year) or take a job? Which colleges in Uttarakhand?`,
                  },
                  {
                    label: 'Resume & High-Value Skills',
                    query: `Review what skills and project bullet points I should add to my diploma resume right now.`,
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiQuery(item.query);
                      handleAskAiMentor(item.query);
                    }}
                    disabled={isAiLoading}
                    className="px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[11px] font-bold border border-violet-200 dark:border-violet-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advice Result Box / Scrollable Chat */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-3 font-sans leading-relaxed">
              {isAiLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                  <p className="font-bold text-xs text-violet-600 dark:text-violet-400 animate-pulse">
                    Preparing your career plan.
                  </p>
                </div>
              ) : aiResponse ? (
                <div className="space-y-2 whitespace-pre-line text-slate-800 dark:text-slate-200">
                  {aiResponse}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Bot className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-medium text-xs">
                    Choose a quick career topic above or type your dream job aspiration below!
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tailored specifically for Polytechnic Diploma students in Uttarakhand.
                  </p>
                </div>
              )}
            </div>

            {/* Input & Ask Bar */}
            <div className="shrink-0 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask anything: e.g. 'How to prepare for coding round?', 'Govt jobs after diploma'..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAskAiMentor();
                  }
                }}
                disabled={isAiLoading}
                className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
              />
              <button
                type="button"
                onClick={() => handleAskAiMentor()}
                disabled={isAiLoading || !aiQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Get plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
