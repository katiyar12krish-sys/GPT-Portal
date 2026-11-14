'use client';

/**
 * Academic Resource Library screen: notes, question papers and lab files by board, branch, semester and subject.
 * Staff upload and approve; students download. Data: /api/resources + src/lib/data/resourceLibraryData.ts (built-in list).
 */
import { api } from '../../lib/client/api';
import { ExportButtons } from '../ui/ExportButtons';
import { DownloadButton } from '../ui/DownloadButton';
import { subjectsOf } from '../../lib/data/placementQnaBank';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { AcademicResource, ResourceCategory, TechnicalBoard, Branch, AcademicYear } from '../../lib/types';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  FileCode,
  Tag,
  Users,
  Building2,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  X,
  Check,
  AlertCircle,
  FileCheck,
  Info,
} from 'lucide-react';
import { BoardMetadata } from '../../lib/data/resourceLibraryData';

const COMMON_SUBJECT_PRESETS = [
  { code: 'CSE-301', name: 'Object Oriented Programming (OOPs C++)', dept: 'Computer Science & Engineering', sem: 3 },
  { code: 'CSE-302', name: 'Database Management Systems (RDBMS)', dept: 'Computer Science & Engineering', sem: 3 },
  { code: 'CSE-401', name: 'Computer Networks (TCP/IP)', dept: 'Computer Science & Engineering', sem: 4 },
  { code: 'CSE-402', name: 'Java Programming & App Development', dept: 'Computer Science & Engineering', sem: 4 },
  { code: 'CSE-404', name: 'Python Programming Essentials', dept: 'Computer Science & Engineering', sem: 4 },
  { code: 'CSE-501', name: 'Advanced Relational Databases & SQL Optimization', dept: 'Computer Science & Engineering', sem: 5 },
  { code: 'CSE-502', name: 'Software Engineering & Agile Methodologies', dept: 'Computer Science & Engineering', sem: 5 },
  { code: 'CSE-503', name: 'Full Stack Web & Capstone Project', dept: 'Computer Science & Engineering', sem: 5 },
  { code: 'CE-301', name: 'Advanced Surveying & Field Practical', dept: 'Civil Engineering', sem: 3 },
  { code: 'CE-302', name: 'Building Construction & Materials', dept: 'Civil Engineering', sem: 3 },
  { code: 'CE-501', name: 'Design of Steel & RCC Structures (IS:456 / IS:800)', dept: 'Civil Engineering', sem: 5 },
  { code: 'ASH-101', name: 'Applied Mathematics-I', dept: 'General / Applied Sciences', sem: 1 },
  { code: 'ASH-102', name: 'Applied Physics-I', dept: 'General / Applied Sciences', sem: 1 },
  { code: 'ASH-201', name: 'Applied Mathematics-II', dept: 'General / Applied Sciences', sem: 2 },
];

const SUBJECT_FILES = ['CSE Subjects', 'Civil Subjects', 'India GK'].map(category => ({ category, subjects: subjectsOf(category) }));

