'use client';

/**
 * Older interview Q&A screen (company-wise questions); the main practice screen is tracker/PlacementQnaPracticeScreen.tsx.
 */
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { InterviewQA } from '../../lib/types';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
  ThumbsUp,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  Award,
  Briefcase,
  Video,
} from 'lucide-react';

export const PlacementQuestionsScreen: React.FC = () => {
  const { interviewQuestions, language } = useCollege();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Civil Engineering' | 'Computer Science' | 'HR & Behavioral'>('All');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(interviewQuestions[0]?.id || null);
  const [testModeHideAnswers, setTestModeHideAnswers] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredQuestions = interviewQuestions.filter(q => {
    if (selectedCategory !== 'All' && q.category !== selectedCategory) return false;
    if (selectedCompanyFilter !== 'All' && !q.companyTags.includes(selectedCompanyFilter)) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchQ = q.question.toLowerCase().includes(query);
      const matchA = q.answer.toLowerCase().includes(query);
      const matchSub = (q.subCategory || '').toLowerCase().includes(query);
      const matchTags = q.companyTags.some(t => t.toLowerCase().includes(query));
      if (!matchQ && !matchA && !matchSub && !matchTags) return false;
    }
    return true;
  });
  const pg = usePaged(filteredQuestions, 10);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleCopyQA = (q: InterviewQA) => {
    const text = `Q: ${q.question}\n\nAnswer: ${q.answer}\n\nKey Concepts: ${q.keyConcepts.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const topCompanies = ['All', 'NHPC', 'L&T', 'TCS', 'Infosys', 'UK PWD', 'Wipro', 'Tata Projects', 'BRO/GREF'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-amber-950 text-white border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                260+ PLACEMENT VIVA QUESTIONS
              </span>
              <span className="text-xs text-amber-300 font-mono">
                Click Any Question to Open In-Place
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? '260+ प्लेसमेंट एवं वाइवा प्रश्न बैंक' : '260+ Placement & Technical Viva Question Bank'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'सिविल, कम्प्यूटर साइंस, एवं सामान्य एचआर के 260 से अधिक वास्तविक प्रश्न। किसी भी प्रश्न पर क्लिक करते ही उसका सम्पूर्ण उत्तर, तकनीकी सूत्र और कंपनी टैग्स वहीं खुलेंगे।'
                : 'Comprehensive library of 260+ verified interview questions for diploma graduates. Click any question to expand full model answer directly in place.'}
            </p>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://govtjobguru.in/jobs-by-qualification/diploma-freshers/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>डिप्लोमा के बाद गवर्नमेंट जॉब (GovtJobGuru) ↗</span>
              </a>

              <a
                href="https://ssc.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>SSC Official ↗</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => setTestModeHideAnswers(!testModeHideAnswers)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer ${
                testModeHideAnswers
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {testModeHideAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{testModeHideAnswers ? 'Test Mode (Answers Hidden)' : 'Study Mode (Answers Visible)'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            All Questions ({interviewQuestions.length})
          </button>
          <button
            onClick={() => setSelectedCategory('Civil Engineering')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'Civil Engineering'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Civil Engineering (100)
          </button>
          <button
            onClick={() => setSelectedCategory('Computer Science')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'Computer Science'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Computer Science (100)
          </button>
          <button
            onClick={() => setSelectedCategory('HR & Behavioral')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'HR & Behavioral'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            HR & Aptitude (60)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 260+ questions by keyword (e.g., slump, SQL, NATM, B-Tree, TCP, beam)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        {/* Company Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-semibold scrollbar-none">
          <span className="text-slate-400 shrink-0 text-[11px]">Company:</span>
          {topCompanies.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCompanyFilter(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                selectedCompanyFilter === c
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List (Expandable In-Place) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
          <span>Showing {filteredQuestions.length} technical viva questions</span>
          <span>Click any question bar to open / collapse answer</span>
        </div>

        <ShowEntries pg={pg} label="questions" />
        {pg.pageItems.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          const isCopied = copiedId === q.id;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-amber-400/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              {/* Question Header (Always Visible & Clickable) */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      #{pg.offset + idx + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {q.category}
                    </span>
                    {q.subCategory && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        • {q.subCategory}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {q.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h3>

                  {/* Company Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {q.companyTags.map((tag, ti) => (
                      <span
                        key={ti}
                        className="px-2 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 hidden sm:inline">
                    {isExpanded ? 'Collapse' : 'View Answer'}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* In-Place Expanded Model Answer & Analysis */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  {!testModeHideAnswers ? (
                    <>
                      {/* Model Answer Body */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                          Comprehensive Model Answer (UBTER / Campus Examiner Approved):
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                          {q.answer}
                        </p>
                      </div>

                      {/* Key Concepts and Takeaways */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                            Key Concepts Expected:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {q.keyConcepts.map((kc, kci) => (
                              <span
                                key={kci}
                                className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold"
                              >
                                {kc}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-1">
                          <span className="font-bold text-blue-800 dark:text-blue-300 block">
                            Examiner Key Takeaway:
                          </span>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300">
                            {q.keyTakeaway}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-center space-y-2">
                      <HelpCircle className="w-8 h-8 text-amber-600 mx-auto" />
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Test Mode Active
                      </h4>
                      <p className="text-xs text-slate-500">
                        Try answering aloud or in rough notes first! Click below when ready to inspect the official model answer.
                      </p>
                      <button
                        onClick={() => setTestModeHideAnswers(false)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        Reveal Model Answer
                      </button>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 text-[11px]">
                      Answered by: <strong>{q.answeredBy}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyQA(q)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied Q&A!' : 'Copy to Clipboard'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              No questions matched your search query.
            </p>
            <p className="text-xs">
              Try searching for &quot;IS 456&quot;, &quot;slump&quot;, &quot;SQL&quot;, &quot;BBS&quot;, or &quot;OOPs&quot;.
            </p>
          </div>
        )}
        <Pager pg={pg} />
      </div>
    </div>
  );
};
