import { query } from './db';
import { sendSms } from './sms';

/** Sends reminder #n for one assignment to every student who has not submitted. */
export async function sendReminder(assignmentId: string, auto = false): Promise<number> {
  const row = (await query('SELECT * FROM assignments WHERE id=$1', [assignmentId]))[0];
  if (!row) return 0;
  const d = row.data;
  if (d.remindersSentCount >= 3) return 0;
  const n = d.remindersSentCount + 1;
  const pending = d.studentSubmissions.filter((s: any) => !s.isSubmitted);
  for (const p of pending) {
    const st = (await query('SELECT s.user_id, u.mobile, u.sms_alerts FROM students s JOIN users u ON u.id=s.user_id WHERE s.id=$1', [p.studentId]))[0];
    if (!st) continue;
    await query('INSERT INTO notifications (id,target_user_id,data) VALUES ($1,$2,$3)', [
      `notif-${assignmentId}-${p.studentId}-r${n}`, st.user_id,
      JSON.stringify({ title: `Reminder ${n}/3: ${d.title}`, message: `Deadline ${new Date(d.deadlineDate).toLocaleString('en-IN')}. Please submit soon.`, type: 'assignment_reminder', urgencyLevel: n === 3 ? 'urgent' : 'warning' }),
    ]).catch(() => {}); // duplicate id => already sent, ignore
    if (st.mobile && st.sms_alerts) await sendSms(st.mobile, `UGIP Tanakpur: Reminder ${n}/3 - assignment "${d.title}" is pending. Deadline ${new Date(d.deadlineDate).toLocaleDateString('en-IN')}.`);
  }
  d.remindersSentCount = n;
  d.reminderTimestamps = [...d.reminderTimestamps, `${new Date().toISOString().replace('T', ' ').slice(0, 16)} (Reminder #${n}${auto ? ', automatic' : ''})`];
  await query('UPDATE assignments SET data=$2::jsonb WHERE id=$1', [assignmentId, JSON.stringify(d)]);
  return pending.length;
}
