'use client';

/**
 * usePlacementTracker() – loads /api/tracker (resumes, Q&A, interviews, notices, panels) every 20 s and gives `post()` to send actions.
 */
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/client/api';
import type { FacultyNotice, MockInterviewResult, PanelInterview, QnaAttempt, ResumeSubmission, StudentNoticeView } from '../lib/tracker/types';

export interface TrackerStudent {
  studentUserId: string;
  rollNumber: string;
  studentName: string;
  department: string;
  branch: string;
  year: string;
}

export interface TrackerData {
  resumes: ResumeSubmission[];
  qna: QnaAttempt[];
  interviews: MockInterviewResult[];
  /** Student: StudentNoticeView[]; faculty/admin: FacultyNotice[] */
  notices: any[];
  panels: PanelInterview[];
  students?: TrackerStudent[];
}

const EMPTY: TrackerData = { resumes: [], qna: [], interviews: [], notices: [], panels: [] };

/** Loads /api/tracker and refreshes every 20 s, so faculty see new submissions automatically. */
export function usePlacementTracker(enabled = true) {
  const [data, setData] = useState<TrackerData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const r = await api('/api/tracker');
    if (r.success) {
      setData({ resumes: r.resumes, qna: r.qna, interviews: r.interviews, notices: r.notices, panels: r.panels ?? [], students: r.students });
      setError(null);
    } else setError(r.error || 'Could not load tracker.');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    reload();
    const t = setInterval(() => document.visibilityState === 'visible' && reload(), 20000);
    // other screens using this hook reload right after a change
    window.addEventListener('tracker:changed', reload);
    return () => {
      clearInterval(t);
      window.removeEventListener('tracker:changed', reload);
    };
  }, [enabled, reload]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      const r = await api('/api/tracker', { body });
      if (r.success) window.dispatchEvent(new Event('tracker:changed'));
      return r;
    },
    []
  );

  return { data, loading, error, reload, post };
}

export type { FacultyNotice, StudentNoticeView };
