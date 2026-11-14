'use client';

import React, { useState } from 'react';

/**
 * One click download with visible feedback: "Preparing…", then the file, or a clear error.
 * The file is fetched first, so a logged-out session or a server error is shown on screen.
 */
export const DownloadButton: React.FC<{ href: string; className?: string; children: React.ReactNode }> = ({ href, className, children }) => {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const run = async () => {
    setState('busy');
    try {
      const res = await fetch(href, { credentials: 'same-origin' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Download failed (${res.status})`);
      }
      const name = res.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1] ?? 'download';
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setState('done');
      setTimeout(() => setState('idle'), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.');
      setState('error');
    }
  };

  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={run} disabled={state === 'busy'} className={className}>
        {state === 'busy' ? 'Preparing…' : state === 'done' ? 'Downloaded ✓' : children}
      </button>
      {state === 'error' && (
        <span role="alert" className="text-xs text-rose-700 mt-1">
          {error}
        </span>
      )}
    </span>
  );
};
