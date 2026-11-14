'use client';

/**
 * Home page after login. Students see their own profile, attendance and CGPA; staff see their own profile and pick a student
 * ("Student data below for") whose data is shown below. Placement figures in the hero come from src/lib/data/campusPlacementStats.ts.
 */
import React, { useState, useMemo } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { OfficialLinksBar } from '../layout/OfficialLinksBar';
import { AcademicYear, StudentProfile, AttendanceRecord, MockInterviewVideo } from '../../lib/types';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  Briefcase,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderTree,
  Filter,
  Check,
  AlertCircle,
  Bookmark,
  Award,
  Play,
  Video,
  Building2,
  XCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { ActiveScreen } from '../layout/Navbar';
import { ALL_ATTENDANCE_DATABASE, DIYA_ATTENDANCE, ANURAG_ATTENDANCE } from '../../lib/data/academicData';
import { CS_VS_CIVIL_GOVT_JOBS, MOCK_INTERVIEW_VIDEOS } from '../../lib/data/govtJobsAndVideosData';

interface PostLoginDashboardProps {
  onNavigateToScreen: (screen: ActiveScreen) => void;
  onOpenCodeExplorer?: () => void;
}

export const PostLoginDashboard: React.FC<PostLoginDashboardProps> = ({
  onNavigateToScreen,
  onOpenCodeExplorer,
}) => {
  const {
    currentUser,
    loggedInRole,
    loggedStudent,
    primaryStudent,
    students,
    language,
    attendanceRecords,
  } = useCollege();

  // Top View Switcher: 'placement_command' (Default) vs 'academic_attendance'
  const [dashboardView, setDashboardView] = useState<'placement_command' | 'academic_attendance'>('placement_command');

  // Video modal player
  const [selectedVideo, setSelectedVideo] = useState<MockInterviewVideo | null>(null);

  // Year filter state for the Attendance Hero Banner
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'All'>('3rd Year');

  // For faculty and admin: allow selecting which student to inspect
  const [inspectedStudentId, setInspectedStudentId] = useState<string>(() => {
    if (loggedInRole === 'student') {
      return loggedStudent?.id || primaryStudent.id;
    }
    const diya = students.find((s) => s.ubterRollNumber === '24090050011');
    return diya ? diya.id : primaryStudent.id;
  });

  // Active student profile: Strictly limited to logged-in student's own data if student role
  const activeStudent: StudentProfile = useMemo(() => {
    if (loggedInRole === 'student') {
      return loggedStudent || students.find((s) => s.ubterRollNumber === currentUser.rollNumber) || primaryStudent;
    }
    return students.find((s) => s.id === inspectedStudentId) || primaryStudent;
  }, [loggedInRole, loggedStudent, currentUser, students, inspectedStudentId, primaryStudent]);

  // Student specific attendance records
  const studentAttendancePool: AttendanceRecord[] = useMemo(() => {
    if (activeStudent.id === 'stu-diya-adhikari-24090050011' || activeStudent.ubterRollNumber === '24090050011') {
      return DIYA_ATTENDANCE;
    }
    if (activeStudent.id === 'stu-anurag-mourya-24090050007' || activeStudent.ubterRollNumber === '24090050007') {
      return ANURAG_ATTENDANCE;
    }
    const matched = ALL_ATTENDANCE_DATABASE.filter((a) => a.studentId === activeStudent.id);
    return matched.length > 0 ? matched : attendanceRecords;
  }, [activeStudent, attendanceRecords]);

  // Filter attendance records by selected year
  const filteredAttendance = useMemo(() => {
    if (selectedYear === 'All') {
      return studentAttendancePool;
    }
    const filtered = studentAttendancePool.filter((rec) => {
      if (rec.academicYear) {
        return rec.academicYear === selectedYear;
      }
      if (selectedYear === '1st Year') {
        return rec.subjectCode.includes('10') || rec.subjectCode.includes('20');
      }
      if (selectedYear === '2nd Year') {
        return rec.subjectCode.includes('30') || rec.subjectCode.includes('40');
      }
      if (selectedYear === '3rd Year') {
        return rec.subjectCode.includes('50') || rec.subjectCode.includes('60');
      }
      return true;
    });

    return filtered.length > 0 ? filtered : studentAttendancePool;
  }, [studentAttendancePool, selectedYear]);

  // Calculated attendance metrics for the active year filter
  const overallAttendancePct = useMemo(() => {
    if (filteredAttendance.length === 0) return activeStudent.attendancePercentage || 85.5;
    const totalHeld = filteredAttendance.reduce((acc, curr) => acc + curr.totalClassesHeld, 0);
    const totalAttended = filteredAttendance.reduce((acc, curr) => acc + curr.classesAttended, 0);
    return totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 1000) / 10 : 85.5;
  }, [filteredAttendance, activeStudent]);

  const totalClassesAttended = useMemo(() => {
    return filteredAttendance.reduce((acc, curr) => acc + curr.classesAttended, 0);
  }, [filteredAttendance]);

  const totalClassesHeld = useMemo(() => {
    return filteredAttendance.reduce((acc, curr) => acc + curr.totalClassesHeld, 0);
  }, [filteredAttendance]);

  // CGPA calculations
  const year1CGPA = activeStudent.firstYearCGPA || 7.28;
  const year2CGPA = activeStudent.secondYearCGPA || 8.39;
  const cgpaGrowth = Math.max(0, Math.round((year2CGPA - year1CGPA) * 100) / 100);

  const isExamEligible = overallAttendancePct >= 75.0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 0. TOP VIEW SWITCHER: Placement Dashboard (Default) vs Academic & Attendance Clearance */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDashboardView('placement_command')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              dashboardView === 'placement_command'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-200" />
            <span>
              {language === 'hi'
                ? 'प्लेसमेंट एवं करियर कमांड हब (TPO Portal)'
                : 'Placement dashboard'}
            </span>
          </button>
        </div>

        {/* Official result & govt job links */}
        <OfficialLinksBar compact />
      </div>

      {/* VIEW 1: CAMPUS PLACEMENT & CAREER DASHBOARD (Primary TPO Experience) */}
      {dashboardView === 'placement_command' && (
        <div className="space-y-6">
          {/* Main Placement Hero Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-[#13294b] text-white p-6 sm:p-8 border border-cyan-500/30 shadow-2xl">
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b] shadow-xs">
                      CAMPUS RECRUITMENT & PLACEMENT CELL (TPO)
                    </span>
                    <span className="text-xs text-cyan-300 tabular-nums font-semibold">
                      Institute Code: 090 • Tanakpur
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      90.6% placed in 2025-26
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                    {language === 'hi'
                      ? 'प्रशिक्षण एवं प्लेसमेंट सेल — करियर कमांड हब'
                      : 'Training & Placement Cell'}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {language === 'hi'
                      ? 'डिप्लोमा इंजीनियरों के लिए 24 कोर रिक्रूटर्स, यूकेपीएससी/एसएससी जेई सरकारी जॉब नोटिफिकेशन, 2 Q&A ट्रैक (सरकारी व प्राइवेट), 9 वीडियो मॉक इंटरव्यू मास्टरक्लास, एवं एटीएस रिज्यूमे स्कोरिंग।'
                      : 'Placement portal for diploma candidates to 24 core corporate recruiters, UKPSC & SSC JE government notifications, dual Sarkari vs Private Q&A tracks, and video masterclasses.'}
                  </p>
                </div>

                {/* Your profile Card: staff see their own profile and pick which student's data is shown below */}
                {loggedInRole !== 'student' ? (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[260px] max-w-sm space-y-2 text-xs">
                  <span className="font-bold text-[10px] uppercase text-gold-200">Your profile</span>
                  <div>
                    <h3 className="font-black text-base text-white">{currentUser.name}</h3>
                    <p className="text-[11px] text-gold-200 font-bold">{loggedInRole === 'admin' ? 'Admin (Principal)' : 'Faculty'}</p>
                    {currentUser.department && <p className="text-[11px] text-slate-300">{currentUser.department}</p>}
                    {currentUser.email && <p className="text-[11px] text-slate-300 break-all">{currentUser.email}</p>}
                  </div>
                  <label className="block pt-1 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-300">Student data below for</span>
                    <select
                      value={inspectedStudentId}
                      onChange={e => setInspectedStudentId(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-semibold"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {`${s.aadharName} – ${s.ubterRollNumber} (${/civil/i.test(s.branch) ? 'Civil' : 'CSE'}, ${s.currentYear})`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                ) : (
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[260px] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gold-200">
                    <span className="font-bold text-[10px] uppercase">Your profile</span>
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">{activeStudent.aadharName}</h3>
                    <p className="text-[11px] text-slate-300 tabular-nums">
                      Roll: {activeStudent.ubterRollNumber} • {activeStudent.branch}
                    </p>
                  </div>
                  <div className="pt-1 space-y-1 text-[11px] font-medium text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Year:</span>
                      <strong>{activeStudent.currentYear}, Sem {activeStudent.currentSemester}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <strong>{activeStudent.status}</strong>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Action Buttons in Hero */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://govtjobguru.in/jobs-by-qualification/diploma-freshers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-[#13294b] font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Award className="w-4 h-4" />
                  <span>डिप्लोमा के बाद गवर्नमेंट जॉब (GovtJobGuru) ↗</span>
                </a>

                <a
                  href="https://ssc.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>SSC Official (central govt jobs) ↗</span>
                </a>

                <button
                  onClick={() => onNavigateToScreen('questions')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>2 Q&A ट्रैक: सरकारी vs प्राइवेट</span>
                </button>

                <button
                  onClick={() => onNavigateToScreen('companies')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border border-white/20 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Building2 className="w-4 h-4 text-cyan-300" />
                  <span>24 कोर रिक्रूटर्स ड्राइव्स</span>
                </button>
              </div>

              {/* Placement Key Metrics */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-gold-200 uppercase font-black block">Placement Rate</span>
                  <span className="text-xl font-black tabular-nums text-white">90.6%</span>
                  <span className="text-[9px] text-slate-400 block">Class of 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-gold-200 uppercase font-black block">Highest Package</span>
                  <span className="text-xl font-black tabular-nums text-white">₹3.60 LPA</span>
                  <span className="text-[9px] text-slate-400 block">L&T / TCS</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-gold-200 uppercase font-black block">Govt Job Vacancies</span>
                  <span className="text-xl font-black tabular-nums text-white">SSC · RRB · UKSSSC</span>
                  <span className="text-[9px] text-slate-400 block">UKPSC, SSC JE, RRB</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] text-gold-200 uppercase font-black block">Core Recruiters</span>
                  <span className="text-xl font-black tabular-nums text-white">24 Companies</span>
                  <span className="text-[9px] text-slate-400 block">12 Civil + 12 CS</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. CS VS CIVIL GOVERNMENT JOBS MATRIX PREVIEW */}
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                  <span>CS बनाम Civil सरकारी नौकरी विश्लेषण (Annual Vacancies & Pay Scale)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  डिप्लोमा पास होने के बाद किस शाखा में कितनी सरकारी नौकरियां आती हैं, उनका वेतनमान व परीक्षा पैटर्न।
                </p>
              </div>

              <button
                onClick={() => onNavigateToScreen('questions')}
                className="text-xs font-black text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Matrix & Q&A →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Civil Highlights */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Civil Engineering Govt Jobs
                  </span>
                  <span className="tabular-nums font-bold text-amber-600 dark:text-amber-400">~3,800+ Annual Seats</span>
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                  UKPSC JE, SSC JE, RRB JE, NHPC Banbasa, BRO & State PWD
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  उत्तराखंड में सिविल डिप्लोमा होल्डर्स के लिए सबसे अधिक सरकारी सीटें आती हैं। Level-7 (Rs. 44,900 - 1,42,400) पे स्केल मिलता है।
                </p>
                <div className="pt-1 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">PWD Uttarakhand</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">Irrigation Department</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">BRO Border Roads</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">CPWD Central</span>
                </div>
              </div>

              {/* Computer Science Highlights */}
              <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                    Computer Science & IT Govt Jobs
                  </span>
                  <span className="tabular-nums font-bold text-cyan-600 dark:text-cyan-400">~1,200+ Annual Seats</span>
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">
                  NIC Technical Assistant, DRDO CEPTAM, UKSSSC IT, ISRO
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  नैशनल इन्फॉर्मेटिक्स सेंटर (NIC) चम्पावत व देहरादून, DRDO DEAL/IRDE, एवं उत्तराखंड सचिवालय में आईटी प्रोग्रामर पद। Level-6 पे स्केल।
                </p>
                <div className="pt-1 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">NIC District Centre</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">DRDO Dehradun</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">ISRO IIRS</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] text-slate-600">Police Telecom</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. MOCK INTERVIEW VIDEO MASTERCLASS & SUCCESS STORIES SPOTLIGHT */}
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Video className="w-5 h-5 text-rose-600" />
                  <span>मॉक इंटरव्यू वीडियो एवं जीवन परिवर्तन सफलता गाथाएं (YouTube)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  छात्रों के लिए वास्तविक मॉक इंटरव्यू और &ldquo;नौकरी मिलने के बाद इनकी लाइफ कितनी चेंज हुई&rdquo; के प्रेरणादायक वीडियो।
                </p>
              </div>

              <button
                onClick={() => onNavigateToScreen('questions')}
                className="text-xs font-black text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All 9 Videos & Practice Questions →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_INTERVIEW_VIDEOS.slice(0, 3).map((vid) => (
                <div
                  key={vid.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div
                      onClick={() => setSelectedVideo(vid)}
                      className="relative aspect-video rounded-xl bg-slate-900 text-white overflow-hidden cursor-pointer flex items-center justify-center group-hover:scale-[1.02] transition-transform"
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5 fill-white" />
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] tabular-nums font-bold">
                        {vid.duration}
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 inline-block">
                      {vid.category}
                    </span>

                    <h4 className="font-black text-slate-900 dark:text-white text-xs line-clamp-2">
                      {vid.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{vid.highlight}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedVideo(vid)}
                      className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Watch</span>
                    </button>

                    <a
                      href={vid.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1"
                    >
                      <span>YouTube ↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. TOP CAMPUS RECRUITERS SPOTLIGHT (24 Companies) */}
          <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span>24 शीर्ष रिक्रूटर्स ड्राइव्स (Civil & CS Placement Partners)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  L&T, Tata Motors, HCLTech, Ashok Leyland, Bajaj Auto, NHPC एवं UK PWD।
                </p>
              </div>

              <button
                onClick={() => onNavigateToScreen('companies')}
                className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All 24 Companies Dossiers →</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
              {[
                { name: 'Larsen & Toubro (L&T)', branch: 'Civil', pkg: 'DET programme' },
                { name: 'HCLTech', branch: 'CS / IT', pkg: 'IT support' },
                { name: 'Tata Projects', branch: 'Civil', pkg: 'Site engineer' },
                { name: 'VVDN Technologies', branch: 'CS / IT', pkg: 'Past recruiter' },
                { name: 'Uttarakhand PWD', branch: 'Civil', pkg: 'JE exam' },
                { name: 'Bharti Airtel', branch: 'CS / IT', pkg: 'Past recruiter' },
              ].map((co, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToScreen('companies')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer space-y-1"
                >
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block">{co.branch}</span>
                  <h5 className="font-black text-xs text-slate-900 dark:text-white truncate">{co.name}</h5>
                  <span className="text-[11px] tabular-nums font-bold text-emerald-600 dark:text-emerald-400 block">{co.pkg}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5. ESSENTIAL LMS QUICK HUBS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Quick Link 1: Resource Library */}
            <div
              onClick={() => onNavigateToScreen('notes')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-xs cursor-pointer transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" />
                  <span>Resource Library</span>
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500">
                Multi-board database, lecture notes, syllabus PDFs, and department/semester search.
              </p>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 block pt-1">
                Browse Academic Library →
              </span>
            </div>

            {/* Quick Link 2: SSC & Govt Jobs */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Govt Job Portals</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs text-slate-500">
                Access official SSC notices and UKPSC/SSC junior engineer recruitments.
              </p>
              <div className="pt-1 flex flex-col gap-1.5 text-xs font-bold">
                <a
                  href="https://ssc.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:underline flex items-center justify-between"
                >
                  <span>SSC Official</span>
                  <span className="tabular-nums text-[10px]">↗</span>
                </a>
                <a
                  href="https://govtjobguru.in/jobs-by-qualification/diploma-freshers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center justify-between"
                >
                  <span>Diploma Freshers Govt Jobs</span>
                  <span className="tabular-nums text-[10px]">↗</span>
                </a>
              </div>
            </div>

            {/* Quick Link 3: Resume Hub & ATS */}
            <div
              onClick={() => onNavigateToScreen('resume')}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-xs cursor-pointer transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Resume Hub & ATS</span>
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-500">
                Upload candidate resumes, maintain document versions, and update professional profiles.
              </p>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block pt-1">
                Open Resume Management →
              </span>
            </div>

            {/* Quick Link 5: Project Architecture & Code Explorer */}
            <div
              onClick={() => {
                if (onOpenCodeExplorer) onOpenCodeExplorer();
                else onNavigateToScreen('code_explorer');
              }}
              className="p-4 rounded-2xl bg-slate-900 text-white border border-cyan-500/30 shadow-xs cursor-pointer hover:border-cyan-400 transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  <span>Project Code Explorer</span>
                </span>
                <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              </div>
              <p className="text-xs text-slate-300">
                Folder-in-folder architecture viewer displaying source code for all modules and parts!
              </p>
              <span className="text-[11px] font-bold text-cyan-300 block pt-1">
                Browse Project Code →
              </span>
            </div>
          </section>
        </div>
      )}

      {/* Global Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-slate-900 text-white border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-rose-400">
                  {selectedVideo.category}
                </span>
                <h3 className="font-black text-sm sm:text-base text-white truncate max-w-xl">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.embedId}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400">Speaker: {selectedVideo.speaker}</span>
                <p className="text-slate-300 text-[11px]">{selectedVideo.highlight}</p>
              </div>
              <a
                href={selectedVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Open in YouTube App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
