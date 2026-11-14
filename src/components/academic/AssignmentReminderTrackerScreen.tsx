'use client';

/**
 * Assignments & Reminders screen: deadlines per branch/year, submission status and the 3-reminder alert system (/api/assignments).
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { AssignmentRecord, AcademicYear, Branch } from '../../lib/types';
import {
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Send,
  Plus,
  FileText,
  Award,
  Sparkles,
  X,
  AlertCircle,
  Volume2,
} from 'lucide-react';

export const AssignmentReminderTrackerScreen: React.FC = () => {
  const {
    assignments,
    addAssignment,
    submitAssignment,
    triggerManualReminder,
    currentUser,
    language,
    primaryStudent,
  } = useCollege();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submissionModalAsg, setSubmissionModalAsg] = useState<AssignmentRecord | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  // Create Assignment Form
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('CSE-302');
  const [newSubjectName, setNewSubjectName] = useState('Database Management Systems');
  const [newBranch, setNewBranch] = useState<Branch>('Computer Science & Engineering');
  const [newTargetYear, setNewTargetYear] = useState<AcademicYear>('3rd Year');
  const [newDeadline, setNewDeadline] = useState('2026-03-15T23:59:59');
  const [newTotalMarks, setNewTotalMarks] = useState(25);
  const [newDescription, setNewDescription] = useState('');

  const [currentTime] = useState(() => Date.now());
  const isFacultyOrAdmin = currentUser.role === 'admin' || currentUser.role === 'faculty';

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    addAssignment({
      title: newTitle.trim(),
      subjectCode: newSubjectCode,
      subjectName: newSubjectName,
      facultyName: currentUser.name,
      branch: newBranch,
      targetYear: newTargetYear,
      assignedDate: new Date().toISOString().slice(0, 10),
      deadlineDate: newDeadline,
      totalMarks: newTotalMarks,
      description: newDescription.trim(),
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleOpenSubmission = (asg: AssignmentRecord) => {
    setSubmissionModalAsg(asg);
    setSubmissionText('');
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionModalAsg || !submissionText.trim()) return;
    submitAssignment(submissionModalAsg.id, currentUser.id, submissionText.trim());
    setSubmissionModalAsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-rose-950 text-white border border-rose-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1">
                <Bell className="w-3 h-3" />
                <span>3-REMINDER DEADLINE TRACKER</span>
              </span>
              <span className="text-xs text-rose-300 font-mono">
                Private Student Alerts & Automated Grading
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'असाइनमेंट 3-रिमाइंडर ट्रैकर एवं ऑटो-ग्रेडिंग' : 'Assignment 3-Reminder Tracker & Auto-Grading'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'यदि विद्यार्थी असाइनमेंट सबमिट नहीं करता है तो दी गई अंतिम तिथि तक 3 रिमाइंडर नोटिफिकेशन बजते हैं। नोटिफिकेशन सिर्फ उसी छात्र को दिखेगा। डेडलाइन बीतने पर फैकल्टी को अलर्ट एवं सबमिशन पर ऑटो-ग्रेडिंग होती है।'
                : 'Automated 3-reminder timeline. Private student alerts, deadline expiry warnings to faculty, and instant auto-grading upon submission.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isFacultyOrAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Assignment</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assignments Stream */}
      <div className="space-y-4">
        {assignments.map((asg) => {
          const submission = asg.studentSubmissions.find(s => s.studentId === currentUser.id) || asg.studentSubmissions[0];
          const isSubmitted = submission?.isSubmitted;
          const deadlinePassed = new Date(asg.deadlineDate).getTime() < currentTime;

          return (
            <div
              key={asg.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-4 ${
                !isSubmitted && deadlinePassed
                  ? 'border-rose-400 dark:border-rose-800 shadow-md ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      {asg.subjectCode}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {asg.subjectName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {asg.targetYear} • {asg.branch.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                    {asg.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Assigned by: <strong>{asg.facultyName}</strong> on {asg.assignedDate}
                  </p>
                </div>

                {/* Deadline & Submission Status Badge */}
                <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Deadline: {new Date(asg.deadlineDate).toLocaleString()}</span>
                  </div>

                  {isSubmitted ? (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Submitted ({submission?.obtainedMarks}/{asg.totalMarks} Marks)</span>
                    </span>
                  ) : deadlinePassed ? (
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Deadline Overdue!</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Pending Submission</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {asg.description}
              </p>

              {/* 3-Reminder Progress Bar Component */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span>Automated 3-Reminder Notification Timeline:</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {asg.remindersSentCount} of 3 Reminders Dispatched
                  </span>
                </div>

                {/* 3 Segment Progress Blocks */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  {[1, 2, 3].map((num) => {
                    const isFired = num <= asg.remindersSentCount;
                    return (
                      <div
                        key={num}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isFired
                            ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-[11px]">
                          <Bell className={`w-3 h-3 ${isFired ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
                          <span>Reminder #{num}</span>
                        </div>
                        <span className="text-[10px] font-normal block mt-0.5">
                          {isFired ? 'Dispatched to Student' : 'Scheduled'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Timestamps log */}
                {asg.reminderTimestamps.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-400 space-y-0.5 pt-1">
                    {asg.reminderTimestamps.map((ts, i) => (
                      <div key={i}>• {ts}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Faculty Deadline Expiry Alert Banner (Visible to faculty or when overdue) */}
              {deadlinePassed && !isSubmitted && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <strong className="block">Faculty Alert: Submission Deadline Expired</strong>
                      <span>Student Anurag Mourya (Roll: 24090050007) has not submitted this assignment before cutoff date.</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-rose-600 text-white shrink-0">
                    Faculty Notified
                  </span>
                </div>
              )}

              {/* Auto-Grade Card if already submitted */}
              {isSubmitted && submission && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Automatic Grading & Performance Report:</span>
                    </div>
                    <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                      Score: {submission.obtainedMarks} / {asg.totalMarks} ({submission.autoGradeScore}%)
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {submission.feedback}
                  </p>
                  {submission.submissionUrlOrText && (
                    <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                      Submitted Code / Link: {submission.submissionUrlOrText}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                {isFacultyOrAdmin && (
                  <button
                    onClick={() => triggerManualReminder(asg.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Send Manual Reminder (Bell Notification)</span>
                  </button>
                )}

                {!isSubmitted && (
                  <button
                    onClick={() => handleOpenSubmission(asg)}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Assignment Work</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Submit Assignment Work */}
      {submissionModalAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Submit Assignment Work
                </h3>
                <p className="text-xs text-slate-500">{submissionModalAsg.title}</p>
              </div>
              <button onClick={() => setSubmissionModalAsg(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Submission Code / Solution Text / GitHub or Drive URL *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste your source code, procedure steps, or verified file link..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-[11px] space-y-1">
                <strong>Automatic Grading Enabled:</strong>
                <p>Upon submission, the automated evaluation engine calculates code syntax adherence and marks out of {submissionModalAsg.totalMarks}.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmissionModalAsg(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Auto-Grade</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Assignment (Faculty & Admin) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Issue Assignment to Class
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Slump Cone Test Experiment or SQL Joins Project"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={newTotalMarks}
                    onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value as Branch)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Computer Science & Engineering">Computer Science</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Year</label>
                  <select
                    value={newTargetYear}
                    onChange={(e) => setNewTargetYear(e.target.value as AcademicYear)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="3rd Year">3rd Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="1st Year">1st Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Submission Deadline *</label>
                <input
                  type="datetime-local"
                  required
                  value={newDeadline.slice(0, 16)}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the experiment or assignment prompt..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-md"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
