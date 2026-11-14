'use client';

/**
 * Online Q&A / Doubts screen: students ask a question on a subject, faculty reply (/api/doubts, refreshed every 20 s).
 */
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { DoubtSession } from '../../lib/types';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  Bot,
  X,
  Code2,
} from 'lucide-react';

export const OnlineQnADoubtsScreen: React.FC = () => {
  const {
    doubtSessions,
    createDoubt,
    replyDoubt,
    resolveDoubt,
    currentUser,
    language,
  } = useCollege();

  const [selectedDoubtId, setSelectedDoubtId] = useState<string>(doubtSessions[0]?.id || '');
  const [replyInput, setReplyInput] = useState('');
  const [isNewDoubtModalOpen, setIsNewDoubtModalOpen] = useState(false);

  // New Doubt Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Database Management Systems (CSE-302)');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAssignedFaculty, setNewAssignedFaculty] = useState('Mrs. Anita (Lecturer CSE)');
  const [searchFilter, setSearchFilter] = useState('');

  const activeDoubt = doubtSessions.find(d => d.id === selectedDoubtId) || doubtSessions[0];

  const filteredDoubts = doubtSessions.filter(d => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.subject.toLowerCase().includes(q) ||
      d.assignedFacultyOrExpert.toLowerCase().includes(q)
    );
  });
  const pg = usePaged(filteredDoubts, 10);

  const [aiResponding, setAiResponding] = useState(false);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeDoubt) return;
    replyDoubt(activeDoubt.id, replyInput.trim());
    setReplyInput('');
  };

  const handleAskAIFaculty = async () => {
    if (!activeDoubt || aiResponding) return;
    setAiResponding(true);
    try {
      const res = await fetch('/api/ai/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeDoubt.questionText,
          subject: activeDoubt.subject,
          studentName: activeDoubt.studentName,
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        replyDoubt(activeDoubt.id, data.answer);
      }
    } catch {
      replyDoubt(
        activeDoubt.id,
        'Academic Guidance: Review the relevant Indian Standard / syllabus specifications and test with sample inputs on the lab console.'
      );
    } finally {
      setAiResponding(false);
    }
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuestionText.trim()) return;
    createDoubt(newTitle.trim(), newSubject, newQuestionText.trim(), newAssignedFaculty);
    setIsNewDoubtModalOpen(false);
    setNewTitle('');
    setNewQuestionText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-indigo-950 text-white border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
                LIVE ACADEMIC Q&A
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                Real-Time Expert Doubt Resolution
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'ऑनलाइन Q&A एवं रियल-टाइम डाउट समाधान' : 'Online Q&A & Real-Time Doubt Resolution'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'यदि किसी विद्यार्थी को कोई विशिष्ट डाउट हो तो वह सीधे अपने विषय विशेषज्ञ अथवा एलुमनाई मेंटर से चैट कर सकता है। लाइव डाउट थ्रेड्स और समाधान ट्रैकिंग।'
                : 'Simple real-time doubt resolution. Ask specific technical doubts directly to faculty lecturers or industry experts with live thread tracking.'}
            </p>
          </div>

          <button
            onClick={() => setIsNewDoubtModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ask New Doubt</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Q&A Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left List of Doubts (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search doubt sessions..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <ShowEntries pg={pg} label="doubts" />
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {pg.pageItems.map((d) => {
              const isSelected = activeDoubt?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoubtId(d.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.createdAt}</span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                    {d.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {d.questionText}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>{d.subject}</span>
                    <span>{d.replies.length} Replies</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Pager pg={pg} />
        </div>

        {/* Right Active Discussion Thread (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between space-y-4">
          {activeDoubt ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {activeDoubt.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeDoubt.status !== 'Resolved' && (
                      <button
                        onClick={() => resolveDoubt(activeDoubt.id)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Expert: {activeDoubt.assignedFacultyOrExpert}
                    </span>
                  </div>
                </div>

                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  {activeDoubt.title}
                </h3>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Student Query ({activeDoubt.studentName} - {activeDoubt.rollNumber}):
                  </span>
                  {activeDoubt.questionText}
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] p-2">
                {activeDoubt.replies.map((rep) => {
                  const isSelf = rep.senderName === currentUser.name;
                  return (
                    <div
                      key={rep.id}
                      className={`flex gap-3 text-xs ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl max-w-lg leading-relaxed ${
                          isSelf
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold mb-1 opacity-80">
                          <span>{rep.senderName} ({rep.senderRole})</span>
                          <span>{rep.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-line">{rep.messageText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions & Reply Input Form */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Direct Expert Chat Active</span>
                  <button
                    type="button"
                    onClick={handleAskAIFaculty}
                    disabled={aiResponding}
                    className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold flex items-center gap-1 hover:bg-purple-100 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span>{aiResponding ? 'Searching...' : 'Consult AI Faculty Assistant'}</span>
                  </button>
                </div>
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Reply to ${activeDoubt.studentName} or ask follow-up...`}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold">Select a doubt session to inspect the thread.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Ask New Doubt */}
      {isNewDoubtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Submit Technical Academic Doubt</span>
              </h3>
              <button onClick={() => setIsNewDoubtModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoubt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Topic *
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Database Management Systems (CSE-302)">Database Management Systems (CSE-302)</option>
                  <option value="Object Oriented Programming C++ (CSE-301)">Object Oriented Programming C++ (CSE-301)</option>
                  <option value="Computer Networks (CSE-401)">Computer Networks (CSE-401)</option>
                  <option value="Concrete Technology & Mix Design (CE-301)">Concrete Technology & Mix Design (CE-301)</option>
                  <option value="Surveying & Field Instruments (CE-302)">Surveying & Field Instruments (CE-302)</option>
                  <option value="Placement Aptitude">Placement Aptitude</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Expert / Faculty Lecturer *
                </label>
                <select
                  value={newAssignedFaculty}
                  onChange={(e) => setNewAssignedFaculty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Mrs. Anita (Lecturer CSE)">Mrs. Anita (Lecturer CSE - Web & Databases)</option>
                  <option value="Mrs. Bhawana Bisht (Lecturer CSE)">Mrs. Bhawana Bisht (Lecturer CSE - Networks & OOP)</option>
                  <option value="Mr. Virendra Singh Taragi (Lecturer Civil)">Mr. Virendra Singh Taragi (Lecturer Civil)</option>
                  <option value="Priya Bisht (Alumni Mentor)">Priya Bisht (Alumni Mentor)</option>
                  <option value="Er. Alok Semwal (L&T Construction Mentor)">Er. Alok Semwal (L&T Construction Mentor)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Doubt Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-Tree index lookup vs hash index performance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Explanation / Code or Equation *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain where you got stuck and what error or confusion you are facing..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDoubtModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md"
                >
                  Submit Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
