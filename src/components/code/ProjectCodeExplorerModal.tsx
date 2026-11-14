'use client';

/**
 * Code & Folders Explorer (admin only): a read-only map of the project folders and key files, for teaching and maintenance.
 * The login constants exported here are DISPLAY copies with masked passwords – real ones are in src/config/credentials.ts.
 */
import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  X,
  Search,
  Code2,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  description?: string;
  children?: FileNode[];
  code?: string;
}

const PROJECT_TREE: FileNode = {
  id: 'root',
  name: 'gpt-tanakpur-lms',
  type: 'folder',
  path: '/',
  children: [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      path: '/src',
      description: 'All application code lives in src/ (app, components, context, hooks, lib, config).',
      children: [
    {
      id: 'config',
      name: 'config',
      type: 'folder',
      path: '/src/config',
      children: [
        {
          id: 'config-credentials',
          name: 'credentials.ts',
          type: 'file',
          path: '/src/config/credentials.ts',
          description: 'Separate login file for Admin, Faculty and Student passwords (server-only, never sent to the browser).',
          code: `// src/config/credentials.ts
export const ADMIN_LOGIN = { loginId: 'admin', password: '••••••••', userId: 'user_admin_principal' };
export const FACULTY_LOGINS = [{ loginId: 'jitendra.cse@ugip.gov.in', password: '••••••••', userId: 'user_faculty_jitendra_hod' }];
export const DEFAULT_FACULTY_PASSWORD = '••••••••';
export const DEFAULT_STUDENT_PASSWORD = '••••••••'; // students log in with roll number`,
        },
      ],
    },
    {
      id: 'tracker',
      name: 'components/tracker',
      type: 'folder',
      path: '/src/components/tracker',
      description: 'Placement Tracker: resume submission + analysis, placement Q&A, AI mock interview, notices with 3 reminders and lock.',
      children: [
        { id: 'tr-1', name: 'StudentResumeSubmitScreen.tsx', type: 'file', path: '/src/components/tracker/StudentResumeSubmitScreen.tsx', description: 'Student uploads PDF/DOCX; server scores it; faculty see who sent which resume.' },
        { id: 'tr-2', name: 'PlacementQnaPracticeScreen.tsx', type: 'file', path: '/src/components/tracker/PlacementQnaPracticeScreen.tsx', description: '10-question placement tests; attempted / correct / wrong saved per student.' },
        { id: 'tr-3', name: 'AiMockInterviewScreen.tsx', type: 'file', path: '/src/components/tracker/AiMockInterviewScreen.tsx', description: 'Voice, typed and panel interviews; results go to faculty.' },
        { id: 'tr-4', name: 'StudentNoticesScreen.tsx', type: 'file', path: '/src/components/tracker/StudentNoticesScreen.tsx', description: 'Faculty notices; 3 reminders then the portal locks until completed.' },
        { id: 'tr-5', name: 'FacultyPlacementTrackerScreen.tsx', type: 'file', path: '/src/components/tracker/FacultyPlacementTrackerScreen.tsx', description: 'Faculty/Admin dashboard: all students, top resumes, Q&A analysis, interviews, notices.' },
      ],
    },

    {
      id: 'app',
      name: 'app',
      type: 'folder',
      path: '/src/app',
      children: [
        {
          id: 'app-page',
          name: 'page.tsx',
          type: 'file',
          path: '/src/app/page.tsx',
          description: 'Main App Router entry point. Renders Navbar, AppSidebar, screen routing, and role guards.',
          code: `// app/page.tsx - Core LMS Root Controller
'use client';
import React, { useState } from 'react';
import { CollegeProvider, useCollege } from '../context/CollegeContext';
import { Navbar, ActiveScreen } from '../components/layout/Navbar';
import { AppSidebar } from '../components/layout/AppSidebar';
import { PostLoginDashboard } from '../components/dashboards/PostLoginDashboard';
import { StudentPortfolioScreen } from '../components/student/StudentPortfolioScreen';

export default function Home() {
  return (
    <CollegeProvider>
      <PortalMainContent />
    </CollegeProvider>
  );
}`,
        },
        {
          id: 'app-layout',
          name: 'layout.tsx',
          type: 'file',
          path: '/src/app/layout.tsx',
          description: 'Next.js App Router root layout configuring fonts, meta tags, and global container.',
          code: `// app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'UGIP Tanakpur • Official LMS & Placement Portal',
  description: 'Education Management System & Placement Portal for UBTER Institute Code 090',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}`,
        },
        {
          id: 'app-api',
          name: 'api',
          type: 'folder',
          path: '/src/app/api',
          children: [
            {
              id: 'app-api-ai',
              name: 'ai-career-mentor',
              type: 'folder',
              path: '/src/app/api/ai-career-mentor',
              children: [
                {
                  id: 'app-api-ai-route',
                  name: 'route.ts',
                  type: 'file',
                  path: '/src/app/api/ai-career-mentor/route.ts',
                  description: 'Career guidance with official job links & skill recommendation.',
                  code: `// app/api/ai-career-mentor/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { student, query, category } = await req.json();
  // Returns personalized roadmap, official job links, and skill verification guidance
  return NextResponse.json({ advice: 'AI Career Guidance generated successfully' });
}`,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'components',
      name: 'components',
      type: 'folder',
      path: '/src/components',
      children: [
        {
          id: 'components-dashboards',
          name: 'dashboards',
          type: 'folder',
          path: '/src/components/dashboards',
          children: [
            {
              id: 'dash-postlogin',
              name: 'PostLoginDashboard.tsx',
              type: 'file',
              path: '/src/components/dashboards/PostLoginDashboard.tsx',
              description: 'LMS post-login interface with navy-to-indigo banner, 1st/2nd/3rd Year filter, 3 analytics cards, and subject ledger.',
              code: `// components/dashboards/PostLoginDashboard.tsx
// Features:
// 1. Large rounded navy-to-indigo gradient hero banner
// 2. Cyan accents & working 1st Year / 2nd Year / 3rd Year / All filters
// 3. Three analytics cards (Student Profile, CGPA Progression, Examination Eligibility)
// 4. Subject-wise attendance ledger with progress bars & status colors`,
            },
            {
              id: 'dash-outer',
              name: 'OuterDashboardsHub.tsx',
              type: 'file',
              path: '/src/components/dashboards/OuterDashboardsHub.tsx',
              description: 'Public overview hub with institutional cards, secure unhinted login forms for Student, Faculty & Admin.',
              code: `// components/dashboards/OuterDashboardsHub.tsx
// Clean institutional login portal with zero exposed passwords or hints`,
            },
          ],
        },
        {
          id: 'components-layout',
          name: 'layout',
          type: 'folder',
          path: '/src/components/layout',
          children: [
            {
              id: 'layout-navbar',
              name: 'Navbar.tsx',
              type: 'file',
              path: '/src/components/layout/Navbar.tsx',
              description: 'White top header with college logo, home navigation, language selector, theme toggle, notifications, and user details.',
              code: `// components/layout/Navbar.tsx
// White header with college logo emblem, home button, EN/HI language toggle, notifications & session logout`,
            },
            {
              id: 'layout-sidebar',
              name: 'AppSidebar.tsx',
              type: 'file',
              path: '/src/components/layout/AppSidebar.tsx',
              description: 'Collapsible role-based sidebar for Overview, Dossier, Excel, Recruiters, Viva, Q&A, Mock Tests, Reminders, Resume Hub, etc.',
              code: `// components/layout/AppSidebar.tsx
// Collapsible sidebar with role-aware items for Student, Faculty, and Admin`,
            },
          ],
        },
        {
          id: 'components-academic',
          name: 'academic',
          type: 'folder',
          path: '/src/components/academic',
          children: [
            {
              id: 'acad-mock',
              name: 'MockTestCentreScreen.tsx',
              type: 'file',
              path: '/src/components/academic/MockTestCentreScreen.tsx',
              description: 'Mock Test Centre: full 60-question placement paper and timed mock tests of any CSE or Civil subject, with correct answers after submit.',
              code: `// components/academic/MockTestCentreScreen.tsx
// Uses QuestionRunner and TestPicker from components/tracker/qna/QnaParts.tsx`,
            },
            {
              id: 'acad-asg',
              name: 'AssignmentReminderTrackerScreen.tsx',
              type: 'file',
              path: '/src/components/academic/AssignmentReminderTrackerScreen.tsx',
              description: 'Assignments management with 3-reminder countdown tracker, auto-grading, and faculty overdue alerts.',
              code: `// components/academic/AssignmentReminderTrackerScreen.tsx
// 3-reminder task tracking with SMS simulation and submission records`,
            },
            {
              id: 'acad-doubt',
              name: 'OnlineQnADoubtsScreen.tsx',
              type: 'file',
              path: '/src/components/academic/OnlineQnADoubtsScreen.tsx',
              description: 'Real-time student doubts resolution stream with faculty & alumni expert responses.',
              code: `// components/academic/OnlineQnADoubtsScreen.tsx
// Interactive academic discussion forum with faculty endorsements`,
            },
          ],
        },
        {
          id: 'components-student',
          name: 'student',
          type: 'folder',
          path: '/src/components/student',
          children: [
            {
              id: 'stu-dossier',
              name: 'StudentPortfolioScreen.tsx',
              type: 'file',
              path: '/src/components/student/StudentPortfolioScreen.tsx',
              description: 'Comprehensive student dossier (Diya Adhikari / Anurag Mourya) with 1st-4th sem marks, AI Career Mentor, and official job links.',
              code: `// components/student/StudentPortfolioScreen.tsx
// 14 core details: Aadhar Name, Roll, 10th %, 12th %, Semesters 1-4 %, Caste, Address, AI Career Mentor`,
            },
            {
              id: 'stu-resume-mod',
              name: 'ResumeManagementModule.tsx',
              type: 'file',
              path: '/src/components/student/ResumeManagementModule.tsx',
              description: 'Resume Management module: ATS upload, version control, professional profile, and social portfolios.',
              code: `// components/student/ResumeManagementModule.tsx
// Full resume version history, LinkedIn/GitHub links, and career documents`,
            },
            {
              id: 'stu-resume-hub',
              name: 'ResumeHubScreen.tsx',
              type: 'file',
              path: '/src/components/student/ResumeHubScreen.tsx',
              description: 'Dedicated Resume Hub screen accessible directly from LMS sidebar.',
              code: `// components/student/ResumeHubScreen.tsx
// Standalone Resume Hub screen integrating ResumeManagementModule`,
            },
          ],
        },
        {
          id: 'components-faculty',
          name: 'faculty',
          type: 'folder',
          path: '/src/components/faculty',
          children: [
            {
              id: 'fac-portal',
              name: 'FacultyPortalScreen.tsx',
              type: 'file',
              path: '/src/components/faculty/FacultyPortalScreen.tsx',
              description: 'Role-based access control (RBAC) marks editing, student record editor, and skill verification portal.',
              code: `// components/faculty/FacultyPortalScreen.tsx
// Faculty can update marks for their assigned subject and edit student records`,
            },
          ],
        },
        {
          id: 'components-admin',
          name: 'admin',
          type: 'folder',
          path: '/src/components/admin',
          children: [
            {
              id: 'admin-vault',
              name: 'AdminVaultScreen.tsx',
              type: 'file',
              path: '/src/components/admin/AdminVaultScreen.tsx',
              description: 'Directorate master security vault (AES-256 encrypted), student records management, and audit logs.',
              code: `// components/admin/AdminVaultScreen.tsx
// Master admin dashboard for college-wide student management and encrypted vault`,
            },
          ],
        },
        {
          id: 'components-excel',
          name: 'excel',
          type: 'folder',
          path: '/src/components/excel',
          children: [
            {
              id: 'excel-gen',
              name: 'ClassExcelGeneratorScreen.tsx',
              type: 'file',
              path: '/src/components/excel/ClassExcelGeneratorScreen.tsx',
              description: 'Class Excel Sheet Generator: filter by Year, Branch, Batch; view table and export CSV/Excel.',
              code: `// components/excel/ClassExcelGeneratorScreen.tsx
// Generates official UBTER CSV roster with Aadhar name, marks, caste, and roll number`,
            },
          ],
        },
        {
          id: 'components-placement',
          name: 'placement',
          type: 'folder',
          path: '/src/components/placement',
          children: [
            {
              id: 'place-companies',
              name: 'PlacementCompaniesScreen.tsx',
              type: 'file',
              path: '/src/components/placement/PlacementCompaniesScreen.tsx',
              description: '24 Core Recruiters (12 CSE + 12 Civil Engineering) with eligibility criteria, packages, and alumni mentors.',
              code: `// components/placement/PlacementCompaniesScreen.tsx
// 24 Core companies: L&T, HCLTech, VVDN, Banbasa Barrage, NHPC, UKPSC, etc.`,
            },
            {
              id: 'place-questions',
              name: 'PlacementQuestionsScreen.tsx',
              type: 'file',
              path: '/src/components/placement/PlacementQuestionsScreen.tsx',
              description: '260+ Viva Questions Bank covering Computer Science, Civil Engineering, and Aptitude.',
              code: `// components/placement/PlacementQuestionsScreen.tsx
// 260+ categorized viva questions with detailed institutional answers`,
            },
          ],
        },
      ],
    },
    {
      id: 'context',
      name: 'context',
      type: 'folder',
      path: '/src/context',
      children: [
        {
          id: 'ctx-college',
          name: 'CollegeContext.tsx',
          type: 'file',
          path: '/src/context/CollegeContext.tsx',
          description: 'Global React context managing state: Students, Faculty, Authentication, Attendance, Assignments, Doubts, and RBAC.',
          code: `// context/CollegeContext.tsx
// Global state management for LMS with encryption, authentication, and live roster`,
        },
      ],
    },
    {
      id: 'lib',
      name: 'lib',
      type: 'folder',
      path: '/src/lib',
      children: [
        {
          id: 'lib-types',
          name: 'types.ts',
          type: 'file',
          path: '/src/lib/types.ts',
          description: 'TypeScript interfaces & types: StudentProfile, AttendanceRecord, UserProfile, AssignmentRecord, etc.',
          code: `// lib/types.ts
// Complete TypeScript definitions for student dossiers, attendance, and LMS roles`,
        },
        {
          id: 'lib-crypto',
          name: 'crypto.ts',
          type: 'file',
          path: '/src/lib/crypto.ts',
          description: 'AES-256 encryption, password hashing, Aadhar masking, and OTP generator helpers.',
          code: `// lib/crypto.ts
// AES-256 encryption & masking functions for student data security`,
        },
        {
          id: 'lib-data',
          name: 'data',
          type: 'folder',
          path: '/src/lib/data',
          children: [
            {
              id: 'data-student',
              name: 'studentData.ts',
              type: 'file',
              path: '/src/lib/data/studentData.ts',
              description: 'Initial student records for Diya Adhikari, Anurag Mourya, and full polytechnic cohort.',
              code: `// lib/data/studentData.ts
// Primary student profiles with full marks, address, caste, parents, and semester scorecards`,
            },
            {
              id: 'data-academic',
              name: 'academicData.ts',
              type: 'file',
              path: '/src/lib/data/academicData.ts',
              description: 'Subject attendance records across 1st, 2nd, and 3rd year for all monitored subjects.',
              code: `// lib/data/academicData.ts
// Subject attendance database with monthly trends and RBAC mapping`,
            },
            {
              id: 'data-faculty',
              name: 'facultyData.ts',
              type: 'file',
              path: '/src/lib/data/facultyData.ts',
              description: 'Faculty roster, authorized departments, and secure credential stores.',
              code: `// lib/data/facultyData.ts
// Institutional faculty roster and user credentials`,
            },
            {
              id: 'data-placement',
              name: 'placementData.ts',
              type: 'file',
              path: '/src/lib/data/placementData.ts',
              description: '24 core companies profiles and 260+ viva interview questions.',
              code: `// lib/data/placementData.ts
// Detailed company records, job roles, salary CTC, and interview question bank`,
            },
          ],
        },
      ],
    },
      ],
    },
  ],
};

interface ProjectCodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectCodeExplorerModal: React.FC<ProjectCodeExplorerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    app: true,
    components: true,
    'components-dashboards': true,
    'components-layout': true,
    'components-academic': true,
    'components-student': true,
    context: true,
    lib: true,
    'lib-data': true,
  });

  const [selectedFile, setSelectedFile] = useState<FileNode>({
    id: 'dash-postlogin',
    name: 'PostLoginDashboard.tsx',
    type: 'file',
    path: '/src/components/dashboards/PostLoginDashboard.tsx',
    description: 'LMS post-login interface with navy-to-indigo banner, 1st/2nd/3rd Year filter, 3 analytics cards, and subject ledger.',
    code: `// components/dashboards/PostLoginDashboard.tsx
// Features:
// 1. Large rounded navy-to-indigo gradient hero banner
// 2. Cyan accents & working 1st Year / 2nd Year / 3rd Year / All filters
// 3. Three analytics cards (Student Profile, CGPA Progression, Examination Eligibility)
// 4. Subject-wise attendance ledger with progress bars & status colors`,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCopyCode = () => {
    if (selectedFile?.code) {
      navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderTree = (node: FileNode, level = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.id];
    const isSelected = selectedFile?.id === node.id;

    const matchesSearch =
      searchQuery === '' ||
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.path.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch && isFolder && !node.children?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return null;
    }

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.id);
            } else {
              setSelectedFile(node);
            }
          }}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
            </>
          )}

          <span className="truncate">{node.name}</span>
        </div>

        {isFolder && isExpanded && node.children && (
          <div>{node.children.map(child => renderTree(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[88vh] rounded-3xl bg-slate-950 border border-cyan-500/30 text-white flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#13294b] flex items-center justify-center border border-cyan-400/40">
              <Code2 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  Project Code & Folder Architecture Explorer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Folder Inside Folder Structure
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse through folders and files to inspect the clean code implementation of all LMS parts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Tree + Right Code View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Folder Tree Sidebar */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900/60 p-3 flex flex-col overflow-hidden shrink-0">
            {/* Search filter */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file or folder..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400"
              />
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
              Project Tree View
            </div>

            {/* Tree View Container */}
            <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin pr-1">
              {renderTree(PROJECT_TREE)}
            </div>
          </div>

          {/* Right: Code Viewer & File Info */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File Header Bar */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 truncate">
                    {selectedFile.path}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    TypeScript / TSX
                  </span>
                </div>
                {selectedFile.description && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {selectedFile.description}
                  </p>
                )}
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 bg-slate-950 scrollbar-thin">
              <pre className="leading-relaxed">
                <code>
                  {selectedFile.code || `// ${selectedFile.path}\n// Module source file in Uttarakhand Government Institute of Polytechnic, Tanakpur LMS`}
                </code>
              </pre>
            </div>

            {/* Footer Summary Bar */}
            <div className="p-2.5 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>UGIP Tanakpur • Code Architecture</span>
              <span>AES-256 Encrypted • Next.js 15 App Router</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
