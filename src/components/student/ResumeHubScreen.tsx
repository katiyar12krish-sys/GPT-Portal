'use client';

/**
 * Resume Hub & ATS screen: resume builder / manager (ResumeManagementModule) with ATS tips.
 */
import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { ResumeManagementModule } from './ResumeManagementModule';
import { FileText, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';

interface ResumeHubScreenProps {
  onBackToOverview?: () => void;
}

export const ResumeHubScreen: React.FC<ResumeHubScreenProps> = ({ onBackToOverview }) => {
  const { loggedStudent, primaryStudent, currentUser, loggedInRole } = useCollege();
  const activeStudent = loggedStudent || primaryStudent;

  return (
    <div className="space-y-6">
      {/* Resume Hub Banner */}
      <div className="p-6 rounded-3xl bg-[#13294b] text-white border-b-4 border-gold-500 shadow-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gold-300 text-[#13294b]">
              OFFICIAL CAREER PORTFOLIO & RESUME HUB
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Resume Management & ATS Optimization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Candidate: <strong className="text-white">{activeStudent.aadharName}</strong> • Roll: <span className="font-mono text-cyan-300">{activeStudent.ubterRollNumber}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://ssc.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>SSC Official</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Resume Management Module */}
      <ResumeManagementModule student={activeStudent} />
    </div>
  );
};
