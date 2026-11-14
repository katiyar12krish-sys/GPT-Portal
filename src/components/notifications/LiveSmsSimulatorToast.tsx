'use client';

/**
 * Small pop-up that shows an SMS preview in demo mode (no real SMS is sent without FAST2SMS_API_KEY).
 */
import React, { useState } from 'react';
import { Smartphone, X, Copy, Check } from 'lucide-react';

export const LiveSmsSimulatorToast: React.FC = () => {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  if (!activeMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-3xl bg-slate-900 text-white border-2 border-emerald-500 shadow-2xl space-y-3">
        <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-white">Govt SMS Alert</span>
          </div>
          <button
            onClick={() => setActiveMessage(null)}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
          {activeMessage}
        </div>
      </div>
    </div>
  );
};
