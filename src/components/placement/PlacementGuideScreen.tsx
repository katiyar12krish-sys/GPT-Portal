'use client';

import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { ScreenHeader, btnGhost } from '../tracker/TrackerUi';
import { PlacementGuidanceTab, SalaryGuideTab } from './hub/PlacementGuideTab';

// Placement Guidance and Salary Guide are separate pages, each with its own menu item; each links to the other.

export const PlacementGuideScreen: React.FC<{ part: 'guidance' | 'salary'; onSwitch?: () => void }> = ({ part, onSwitch }) => {
  const { language } = useCollege();
  const hi = language === 'hi';
  const salary = part === 'salary';

  return (
    <div className="space-y-6">
      <ScreenHeader
        badge={salary ? (hi ? 'सैलरी गाइड' : 'Salary Guide') : hi ? 'प्लेसमेंट गाइडेंस' : 'Placement Guidance'}
        title={
          salary
            ? hi ? 'डिप्लोमा के बाद कितनी सैलरी मिलती है' : 'How much you earn after a diploma'
            : hi ? 'नौकरी कैसे पाएँ और अच्छी नौकरी कैसे चुनें' : 'How to get a job and choose a good one'
        }
        subtitle={
          salary
            ? 'Starting pay for CSE and Civil, government and PSU pay levels, how salary grows, and a CTC to in-hand calculator.'
            : 'Your readiness score, how a placement drive works, what recruiters check, fake-job warnings, documents and life after joining.'
        }
      >
        {onSwitch && (
          <button onClick={onSwitch} className={`${btnGhost} !bg-white/10 !text-white !border-white/20`}>
            {salary ? (hi ? 'प्लेसमेंट गाइडेंस देखें →' : 'Open Placement Guidance →') : hi ? 'सैलरी गाइड देखें →' : 'Open Salary Guide →'}
          </button>
        )}
      </ScreenHeader>
      {salary ? <SalaryGuideTab /> : <PlacementGuidanceTab />}
    </div>
  );
};
