'use client';

/**
 * Videos & Exam Guides (inside Job House → "Videos & Exam Guides"): government vs private job comparison, exam patterns and video masterclasses.
 * Data: src/lib/data/govtJobsAndVideosData.ts.
 */
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import { OfficialLinksBar } from '../layout/OfficialLinksBar';
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import {
  CS_VS_CIVIL_GOVT_JOBS,
  MOCK_INTERVIEW_VIDEOS,
  GOVT_EXAM_PRACTICE_QUESTIONS,
} from '../../lib/data/govtJobsAndVideosData';
import { GovtJobComparison, MockInterviewVideo, GovtExamQuestion } from '../../lib/types';
import {
  Briefcase,
  Building2,
  ExternalLink,
  Award,
  Video,
  Play,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  GraduationCap,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Users,
  FileText,
  Star,
  Info,
} from 'lucide-react';

export const GovtVsPrivateJobsScreen: React.FC = () => {
  const { language, currentUser, loggedInRole, loggedStudent, primaryStudent, recordQuizAttempt } = useCollege();
  const activeStudent = loggedStudent || primaryStudent;

  // Tabs: 'dual_qna' | 'govt_jobs_matrix' | 'interview_videos' | 'practice_exam'
  const [activeTab, setActiveTab] = useState<'govt_jobs_matrix' | 'interview_videos' | 'dual_qna' | 'practice_exam'>('govt_jobs_matrix');

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState<MockInterviewVideo | null>(null);

  // Filter States
  const [branchFilter, setBranchFilter] = useState<'All' | 'Civil Engineering' | 'Computer Science & Engineering'>('All');
  const [videoFilter, setVideoFilter] = useState<'All' | 'Mock' | 'Transformation'>('All');

  // Practice Exam State
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState<boolean>(false);

  // Dual Q&A Track Toggle
  const [qnaTrack, setQnaTrack] = useState<'sarkari' | 'corporate'>('sarkari');

  // Filtered Govt Jobs
  const filteredGovtJobs = CS_VS_CIVIL_GOVT_JOBS.filter((job) => {
    if (branchFilter === 'All') return true;
    if (job.branch === 'Both') return true;
    return job.branch === branchFilter;
  });
  const pgJobs = usePaged(filteredGovtJobs, 10);

  // Filtered Videos
  const filteredVideos = MOCK_INTERVIEW_VIDEOS.filter((vid) => {
    if (videoFilter === 'Mock') {
      return vid.category.includes('Mock') || vid.category.includes('Interview');
    }
    if (videoFilter === 'Transformation') {
      return vid.category.includes('Transformation') || vid.category.includes('Life');
    }
    return true;
  });

  // Filtered Practice Questions
  const filteredQuestions = GOVT_EXAM_PRACTICE_QUESTIONS.filter((q) => {
    if (selectedSubject === 'All') return true;
    return q.subject === selectedSubject;
  });
  const pgQ = usePaged(filteredQuestions, 10);

  const subjectsList = [
    'All',
    'History of Computer & IT',
    'History of India & Uttarakhand',
    'Quantitative Aptitude',
    'Reasoning Ability',
    'General Knowledge & Current Affairs',
    'English & Hindi Grammar',
    'Interview & Personality',
  ];

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    // Count only the first answer to a question towards the Quiz Stats (Placement Hub).
    if (userAnswers[qId] === undefined) {
      const q = filteredQuestions.find((x) => x.id === qId);
      if (q) recordQuizAttempt(qId, optionIdx, optionIdx === q.correctIndex);
    }
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    let wrong = 0;
    filteredQuestions.forEach((q) => {
      if (userAnswers[q.id] !== undefined) {
        if (userAnswers[q.id] === q.correctIndex) {
          correct++;
        } else {
          wrong++;
        }
      }
    });
    return { correct, wrong, totalAttempted: correct + wrong, totalQuestions: filteredQuestions.length };
  };

  const scoreResult = calculateScore();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Official links: UBTER result, SSC, UKSSSC, UKPSC, NATS, NCS */}
      <OfficialLinksBar />

      {/* 1. TOP HERO: Training & Placement Cell Career Command Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#13294b] text-white p-6 sm:p-8 border border-cyan-500/30 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b] shadow-xs">
                  TRAINING & PLACEMENT CELL (TPO HUB)
                </span>
                <span className="text-xs text-cyan-300 font-mono">
                  UGIP Tanakpur • UBTER Code: 090
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  90.6% placed in 2025-26
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {language === 'hi'
                  ? 'प्लेसमेंट पोर्टल: सरकारी भर्ती बनाम कॉर्पोरेट प्लेसमेंट हब'
                  : 'Placement Portal: Govt Vacancies vs Corporate Placement Command'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'hi'
                  ? 'डिप्लोमा फ्रेशर्स के लिए यूकेपीएससी, एसएससी जेई, आरआरबी, एनएचपीसी व डीआरडीओ सरकारी नौकरियां, 24 शीर्ष कॉर्पोरेट रिक्रूटर्स, मॉक इंटरव्यू वीडियो मास्टरक्लास, एवं 6-डोमेन अभ्यास परीक्षा।'
                  : 'Centralized placement portal for diploma candidates featuring UKPSC, SSC JE, RRB & DRDO government opportunities, 24 core corporate recruiters, mock interview video masterclasses, and 6-domain test arena.'}
              </p>
            </div>

            {/* TWO DIRECT PROMINENT BUTTONS REQUESTED BY USER */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              {/* Button 1: Diploma Ke Baad Government Job */}
              <a
                href="https://govtjobguru.in/jobs-by-qualification/diploma-freshers/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-between gap-3 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <Award className="w-5 h-5 shrink-0 text-slate-950" />
                  <div>
                    <span className="block text-[11px] leading-tight font-black">
                      डिप्लोमा के बाद गवर्नमेंट जॉब
                    </span>
                    <span className="block text-[9px] opacity-80 font-bold">
                      GovtJobGuru.in (Live Notifications)
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Button 2: SSC Official */}
              <a
                href="https://ssc.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-between gap-3 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <Briefcase className="w-5 h-5 shrink-0 text-cyan-200" />
                  <div>
                    <span className="block text-[11px] leading-tight font-black">
                      SSC Official
                    </span>
                    <span className="block text-[9px] opacity-80 font-bold">
                      Latest Forms, Admit Cards & Results
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block">Highest Package</span>
              <span className="text-lg font-black font-mono text-cyan-400">₹3.60 LPA</span>
              <span className="text-[9px] text-slate-400 block">L&T / TCS NQT</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Core Recruiters</span>
              <span className="text-lg font-black font-mono text-amber-400">24 Companies</span>
              <span className="text-[9px] text-slate-400 block">12 Civil + 12 CS</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Govt Job Openings</span>
              <span className="text-lg font-black font-mono text-emerald-400">SSC · RRB · UKSSSC</span>
              <span className="text-[9px] text-slate-400 block">UKPSC, SSC JE, RRB</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Mock Interviews</span>
              <span className="text-lg font-black font-mono text-rose-400">9 Video Masterclasses</span>
              <span className="text-[9px] text-slate-400 block">Technical + Life Stories</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NAVIGATION TABS: Switch between Placement Capabilities */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('govt_jobs_matrix')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'govt_jobs_matrix'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>CS vs Civil सरकारी नौकरियां (Matrix)</span>
        </button>

        <button
          onClick={() => setActiveTab('interview_videos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'interview_videos'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>मॉक इंटरव्यू व सफलता वीडियो (9 Videos)</span>
        </button>

        <button
          onClick={() => setActiveTab('dual_qna')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dual_qna'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>2 Q&A ट्रैक: सरकारी vs प्राइवेट</span>
        </button>

        <button
          onClick={() => setActiveTab('practice_exam')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'practice_exam'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>6-डोमेन अभ्यास परीक्षा (Live Test & Score)</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: CS VS CIVIL GOVT JOBS MATRIX */}
      {activeTab === 'govt_jobs_matrix' && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                डिप्लोमा फ्रेशर्स के लिए सरकारी नौकरियों का वार्षिक विश्लेषण (CS vs Civil)
              </h3>
              <p className="text-xs text-slate-500">
                UKPSC, SSC JE, RRB, NHPC, DRDO CEPTAM, NIC व ISRO में वेतनमान, पद संख्या एवं चयन प्रक्रिया।
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">शाखा चुनें:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Branches (सभी शाखाएं)</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <ShowEntries pg={pgJobs} label="jobs" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pgJobs.pageItems.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-colors space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        job.branch === 'Civil Engineering'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : job.branch === 'Computer Science & Engineering'
                          ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}
                    >
                      {job.branch}
                    </span>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">
                      {job.agencyName}
                    </h4>
                  </div>

                  <a
                    href={job.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-cyan-600 transition-colors"
                    title="Official Recruitment Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">वार्षिक अनुमानित पद</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      ~{job.typicalAnnualSeats} Seats
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block">वेतनमान (Pay Scale)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {job.payScale.split('(')[0]}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 text-[11px]">न्यूनतम योग्यता:</span>
                    <p className="text-slate-700 dark:text-slate-300">{job.qualification}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 text-[11px]">परीक्षा पैटर्न:</span>
                    <p className="text-slate-700 dark:text-slate-300">{job.examPattern}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 text-[11px]">प्रमुख विभाग:</span>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.departments.map((dept, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300"
                        >
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/50 dark:border-cyan-800/50 text-[11px] text-cyan-900 dark:text-cyan-200">
                    <strong className="block font-black text-cyan-800 dark:text-cyan-300">
                      टनकपुर डिप्लोमा छात्रों हेतु विशेष मार्गदर्शन:
                    </strong>
                    {job.tipsForDiploma}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pager pg={pgJobs} />
        </div>
      )}

      {/* TAB 2: MOCK INTERVIEW VIDEOS & SUCCESS MASTERCLASS */}
      {activeTab === 'interview_videos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                मॉक इंटरव्यू वीडियो एवं जीवन परिवर्तन सफलता गाथाएं (YouTube Masterclass)
              </h3>
              <p className="text-xs text-slate-500">
                छात्रों के प्लेसमेंट इंटरव्यू की तैयारी तथा नौकरी मिलने के बाद जीवन में आए बदलाव की वास्तविक कहानियां।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVideoFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  videoFilter === 'All'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All (सभी 9)
              </button>
              <button
                onClick={() => setVideoFilter('Mock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  videoFilter === 'Mock'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                मॉक इंटरव्यू
              </button>
              <button
                onClick={() => setVideoFilter('Transformation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  videoFilter === 'Transformation'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                सफलता की कहानियां
              </button>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((vid) => {
              const isStory = vid.category.includes('Life') || vid.category.includes('Transformation');
              return (
                <div
                  key={vid.id}
                  className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col justify-between space-y-3 group ${
                    isStory
                      ? 'border-amber-400/50 hover:border-amber-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Thumbnail banner simulator */}
                    <div
                      onClick={() => setSelectedVideo(vid)}
                      className="relative aspect-video rounded-2xl bg-slate-900 text-white overflow-hidden cursor-pointer flex items-center justify-center border border-white/10 group-hover:scale-[1.02] transition-transform"
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <div className="relative z-10 w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 ml-0.5 fill-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold">
                        {vid.duration}
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[9px] uppercase font-black text-cyan-300">
                        {vid.branch}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block ${
                          isStory
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {vid.category}
                      </span>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-2">
                        {vid.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{vid.description}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-slate-400 text-[10px] block">प्रमुख सीख / Highlight:</span>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{vid.highlight}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">
                      {vid.speaker}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedVideo(vid)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Watch Video</span>
                      </button>

                      <a
                        href={vid.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Open directly on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Video Modal Player */}
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

                {/* Embedded YouTube Iframe */}
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
      )}

      {/* TAB 3: DUAL Q&A TRACK (Sarkari Job vs Corporate Private Track) */}
      {activeTab === 'dual_qna' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                2 Q&A ट्रैक: सरकारी नौकरी बनाम प्राइवेट कॉर्पोरेट प्लेसमेंट
              </h3>
              <p className="text-xs text-slate-500">
                एक ही पोर्टल में दोनों ट्रैक उपलब्ध हैं — अपनी लक्ष्य अनुसार तैयारी करें।
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <button
                onClick={() => setQnaTrack('sarkari')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  qnaTrack === 'sarkari'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>ट्रैक 1: सरकारी जॉब (UKPSC / SSC JE)</span>
              </button>

              <button
                onClick={() => setQnaTrack('corporate')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  qnaTrack === 'corporate'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>ट्रैक 2: प्राइवेट कॉर्पोरेट (L&T / HCLTech)</span>
              </button>
            </div>
          </div>

          {/* Sarkari Track Content */}
          {qnaTrack === 'sarkari' ? (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-base">
                    सरकारी इंजीनियरिंग परीक्षा प्रश्न बैंक (उत्तराखंड विशेष)
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    UKPSC JE Civil/CS, SSC JE, RRB JE, NHPC, UKSSSC तकनीकी सहायक एवं राज्य PWD भर्ती हेतु संकलित।
                  </p>
                </div>

                <a
                  href="https://govtjobguru.in/jobs-by-qualification/diploma-freshers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0 flex items-center gap-1.5"
                >
                  <span>Check Latest Vacancies ↗</span>
                </a>
              </div>

              {/* Sarkari Q&A items */}
              <div className="space-y-3">
                {GOVT_EXAM_PRACTICE_QUESTIONS.slice(0, 6).map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {q.examBadge}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{q.subject}</span>
                    </div>

                    <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                      Q{idx + 1}. {q.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border font-medium ${
                            oIdx === q.correctIndex
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                          {oIdx === q.correctIndex && (
                            <span className="ml-2 text-emerald-600 dark:text-emerald-400 text-[10px]">
                              ✓ सही उत्तर
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        व्याख्या (Explanation):
                      </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Corporate Private Track Content */
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-950 dark:text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-base">
                    कॉर्पोरेट कैंपस प्लेसमेंट प्रश्न बैंक (24 Core Recruiters)
                  </h4>
                  <p className="text-xs text-cyan-800 dark:text-cyan-300">
                    L&T Site Engineer, HCLTech, Bajaj Auto, Tata Motors एवं Tata Projects के लिए तकनीकी व एचआर प्रश्न।
                  </p>
                </div>

                <a
                  href="https://ssc.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shrink-0 flex items-center gap-1.5"
                >
                  <span>Industry Drives ↗</span>
                </a>
              </div>

              {/* Corporate Q&A Sample */}
              <div className="space-y-3">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      IT support interview
                    </span>
                    <span className="text-xs font-bold text-slate-400">Object Oriented Programming</span>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    Q1. Polymorphism kya hai aur Compile-time vs Run-time polymorphism me kya antar hai?
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                    <p>
                      <strong>Answer:</strong> Polymorphism ka arth hai &ldquo;many forms&rdquo;. Ek hi function ya operator alag alag contexts me alag behave karta hai.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li><strong>Compile-time Polymorphism:</strong> Method overloading ya Operator overloading se hota hai. Early binding kehlati hai.</li>
                      <li><strong>Run-time Polymorphism:</strong> Method overriding aur virtual functions se implement hota hai. Late binding kehlati hai.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      L&T Construction / Tata Projects
                    </span>
                    <span className="text-xs font-bold text-slate-400">Civil Engineering Site Practical</span>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    Q2. Concrete Slump Test kyun kiya jata hai aur RCC Beams ke liye standard slump value kya honi chahiye?
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                    <p>
                      <strong>Answer:</strong> Slump test fresh concrete ki workability aur water-cement ratio consistency check karne ke liye site par kiya jata hai.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Heavily reinforced sections aur beams ke liye recommended slump 75mm se 100mm hota hai (medium workability as per IS 456).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: 6-DOMAIN INTERACTIVE PRACTICE EXAM */}
      {activeTab === 'practice_exam' && (
        <div className="space-y-6">
          {/* Header & Subject Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                6-डोमेन अभ्यास परीक्षा (Real-Time Quiz & Analytics)
              </h3>
              <p className="text-xs text-slate-500">
                कंप्यूटर इतिहास, भारत व उत्तराखंड इतिहास, गणित, तर्कशक्ति, करंट अफेयर्स, व्याकरण एवं इंटरव्यू प्रश्न।
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">विषय चुनें:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {subjectsList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Scorecard Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                {scoreResult.totalAttempted}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black">कुल हल किए प्रश्न</span>
                <p className="text-sm font-black text-white">
                  {scoreResult.totalAttempted} / {scoreResult.totalQuestions} Questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">सही उत्तर (Correct)</span>
                <span className="text-lg font-black font-mono text-emerald-400">{scoreResult.correct}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">गलत उत्तर (Wrong)</span>
                <span className="text-lg font-black font-mono text-rose-400">{scoreResult.wrong}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Accuracy %</span>
                <span className="text-lg font-black font-mono text-amber-400">
                  {scoreResult.totalAttempted > 0
                    ? Math.round((scoreResult.correct / scoreResult.totalAttempted) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setUserAnswers({});
                setSubmittedQuiz(false);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
            >
              Reset Quiz
            </button>
          </div>

          {/* Questions List */}
          <ShowEntries pg={pgQ} label="questions" />
          <div className="space-y-4">
            {pgQ.pageItems.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-colors space-y-3 ${
                    isAnswered
                      ? isCorrect
                        ? 'border-emerald-500/60 shadow-xs'
                        : 'border-rose-500/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {q.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-400">• {q.topic}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {q.examBadge}
                    </span>
                  </div>

                  <p className="font-black text-slate-900 dark:text-white text-base">
                    Q{idx + 1}. {q.question}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isThisSelected = selectedOpt === oIdx;
                      const isThisCorrect = oIdx === q.correctIndex;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(q.id, oIdx)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isAnswered
                              ? isThisCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold'
                                : isThisSelected
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-950 dark:text-rose-100 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isAnswered && (
                            <div>
                              {isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              {isThisSelected && !isThisCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after answered */}
                  {isAnswered && (
                    <div
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50'
                      }`}
                    >
                      <strong className="block font-black">
                        {isCorrect ? '✓ शाबाश! सही उत्तर' : '✗ गलत उत्तर — सही व्याख्या देखें:'}
                      </strong>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pager pg={pgQ} />
        </div>
      )}
    </div>
  );
};
