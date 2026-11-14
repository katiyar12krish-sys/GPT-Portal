'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Download, Eye, Link2, MonitorUp, PlayCircle, Search, Square, Trash2, Upload, Video } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { api } from '../../lib/client/api';
import type { VideoLecture } from '../../lib/tracker/types';
import { Card, Pill, ScreenHeader, btn, btnGhost, btnPrimary, fmtDate, input } from '../tracker/TrackerUi';

// Video lectures: teachers record in the browser, upload a file or add a YouTube link; students watch and download.
// Files move in pieces of `chunkSize` bytes (see src/lib/server/videoStore.ts).

type Mode = 'record' | 'upload' | 'youtube';
type Branch = VideoLecture['branch'];
type Year = VideoLecture['year'];
interface Meta {
  title: string;
  subject: string;
  description: string;
  branch: Branch;
  year: Year;
  allowDownload: boolean;
}
const EMPTY: Meta = { title: '', subject: '', description: '', branch: 'All', year: 'All', allowDownload: true };
const YEARS: Year[] = ['All', '1st Year', '2nd Year', '3rd Year'];

const mb = (n = 0) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const mmss = (s = 0) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const branchLabel = (b: Branch) => (b === 'All' ? 'All branches' : b);

/** Sends one piece, retrying a few times on a weak connection. */
async function putPiece(id: string, offset: number, piece: Blob) {
  let last = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`/api/videos/chunk?id=${encodeURIComponent(id)}&offset=${offset}`, { method: 'PUT', body: piece });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) return;
      last = j.error || `Server error ${res.status}`;
      if (res.status === 403 || res.status === 404) break;
    } catch {
      last = 'Connection lost while uploading.';
    }
    await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(last || 'Upload failed.');
}

