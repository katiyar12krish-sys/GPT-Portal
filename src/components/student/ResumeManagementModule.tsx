'use client';

/**
 * Resume builder: fill sections, preview and download a resume; also shows ATS keywords for the branch.
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { StudentProfile, CareerDocument, ProfessionalProfile } from '../../lib/types';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  Plus,
  Globe,
  Linkedin,
  Github,
  ExternalLink,
  Briefcase,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  Save,
  Check,
  FileCheck,
  Star,
} from 'lucide-react';

interface ResumeManagementModuleProps {
  student?: StudentProfile;
}

export const ResumeManagementModule: React.FC<ResumeManagementModuleProps> = ({ student }) => {
  const {
    students,
    primaryStudent,
    loggedStudent,
    loggedInRole,
    currentUser,
    uploadStudentResume,
    updateProfessionalProfile,
    addCareerDocument,
    deleteCareerDocument,
    setActiveResume,
    language,
  } = useCollege();

  // Target student: logged-in student gets their own, faculty/admin inspects selected student
  const activeStudent = student || (
    loggedInRole === 'student'
      ? (loggedStudent || students.find(s => s.ubterRollNumber === currentUser.rollNumber) || primaryStudent)
      : primaryStudent
  );

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New Document Upload State
  const [docTitle, setDocTitle] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docType, setDocType] = useState<CareerDocument['docType']>('Resume');
  const [docVersion, setDocVersion] = useState('v2.3');
  const [setAsActive, setSetAsActive] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Professional Profile Form State
  const defaultProf = activeStudent.professionalProfile || {
    headline: 'Polytechnic Diploma Scholar • Full Stack Web Developer & Aspiring Junior Engineer',
    bio: 'Dedicated 3rd Year student with strong analytical skills in engineering disciplines. Aiming for Tier-1 campus placement and state government engineering opportunities.',
    linkedInUrl: 'https://linkedin.com/in/student-gpt',
    gitHubUrl: 'https://github.com/student-gpt',
    portfolioUrl: 'https://student-portfolio.uk.gov.in',
    targetRoles: ['Junior Engineer', 'Full-Stack Developer', 'Technical Assistant'],
  };

  const [profForm, setProfForm] = useState<ProfessionalProfile>(defaultProf);
  const [targetRoleInput, setTargetRoleInput] = useState('');

  const documents = activeStudent.resumeHistory || [
    {
      id: 'doc-def-1',
      fileName: activeStudent.resumeFileName || `${activeStudent.aadharName.replace(/\s+/g, '_')}_Resume_2026.pdf`,
      title: 'Current Active Placement Resume (ATS Standard)',
      fileSize: '320 KB',
      uploadedAt: activeStudent.resumeUploadedAt || '2026-10-01',
      isActive: true,
      docType: 'Resume' as const,
      version: 'v2.0',
    },
    {
      id: 'doc-def-2',
      fileName: `${activeStudent.aadharName.replace(/\s+/g, '_')}_Academic_Record.pdf`,
      title: 'Semester 1-4 Marksheets & Academic Dossier',
      fileSize: '410 KB',
      uploadedAt: '2025-11-15',
      isActive: false,
      docType: 'Diploma Certificate' as const,
      version: 'v1.0',
    },
  ];

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileName.trim()) return;

    addCareerDocument(activeStudent.id, {
      title: docTitle.trim(),
      fileName: docFileName.trim().endsWith('.pdf') ? docFileName.trim() : `${docFileName.trim()}.pdf`,
      docType,
      fileSize: `${Math.floor(Math.random() * 250 + 150)} KB`,
      version: docVersion.trim() || 'v2.0',
      isActive: setAsActive,
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
      setDocTitle('');
      setDocFileName('');
    }, 1200);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfessionalProfile(activeStudent.id, profForm);
    setIsProfileModalOpen(false);
  };

  const handleAddTargetRole = () => {
    if (!targetRoleInput.trim()) return;
    if (!profForm.targetRoles.includes(targetRoleInput.trim())) {
      setProfForm({
        ...profForm,
        targetRoles: [...profForm.targetRoles, targetRoleInput.trim()],
      });
    }
    setTargetRoleInput('');
  };

  const handleRemoveTargetRole = (role: string) => {
    setProfForm({
      ...profForm,
      targetRoles: profForm.targetRoles.filter(r => r !== role),
    });
  };

  const handleDownloadDoc = (doc: CareerDocument) => {
    const dummyContent = `UTTARAKHAND TECHNICAL EDUCATION - VERIFIED STUDENT DOCUMENT\n\nDocument: ${doc.title}\nCandidate: ${activeStudent.aadharName}\nRoll: ${activeStudent.ubterRollNumber}\nBranch: ${activeStudent.branch}\nYear: ${activeStudent.currentYear}\nVersion: ${doc.version}\nUploaded Date: ${doc.uploadedAt}\n\nAcademic Standing: Aggregate CGPA ${activeStudent.secondYearCGPA} (Honors)\nInstitution: Uttarakhand Government Institute of Polytechnic, Tanakpur (Code: 090)`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Module Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950">
                CAREER DOCUMENTS & RESUME HUB
              </span>
              <span className="text-xs text-teal-300 font-mono">
                Candidate: {activeStudent.aadharName} (Roll: {activeStudent.ubterRollNumber})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {language === 'hi'
                ? 'रिज्यूमे प्रबंधन एवं करियर दस्तावेज लेजर'
                : 'Resume Management & Career Documents Hub'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'छात्र अपने बहु-संस्करण रिज्यूमे, कवर लेटर एवं तकनीकी दस्तावेज अपलोड कर सकते हैं, प्रोफेशनल प्रोफाइल अपडेट कर सकते हैं एवं संपूर्ण करियर इतिहास सुरक्षित रख सकते हैं।'
                : 'Upload multi-version resumes, manage official ATS documents, update your professional bio, and maintain an audit history of verified credentials.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Professional Bio'}</span>
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया दस्तावेज अपलोड' : 'Upload New Document'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Professional Profile Showcase Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              PUBLIC PROFESSIONAL DOSSIER
            </span>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              {defaultProf.headline || 'Diploma Engineering Scholar'}
            </h3>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Details</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
          {defaultProf.bio || 'Polytechnic student striving for technical excellence.'}
        </p>

        {/* Target Roles & External Professional Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">Target Career Roles:</span>
            <div className="flex flex-wrap gap-1.5">
              {(defaultProf.targetRoles || ['Junior Engineer']).map((role, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold text-[11px] flex items-center gap-1"
                >
                  <Briefcase className="w-3 h-3 text-teal-500" />
                  <span>{role}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block">Verified Portfolio & Profiles:</span>
            <div className="flex flex-wrap items-center gap-2">
              {defaultProf.linkedInUrl && (
                <a
                  href={defaultProf.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {defaultProf.gitHubUrl && (
                <a
                  href={defaultProf.gitHubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {defaultProf.portfolioUrl && (
                <a
                  href={defaultProf.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Portfolio Site</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Primary Resume Card */}
      <div className="p-5 rounded-3xl bg-teal-50 dark:bg-slate-900 border-2 border-teal-500/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-600 text-white">
                PRIMARY ACTIVE RESUME
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                Visible to 24+ Recruiters
              </span>
            </div>
            <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
              {activeStudent.resumeFileName || 'Resume_2026.pdf'}
            </h4>
            <span className="text-[11px] text-slate-500">
              Uploaded on {activeStudent.resumeUploadedAt || '2026-10-01'} • ATS-Ready PDF
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              const currentActive = documents.find(d => d.isActive) || documents[0];
              if (currentActive) handleDownloadDoc(currentActive);
            }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload New Version</span>
          </button>
        </div>
      </div>

      {/* Career Documents Audit & History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Career Document History & Version Archives</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete archive of submitted resumes, cover letters, and semester diplomas.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold self-start sm:self-auto">
            {documents.length} Documents Saved
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3.5">Document Title & Version</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5">File Name & Size</th>
                <th className="py-3 px-3.5">Uploaded Date</th>
                <th className="py-3 px-3.5">Placement Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                      <div>
                        <span>{doc.title}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                          {doc.version}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {doc.docType}
                    </span>
                  </td>

                  <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-300">
                    <div>{doc.fileName}</div>
                    <span className="text-[10px] text-slate-400">{doc.fileSize}</span>
                  </td>

                  <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                    {doc.uploadedAt}
                  </td>

                  <td className="py-3 px-3.5">
                    {doc.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <Check className="w-3 h-3" />
                        <span>Active Primary</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveResume(activeStudent.id, doc.id)}
                        className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        Set as Active
                      </button>
                    )}
                  </td>

                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title="Download document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCareerDocument(activeStudent.id, doc.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete from archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Upload Career Document / Resume Version
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Student: {activeStudent.aadharName} ({activeStudent.ubterRollNumber})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Document successfully uploaded to Career Ledger!</span>
              </div>
            )}

            <form onSubmit={handleDocumentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Placement Resume v2.4 (React & C++ Projects)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Resume">Resume / CV</option>
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Diploma Certificate">Diploma Certificate</option>
                    <option value="Internship Letter">Internship Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Version Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v2.4"
                    value={docVersion}
                    onChange={(e) => setDocVersion(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anurag_Mourya_Resume_v2_4.pdf"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="setActiveCheck"
                  checked={setAsActive}
                  onChange={(e) => setSetAsActive(e.target.checked)}
                  className="rounded text-teal-600 cursor-pointer"
                />
                <label htmlFor="setActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Set this document as the Active Primary Resume for Recruiters
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Archive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Professional Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Update Professional Profile & Bio
                </h3>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  required
                  value={profForm.headline}
                  onChange={(e) => setProfForm({ ...profForm, headline: e.target.value })}
                  placeholder="e.g. Diploma Engineer • Web Developer & Junior Engineer Aspirant"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Summary / Bio *
                </label>
                <textarea
                  rows={3}
                  required
                  value={profForm.bio}
                  onChange={(e) => setProfForm({ ...profForm, bio: e.target.value })}
                  placeholder="Briefly describe your technical strengths, academic journey, and career objectives..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-normal"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Target Engineering & IT Roles:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    placeholder="e.g. Junior Engineer (Civil), Frontend Developer"
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddTargetRole}
                    className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profForm.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTargetRole(role)}
                        className="text-indigo-400 hover:text-rose-500 cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={profForm.linkedInUrl || ''}
                    onChange={(e) => setProfForm({ ...profForm, linkedInUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub / Code Repository URL
                  </label>
                  <input
                    type="url"
                    value={profForm.gitHubUrl || ''}
                    onChange={(e) => setProfForm({ ...profForm, gitHubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