export const AcademicResourceLibraryScreen: React.FC = () => {
  const {
    currentUser,
    loggedInRole,
    loggedStudent,
    primaryStudent,
    language,
    academicResources,
    technicalBoards,
    reloadAcademicResources,
  } = useCollege();

  // Active student context if student role
  const activeStudent = loggedStudent || primaryStudent;
  const isStudent = loggedInRole === 'student';
  // Library is loaded from the server, so uploads and download counts are always current.
  React.useEffect(() => {
    reloadAcademicResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const isFacultyOrAdmin = loggedInRole === 'faculty' || loggedInRole === 'admin';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>(() => {
    if (isStudent) {
      return activeStudent.branch;
    }
    return 'All';
  });
  const [selectedSemester, setSelectedSemester] = useState<string>(() => {
    if (isStudent) {
      return `Semester ${activeStudent.currentSemester || 5}`;
    }
    return 'All';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'resources' | 'boards_info'>('resources');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<AcademicResource | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Resource Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBoard, setNewBoard] = useState<TechnicalBoard>('UBTER (Uttarakhand Board of Technical Education)');
  const [newDept, setNewDept] = useState<Branch | 'General / Applied Sciences'>('Computer Science & Engineering');
  const [newSemester, setNewSemester] = useState<number>(3);
  const [newSubjectCode, setNewSubjectCode] = useState('CSE-302');
  const [newSubjectName, setNewSubjectName] = useState('Database Management Systems (RDBMS)');
  const [newCategory, setNewCategory] = useState<ResourceCategory>('Lecture Notes');
  const [newUnitModule, setNewUnitModule] = useState('Unit 1: Fundamentals');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newTags, setNewTags] = useState('UBTER, Notes, CSE');

  // Filtered resources pipeline
  const filteredResources = useMemo(() => {
    return academicResources.filter(res => {
      // Board filter
      if (selectedBoard !== 'All' && !res.board.toLowerCase().includes(selectedBoard.toLowerCase())) {
        return false;
      }
      // Department filter
      if (selectedDept !== 'All' && res.department !== selectedDept) {
        return false;
      }
      // Semester filter
      if (selectedSemester !== 'All') {
        const semNum = parseInt(selectedSemester.replace('Semester ', ''), 10);
        if (!isNaN(semNum) && res.semester !== semNum) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== 'All' && res.category !== selectedCategory) {
        return false;
      }
      // Search query (Subject Code, Title, Faculty, Description, Tags)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const codeMatch = res.subjectCode.toLowerCase().includes(query);
        const nameMatch = res.subjectName.toLowerCase().includes(query);
        const titleMatch = res.title.toLowerCase().includes(query);
        const descMatch = res.description.toLowerCase().includes(query);
        const facultyMatch = res.facultyName.toLowerCase().includes(query);
        const tagMatch = res.tags.some(t => t.toLowerCase().includes(query));
        const unitMatch = res.unitModule ? res.unitModule.toLowerCase().includes(query) : false;

        if (!codeMatch && !nameMatch && !titleMatch && !descMatch && !facultyMatch && !tagMatch && !unitMatch) {
          return false;
        }
      }

      return true;
    });
  }, [academicResources, selectedBoard, selectedDept, selectedSemester, selectedCategory, searchQuery]);
  const pg = usePaged(filteredResources, 12);

  // Handle Preset Subject Selection
  const applySubjectPreset = (preset: typeof COMMON_SUBJECT_PRESETS[0]) => {
    setNewSubjectCode(preset.code);
    setNewSubjectName(preset.name);
    setNewDept(preset.dept as any);
    setNewSemester(preset.sem);
  };

  const flash = (text: string) => {
    setDownloadSuccessToast(text);
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  // Real upload: the file goes to the server and is stored with the resource.
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubjectCode.trim()) {
      setErrorMessage('Please provide resource title and subject code.');
      return;
    }
    if (!newFile) {
      setErrorMessage('Please choose the file to upload.');
      return;
    }
    // Vercel accepts smaller requests than a normal server.
    const maxMb = process.env.NEXT_PUBLIC_VERCEL_ENV ? 3 : 8;
    if (newFile.size > maxMb * 1024 * 1024) {
      setErrorMessage(`File is larger than ${maxMb} MB.`);
      return;
    }
    setUploading(true);
    setErrorMessage(null);
    const base64 = await new Promise<string>((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result));
      fr.onerror = () => rej(fr.error);
      fr.readAsDataURL(newFile);
    });
    const r = await api('/api/resources', {
      body: {
        action: 'upload',
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        board: newBoard,
        department: newDept,
        semester: newSemester,
        subjectCode: newSubjectCode.trim(),
        subjectName: newSubjectName.trim(),
        unitModule: newUnitModule.trim() || undefined,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        fileName: newFile.name,
        mimeType: newFile.type,
        base64,
      },
    });
    setUploading(false);
    if (!r.success) {
      setErrorMessage(r.error || 'Upload failed.');
      return;
    }
    await reloadAcademicResources();
    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewFile(null);
    flash(isStudent ? 'Uploaded. It will appear for others after faculty approval.' : 'Resource published to the library.');
  };

  // Real download from the server; the counter is updated there.
  const handleDownload = (resource: AcademicResource) => {
    const a = document.createElement('a');
    a.href = `/api/resources/${resource.id}/file`;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    a.remove();
    flash(`Downloading ${resource.fileName}`);
    setTimeout(reloadAcademicResources, 1500);
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Remove this resource from the library?')) return;
    const r = await api('/api/resources', { body: { action: 'delete', id: resourceId } });
    if (!r.success) return alert(r.error);
    await reloadAcademicResources();
    flash('Resource removed.');
  };

  const handleApprove = async (resourceId: string) => {
    const r = await api('/api/resources', { body: { action: 'approve', id: resourceId } });
    if (!r.success) return alert(r.error);
    await reloadAcademicResources();
    flash('Approved. Students can see it now.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HERO BANNER: Academic Resource Library & Multi-Board Database */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13294b] text-white p-6 sm:p-8 border border-cyan-500/30 shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b] shadow-xs">
                  CENTRAL ACADEMIC REPOSITORY & BOARDS DATABASE
                </span>
                <span className="text-xs text-cyan-300 font-mono">
                  UBTER Roorkee • AICTE • BTEUP • MSBTE
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {language === 'hi'
                  ? 'अकादमिक रिसोर्स लाइब्रेरी एवं तकनीकी बोर्ड डेटाबेस'
                  : 'Academic Resource Library & Boards Database'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'hi'
                  ? 'फैकल्टी द्वारा अपलोड किए गए विषय-वार व्याख्यान नोट्स, आधिकारिक यूबीटीईआर सिलेबस पीडीएफ, पिछले वर्षों के प्रश्न पत्र (PYQ), एवं प्रैक्टिकल लैब मैनुअल का केंद्रीकृत संग्रह।'
                  : 'Centralized repository of verified lecture notes, official syllabus PDFs, previous year papers (PYQs), and laboratory manuals categorized by department, semester, and technical board.'}
              </p>
            </div>

            {/* Quick Action Buttons & Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[120px]">
                <span className="text-[10px] text-cyan-300 uppercase font-black tracking-wider block">
                  Total Resources
                </span>
                <span className="text-3xl font-black font-mono text-cyan-400">
                  {academicResources.length}
                </span>
                <span className="text-[10px] text-slate-300 block">5 Technical Boards</span>
              </div>

              {(
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-gold-300 text-[#13294b] font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isStudent ? 'Upload Notes' : 'Upload Resource'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Technical Boards Switcher & Navigation Tabs */}
          <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('resources')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'resources'
                    ? 'bg-gold-300 text-[#13294b] font-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Resource Library ({filteredResources.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('boards_info')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'boards_info'
                    ? 'bg-gold-300 text-[#13294b] font-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Technical Boards Directory ({technicalBoards.length})</span>
              </button>
            </div>

            {/* Quick Student Auto-Filter Badge */}
            {isStudent && (
              <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] font-mono text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Filtered for: {activeStudent.branch.split(' ')[0]} • Sem {activeStudent.currentSemester}</span>
                <button
                  onClick={() => {
                    setSelectedDept('All');
                    setSelectedSemester('All');
                  }}
                  className="underline hover:text-white cursor-pointer ml-1"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <ExportButtons dataset="resources" label="Download this list:" />
      </div>

      {/* Success Download Toast */}
      {downloadSuccessToast && (
        <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{downloadSuccessToast}</span>
          </div>
          <button onClick={() => setDownloadSuccessToast(null)} className="cursor-pointer text-cyan-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN VIEW TAB 1: RESOURCE REPOSITORY */}
      {activeTab === 'resources' && (
        <div className="space-y-5">
          {/* Subject-wise question files, ready to download */}
          <details open className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <summary className="font-black text-slate-900 dark:text-white text-base cursor-pointer">Subject-wise question files</summary>
            <p className="text-xs text-slate-500 mt-1">Every file has the questions, options and answers. Teachers can add their own notes with Upload.</p>
            {SUBJECT_FILES.map(group => (
              <div key={group.category} className="mt-4">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">{group.category}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.subjects.map(s => {
                    const query = `category=${encodeURIComponent(group.category)}&subject=${encodeURIComponent(s.subject)}`;
                    return (
                      <div key={s.subject} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="flex-1 min-w-0 font-bold text-slate-800 dark:text-slate-100 [overflow-wrap:anywhere]">
                          {s.subject} <span className="text-slate-400 font-semibold">({s.count})</span>
                        </span>
                        <DownloadButton href={`/api/qna/pdf?${query}`} className="shrink-0 font-black text-cyan-700 dark:text-cyan-300 cursor-pointer">
                          PDF
                        </DownloadButton>
                        <DownloadButton href={`/api/export/qna?format=xlsx&${query}`} className="shrink-0 font-black text-cyan-700 dark:text-cyan-300 cursor-pointer">
                          Excel
                        </DownloadButton>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </details>

          {/* 2. SEARCH & ADVANCED FILTERS PANEL */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            {/* Search Bar - Highlight Subject Code Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-cyan-600 dark:text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Subject Code (e.g. CSE-302, CSE-501, ASH-101), Title, Faculty, or Unit..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Board Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Technical Board:
                </label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:border-cyan-500 cursor-pointer text-xs"
                >
                  <option value="All">All Boards (5 Databases)</option>
                  <option value="UBTER">UBTER (Uttarakhand Roorkee)</option>
                  <option value="AICTE">AICTE (National Model)</option>
                  <option value="BTEUP">BTEUP (Uttar Pradesh)</option>
                  <option value="MSBTE">MSBTE (Maharashtra)</option>
                  <option value="HSBTE">HSBTE (Haryana)</option>
                </select>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Department / Branch:
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:border-cyan-500 cursor-pointer text-xs"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="General / Applied Sciences">General / Applied Sciences</option>
                </select>
              </div>

              {/* Semester Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Semester (1 to 6):
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:border-cyan-500 cursor-pointer text-xs"
                >
                  <option value="All">All Semesters (1st-6th)</option>
                  <option value="Semester 1">Semester 1 (1st Year)</option>
                  <option value="Semester 2">Semester 2 (1st Year)</option>
                  <option value="Semester 3">Semester 3 (2nd Year)</option>
                  <option value="Semester 4">Semester 4 (2nd Year)</option>
                  <option value="Semester 5">Semester 5 (3rd Year)</option>
                  <option value="Semester 6">Semester 6 (3rd Year)</option>
                </select>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Resource Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:border-cyan-500 cursor-pointer text-xs"
                >
                  <option value="All">All Resource Categories</option>
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Syllabus PDF">Syllabus PDF</option>
                  <option value="Lab Manual">Lab Manual</option>
                  <option value="Previous Year Paper (PYQ)">Previous Year Paper (PYQ)</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Model Question Paper">Model Question Paper</option>
                  <option value="Reference E-Book">Reference E-Book</option>
                </select>
              </div>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-400 text-[10px] font-bold uppercase mr-1">Quick Types:</span>
              {['All', 'Lecture Notes', 'Syllabus PDF', 'Lab Manual', 'Previous Year Paper (PYQ)'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 3. RESOURCES CARDS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{filteredResources.length}</strong> resources in repository
              </span>
              <span className="font-mono text-[11px]">
                Active Filters: {selectedBoard} • {selectedDept.split(' ')[0]} • {selectedSemester}
              </span>
            </div>

            {filteredResources.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    No Academic Resources Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No study materials matched the selected filters. Try clearing your search query or switching board/semester filters.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBoard('All');
                    setSelectedDept('All');
                    setSelectedSemester('All');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
              <ShowEntries pg={pg} label="resources" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pg.pageItems.map((res) => {
                  const isBoardUBTER = res.board.includes('UBTER');

                  return (
                    <div
                      key={res.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      {/* Top Badges: Subject Code + Category + Board */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#13294b] text-cyan-300 border border-cyan-500/30">
                              {res.subjectCode}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Sem {res.semester} ({res.academicYear})
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${
                              res.category === 'Syllabus PDF'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                : res.category === 'Lecture Notes'
                                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                                : res.category === 'Lab Manual'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {res.category}
                          </span>
                        </div>

                        {/* Title & Subject Name */}
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {res.title}
                          </h3>
                          <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                            {res.subjectName} • <strong className="text-slate-700 dark:text-slate-300">{res.department}</strong>
                          </span>
                        </div>

                        {/* Unit / Module */}
                        {res.unitModule && (
                          <div className="flex items-center gap-1.5 text-xs text-cyan-700 dark:text-cyan-300 font-medium">
                            <Tag className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            <span className="truncate">{res.unitModule}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                      </div>

                      {/* Bottom Info: Board Badge, Faculty, File Stats, Download & Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[200px]">
                            {res.board.split(' ')[0]}
                          </span>

                          <span className="text-slate-500">
                            By: <strong className="text-slate-800 dark:text-slate-200">{res.facultyName}</strong>
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] font-mono text-slate-500">
                            {res.isVerifiedByHOD === false && <span className="mr-1 font-bold text-amber-700">Waiting for approval •</span>}
                            <span>{res.fileSize}</span>
                            <span className="mx-1">•</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{res.downloadCount} Downloads</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewResource(res)}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Preview Details & Syllabus Mapping"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDownload(res)}
                              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>

                            {isFacultyOrAdmin && res.isVerifiedByHOD === false && (
                              <button
                                onClick={() => handleApprove(res.id)}
                                className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 text-xs font-bold cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {/* Delete button for faculty/admin */}
                            {isFacultyOrAdmin && (
                              <button
                                onClick={() => handleDelete(res.id)}
                                className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete Resource"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pager pg={pg} />
              </>
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEW TAB 2: TECHNICAL BOARDS DIRECTORY ("har board ka database") */}
      {activeTab === 'boards_info' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <div>
                <h2 className="font-black text-slate-900 dark:text-white text-lg">
                  State Technical Education Boards & Central AICTE Curriculum Registry
                </h2>
                <p className="text-xs text-slate-500">
                  Accredited technical examination boards, curriculum schemes, and institute databases across India
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technicalBoards.map((board) => {
                const resourcesCount = academicResources.filter(r => r.board === board.name).length;

                return (
                  <div
                    key={board.id}
                    className="p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider block">
                          {board.state}
                        </span>
                        <h3 className="font-black text-slate-900 dark:text-white text-base">
                          {board.name}
                        </h3>
                        <span className="text-xs text-slate-500 block">
                          Short Name: <strong className="text-slate-800 dark:text-slate-200">{board.shortName}</strong>
                        </span>
                      </div>

                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                        {resourcesCount} Resources
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {board.description}
                    </p>

                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 font-sans">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Curriculum Scheme:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{board.curriculumScheme}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Affiliated Polytechnics:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{board.totalInstitutes}+ Institutes</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setSelectedBoard(board.shortName.split(' ')[0]);
                          setActiveTab('resources');
                        }}
                        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Filter Resources for this Board</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={board.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: UPLOAD ACADEMIC RESOURCE (Faculty / Admin) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Upload Academic Resource & Categorize
                  </h3>
                  <p className="text-xs text-slate-500">
                    Publish study materials, syllabus PDFs, or lab manuals mapped to subject & board
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Quick Preset Subject Chips */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quick Select Known Polytechnic Subject:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {COMMON_SUBJECT_PRESETS.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => applySubjectPreset(p)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                        newSubjectCode === p.code
                          ? 'bg-cyan-600 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {p.code} ({p.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. RDBMS Stored Procedures & B-Tree Index Lecture Handouts"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Technical Board & Resource Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Technical Board Database *
                  </label>
                  <select
                    value={newBoard}
                    onChange={(e) => setNewBoard(e.target.value as TechnicalBoard)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="UBTER (Uttarakhand Board of Technical Education)">
                      UBTER (Uttarakhand Board of Technical Education)
                    </option>
                    <option value="AICTE (Model National Curriculum)">
                      AICTE (Model National Curriculum)
                    </option>
                    <option value="BTEUP (Uttar Pradesh Technical Board)">
                      BTEUP (Uttar Pradesh Technical Board)
                    </option>
                    <option value="MSBTE (Maharashtra State Board)">
                      MSBTE (Maharashtra State Board)
                    </option>
                    <option value="HSBTE (Haryana Board of Technical Education)">
                      HSBTE (Haryana Board of Technical Education)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Resource Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ResourceCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Syllabus PDF">Syllabus PDF</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Previous Year Paper (PYQ)">Previous Year Paper (PYQ)</option>
                    <option value="Study Material">Study Material</option>
                    <option value="Model Question Paper">Model Question Paper</option>
                    <option value="Reference E-Book">Reference E-Book</option>
                  </select>
                </div>
              </div>

              {/* Subject Code, Subject Name, Department, Semester */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    placeholder="e.g. CSE-302"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester (1-6)
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer text-xs"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                  </select>
                </div>
              </div>

              {/* Department & Unit / Module */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 cursor-pointer text-xs"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="General / Applied Sciences">General / Applied Sciences</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit / Module Coverage
                  </label>
                  <input
                    type="text"
                    value={newUnitModule}
                    onChange={(e) => setNewUnitModule(e.target.value)}
                    placeholder="e.g. Unit 2: SQL Normalization"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              {/* File Attachment & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Choose file * (PDF, Word, PPT, Excel, ZIP, image, up to 8 MB)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png"
                    onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g. Normalization, SQL, Sem 3"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brief Description & Learning Outcomes
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline key topics, practical significance, and exam relevance..."
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-xs font-black shadow-md cursor-pointer transition-colors"
                >
                  {uploading ? 'Uploading…' : isStudent ? 'Send for approval' : 'Publish to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: RESOURCE PREVIEW & SYLLABUS MAPPING */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  {previewResource.subjectCode}
                </span>
                <h3 className="font-black text-slate-900 dark:text-white text-base mt-1">
                  {previewResource.title}
                </h3>
                <span className="text-xs text-slate-500 block">
                  {previewResource.subjectName} • {previewResource.board}
                </span>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Author / Faculty In-Charge:</span>
                  <strong className="text-slate-900 dark:text-white">{previewResource.facultyName}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Semester & Target Batch:</span>
                  <strong className="text-slate-900 dark:text-white">Semester {previewResource.semester} ({previewResource.academicYear})</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Resource Category:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{previewResource.category}</strong>
                </div>
                {previewResource.unitModule && (
                  <div className="flex justify-between text-slate-500">
                    <span>Unit / Topic Coverage:</span>
                    <strong className="text-slate-900 dark:text-white">{previewResource.unitModule}</strong>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>File Specifications:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{previewResource.fileName} ({previewResource.fileSize})</strong>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description & Syllabus Relevance:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                  {previewResource.description}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Curriculum Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewResource.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[11px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {previewResource.downloadCount} verified student downloads
              </span>

              <button
                onClick={() => {
                  handleDownload(previewResource);
                  setPreviewResource(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
