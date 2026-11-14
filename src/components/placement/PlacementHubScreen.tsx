'use client';

/**
 * Placement Hub: tabs for placement companies, city-wise companies, resource library, quiz stats and mentorship booking.
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { MapPin, Building2, MessageSquareQuote, Library, BarChart3, CalendarCheck } from 'lucide-react';
import { RegionalCompaniesTab } from './hub/RegionalCompaniesTab';
import { ResourcesTab } from './hub/ResourcesTab';
import { QuizStatsTab } from './hub/QuizStatsTab';
import { MentorshipTab } from './hub/MentorshipTab';
import { CityCompaniesTab } from './hub/CityCompaniesTab';
import { CITY_COMPANIES } from '../../lib/data/cityCompaniesData';

type HubTab = 'companies' | 'cities' | 'resources' | 'quiz' | 'mentorship';

interface Props {
  onOpenCoreRecruiters?: () => void;
  onOpenMockTests?: () => void;
  onOpenGovtJobs?: () => void;
  onOpenResumeHub?: () => void;
  initialTab?: HubTab;
}

export const PlacementHubScreen: React.FC<Props> = ({
  onOpenCoreRecruiters,
  onOpenMockTests,
  onOpenGovtJobs,
  onOpenResumeHub,
  initialTab = 'companies',
}) => {
  const { language, mentorshipBookings, quizStats } = useCollege();
  const [tab, setTab] = useState<HubTab>(initialTab);

  const activeBookings = mentorshipBookings.filter(b => b.status === 'Requested' || b.status === 'Confirmed').length;

  const tabs: Array<{ id: HubTab; en: string; hi: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
    { id: 'companies', en: 'Placement Companies', hi: 'प्लेसमेंट कंपनियां', icon: Building2 },
    { id: 'cities', en: 'City-wise Companies', hi: 'शहर-वार कंपनियां', icon: MapPin, badge: String(CITY_COMPANIES.length) },
    { id: 'resources', en: 'Resource Library', hi: 'रिसोर्स लाइब्रेरी', icon: Library },
    { id: 'quiz', en: 'Quiz Stats', hi: 'क्विज़ स्टैट्स', icon: BarChart3, badge: `${quizStats.accuracyPercentage}%` },
    { id: 'mentorship', en: 'Mentorship Booking', hi: 'मेंटरशिप बुकिंग', icon: CalendarCheck, badge: activeBookings ? String(activeBookings) : undefined },
  ];

  return (
    <div className="space-y-6">
      <header className="p-6 rounded-3xl bg-[#13294b] text-white border-b-4 border-gold-500 shadow-xl space-y-4">
        <div className="space-y-1.5">
          <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b]">
            {language === 'hi' ? 'प्लेसमेंट हब' : 'Placement Hub'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {language === 'hi'
              ? 'कंपनियां, इंटरव्यू तैयारी, क्विज़ और मेंटरशिप – एक जगह'
              : 'Companies, interview prep, quizzes and mentorship – in one place'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {language === 'hi'
              ? 'उत्तराखंड, दिल्ली-NCR और आसपास के शहरों की कंपनियां, UGIP टनकपुर का पिछले 5 साल का प्लेसमेंट रिकॉर्ड, और अलुमनाई मेंटर बुकिंग।'
              : 'Recruiters from Uttarakhand, Delhi-NCR and nearby cities, UGIP Tanakpur\'s 5-year placement record, and alumni mentor booking.'}
          </p>
        </div>

        <div role="tablist" aria-label="Placement hub sections" className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-xl whitespace-nowrap flex items-center gap-2 cursor-pointer transition-colors ${
                  active ? 'bg-white text-slate-950 font-black shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{language === 'hi' ? t.hi : t.en}</span>
                {t.badge && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? 'bg-cyan-100 text-cyan-800' : 'bg-white/20 text-white'}`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div role="tabpanel">
        {tab === 'companies' && <RegionalCompaniesTab onOpenCoreRecruiters={onOpenCoreRecruiters} />}
        {tab === 'cities' && <CityCompaniesTab />}
        {tab === 'resources' && <ResourcesTab onOpenResumeHub={onOpenResumeHub} />}
        {tab === 'quiz' && <QuizStatsTab onOpenMockTests={onOpenMockTests} onOpenGovtJobs={onOpenGovtJobs} />}
        {tab === 'mentorship' && <MentorshipTab />}
      </div>
    </div>
  );
};
