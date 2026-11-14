'use client';

/**
 * Live voice & video interview: camera on, the question is spoken, 90 s to answer, speech converted to text in the browser,
 * speaking pace and filler words measured. The video never leaves the device (download only).
 */
import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, Volume2, SkipForward, Square, Download, Play } from 'lucide-react';
import { INTERVIEW_TRACKS } from '../../lib/data/mockInterviewBank';
import type { MockInterviewResult } from '../../lib/tracker/types';
import { Card, ScoreBar, btnGhost, btnPrimary } from './TrackerUi';

const THINK_SEC = 5;
const ANSWER_SEC = 90;
const FILLERS = /\b(um+|uh+|erm+|hmm+|like|basically|actually|you know)\b/gi;

type Phase = 'setup' | 'asking' | 'thinking' | 'answering' | 'submitting';

interface Props {
  track: string;
  post: (b: Record<string, unknown>) => Promise<any>;
  onResult: (r: MockInterviewResult, recordingUrl?: string) => void;
  onCancel: () => void;
}

/**
 * Real interview feel – not an online Q&A form:
 * camera on, the interviewer *speaks* each question, a short think time, then the student
 * answers out loud within 90 s. Speech is turned into text in the browser, and speaking pace
 * and filler words are measured. The video never leaves the device (download only).
 */
