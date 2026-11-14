'use client';

/**
 * Core Recruiters screen: profiles of the main CSE and Civil recruiters (roles, eligibility, process, salary). Data: src/lib/data/placementData.ts.
 */
import { ExportButtons } from '../ui/ExportButtons';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { CompanyDetailProfile, AlumniMentor } from '../../lib/types';
import {
  Briefcase,
  Building2,
  Search,
  ExternalLink,
  MapPin,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Sparkles,
  HelpCircle,
  Clock,
  Star,
  MessageSquare,
  X,
} from 'lucide-react';

interface PlacementCompaniesScreenProps {
  onOpenQuestionsHub?: () => void;
}

export const PlacementCompaniesScreen: React.FC<PlacementCompaniesScreenProps> = ({
  onOpenQuestionsHub,
}) => {
  const {
    civilCompanies,
    cseCompanies,
    allCompanies,
    alumniMentors,
    bookMentorshipSession,
    language,
  } = useCollege();

  const [activeTab, setActiveTab] = useState<'civil' | 'cse' | 'mentors'>('civil');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyModal, setSelectedCompanyModal] = useState<CompanyDetailProfile | null>(null);
  const [bookingMentor, setBookingMentor] = useState<AlumniMentor | null>(null);
  const [bookingTopic, setBookingTopic] = useState('Campus Interview Preparation & Technical Viva Advice');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const displayedCompanies = activeTab === 'civil'
    ? civilCompanies
    : activeTab === 'cse'
    ? cseCompanies
    : allCompanies;

  const filteredCompanies = displayedCompanies.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.hiringRoles.some(r => r.toLowerCase().includes(q)) ||
      c.about.toLowerCase().includes(q)
    );
  });
  const pg = usePaged(filteredCompanies, 10);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;
    bookMentorshipSession(bookingMentor.id, bookingTopic);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingMentor(null);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-blue-950 text-white border border-blue-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white">
                DIPLOMA RECRUITMENT CELL
              </span>
              <span className="text-xs text-blue-300 font-mono">
                12 Civil + 12 CS Companies & Mentors
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' ? 'प्लेसमेंट पोर्टल: सिविल एवं कम्प्यूटर साइंस कंपनियां' : 'Placement Portal: 24 Core Companies & Alumni Mentors'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {language === 'hi'
                ? 'कम से कम 10 सिविल (L&T, NHPC, THDC, UK PWD आदि) एवं 10 कम्प्यूटर साइंस (HCLTech, VVDN, Airro, HCLTech आदि) कंपनियों की सम्पूर्ण जानकारी, पैकेज, चयन प्रक्रिया एवं एलुमनाई मेंटरशिप प्रोग्राम।'
                : 'Verified recruiters for 3-year diploma engineers with package slabs, training stipends, eligibility criteria, and 1-on-1 industry mentorship.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenQuestionsHub && (
              <button
                onClick={onOpenQuestionsHub}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'hi' ? '260+ प्रश्न बैंक खोलें' : 'Open 260+ Viva Questions'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: Civil (12) | CSE (12) | Mentorship Program */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('civil')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'civil'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Civil Engineering Companies ({civilCompanies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('cse')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cse'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Computer Science Companies ({cseCompanies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'mentors'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Alumni Networking & Industry Mentorship ({alumniMentors.length})</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {activeTab !== 'mentors' && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies by name, package, hiring role, project location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* VIEW: Companies Grid (Civil or CSE) */}
      {activeTab !== 'mentors' && (
        <>
          <ExportButtons dataset="recruiters" label="Download all recruiters:" />
          <ShowEntries pg={pg} label="companies" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pg.pageItems.map((comp) => (
            <div
              key={comp.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      comp.jobType === 'Government'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {comp.jobType === 'Government' ? 'Sarkari / PSU' : 'Private MNC'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{comp.sector}</span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {comp.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{comp.location}</span>
                  </div>
                </div>

                {/* Salary & Stipend Card */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Package:</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {comp.packageRange}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Stipend:</span>
                    <span className="font-mono font-bold">{comp.stipendDuringTraining.slice(0, 24)}...</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {comp.about}
                </p>

                {/* Roles Tags */}
                <div className="flex flex-wrap gap-1">
                  {comp.hiringRoles.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCompanyModal(comp)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  View Details & Questions
                </button>
                {comp.careersUrl && (
                <a
                  href={comp.careersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Careers</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <Pager pg={pg} />
        </>
      )}

      {/* VIEW: Alumni Mentorship & Guidance Program */}
      {activeTab === 'mentors' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <strong className="block text-sm font-black">Official Industry Mentorship Program</strong>
                <span>Connect directly with alumni currently working at L&T, NHPC, UK PWD, TCS, and Infosys.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {alumniMentors.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base">
                        {m.name}
                      </h3>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {m.designation} • {m.companyName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Batch {m.graduationYear} ({m.branch}) • {m.location}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    ★ {m.rating} ({m.totalMenteesHelped} Mentees)
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.bio}
                </p>

                {/* Domain Expertise */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Mentorship Domains:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.domainExpertise.map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Availability: <strong>{m.availability}</strong>
                  </span>
                  <button
                    onClick={() => setBookingMentor(m)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book 1-on-1 Guidance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Company Full Profile & Sample Questions */}
      {selectedCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {selectedCompanyModal.sector}
                </span>
                <h3 className="font-black text-lg text-slate-900 dark:text-white mt-1">
                  {selectedCompanyModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <p>{selectedCompanyModal.about}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-0.5">Salary Package:</strong>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {selectedCompanyModal.packageRange}
                  </span>
                </div>
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-0.5">Training Stipend:</strong>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {selectedCompanyModal.stipendDuringTraining}
                  </span>
                </div>
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-0.5">Eligibility:</strong>
                  <span>{selectedCompanyModal.eligibility}</span>
                </div>
                <div>
                  <strong className="block text-slate-900 dark:text-white mb-0.5">Selection Flow:</strong>
                  <span>{selectedCompanyModal.selectionProcess}</span>
                </div>
              </div>

              <div>
                <strong className="block font-bold text-slate-900 dark:text-white mb-1.5">
                  Sample Technical Viva Questions Asked by this Recruiter:
                </strong>
                <ul className="space-y-1.5 pl-4 list-disc text-slate-600 dark:text-slate-300">
                  {selectedCompanyModal.sampleQuestions.map((q, idx) => (
                    <li key={idx} className="font-medium">{q}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>Uttarakhand & Key Projects:</strong> {selectedCompanyModal.keyProjectsOrClients}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              {selectedCompanyModal.careersUrl && (
              <a
                href={selectedCompanyModal.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <span>Official Careers Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              )}
              <button
                onClick={() => setSelectedCompanyModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Book Mentorship Session */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Schedule Mentorship Session
                </h3>
                <p className="text-xs text-slate-500">
                  Mentor: {bookingMentor.name} ({bookingMentor.companyName})
                </p>
              </div>
              <button onClick={() => setBookingMentor(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  Mentorship Request Sent!
                </h4>
                <p className="text-xs text-slate-500">
                  {bookingMentor.name} will connect with you via email / portal meeting link.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Guidance Topic / Discussion Need *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    placeholder="Describe your doubt, resume questions, or mock interview preparation..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div>Candidate: <strong>Anurag Mourya</strong> (Roll: 24090050007)</div>
                  <div>Mode: <strong>1-on-1 Virtual / Telephonic Session</strong></div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMentor(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