/** Downloads a stored video piece by piece and saves it as one file. */
async function downloadVideo(v: VideoLecture, onProgress: (pct: number) => void) {
  const parts: ArrayBuffer[] = [];
  let start = 0;
  let total = v.sizeBytes ?? 0;
  do {
    const res = await fetch(`/api/videos/${v.id}/file`, { headers: { range: `bytes=${start}-` } });
    if (res.status !== 206 && res.status !== 200) throw new Error('Could not download the video. Please try again.');
    const m = (res.headers.get('content-range') ?? '').match(/\/(\d+)$/);
    if (m) total = Number(m[1]);
    const buf = await res.arrayBuffer();
    if (!buf.byteLength) break;
    parts.push(buf);
    start += buf.byteLength;
    onProgress(total ? Math.round((start / total) * 100) : 0);
  } while (start < total);
  const url = URL.createObjectURL(new Blob(parts, { type: v.mimeType || 'video/mp4' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = (v.fileName || `${v.title}.mp4`).replace(/[^\w.\- ]/g, '_');
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const MetaForm: React.FC<{ meta: Meta; set: (m: Meta) => void; youtube?: boolean }> = ({ meta, set, youtube }) => (
  <div className="grid sm:grid-cols-2 gap-2">
    <input className={input} placeholder="Title, e.g. Surveying – levelling (Unit 2)" value={meta.title} onChange={e => set({ ...meta, title: e.target.value })} />
    <input className={input} placeholder="Subject, e.g. Surveying-I" value={meta.subject} onChange={e => set({ ...meta, subject: e.target.value })} />
    <select className={input} value={meta.branch} onChange={e => set({ ...meta, branch: e.target.value as Branch })} aria-label="Branch">
      <option value="All">All branches</option>
      <option value="CSE">Computer Science</option>
      <option value="Civil">Civil</option>
    </select>
    <select className={input} value={meta.year} onChange={e => set({ ...meta, year: e.target.value as Year })} aria-label="Year">
      {YEARS.map(y => (
        <option key={y} value={y}>
          {y === 'All' ? 'All years' : y}
        </option>
      ))}
    </select>
    <textarea className={`${input} sm:col-span-2`} rows={2} placeholder="What does this video teach? (optional)" value={meta.description} onChange={e => set({ ...meta, description: e.target.value })} />
    {!youtube && (
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 sm:col-span-2">
        <input type="checkbox" checked={meta.allowDownload} onChange={e => set({ ...meta, allowDownload: e.target.checked })} />
        Students may download this video
      </label>
    )}
  </div>
);

const AddVideo: React.FC<{ chunkSize: number; maxBytes: number; onAdded: () => void }> = ({ chunkSize, maxBytes, onAdded }) => {
  const [mode, setMode] = useState<Mode>('record');
  const [meta, setMeta] = useState<Meta>(EMPTY);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // recording
  const [recSource, setRecSource] = useState<'camera' | 'screen'>('camera');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recorded, setRecorded] = useState<{ blob: Blob; url: string; seconds: number } | null>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const startedRef = useRef(0);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };
  useEffect(() => () => stopStream(), []);
  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startedRef.current) / 1000)), 500);
    return () => clearInterval(t);
  }, [recording]);

  const startRecording = async () => {
    setMsg(null);
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices) {
      setMsg({ ok: false, text: 'This browser cannot record video. Use Chrome or Edge, or record on the phone camera and use “Upload a video”.' });
      return;
    }
    try {
      let stream: MediaStream;
      if (recSource === 'screen') {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        stream = new MediaStream([...screen.getVideoTracks(), ...(mic ? mic.getAudioTracks() : screen.getAudioTracks())]);
        screen.getVideoTracks()[0].addEventListener('ended', () => recRef.current?.state === 'recording' && recRef.current.stop());
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      }
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        liveRef.current.play().catch(() => undefined);
      }
      const type = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, type ? { mimeType: type, videoBitsPerSecond: 1_500_000 } : undefined);
      const parts: Blob[] = [];
      rec.ondataavailable = e => e.data.size && parts.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(parts, { type: (rec.mimeType || 'video/webm').split(';')[0] });
        const seconds = Math.round((Date.now() - startedRef.current) / 1000);
        setRecorded({ blob, url: URL.createObjectURL(blob), seconds });
        setRecording(false);
        stopStream();
      };
      recRef.current = rec;
      startedRef.current = Date.now();
      setElapsed(0);
      setRecorded(null);
      rec.start(1000);
      setRecording(true);
    } catch {
      stopStream();
      setMsg({ ok: false, text: 'Camera / microphone / screen permission was not given. Allow it in the browser and try again.' });
    }
  };

  const upload = async (blob: Blob, fileName: string, source: 'recorded' | 'uploaded', durationSec?: number) => {
    if (blob.size > maxBytes) return setMsg({ ok: false, text: `The video is ${mb(blob.size)}. The limit is ${mb(maxBytes)} – record a shorter part or compress it.` });
    setBusy(true);
    setMsg(null);
    setProgress(0);
    try {
      const c = await api('/api/videos', { body: { action: 'create', ...meta, source, fileName, mimeType: blob.type || 'video/mp4', sizeBytes: blob.size, durationSec } });
      if (!c.success) throw new Error(c.error);
      const id = c.video.id as string;
      for (let off = 0; off < blob.size; off += chunkSize) {
        await putPiece(id, off, blob.slice(off, off + chunkSize));
        setProgress(Math.round((Math.min(blob.size, off + chunkSize) / blob.size) * 100));
      }
      const f = await api('/api/videos', { body: { action: 'finish', id } });
      if (!f.success) throw new Error(f.error);
      setMsg({ ok: true, text: `“${meta.title}” is now in Video Lectures. Students of ${branchLabel(meta.branch)}, ${meta.year === 'All' ? 'all years' : meta.year} can watch it.` });
      setMeta(EMPTY);
      setFile(null);
      setRecorded(null);
      onAdded();
    } catch (e: any) {
      setMsg({ ok: false, text: e?.message || 'Upload failed. Please try again.' });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const addLink = async () => {
    setBusy(true);
    setMsg(null);
    const r = await api('/api/videos', { body: { action: 'youtube', ...meta, url } });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error || 'Could not add the link.' });
    setMsg({ ok: true, text: `“${meta.title}” added.` });
    setMeta(EMPTY);
    setUrl('');
    onAdded();
  };

  const ready = meta.title.trim().length >= 3 && meta.subject.trim().length >= 2;
  const ext = (t: string) => (t.includes('mp4') ? 'mp4' : 'webm');

  return (
    <Card className="space-y-4">
      <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Add a video lecture</h3>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['record', 'Record now', Camera],
            ['upload', 'Upload a video', Upload],
            ['youtube', 'YouTube link', Link2],
          ] as Array<[Mode, string, React.ElementType]>
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => !recording && setMode(id)}
            className={`px-3 py-2 rounded-xl text-xs font-black border cursor-pointer inline-flex items-center gap-1.5 ${
              mode === id ? 'bg-[#13294b] text-white border-[#13294b]' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <MetaForm meta={meta} set={setMeta} youtube={mode === 'youtube'} />

      {mode === 'record' && (
        <div className="space-y-3">
          {!recording && !recorded && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Record:</span>
              <button onClick={() => setRecSource('camera')} className={`${btnGhost} inline-flex items-center gap-1.5 ${recSource === 'camera' ? '!border-[#13294b] !bg-cyan-50' : ''}`}>
                <Camera className="w-3.5 h-3.5" /> Camera + mic
              </button>
              <button onClick={() => setRecSource('screen')} className={`${btnGhost} inline-flex items-center gap-1.5 ${recSource === 'screen' ? '!border-[#13294b] !bg-cyan-50' : ''}`}>
                <MonitorUp className="w-3.5 h-3.5" /> Screen / PPT + mic
              </button>
            </div>
          )}
          <video ref={liveRef} muted playsInline className={`w-full max-w-2xl rounded-xl bg-black aspect-video ${recording ? '' : 'hidden'}`} />
          {recorded && <video src={recorded.url} controls playsInline className="w-full max-w-2xl rounded-xl bg-black aspect-video" />}
          <div className="flex flex-wrap items-center gap-2">
            {!recording ? (
              <button onClick={startRecording} disabled={busy} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
                <Video className="w-4 h-4" /> {recorded ? 'Record again' : 'Start recording'}
              </button>
            ) : (
              <button onClick={() => recRef.current?.stop()} className={`${btn} bg-rose-600 text-white inline-flex items-center gap-1.5`}>
                <Square className="w-4 h-4" /> {`Stop (${mmss(elapsed)})`}
              </button>
            )}
            {recorded && (
              <>
                <button
                  onClick={() => upload(recorded.blob, `${meta.title || 'lecture'}.${ext(recorded.blob.type)}`, 'recorded', recorded.seconds)}
                  disabled={busy || !ready}
                  className={`${btnPrimary} inline-flex items-center gap-1.5`}
                >
                  <Upload className="w-4 h-4" /> Save to portal
                </button>
                <a href={recorded.url} download={`${meta.title || 'lecture'}.${ext(recorded.blob.type)}`} className={`${btnGhost} inline-flex items-center gap-1.5`}>
                  <Download className="w-4 h-4" /> Save on this device
                </a>
                <span className="text-xs text-slate-500">{`${mmss(recorded.seconds)} · ${mb(recorded.blob.size)}`}</span>
              </>
            )}
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[#13294b] file:text-white file:font-bold"
          />
          {file && <span className="text-xs text-slate-500">{`${file.name} · ${mb(file.size)}`}</span>}
          <button onClick={() => file && upload(file, file.name, 'uploaded')} disabled={busy || !file || !ready} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      )}

      {mode === 'youtube' && (
        <div className="flex flex-wrap gap-2">
          <input className={`${input} flex-1 min-w-[240px]`} placeholder="https://youtu.be/..." value={url} onChange={e => setUrl(e.target.value)} />
          <button onClick={addLink} disabled={busy || !ready || !url.trim()} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
            <Link2 className="w-4 h-4" /> Add link
          </button>
        </div>
      )}

      {!ready && <p className="text-xs text-slate-500">Fill the title and subject first.</p>}
      {progress !== null && (
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-[#13294b] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500">{`Uploading… ${progress}% – keep this page open.`}</p>
        </div>
      )}
      {msg && <p className={`text-sm font-semibold ${msg.ok ? 'text-emerald-700' : 'text-rose-600'}`}>{msg.text}</p>}
      <p className="text-xs text-slate-500">{`MP4 or WebM, up to ${mb(maxBytes)}. Large videos are sent in small pieces, so a slow connection is fine – just keep the page open.`}</p>
    </Card>
  );
};

const VideoCard: React.FC<{ v: VideoLecture; staff: boolean; canEdit: boolean; reload: () => void }> = ({ v, staff, canEdit, reload }) => {
  const [open, setOpen] = useState(false);
  const [dl, setDl] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const watch = () => {
    setOpen(true);
    if (!staff) api('/api/videos', { body: { action: 'view', id: v.id } });
  };
  const download = async () => {
    setErr(null);
    setDl(0);
    try {
      await downloadVideo(v, setDl);
    } catch (e: any) {
      setErr(e?.message || 'Download failed.');
    } finally {
      setDl(null);
    }
  };
  const act = async (action: 'delete' | 'toggle_download') => {
    if (action === 'delete' && !window.confirm(`Delete “${v.title}”? Students will no longer see it.`)) return;
    const r = await api('/api/videos', { body: { action, id: v.id } });
    if (!r.success) setErr(r.error || 'Could not change the video.');
    reload();
  };

  return (
    <Card className="space-y-3">
      <div className="rounded-xl overflow-hidden bg-[#0c1a31] aspect-video">
        {open ? (
          v.source === 'youtube' ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
              title={v.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <video className="w-full h-full" src={`/api/videos/${v.id}/file`} controls autoPlay playsInline preload="metadata" />
          )
        ) : (
          <button onClick={watch} className="w-full h-full flex flex-col items-center justify-center gap-2 text-white cursor-pointer" aria-label={`Watch ${v.title}`}>
            <PlayCircle className="w-14 h-14 text-gold-300" />
            <span className="text-sm font-bold">Watch</span>
          </button>
        )}
      </div>
      <div className="space-y-1">
        <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">{v.title}</h4>
        <div className="flex flex-wrap gap-1.5">
          <Pill tone="cyan">{v.subject}</Pill>
          <Pill>{`${branchLabel(v.branch)} · ${v.year === 'All' ? 'All years' : v.year}`}</Pill>
          <Pill tone={v.source === 'youtube' ? 'rose' : 'slate'}>{v.source === 'youtube' ? 'YouTube' : v.source === 'recorded' ? 'Recorded' : 'Uploaded'}</Pill>
          {v.status === 'uploading' && <Pill tone="amber">Upload not finished</Pill>}
        </div>
        {v.description && <p className="text-sm text-slate-600 dark:text-slate-300">{v.description}</p>}
        <p className="text-xs text-slate-500">
          {`${v.uploadedByName} · ${fmtDate(v.createdAt)}`}
          {v.sizeBytes ? ` · ${mb(v.sizeBytes)}` : ''}
          {v.durationSec ? ` · ${mmss(v.durationSec)}` : ''}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {v.source !== 'youtube' && v.status === 'ready' && (v.allowDownload || staff) && (
          <button onClick={download} disabled={dl !== null} className={`${btnGhost} inline-flex items-center gap-1.5`}>
            <Download className="w-3.5 h-3.5" /> {dl !== null ? `Downloading ${dl}%` : 'Download'}
          </button>
        )}
        {v.source === 'youtube' && (
          <a href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer" className={`${btnGhost} inline-flex items-center gap-1.5`}>
            Open on YouTube ↗
          </a>
        )}
        {staff && (
          <span className="text-xs text-slate-500 inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {`Seen by ${v.viewCount ?? v.viewers.length} students`}
          </span>
        )}
        {canEdit && v.source !== 'youtube' && (
          <button onClick={() => act('toggle_download')} className={`${btnGhost} !px-2.5`}>
            {v.allowDownload ? 'Download: allowed' : 'Download: off'}
          </button>
        )}
        {canEdit && (
          <button onClick={() => act('delete')} className={`${btnGhost} !px-2.5 text-rose-600`} aria-label="Delete video">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {staff && v.viewers.length > 0 && (
        <details className="text-xs text-slate-600 dark:text-slate-300">
          <summary className="cursor-pointer font-bold">Who watched</summary>
          <ul className="pt-1 space-y-0.5">
            {v.viewers.map(x => (
              <li key={x.id}>{`${x.name} · ${fmtDate(x.at)}`}</li>
            ))}
          </ul>
        </details>
      )}
      {err && <p className="text-xs text-rose-600 font-semibold">{err}</p>}
    </Card>
  );
};

export const VideoLecturesScreen: React.FC = () => {
  const { loggedInRole, currentUser, loggedStudent, language } = useCollege();
  const staff = loggedInRole !== 'student';
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [limits, setLimits] = useState({ chunkSize: 2.5 * 1024 * 1024, maxBytes: 300 * 1024 * 1024 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [branch, setBranch] = useState<'All' | 'CSE' | 'Civil'>('All');
  const [year, setYear] = useState<Year>('All');

  const load = useCallback(async () => {
    const r = await api('/api/videos');
    setLoading(false);
    if (!r.success) return setError(r.error || 'Could not load videos.');
    setError(null);
    setVideos(r.videos);
    setLimits({ chunkSize: r.chunkSize, maxBytes: r.maxBytes });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const shown = videos.filter(
    v =>
      (branch === 'All' || v.branch === 'All' || v.branch === branch) &&
      (year === 'All' || v.year === 'All' || v.year === year) &&
      (!q || `${v.title} ${v.subject} ${v.description} ${v.uploadedByName}`.toLowerCase().includes(q.toLowerCase()))
  );
  const hi = language === 'hi';

  return (
    <div className="space-y-6">
      <ScreenHeader
        badge={hi ? 'वीडियो लेक्चर' : 'Video Lectures'}
        title={hi ? 'कॉलेज के वीडियो लेक्चर – देखें और डाउनलोड करें' : 'College video lectures – watch and download'}
        subtitle={
          staff
            ? 'Record a lecture with your camera or screen, upload a video from your phone or computer, or add a YouTube link. Choose the branch and year who should see it.'
            : `Videos from your teachers for ${loggedStudent ? `${loggedStudent.branch.split(' ')[0] === 'Civil' ? 'Civil' : 'CSE'} · ${loggedStudent.currentYear}` : 'your class'}. Watch here, or download when your teacher allows it.`
        }
      />

      {staff && <AddVideo chunkSize={limits.chunkSize} maxBytes={limits.maxBytes} onAdded={load} />}

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className={`${input} pl-8`} placeholder="Search title, subject or teacher" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {staff && (
          <>
            <select className={`${input} w-auto`} value={branch} onChange={e => setBranch(e.target.value as typeof branch)} aria-label="Branch">
              <option value="All">All branches</option>
              <option value="CSE">Computer Science</option>
              <option value="Civil">Civil</option>
            </select>
            <select className={`${input} w-auto`} value={year} onChange={e => setYear(e.target.value as Year)} aria-label="Year">
              {YEARS.map(y => (
                <option key={y} value={y}>
                  {y === 'All' ? 'All years' : y}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading videos…</p>}
      {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}
      {!loading && !error && shown.length === 0 && (
        <Card>
          <p className="text-sm text-slate-500">
            {videos.length ? 'No video matches this search.' : staff ? 'No videos yet. Add the first one above.' : 'Your teachers have not added videos for your class yet.'}
          </p>
        </Card>
      )}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {shown.map(v => (
          <VideoCard key={v.id} v={v} staff={staff} canEdit={loggedInRole === 'admin' || v.uploadedById === currentUser.id} reload={load} />
        ))}
      </div>
    </div>
  );
};
