'use client';

/**
 * Pop-up listing the keyboard shortcuts (opened from the footer or Alt + ?).
 */
import React from 'react';
import { useCollege } from '../../context/CollegeContext';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useCollege();
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Alt + 0', desc: language === 'hi' ? 'सभी डैशबोर्ड्स हब (Overview)' : 'Overview / All Dashboards Hub' },
    { key: 'Alt + 1', desc: language === 'hi' ? 'विद्यार्थी पोर्टफोलियो (अनुराग मौर्य)' : 'Student Portfolios (Anurag)' },
    { key: 'Alt + 2', desc: language === 'hi' ? 'कक्षा एक्सेल शीट जनरेटर' : 'Class Excel Sheet Generator' },
    { key: 'Alt + 3', desc: language === 'hi' ? 'प्लेसमेंट 24 कंपनियां (10 सिविल + 10 CS)' : 'Placement 24 Companies' },
    { key: 'Alt + 4', desc: language === 'hi' ? '260+ वाइवा प्रश्न बैंक' : '260+ Viva Questions Bank' },
    { key: 'Alt + 5', desc: language === 'hi' ? 'ऑनलाइन Q&A एवं लाइव डाउट्स' : 'Online Q&A & Live Doubts' },
    { key: 'Alt + 6', desc: language === 'hi' ? 'अनुकूलनीय मॉक टेस्ट' : 'Adaptive Mock Tests' },
    { key: 'Alt + 7', desc: language === 'hi' ? 'असाइनमेंट 3-रिमाइंडर ट्रैकर' : '3-Reminder Assignments' },
    { key: 'Alt + 8', desc: language === 'hi' ? 'उपस्थिति विश्लेषण' : 'Attendance Analytics' },
    { key: 'Alt + 9', desc: language === 'hi' ? 'फैकल्टी पोर्टल (RBAC)' : 'Faculty Portal (RBAC)' },
    { key: 'Alt + D', desc: language === 'hi' ? 'डार्क / लाइट थीम टॉगल' : 'Toggle Dark / Light Theme' },
    { key: 'Alt + H', desc: language === 'hi' ? 'हाई कंट्रास्ट मोड' : 'Toggle High Contrast (WCAG AAA)' },
    { key: 'Esc', desc: language === 'hi' ? 'पॉपअप विंडो बंद करें' : 'Close active popup dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <Keyboard className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {language === 'hi' ? 'कीबोर्ड नेविगेशन शॉर्टकट्स' : 'Keyboard Navigation Shortcuts'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                WCAG 2.1 Full Keyboard Accessibility
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs max-h-[380px] overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-[11px] text-slate-900 dark:text-white shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
