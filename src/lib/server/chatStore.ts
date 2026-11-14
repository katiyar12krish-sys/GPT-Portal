import { query } from './db';
import { demoFaculty, isDemoMode } from './demo';
import { allStudents, listItems } from './trackerStore';
import type { SessionUser } from './auth';

// WhatsApp-style chat. Rooms:
//   group:college        everyone
//   group:staff          faculty and admin only
//   group:branch:<name>  students of that branch and all staff
//   dm:<idA>|<idB>       two people; anyone may write to anyone (teacher <-> student, student <-> student, staff <-> staff)
// Every message is one tracker item (kind 'chat'), so it works in demo mode and with the database.

export interface ChatMessage {
  id: string;
  room: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  text: string;
  createdAt: string;
}

export interface ChatPerson {
  id: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  info: string;
  branch: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  kind: 'group' | 'dm';
  info: string;
}

export const MAX_TEXT = 1000;
const STAFF = new Set(['faculty', 'admin']);
const shortBranch = (b: string) => (/civil/i.test(b) ? 'Civil' : /computer|cse/i.test(b) ? 'CSE' : b);

export async function chatPeople(): Promise<ChatPerson[]> {
  const students = (await allStudents()).map(s => ({
    id: s.studentUserId,
    name: s.studentName,
    role: 'student' as const,
    info: `${shortBranch(s.branch)} · ${s.year} · Roll ${s.rollNumber}`,
    branch: s.branch,
  }));
  const staff = isDemoMode()
    ? demoFaculty(false).map(f => ({
        id: f.facultyId,
        name: f.facultyName,
        role: (/principal|admin/i.test(f.facultyId) ? 'admin' : 'faculty') as ChatPerson['role'],
        info: f.department ?? '',
        branch: '',
      }))
    : (await query("SELECT id, name, role, department FROM users WHERE role IN ('faculty','admin') ORDER BY role DESC, name")).map(r => ({
        id: r.id,
        name: r.name,
        role: r.role,
        info: r.department ?? '',
        branch: '',
      }));
  return [...staff, ...students];
}

export const dmRoom = (a: string, b: string) => `dm:${[a, b].sort().join('|')}`;

/** Group rooms this person belongs to. */
export function groupsFor(me: SessionUser, people: ChatPerson[]): ChatRoom[] {
  const staff = STAFF.has(me.role);
  const myBranch = people.find(p => p.id === me.id)?.branch ?? '';
  const branches = Array.from(new Set(people.filter(p => p.role === 'student').map(p => p.branch))).filter(Boolean);
  const rooms: ChatRoom[] = [{ id: 'group:college', name: 'UGIP Tanakpur – College Group', kind: 'group', info: 'All students and staff' }];
  for (const b of branches) {
    if (staff || b === myBranch) rooms.push({ id: `group:branch:${b}`, name: `${shortBranch(b)} Group`, kind: 'group', info: `${b} students and all staff` });
  }
  if (staff) rooms.push({ id: 'group:staff', name: 'Staff Room', kind: 'group', info: 'Faculty and admin only' });
  return rooms;
}

export function canUseRoom(me: SessionUser, room: string, people: ChatPerson[]): boolean {
  if (room.startsWith('dm:')) {
    const ids = room.slice(3).split('|');
    return ids.length === 2 && ids.includes(me.id) && ids[0] !== ids[1] && ids.every(id => id === me.id || people.some(p => p.id === id));
  }
  return groupsFor(me, people).some(g => g.id === room);
}

/** Messages of the rooms given, oldest first. */
export async function messagesIn(rooms: Set<string>): Promise<ChatMessage[]> {
  return (await listItems<ChatMessage>('chat')).filter(m => rooms.has(m.room)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
