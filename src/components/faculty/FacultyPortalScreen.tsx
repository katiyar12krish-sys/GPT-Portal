'use client';

/**
 * Faculty Roster / Subject Marks screen: faculty list, and marks entry limited to each teacher's assigned subjects (RBAC).
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { FacultyLockScreen } from '../auth/FacultyLockScreen';
import { StudentProfile } from '../../lib/types';
import {
  Users,
  Key,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Save,
  BookOpen,
  Edit3,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';

export const FacultyPortalScreen: React.FC = () => {
  const {
    currentUser,
    students,
    primaryStudent,
    updateStudent,
    updateStudentMarks,
    facultyCredentials,
    changeMyPassword,
    language,
  } = useCollege();

  const [activeFacultyTab, setActiveFacultyTab] = useState<'marks_entry' | 'edit_student_record' | 'password_self'>('marks_entry');

  // Selected student for marks entry
  const [targetStudentId, setTargetStudentId] = useState<string>(primaryStudent.id);
  // Year first, then only that year's students are listed (1st / 2nd / 3rd).
  const [yearFilter, setYearFilter] = useState<'1st Year' | '2nd Year' | '3rd Year'>('3rd Year');
  const yearStudents = students.filter(s => s.currentYear === yearFilter);
  const pickYear = (y: '1st Year' | '2nd Year' | '3rd Year') => {
    setYearFilter(y);
    const first = students.find(s => s.currentYear === y);
    if (first) {
      setTargetStudentId(first.id);
      handleSelectStudentForEdit(first.id);
    }
  };
  const YearPicker = (
    <div className="flex flex-wrap gap-2 mb-3">
      {(['1st Year', '2nd Year', '3rd Year'] as const).map(y => (
        <button
          key={y}
          type="button"
          onClick={() => pickYear(y)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
            yearFilter === y ? 'bg-[#13294b] text-[#ffffff] border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
          }`}
        >
          {y} ({students.filter(s => s.currentYear === y).length})
        </button>
      ))}
    </div>
  );
  const [selectedSemNumber, setSelectedSemNumber] = useState<number>(3);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('CSE-302');
  const [newObtainedMarks, setNewObtainedMarks] = useState<number>(92);
  const [marksStatusMsg, setMarksStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // HOD & Faculty: Edit student record state
  const [editStudentId, setEditStudentId] = useState<string>(primaryStudent.id);
  const studentToEdit = students.find(s => s.id === editStudentId) || primaryStudent;
  const [editForm, setEditForm] = useState({
    aadharName: studentToEdit.aadharName,
    mobileNumber: studentToEdit.mobileNumber,
    ubterRollNumber: studentToEdit.ubterRollNumber,
    category: studentToEdit.category || 'General',
    gender: studentToEdit.gender || 'Female',
    tenthPercentage: studentToEdit.tenthPercentage,
    twelfthPercentage: studentToEdit.twelfthPercentage,
    firstYearCGPA: studentToEdit.firstYearCGPA,
    secondYearCGPA: studentToEdit.secondYearCGPA,
    firstYearPercentage: studentToEdit.firstYearPercentage,
    secondYearPercentage: studentToEdit.secondYearPercentage,
    address: studentToEdit.address,
    motherName: studentToEdit.motherName,
    fatherName: studentToEdit.fatherName,
    status: studentToEdit.status,
  });
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  const handleSelectStudentForEdit = (id: string) => {
    setEditStudentId(id);
    const stu = students.find(s => s.id === id) || primaryStudent;
    setEditForm({
      aadharName: stu.aadharName,
      mobileNumber: stu.mobileNumber,
      ubterRollNumber: stu.ubterRollNumber,
      category: stu.category || 'General',
      gender: stu.gender || 'Female',
      tenthPercentage: stu.tenthPercentage,
      twelfthPercentage: stu.twelfthPercentage,
      firstYearCGPA: stu.firstYearCGPA,
      secondYearCGPA: stu.secondYearCGPA,
      firstYearPercentage: stu.firstYearPercentage,
      secondYearPercentage: stu.secondYearPercentage,
      address: stu.address,
      motherName: stu.motherName,
      fatherName: stu.fatherName,
      status: stu.status,
    });
    setEditSuccessMsg(null);
  };

  const handleSaveStudentRecord = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent({
      ...studentToEdit,
      aadharName: editForm.aadharName,
      mobileNumber: editForm.mobileNumber,
      ubterRollNumber: editForm.ubterRollNumber,
      category: editForm.category as any,
      gender: editForm.gender as any,
      tenthPercentage: Number(editForm.tenthPercentage),
      twelfthPercentage: Number(editForm.twelfthPercentage),
      firstYearCGPA: Number(editForm.firstYearCGPA),
      secondYearCGPA: Number(editForm.secondYearCGPA),
      firstYearPercentage: Number(editForm.firstYearPercentage),
      secondYearPercentage: Number(editForm.secondYearPercentage),
      address: editForm.address,
      motherName: editForm.motherName,
      fatherName: editForm.fatherName,
      status: editForm.status,
    });
    setEditSuccessMsg(`StudentRecord for "${editForm.aadharName}" updated successfully by ${currentUser.name}!`);
  };

  // Self password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // If user is not faculty or admin, show secure Lock Screen!
  if (currentUser.role !== 'faculty' && currentUser.role !== 'admin') {
    return (
      <div className="space-y-6">
        <FacultyLockScreen
          onBackToOverview={() => {}}
          onUnlocked={() => {}}
          onOpenForgotSms={() => {}}
        />
      </div>
    );
  }

  const selectedStudent = students.find(s => s.id === targetStudentId) || primaryStudent;
  const currentCred: any = facultyCredentials.find(c => c.facultyId === currentUser.id) || {
    facultyId: currentUser.id,
    facultyName: currentUser.name,
    department: currentUser.department || '',
    mobile: currentUser.mobile,
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    setMarksStatusMsg(null);
    const res = await updateStudentMarks(selectedStudent.id, selectedSemNumber, selectedSubjectCode, Number(newObtainedMarks));
    if (res.success) {
      setMarksStatusMsg({
        type: 'success',
        text: `Marks successfully updated and encrypted for ${selectedSubjectCode} (${selectedStudent.aadharName}).`,
      });
    } else {
      setMarksStatusMsg({
        type: 'error',
        text: res.error || 'Failed to update marks.',
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordStatusMsg({ type: 'error', text: 'Password must be at least 8 characters with letters and numbers.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    const r = await changeMyPassword(currentPasswordInput, newPassword.trim());
    if (!r.success) {
      setPasswordStatusMsg({ type: 'error', text: r.error || 'Could not change password.' });
      return;
    }
    setPasswordStatusMsg({ type: 'success', text: 'Password changed. Other devices were signed out.' });
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-violet-950 text-white border border-violet-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500 text-white">
                FACULTY DEPARTMENTAL CONSOLE
              </span>
              <span className="text-xs text-violet-300 font-mono">
                {currentUser.name} • {currentUser.department}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'फैकल्टी पोर्टल: विषय-वार अंक प्रबंधन (RBAC)' : 'Faculty Portal: Subject-Level Marks Entry (RBAC)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'निदेशालय सुरक्षा नियमों के अनुसार प्रत्येक शिक्षक केवल अपने आवंटित विषय के अंक एडिट/अपडेट कर सकता है। डैशबोर्ड से पासवर्ड रीसेट एवं छात्र शैक्षणिक मूल्यांकन।'
                : 'Role-Based Access Control: Faculty can only update marks for their assigned subjects. Student marks are stored with end-to-end encryption representation.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-violet-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Subjects for {currentUser.name}:</span>
            <div className="font-mono font-bold text-white">
              {currentUser.assignedSubjects?.join(', ') || 'CSE Core Subjects'}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveFacultyTab('marks_entry')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeFacultyTab === 'marks_entry'
                ? 'bg-violet-500 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Subject Marks Entry & RBAC Validation</span>
          </button>
          <button
            onClick={() => setActiveFacultyTab('edit_student_record')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeFacultyTab === 'edit_student_record'
                ? 'bg-indigo-500 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>2. HOD & Faculty: Edit Student Profile</span>
          </button>
          <button
            onClick={() => setActiveFacultyTab('password_self')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeFacultyTab === 'password_self'
                ? 'bg-emerald-500 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>3. Dashboard Password Self-Service</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Marks Entry with RBAC validation */}
      {activeFacultyTab === 'marks_entry' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
              <span>Enter / Update Student Subject Marks</span>
            </h3>
            <p className="text-xs text-slate-500">
              Only subjects mapped to your faculty credentials will be permitted by the RBAC guard.
            </p>
          </div>

          {marksStatusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                marksStatusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
              }`}
            >
              {marksStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{marksStatusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveMarks} className="space-y-4 text-xs">
            {/* Student Select */}
            <div>
              {YearPicker}
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Student Candidate *
              </label>
              <select
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              >
                {yearStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.aadharName} (UBTER Roll: {s.ubterRollNumber}) - {s.currentYear} {s.branch.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
                <select
                  value={selectedSemNumber}
                  onChange={(e) => setSelectedSemNumber(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value={1}>1st Semester</option>
                  <option value={2}>2nd Semester</option>
                  <option value={3}>3rd Semester</option>
                  <option value={4}>4th Semester</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code *</label>
                <select
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="CSE-302">CSE-302 (DBMS RDBMS - Mrs. Anita)</option>
                  <option value="CSE-301">CSE-301 (OOPs C++ - Mrs. Bhawana Bisht)</option>
                  <option value="CSE-304">CSE-304 (Web Technology - Mrs. Anita)</option>
                  <option value="CSE-401">CSE-401 (Computer Networks - Mrs. Bhawana Bisht)</option>
                  <option value="CE-301">CE-301 (Surveying - Mr. Virendra Singh Taragi)</option>
                  <option value="CE-302">CE-302 (Concrete Tech - Mr. Virendra Singh Taragi)</option>
                  <option value="WSP-101">WSP-101 (Workshop - Mr. Ankit Kumar)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Obtained Marks (Out of 100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={newObtainedMarks}
                onChange={(e) => setNewObtainedMarks(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-base"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px] space-y-1">
              <strong>RBAC Permission Check:</strong>
              <p>Your current session is logged in as: <strong>{currentUser.name}</strong>. If you select a subject not assigned to you, the system will block the edit as per Directorate data compliance.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Validate Marks</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: HOD & Faculty: Edit Student Profile */}
      {activeFacultyTab === 'edit_student_record' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <span>HOD & Faculty: Edit Complete Student Record</span>
              </h3>
              <p className="text-xs text-slate-500">
                Update personal, demographic, category, gender, and academic percentages for any student.
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
              HOD / Faculty Authorization
            </span>
          </div>

          {editSuccessMsg && (
            <div className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{editSuccessMsg}</span>
            </div>
          )}

          {/* Select Student Dropdown */}
          <div>
            {YearPicker}
            <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5">
              Select Student to Edit *
            </label>
            <select
              value={editStudentId}
              onChange={(e) => handleSelectStudentForEdit(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
            >
              {yearStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.aadharName} (Roll: {s.ubterRollNumber}) - {s.category || 'General'} | {s.currentYear} {s.branch.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSaveStudentRecord} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Aadhar Card Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.aadharName}
                  onChange={(e) => setEditForm({ ...editForm, aadharName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.mobileNumber}
                  onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. UBTER Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.ubterRollNumber}
                  onChange={(e) => setEditForm({ ...editForm, ubterRollNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  13. Caste / Category *
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
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
                  14. Gender *
                </label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  <option value="Active / Verified">Active / Verified</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Under Academic Review">Under Academic Review</option>
                  <option value="Placed">Placed</option>
                </select>
              </div>
            </div>

            {/* Academic percentages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  4. 10th %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.tenthPercentage}
                  onChange={(e) => setEditForm({ ...editForm, tenthPercentage: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  5. 12th %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.twelfthPercentage}
                  onChange={(e) => setEditForm({ ...editForm, twelfthPercentage: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  6. 1st Yr CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.firstYearCGPA}
                  onChange={(e) => setEditForm({ ...editForm, firstYearCGPA: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  7. 2nd Yr CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.secondYearCGPA}
                  onChange={(e) => setEditForm({ ...editForm, secondYearCGPA: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Address & Parents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  10. Mother Name
                </label>
                <input
                  type="text"
                  value={editForm.motherName}
                  onChange={(e) => setEditForm({ ...editForm, motherName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  11. Father Name
                </label>
                <input
                  type="text"
                  value={editForm.fatherName}
                  onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  9. Poora Address *
                </label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Student Record Updates</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Self-Service Password Reset */}
      {activeFacultyTab === 'password_self' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <span>Change Faculty Password from Dashboard</span>
            </h3>
            <p className="text-xs text-slate-500">
              Update your account password directly. Changes are encrypted using AES-256 and salted bcrypt.
            </p>
          </div>

          {passwordStatusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                passwordStatusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200'
              }`}
            >
              {passwordStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{passwordStatusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div>Faculty: <strong>{currentCred.facultyName}</strong> ({currentCred.department})</div>
              <div>Registered Mobile: <strong>{currentCred.mobile}</strong></div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Min 8 chars, letters + numbers"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save New Password & Transmit SMS</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
