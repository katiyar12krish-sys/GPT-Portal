'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Download, Sparkles } from 'lucide-react';
import { useCollege } from '../../context/CollegeContext';
import { usePlacementTracker } from '../../hooks/usePlacementTracker';
import { Card, Pill, ScoreBar, ScreenHeader, Stat, btnGhost, fmtDate, scoreTone } from './TrackerUi';
import { DownloadButton } from '../ui/DownloadButton';
import { RESUME_FIXES, SAMPLE_RESUMES } from '../../lib/data/sampleResumes';

/** Four sample resumes to copy the layout from, and the common mistakes with their fixes. */
const ResumeHelp: React.FC<{ weak: boolean }> = ({ weak }) => {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      {weak && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20 space-y-2">
          <h3 className="font-black text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Your resume needs some work – fix it in 4 steps
          </h3>
          <ol className="text-xs text-slate-700 dark:text-slate-200 list-decimal pl-5 space-y-1">
            <li>Open one of the sample resumes below that matches you, and download it.</li>
            <li>Keep the same headings and order, and write your own details under each heading.</li>
            <li>Fix the points in “How to improve” and the mistakes in the table below.</li>
            <li>Save it as a PDF from Word or Google Docs (not a photo), and upload it again here to see the new score.</li>
          </ol>
        </Card>
      )}

      <Card className="space-y-3">
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Sample resumes – make yours like this</h3>
        <p className="text-xs text-slate-500">Names and phone numbers in the samples are made up. Replace every detail with your own.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {SAMPLE_RESUMES.map(r => (
            <div key={r.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{r.title}</p>
                  <p className="text-[11px] text-slate-500">{r.forWhom}</p>
                </div>
                <DownloadButton href={`/api/resume/sample/${r.id}`} className={`${btnGhost} !px-2.5 !py-1 text-[11px] inline-flex items-center gap-1 shrink-0`}>
                  <Download className="w-3 h-3" /> PDF
                </DownloadButton>
              </div>
              <button onClick={() => setOpen(o => (o === r.id ? null : r.id))} className="text-[11px] font-black text-cyan-700 dark:text-cyan-300 cursor-pointer">
                {open === r.id ? 'Hide sample' : 'View sample'}
              </button>
              {open === r.id && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-2">
                  <p className="text-base font-black text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-slate-500">{r.contact}</p>
                  {r.sections.map(([h, rows]) => (
                    <div key={h}>
                      <p className="font-black uppercase tracking-wide text-[11px] text-cyan-700 dark:text-cyan-300">{h}</p>
                      {rows.map(t => (
                        <p key={t} className="text-slate-700 dark:text-slate-200">{t}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-black text-sm text-slate-900 dark:text-white">Not this – write this</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {RESUME_FIXES.map(([wrong, right]) => (
            <div key={wrong} className="py-2 grid sm:grid-cols-2 gap-2 text-xs">
              <p className="text-rose-700 dark:text-rose-300">✗ {wrong}</p>
              <p className="text-emerald-700 dark:text-emerald-300">✓ {right}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const readAsDataUrl = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(f);
  });

export const StudentResumeSubmitScreen: React.FC = () => {
  const { language } = useCollege();
  const { data, post, loading } = usePlacementTracker();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const latest = data.resumes[0];

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!/\.(pdf|docx|txt)$/i.test(f.name)) return setMsg({ ok: false, text: 'Only PDF, DOCX or TXT files.' });
    if (f.size > 2 * 1024 * 1024) return setMsg({ ok: false, text: 'File is larger than 2 MB.' });
    setBusy(true);
    setMsg(null);
    const r = await post({ action: 'resume', fileName: f.name, fileType: f.type, base64: await readAsDataUrl(f) });
    setBusy(false);
    setMsg(r.success ? { ok: true, text: `Sent to faculty & TPO. Score: ${r.resume.analysis.score}/100` } : { ok: false, text: r.error || 'Upload failed.' });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        badge={language === 'hi' ? 'रिज्यूमे सबमिशन' : 'Resume Submission'}
        title={language === 'hi' ? 'अपना रिज्यूमे भेजें – फैकल्टी को तुरंत दिखेगा' : 'Send your resume – faculty see it instantly'}
        subtitle={
          language === 'hi'
            ? 'PDF / DOCX अपलोड करें। सिस्टम रिज्यूमे का विश्लेषण करके स्कोर और सुधार के सुझाव देगा। हर नया अपलोड नया वर्ज़न बनता है।'
            : 'Upload a PDF / DOCX. It is analysed automatically (score, ATS match, missing sections). Every upload is saved as a new version for your faculty and the TPO.'
        }
      />

      <Card>
        <label
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            onFile(e.dataTransfer.files[0]);
          }}
          className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed border-cyan-300 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-950/20 cursor-pointer text-center"
        >
          <UploadCloud className="w-8 h-8 text-cyan-600" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{busy ? 'Uploading & analysing…' : 'Click or drop your resume here'}</span>
          <span className="text-[11px] text-slate-500">PDF, DOCX or TXT · max 2 MB · text-based (not a photo)</span>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" disabled={busy} onChange={e => onFile(e.target.files?.[0])} />
        </label>
        {msg && (
          <p className={`mt-3 text-xs font-bold flex items-center gap-1.5 ${msg.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
            {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />} {msg.text}
          </p>
        )}
      </Card>

      {loading ? null : !latest ? (
        <>
          <Card>
            <p className="text-sm text-slate-500">No resume sent yet. Look at a sample below, make yours, then upload it here.</p>
          </Card>
          <ResumeHelp weak={false} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Resume score" value={`${latest.analysis.score}/100`} tone={scoreTone(latest.analysis.score)} />
            <Stat label="ATS match" value={`${latest.analysis.atsScore}%`} tone={scoreTone(latest.analysis.atsScore)} />
            <Stat label="Skills found" value={latest.analysis.skillsFound.length} />
            <Stat label="Versions sent" value={data.resumes.length} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" /> Analysis of v{latest.version}
              </h3>
              <ScoreBar value={latest.analysis.score} />
              <div className="flex flex-wrap gap-1.5">
                {latest.analysis.sectionsFound.map(s => (
                  <Pill key={s} tone="green">✓ {s}</Pill>
                ))}
                {latest.analysis.sectionsMissing.map(s => (
                  <Pill key={s} tone="rose">✗ {s}</Pill>
                ))}
              </div>
              {latest.analysis.skillsFound.length > 0 && (
                <p className="text-[11px] text-slate-500">
                  <b>Skills:</b> {latest.analysis.skillsFound.join(', ')}
                </p>
              )}
              {latest.analysis.strengths.length > 0 && (
                <ul className="text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
                  {latest.analysis.strengths.map(s => (
                    <li key={s}>+ {s}</li>
                  ))}
                </ul>
              )}
            </Card>
            <Card className="space-y-2">
              <h3 className="font-black text-sm text-slate-900 dark:text-white">How to improve</h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                {latest.analysis.suggestions.length ? latest.analysis.suggestions.map(s => <li key={s}>{s}</li>) : <li>Looks great – keep it updated.</li>}
              </ul>
            </Card>
          </div>

          <ResumeHelp weak={latest.analysis.score < 60} />

          <Card>
            <h3 className="font-black text-sm text-slate-900 dark:text-white mb-3">Sent history (visible to faculty & admin)</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.resumes.map(r => (
                <div key={r.id} className="py-2.5 flex items-center gap-3 text-xs">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      v{r.version} · {r.fileName}
                    </div>
                    <div className="text-slate-400">
                      {fmtDate(r.submittedAt)} · {r.sizeKb} KB
                    </div>
                  </div>
                  <span className={`font-black ${scoreTone(r.analysis.score)}`}>{r.analysis.score}/100</span>
                  <a href={`/api/tracker/file/${r.id}`} className={btnGhost} title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