export const LiveVoiceInterview: React.FC<Props> = ({ track, post, onResult, onCancel }) => {
  const qs = INTERVIEW_TRACKS[track];
  const [phase, setPhase] = useState<Phase>('setup');
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => qs.map(() => ''));
  const [interim, setInterim] = useState('');
  const [camOn, setCamOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const answerStart = useRef(0);
  const durations = useRef<number[]>(qs.map(() => 0));
  const startedAt = useRef(0);
  const idxRef = useRef(0);
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const SR = typeof window !== 'undefined' ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition : null;
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // cleanup on leave
  useEffect(
    () => () => {
      recRef.current?.abort?.();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      streamRef.current?.getTracks().forEach(t => t.stop());
    },
    []
  );

  // countdown
  useEffect(() => {
    if (phase !== 'thinking' && phase !== 'answering') return;
    if (left <= 0) {
      if (phase === 'thinking') beginAnswer();
      else finishAnswer();
      return;
    }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
    } catch {
      setError('Camera / microphone permission was not given. You can still continue with microphone only, or allow the camera in the browser and try again.');
    }
  };

  const speak = (text: string, then: () => void) => {
    if (!canSpeak) return then();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = window.speechSynthesis.getVoices().find(v => /en-IN/i.test(v.lang)) || window.speechSynthesis.getVoices().find(v => /^en/i.test(v.lang));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = then;
    u.onerror = then;
    window.speechSynthesis.speak(u);
  };

  const ask = (i: number) => {
    idxRef.current = i;
    setIdx(i);
    setInterim('');
    setPhase('asking');
    speak(`Question ${i + 1}. ${qs[i].q}`, () => {
      setPhase('thinking');
      setLeft(THINK_SEC);
    });
  };

  const start = () => {
    startedAt.current = Date.now();
    if (streamRef.current && typeof MediaRecorder !== 'undefined') {
      try {
        const rec = new MediaRecorder(streamRef.current);
        chunks.current = [];
        rec.ondataavailable = e => e.data.size && chunks.current.push(e.data);
        rec.start(1000);
        recorderRef.current = rec;
      } catch {
        /* recording is optional */
      }
    }
    ask(0);
  };

  const beginAnswer = () => {
    setPhase('answering');
    setLeft(ANSWER_SEC);
    answerStart.current = Date.now();
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let finalText = '';
      let temp = '';
      for (let k = e.resultIndex; k < e.results.length; k++) {
        if (e.results[k].isFinal) finalText += e.results[k][0].transcript + ' ';
        else temp += e.results[k][0].transcript;
      }
      const i = idxRef.current;
      if (finalText) setAnswers(a => a.map((v, j) => (j === i ? `${v} ${finalText}`.trim() : v)));
      setInterim(temp);
    };
    rec.onerror = () => {};
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  };

  const finishAnswer = () => {
    recRef.current?.stop?.();
    recRef.current = null;
    const i = idxRef.current;
    durations.current[i] = Math.round((Date.now() - answerStart.current) / 1000);
    setInterim('');
    if (i < qs.length - 1) ask(i + 1);
    else submit();
  };

  const submit = async () => {
    setPhase('submitting');
    window.speechSynthesis?.cancel();
    // stop the recorder and wait for the last chunk so the download is complete
    let url: string | undefined;
    const recorder = recorderRef.current;
    if (recorder && recorder.state === 'recording') {
      await new Promise<void>(res => {
        recorder.onstop = () => res();
        recorder.stop();
      });
      url = URL.createObjectURL(new Blob(chunks.current, { type: recorder.mimeType || 'video/webm' }));
      setRecordingUrl(url);
    }
    const answers = answersRef.current;
    const all = answers.join(' ');
    const words = all.trim() ? all.trim().split(/\s+/).length : 0;
    const spoken = durations.current.reduce((a, b) => a + b, 0) || 1;
    const speaking = {
      wordsPerMinute: Math.min(400, Math.round(words / (spoken / 60))),
      fillerWords: (all.match(FILLERS) || []).length,
      avgAnswerSec: Math.round(spoken / qs.length),
    };
    const r = await post({ action: 'interview', track, answers, mode: 'Voice & video', speaking, durationSec: Math.round((Date.now() - startedAt.current) / 1000) });
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCamOn(false);
    if (r.success) onResult(r.result, url);
    else {
      setError(r.error || 'Could not save the interview.');
      setPhase('setup');
    }
  };

  const ring = phase === 'answering' ? (left / ANSWER_SEC) * 100 : phase === 'thinking' ? (left / THINK_SEC) * 100 : 100;

  return (
    <Card className="space-y-4">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-4">
        {/* candidate camera */}
        <div className="relative rounded-2xl overflow-hidden bg-[#13294b] aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${camOn ? '' : 'hidden'}`} style={{ transform: 'scaleX(-1)' }} />
          {!camOn && (
            <div className="text-center text-[#f1dca4] space-y-2 p-6">
              <CameraOff className="w-8 h-8 mx-auto opacity-70" />
              <p className="text-sm">Camera is off</p>
            </div>
          )}
          {phase !== 'setup' && phase !== 'submitting' && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          )}
        </div>

        {/* interviewer panel */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500">
            {track} · Question {Math.min(idx + 1, qs.length)} of {qs.length}
          </div>
          <ScoreBar value={phase === 'setup' ? 0 : idx + 1} max={qs.length} />
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 min-h-[110px]">
            {phase === 'setup' ? (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The interviewer will <b>read each question aloud</b>. You get {THINK_SEC} seconds to think and {ANSWER_SEC} seconds to <b>answer by speaking</b>.
                Sit straight, look at the camera and speak clearly. Your video stays on this device.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1">
                  <Volume2 className="w-4 h-4" /> Interviewer
                </div>
                <p className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug">{qs[idx].q}</p>
              </>
            )}
          </div>

          {(phase === 'thinking' || phase === 'answering') && (
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full grid place-items-center text-sm font-bold"
                style={{ background: `conic-gradient(${phase === 'answering' ? '#2a4f8a' : '#3a4a63'} ${ring}%, #e7e5e4 0)` }}
              >
                <span className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 grid place-items-center">{left}s</span>
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {phase === 'thinking' ? 'Think about your answer…' : (
                  <span className="inline-flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-rose-600" /> Speak now{SR ? '' : ' (speech-to-text not supported in this browser – type below)'}
                  </span>
                )}
              </div>
            </div>
          )}
          {phase === 'asking' && <p className="text-sm text-slate-500 inline-flex items-center gap-1.5"><Volume2 className="w-4 h-4" /> Interviewer is asking…</p>}
          {phase === 'submitting' && <p className="text-sm font-semibold text-slate-600">Evaluating your interview…</p>}
        </div>
      </div>

      {phase === 'answering' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500">Your answer (auto-filled from your voice – you can correct it)</label>
          <textarea
            rows={4}
            value={answers[idx] + (interim ? ` ${interim}` : '')}
            onChange={e => setAnswers(a => a.map((v, j) => (j === idx ? e.target.value : v)))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
          />
        </div>
      )}

      {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {phase === 'setup' && (
          <>
            {!camOn && (
              <button onClick={startCamera} className={`${btnGhost} inline-flex items-center gap-2`}>
                <Camera className="w-4 h-4" /> Turn on camera & mic
              </button>
            )}
            <button onClick={start} className={`${btnPrimary} inline-flex items-center gap-2`}>
              <Play className="w-4 h-4" /> Start interview
            </button>
            <button onClick={onCancel} className={btnGhost}>
              Back
            </button>
          </>
        )}
        {phase === 'answering' && (
          <button onClick={finishAnswer} className={`${btnPrimary} inline-flex items-center gap-2`}>
            <Square className="w-4 h-4" /> {idx < qs.length - 1 ? 'Done – next question' : 'Done – finish interview'}
          </button>
        )}
        {(phase === 'thinking' || phase === 'asking') && (
          <button onClick={() => speak(qs[idx].q, () => {})} className={`${btnGhost} inline-flex items-center gap-2`}>
            <Volume2 className="w-4 h-4" /> Repeat question
          </button>
        )}
        {phase === 'thinking' && (
          <button onClick={beginAnswer} className={`${btnGhost} inline-flex items-center gap-2`}>
            <SkipForward className="w-4 h-4" /> Start answering now
          </button>
        )}
        {recordingUrl && (
          <a href={recordingUrl} download="my-mock-interview.webm" className={`${btnGhost} inline-flex items-center gap-2`}>
            <Download className="w-4 h-4" /> Download my recording
          </a>
        )}
      </div>
    </Card>
  );
};
