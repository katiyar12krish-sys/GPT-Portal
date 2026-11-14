import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handle, HttpError, requireUser } from '@/lib/server/auth';
import { putItem } from '@/lib/server/trackerStore';
import { canUseRoom, chatPeople, dmRoom, groupsFor, MAX_TEXT, messagesIn, type ChatMessage } from '@/lib/server/chatStore';

export const dynamic = 'force-dynamic';

/** GET /api/chat?room=…  → people, my rooms with their last message, and the messages of the open room. */
export const GET = handle(async (req: NextRequest) => {
  const me = await requireUser();
  const people = await chatPeople();
  const groups = groupsFor(me, people);
  const all = await messagesIn(new Set([...groups.map(g => g.id), ...people.map(p => dmRoom(me.id, p.id))]));

  const last = new Map<string, ChatMessage>();
  for (const m of all) last.set(m.room, m);
  const dms = people
    .filter(p => p.id !== me.id && last.has(dmRoom(me.id, p.id)))
    .map(p => ({ id: dmRoom(me.id, p.id), name: p.name, kind: 'dm' as const, info: p.info }));
  const rooms = [...groups, ...dms]
    .map(r => ({ ...r, last: last.get(r.id) ?? null }))
    .sort((a, b) => (b.last?.createdAt ?? '').localeCompare(a.last?.createdAt ?? ''));

  const room = req.nextUrl.searchParams.get('room') ?? '';
  const messages = room && canUseRoom(me, room, people) ? all.filter(m => m.room === room).slice(-200) : [];
  return NextResponse.json({ success: true, me: me.id, people: people.filter(p => p.id !== me.id), rooms, messages });
});

const Body = z.object({ room: z.string().min(3).max(200), text: z.string().trim().min(1).max(MAX_TEXT) });

/** POST /api/chat {room, text} – the sender always comes from the login. */
export const POST = handle(async (req: NextRequest) => {
  const me = await requireUser();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) throw new HttpError(400, `Write a message of 1 to ${MAX_TEXT} characters.`);
  const { room, text } = parsed.data;
  if (!canUseRoom(me, room, await chatPeople())) throw new HttpError(403, 'You cannot write in this chat.');
  const msg: ChatMessage = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    room,
    fromId: me.id,
    fromName: me.name,
    fromRole: me.role,
    text,
    createdAt: new Date().toISOString(),
  };
  await putItem('chat', msg.id, me.id, msg);
  return NextResponse.json({ success: true, message: msg });
});
