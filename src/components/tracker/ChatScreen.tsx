'use client';

/**
 * College Chat (WhatsApp style): college/branch/staff groups and direct messages. Polls /api/chat every 5 s.
 * Who may use which room is decided on the server in src/lib/server/chatStore.ts.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Search, Send, Users } from 'lucide-react';
import { api } from '../../lib/client/api';
import { ScreenHeader, input } from './TrackerUi';

interface Msg { id: string; room: string; fromId: string; fromName: string; fromRole: string; text: string; createdAt: string }
interface Person { id: string; name: string; role: string; info: string }
interface Room { id: string; name: string; kind: 'group' | 'dm'; info: string; last: Msg | null }

const dmRoom = (a: string, b: string) => `dm:${[a, b].sort().join('|')}`;
const time = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const ROLE: Record<string, string> = { admin: 'Admin', faculty: 'Teacher', student: 'Student' };

/** WhatsApp-style chat: college, branch and staff groups, plus a direct chat with anyone. Refreshes every 5 seconds. */
export const ChatScreen: React.FC = () => {
  const [me, setMe] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [open, setOpen] = useState<{ id: string; name: string; info: string } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await api(`/api/chat${open ? `?room=${encodeURIComponent(open.id)}` : ''}`);
    if (!r.success) return setError(r.error ?? 'Could not load the chat.');
    setError('');
    setMe(r.me);
    setRooms(r.rooms);
    setPeople(r.people);
    if (open) setMessages(r.messages);
  }, [open]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, open?.id]);

  const send = async () => {
    if (!open || !text.trim()) return;
    setSending(true);
    const r = await api('/api/chat', { body: { room: open.id, text } });
    setSending(false);
    if (!r.success) return setError(r.error ?? 'Message not sent.');
    setText('');
    setMessages(m => [...m, r.message]);
    load();
  };

  const found = useMemo(() => {
    const s = find.trim().toLowerCase();
    return s ? people.filter(p => `${p.name} ${p.info} ${ROLE[p.role]}`.toLowerCase().includes(s)).slice(0, 30) : [];
  }, [find, people]);

  return (
    <div className="space-y-5">
      <ScreenHeader
        badge="Chat"
        title="College Chat – groups and direct messages"
        subtitle="Teachers can write to any student or teacher, and students can write to any classmate or teacher. Messages refresh every 5 seconds."
      />
      {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

      <div className="grid md:grid-cols-[320px_1fr] gap-4 min-h-[520px]">
        {/* conversation list */}
        <div className={`${open ? 'hidden md:flex' : 'flex'} flex-col gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800`}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={`${input} pl-8`} placeholder="Find a student or teacher" value={find} onChange={e => setFind(e.target.value)} />
          </div>
          {found.length > 0 && (
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <p className="text-[10px] font-black uppercase text-slate-400">Start a chat</p>
              {found.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setOpen({ id: dmRoom(me, p.id), name: p.name, info: `${ROLE[p.role] ?? p.role} · ${p.info}` });
                    setMessages([]);
                    setFind('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                  <span className="block text-[11px] text-slate-500">
                    {ROLE[p.role] ?? p.role} · {p.info}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="space-y-1 overflow-y-auto">
            {rooms.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setOpen({ id: r.id, name: r.name, info: r.info });
                  setMessages([]);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl cursor-pointer flex gap-3 items-start ${open?.id === r.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
              >
                <span className="w-9 h-9 shrink-0 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center">
                  {r.kind === 'group' ? <Users className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{r.name}</span>
                  <span className="block text-[11px] text-slate-500 truncate">{r.last ? `${r.last.fromId === me ? 'You' : r.last.fromName}: ${r.last.text}` : r.info}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* open conversation */}
        <div className={`${open ? 'flex' : 'hidden md:flex'} flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden`}>
          {!open ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-slate-500">Choose a group, or find a person to start a chat.</div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => setOpen(null)} className="md:hidden cursor-pointer" aria-label="Back to chats">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{open.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{open.info}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 dark:bg-slate-950/40 max-h-[60vh]">
                {messages.length === 0 && <p className="text-center text-xs text-slate-400 py-8">No messages yet. Say hello.</p>}
                {messages.map(m => {
                  const mine = m.fromId === me;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${mine ? 'bg-cyan-600 text-white rounded-br-md' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md'}`}>
                        {!mine && (
                          <p className="text-[11px] font-black text-cyan-700 dark:text-cyan-300">
                            {m.fromName} · {ROLE[m.fromRole] ?? m.fromRole}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-cyan-100' : 'text-slate-400'}`}>{time(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  send();
                }}
                className="flex gap-2 p-3 border-t border-slate-100 dark:border-slate-800"
              >
                <input className={input} placeholder="Type a message" value={text} maxLength={1000} onChange={e => setText(e.target.value)} />
                <button disabled={sending || !text.trim()} className="px-4 rounded-xl bg-cyan-600 text-white cursor-pointer disabled:opacity-40" aria-label="Send">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
