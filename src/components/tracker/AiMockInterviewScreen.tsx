'use client';

/**
 * Mock Interview screen: choose a round and a question paper (src/lib/data/mockInterviewBank.ts), then practise
 * live (voice & video), typed, or book a faculty panel. Each paper shows its best score and attempts (the tally).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Bot, Mic, MicOff, ChevronRight, Send, RotateCcw, Video, Keyboard, Users, Download } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { usePlacementTracker } from '../../hooks/usePlacementTracker';
import { INTERVIEW_PAPER_COUNT, INTERVIEW_QUESTION_COUNT, INTERVIEW_ROUNDS, INTERVIEW_TRACKS, INTERVIEW_TRACK_NAMES, paperKey } from '../../lib/data/mockInterviewBank';
import type { MockInterviewResult } from '../../lib/tracker/types';
import { Card, Pill, ScoreBar, ScreenHeader, Stat, btnGhost, btnPrimary, fmtDate, input, scoreTone } from './TrackerUi';
import { LiveVoiceInterview } from './LiveVoiceInterview';
import { PanelInterviewSection } from './PanelInterviewSection';
import { usePaged, ShowEntries, Pager } from '../ui/Pagination';

type Mode = 'live' | 'typed' | 'panel';

const MODES: Array<{ id: Mode; icon: React.ComponentType<{ className?: string }>; title: string; text: string }> = [
  { id: 'live', icon: Video, title: 'Live voice & video interview', text: 'Camera on. The interviewer speaks each question, you answer out loud in 90 s – like a real HR / technical round.' },
  { id: 'typed', icon: Keyboard, title: 'Typed answers (practice)', text: 'Read the question and type your answer. Good for preparing your points before speaking.' },
  { id: 'panel', icon: Users, title: 'Panel interview with faculty', text: 'Book a face-to-face or video-call interview with HOD / TPO. They score you with a rubric.' },
];

export const AiMockInterviewScreen: React.FC = () => {
  const { language, loggedStudent } = useCollege();
  const { data, post } = usePlacementTracker();
  const defaultTrack = /civil/i.test(loggedStudent?.branch ?? '') ? 'Civil Technical' : 'CSE Technical';
  const [mode, setMode] = useState<Mode>('live');
  const [round, setRound] = useState(defaultTrack);
  const [track, setTrack] = useState(paperKey(defaultTrack, 0));
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<MockInterviewResult | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  const startedAt = useRef(0);

  const qs = INTERVIEW_TRACKS[track];
  const speechOk = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const history = usePaged(data.interviews, 10);

  useEffect(() => () => recRef.current?.stop(), []);

  const start = () => {
    setAnswers(qs.map(() => ''));
    setResult(null);
    setRecordingUrl(undefined);
    setStep(0);
    setRunning(true);
    startedAt.current = Date.now();
  };

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results as ArrayLike<any>)
        .slice(e.resultIndex)
        .map((r: any) => r[0].transcript)
        .join(' ');
      setAnswers(a => a.map((v, i) => (i === step ? `${v} ${text}`.trim() : v)));
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const finishTyped = async () => {
    recRef.current?.stop();
    setBusy(true);
    const r = await post({ action: 'interview', track, answers, mode: 'Typed', durationSec: Math.round((Date.now() - startedAt.current) / 1000) });
    setBusy(false);
    if (r.success) {
      setResult(r.result);
      setRunning(false);
    }
  };

  const best = data.interviews.reduce((m, x) => Math.max(m, x.overallScore), 0);
  // Tally per paper. Results saved under the plain round name (before papers existed) count as Paper 1.
  const tally = (round: string, i: number) => {
    const key = paperKey(round, i);
    const done = data.interviews.filter(x => x.track === key || (i === 0 && x.track === round));
    return { count: done.length, best: done.reduce((m, x) => Math.max(m, x.overallScore), 0) };
  };
  const papersDone = INTERVIEW_TRACK_NAMES.reduce((t, r) => t + INTERVIEW_ROUNDS[r].filter((_, i) => tally(r, i).count > 0).length, 0);
  const panelsDone = data.panels.filter(p => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <ScreenHeader
        badge={language === 'hi' ? 'मॉक इंटरव्यू' : 'Mock Interview'}
        title={language === 'hi' ? 'असली इंटरव्यू जैसा अभ्यास – आवाज़, वीडियो और फैकल्टी पैनल' : 'Practise like the real thing – voice, video and faculty panel'}
        subtitle="Three ways to practise. Every result is saved to your progress and shared with your faculty and the TPO."
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Practice interviews done" value={data.interviews.length} />
        <Stat label="Best practice score" value={`${best}%`} tone={scoreTone(best)} />
        <Stat label="Question papers done" value={`${papersDone}/${INTERVIEW_PAPER_COUNT}`} />
        <Stat label="Panel interviews done" value={panelsDone} />
        <Stat label="Last verdict" value={data.interviews[0]?.verdict ?? '—'} />
      </div>

      {/* mode chooser */}
      {!running && !result && (
        <div className="grid md:grid-cols-3 gap-3">
          {MODES.map(m => {
            const Icon = m.icon;
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-left p-4 rounded-2xl border transition-colors cursor-pointer ${
                  on ? 'border-[#13294b] bg-[#13294b] text-[#ffffff] dark:border-cyan-600 dark:bg-cyan-950/50' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-400'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${on ? 'text-cyan-300' : 'text-cyan-700'}`} />
                <div className="font-serif font-bold text-base">{m.title}</div>
                <p className={`text-sm mt-1 ${on ? 'text-[#f1dca4]' : 'text-slate-500'}`}>{m.text}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* track chooser for AI modes */}
      {!running && !result && mode !== 'panel' && (
        <Card className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">1. Choose interview round</h3>
          <div className="flex flex-wrap gap-2">
            {INTERVIEW_TRACK_NAMES.map(t => (
              <button
                key={t}
                onClick={() => {
                  setRound(t);
                  setTrack(paperKey(t, 0));
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border cursor-pointer ${
                  round === t ? 'bg-cyan-700 text-white border-cyan-700' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{`2. Choose question paper (${INTERVIEW_ROUNDS[round].length} papers, 6 questions each)`}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {INTERVIEW_ROUNDS[round].map((paper, i) => {
              const key = paperKey(round, i);
              const t = tally(round, i);
              const on = track === key;
              return (
                <button
                  key={key}
                  onClick={() => setTrack(key)}
                  className={`text-left p-3 rounded-xl border cursor-pointer space-y-1 ${
                    on ? 'border-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-700/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{`Paper ${i + 1}`}</span>
                    {t.count ? (
                      <Pill tone={t.best >= 70 ? 'green' : t.best >= 45 ? 'amber' : 'rose'}>{`Best ${t.best}% · ${t.count}×`}</Pill>
                    ) : (
                      <Pill tone="slate">Not attempted</Pill>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{paper.map(q => q.q).slice(0, 2).join(' · ')}</p>
                </button>
              );
            })}
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer font-bold text-cyan-700 dark:text-cyan-300">See all questions of this paper</summary>
            <ol className="list-decimal pl-5 pt-2 space-y-1 text-slate-700 dark:text-slate-300">
              {qs.map(q => (
                <li key={q.q}>{q.q}</li>
              ))}
            </ol>
          </details>
          <p className="text-xs text-slate-500">{`Question bank: ${INTERVIEW_QUESTION_COUNT} interview questions in ${INTERVIEW_PAPER_COUNT} papers. Your faculty sees every paper you attempt and its score.`}</p>
          <button onClick={start} className={`${btnPrimary} inline-flex items-center gap-2 !text-sm`}>
            {mode === 'live' ? <Video className="w-4 h-4" /> : <Bot className="w-4 h-4" />} {mode === 'live' ? 'Go to interview room' : 'Start typed interview'}
          </button>
        </Card>
      )}

      {mode === 'panel' && !running && !result && <PanelInterviewSection panels={data.panels} defaultTrack={defaultTrack} post={post} />}

      {/* live voice / video */}
      {running && mode === 'live' && (
        <LiveVoiceInterview
          track={track}
          post={post}
          onCancel={() => setRunning(false)}
          onResult={(r, url) => {
            setResult(r);
            setRecordingUrl(url);
            setRunning(false);
          }}
        />
      )}

      {/* typed */}
      {running && mode === 'typed' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{track}</span>
            <span>
              Question {step + 1} / {qs.length}
            </span>
          </div>
          <ScoreBar value={step + 1} max={qs.length} />
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-xl bg-cyan-700 text-white shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <p className="font-serif text-lg font-bold text-slate-900 dark:text-white pt-1">{qs[step].q}</p>
          </div>
          <textarea
            rows={6}
            className={input}
            placeholder="Type your answer as you would speak it…"
            value={answers[step] ?? ''}
            onChange={e => setAnswers(a => a.map((v, i) => (i === step ? e.target.value : v)))}
          />
          <div className="flex flex-wrap gap-2">
            {speechOk && (
              <button onClick={toggleMic} className={`${btnGhost} inline-flex items-center gap-2`}>
                {listening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5" />}
                {listening ? 'Stop' : 'Speak answer'}
              </button>
            )}
            <button onClick={() => setRunning(false)} className={btnGhost}>
              Cancel
            </button>
            {step < qs.length - 1 ? (
              <button
                onClick={() => {
                  recRef.current?.stop();
                  setStep(s => s + 1);
                }}
                className={`${btnPrimary} inline-flex items-center gap-2 ml-auto`}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={finishTyped} disabled={busy} className={`${btnPrimary} inline-flex items-center gap-2 ml-auto`}>
                <Send className="w-3.5 h-3.5" /> {busy ? 'Evaluating…' : 'Finish & get result'}
              </button>
            )}
          </div>
        </Card>
      )}

      {/* result */}
      {result && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-4xl font-serif font-bold ${scoreTone(result.overallScore)}`}>{result.overallScore}%</span>
            <Pill tone={result.verdict === 'Ready' ? 'green' : result.verdict === 'Almost ready' ? 'amber' : 'rose'}>{result.verdict}</Pill>
            <Pill tone="slate">{result.mode ?? 'Typed'} · scored by {result.evaluator}</Pill>
            <div className="ml-auto flex gap-2">
              {recordingUrl && (
                <a href={recordingUrl} download="my-mock-interview.webm" className={`${btnGhost} inline-flex items-center gap-1.5`}>
                  <Download className="w-3.5 h-3.5" /> My recording
                </a>
              )}
              <button onClick={start} className={`${btnPrimary} inline-flex items-center gap-2`}>
                <RotateCcw className="w-3.5 h-3.5" /> Try again
              </button>
              <button onClick={() => setResult(null)} className={btnGhost}>
                Close
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Technical" value={`${result.technical}/10`} />
            <Stat label="Communication" value={`${result.communication}/10`} />
            <Stat label="Confidence" value={`${result.confidence}/10`} />
          </div>
          {result.speaking && (
            <div className="grid grid-cols-3 gap-3">
              <Stat
                label="Speaking pace (words/min)"
                value={result.speaking.wordsPerMinute}
                tone={result.speaking.wordsPerMinute >= 100 && result.speaking.wordsPerMinute <= 170 ? 'text-emerald-600' : 'text-amber-600'}
              />
              <Stat label="Filler words (um, like…)" value={result.speaking.fillerWords} tone={result.speaking.fillerWords <= 5 ? 'text-emerald-600' : 'text-amber-600'} />
              <Stat label="Avg. answer length" value={`${result.speaking.avgAnswerSec}s`} />
            </div>
          )}
          {result.speaking && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ideal pace is 110–160 words per minute. Answer each question in 45–90 seconds and replace “um / like” with a short pause.
            </p>
          )}
          <div className="space-y-3">
            {result.answers.map((a, i) => (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                  <span>
                    Q{i + 1}. {a.question}
                  </span>
                  <span className={scoreTone(a.score * 10)}>{a.score}/10</span>
                </div>
                <p className="text-sm text-slate-500 italic line-clamp-3">{a.answer || '(no answer)'}</p>
                <p className="text-sm text-cyan-800 dark:text-cyan-300">{a.feedback}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Interview history</h3>
        {data.interviews.length === 0 ? (
          <p className="text-sm text-slate-500">No interviews yet.</p>
        ) : (
          <>
            <ShowEntries pg={history} label="interviews" />
            {history.pageItems.map(r => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 text-sm py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="flex-1 font-semibold text-slate-700 dark:text-slate-200">
                  {r.track} · {r.mode ?? 'Typed'} · {fmtDate(r.createdAt)}
                </span>
                <Pill tone={r.verdict === 'Ready' ? 'green' : r.verdict === 'Almost ready' ? 'amber' : 'rose'}>{r.verdict}</Pill>
                <span className={`font-bold w-12 text-right ${scoreTone(r.overallScore)}`}>{r.overallScore}%</span>
              </div>
            ))}
            <Pager pg={history} />
          </>
        )}
      </Card>
    </div>
  );
};
