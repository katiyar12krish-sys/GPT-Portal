'use client';

/**
 * Class Excel Sheets (staff): builds a class-wise sheet of students and their marks for download.
 */
import { ExportButtons } from '../ui/ExportButtons';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { AcademicYear, Branch, StudentProfile, StudentStatus } from '../../lib/types';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  Layers,
  Table,
  Printer,
  Sparkles,
} from 'lucide-react';

export const ClassExcelGeneratorScreen: React.FC = () => {
  const {
    students,
    getClassStudents,
    addStudent,
    updateStudentStatus,
    deleteStudent,
    language,
  } = useCollege();

  const [selectedClassYear, setSelectedClassYear] = useState<AcademicYear | 'All'>('3rd Year');
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'All'>('Computer Science & Engineering');
  const [selectedBatchYear, setSelectedBatchYear] = useState<number>(2025);
  const [searchQuery, setSearchQuery] = useState('');

  const classStudents = getClassStudents(selectedClassYear, selectedBranch, selectedBatchYear).filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.aadharName.toLowerCase().includes(q) ||
      s.ubterRollNumber.includes(q) ||
      s.mobileNumber.includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  });
  const pg = usePaged(classStudents, 25);


  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-teal-950 text-white border border-teal-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950">
                AUTOMATED CLASS SPREADSHEETS
              </span>
              <span className="text-xs text-teal-300 font-mono">
                Real-Time Excel Ledger Generator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'कक्षा-वार ऑटोमेटेड एक्सेल शीट जनरेटर' : 'Class-Wise Automated Excel Sheet Generator'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'जैसे-जैसे नए बच्चों का डेटा जुड़ता जाएगा, उनकी क्लास, वर्ष और ब्रांच के अनुसार एक्सेल शीट स्वतः अपडेट होती जाएगी। 1-क्लिक में आधिकारिक CSV/Excel डाउनलोड करें।'
                : 'Automated class sheets updated dynamically as new student records are added. Filter by Year, Branch, and Batch, with 1-click official Excel CSV export.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
<div className="flex flex-col gap-2 items-start">
              <ExportButtons dataset="students" label="Student list:" params={{ year: selectedClassYear, branch: selectedBranch, batch: selectedBatchYear, q: searchQuery }} />
              <ExportButtons dataset="marks" label="Subject marks:" params={{ year: selectedClassYear, branch: selectedBranch, batch: selectedBatchYear, q: searchQuery }} />
            </div>
          </div>
        </div>

        {/* Dynamic Class & Cohort Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
          <div>
            <label className="block text-slate-400 font-bold mb-1">Academic Year</label>
            <select
              value={selectedClassYear}
              onChange={(e) => setSelectedClassYear(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
            >
              <option value="3rd Year" className="text-slate-900">3rd Year (Final Year)</option>
              <option value="2nd Year" className="text-slate-900">2nd Year</option>
              <option value="1st Year" className="text-slate-900">1st Year</option>
              <option value="All" className="text-slate-900">All Years Combined</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Branch / Department</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
            >
              <option value="Computer Science & Engineering" className="text-slate-900">Computer Science & Engineering</option>
              <option value="Civil Engineering" className="text-slate-900">Civil Engineering</option>
              <option value="Mechanical Engineering" className="text-slate-900">Mechanical Engineering</option>
              <option value="All" className="text-slate-900">All Branches Combined</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1">Graduation Batch Year</label>
            <select
              value={selectedBatchYear}
              onChange={(e) => setSelectedBatchYear(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold"
            >
              <option value={2025} className="text-slate-900">Batch 2025</option>
              <option value={2026} className="text-slate-900">Batch 2026</option>
              <option value={2027} className="text-slate-900">Batch 2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Filter Bar & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within this sheet by name, roll number, mobile, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Records in Class Sheet:</span>
          <span className="font-mono font-black px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {classStudents.length} Students
          </span>
        </div>
      </div>

      {/* Spreadsheet Table View */}
      <ShowEntries pg={pg} label="students" />
      <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 px-3.5">#</th>
              <th className="py-3 px-3.5">UBTER Roll No</th>
              <th className="py-3 px-3.5">Aadhar Card Name</th>
              <th className="py-3 px-3.5">Category</th>
              <th className="py-3 px-3.5">Gender</th>
              <th className="py-3 px-3.5">Mobile</th>
              <th className="py-3 px-3.5">10th %</th>
              <th className="py-3 px-3.5">12th %</th>
              <th className="py-3 px-3.5">1st Yr CGPA</th>
              <th className="py-3 px-3.5">2nd Yr CGPA</th>
              <th className="py-3 px-3.5">Sem 1 %</th>
              <th className="py-3 px-3.5">Sem 2 %</th>
              <th className="py-3 px-3.5">Sem 3 %</th>
              <th className="py-3 px-3.5">Sem 4 %</th>
              <th className="py-3 px-3.5">Father Name</th>
              <th className="py-3 px-3.5">Mother Name</th>
              <th className="py-3 px-3.5">Address</th>
              <th className="py-3 px-3.5">Aadhar (GDPR Masked)</th>
              <th className="py-3 px-3.5">Attendance</th>
              <th className="py-3 px-3.5 text-right">Status Track</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {pg.pageItems.map((s, idx) => {
              const sem1 = s.semesters.find(x => x.semNumber === 1)?.percentage || '-';
              const sem2 = s.semesters.find(x => x.semNumber === 2)?.percentage || '-';
              const sem3 = s.semesters.find(x => x.semNumber === 3)?.percentage || '-';
              const sem4 = s.semesters.find(x => x.semNumber === 4)?.percentage || '-';

              return (
                <tr key={s.id} className="hover:bg-teal-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3.5 font-mono text-slate-400">{pg.offset + idx + 1}</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {s.ubterRollNumber}
                  </td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                    {s.aadharName}
                    {s.ubterRollNumber === '24090050007' && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                        Primary
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {s.category || 'General'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 font-medium">
                    {s.gender || 'Not Specified'}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono">{s.mobileNumber}</td>
                  <td className="py-2.5 px-3.5 font-mono">{s.tenthPercentage}%</td>
                  <td className="py-2.5 px-3.5 font-mono">{s.twelfthPercentage}%</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-600">{s.firstYearCGPA}</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-600">{s.secondYearCGPA}</td>
                  <td className="py-2.5 px-3.5 font-mono text-blue-600">{sem1}%</td>
                  <td className="py-2.5 px-3.5 font-mono text-blue-600">{sem2}%</td>
                  <td className="py-2.5 px-3.5 font-mono text-blue-600">{sem3}%</td>
                  <td className="py-2.5 px-3.5 font-mono text-blue-600">{sem4}%</td>
                  <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{s.fatherName}</td>
                  <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{s.motherName}</td>
                  <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={s.address}>
                    {s.address}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-500">{s.aadharMasked}</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-teal-600">{s.attendancePercentage}%</td>
                  <td className="py-2.5 px-3.5 text-right">
                    <select
                      value={s.status}
                      onChange={(e) => updateStudentStatus(s.id, e.target.value as StudentStatus)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Active / Verified">Active / Verified</option>
                      <option value="Enrolled">Enrolled</option>
                      <option value="Documents Pending">Documents Pending</option>
                      <option value="Placed">Placed</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-3 pb-3"><Pager pg={pg} /></div>

        {classStudents.length === 0 && (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 dark:text-slate-300">
              No students found for {selectedClassYear} - {selectedBranch}.
            </p>
            <p className="text-xs">
              Students added in the Student Portfolio will automatically appear in this class sheet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
