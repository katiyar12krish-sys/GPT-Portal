'use client';

import React from 'react';
import { ExternalLink, GraduationCap, Landmark, Briefcase } from 'lucide-react';

// Official result / government-job links used across dashboards.
export const OFFICIAL_LINKS = [
  { label: 'UBTER Result / Student Login', href: 'https://ubterex.in/student_login', tone: 'bg-cyan-700 hover:bg-cyan-600 text-white', icon: GraduationCap },
  { label: 'Diploma Govt Jobs', href: 'https://govtjobguru.in/jobs-by-qualification/diploma-freshers/', tone: 'bg-gold-400 hover:bg-gold-300 text-[#13294b]', icon: Briefcase },
  { label: 'SSC (JE)', href: 'https://ssc.gov.in/', tone: 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200', icon: Landmark },
  { label: 'UKSSSC', href: 'https://sssc.uk.gov.in/', tone: 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200', icon: Landmark },
  { label: 'UKPSC', href: 'https://psc.uk.gov.in/', tone: 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200', icon: Landmark },
  { label: 'NATS Apprenticeship', href: 'https://nats.education.gov.in/', tone: 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200', icon: Briefcase },
  { label: 'NCS Jobs', href: 'https://www.ncs.gov.in/', tone: 'bg-white/90 hover:bg-white text-slate-800 border border-slate-200', icon: Briefcase },
];

export const OfficialLinksBar: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex flex-wrap gap-2">
    {(compact ? OFFICIAL_LINKS.slice(0, 3) : OFFICIAL_LINKS).map(l => {
      const Icon = l.icon;
      return (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-sm transition-colors ${l.tone}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {l.label}
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>
      );
    })}
  </div>
);
