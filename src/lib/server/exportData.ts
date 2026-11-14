/**
 * Defines every Excel/PDF download (dataset): title, columns and rows. Used by /api/export/<dataset>.
 * To add a download, add a dataset here; who may download it is checked in the same place.
 */
import { CITY_COMPANIES } from '@/lib/data/cityCompaniesData';
import { CAMPUS_RECRUITER_LOG, YEAR_BRANCH_STATS } from '@/lib/data/campusPlacementStats';
import { ALL_COMPANIES } from '@/lib/data/placementData';
import { PLACEMENT_MCQ_BANK } from '@/lib/data/placementQnaBank';
import type { StudentProfile } from '@/lib/types';
import type { FacultyNotice, MockInterviewResult, QnaAttempt, ResumeSubmission } from '@/lib/tracker/types';
import { HttpError, type SessionUser } from './auth';
import { query } from './db';
import { isDemoMode } from './demo';
import { demoRoster } from './demoRoster';
import { allResources, visibleTo } from './resourceStore';
import { rowToStudent } from './students';
import { allStudents, listItems, noticeTargets } from './trackerStore';

export interface Column {
  header: string;
  /** Relative width, used for both Excel and PDF. */
  width: number;
}
export interface Dataset {
  title: string;
  columns: Column[];
  rows: Array<Array<string | number>>;
}

const col = (header: string, width = 14): Column => ({ header, width });
const num = (n: number | undefined) => (n ? n : '');

async function roster(): Promise<StudentProfile[]> {
  if (isDemoMode()) return demoRoster();
  return (await query('SELECT * FROM students ORDER BY batch_year DESC, roll_number')).map(rowToStudent);
}

async function filteredRoster(p: URLSearchParams) {
  const year = p.get('year');
  const branch = p.get('branch');
  const batch = p.get('batch');
  const q = (p.get('q') ?? '').toLowerCase();
  return (await roster()).filter(
    s =>
      (!year || year === 'All' || s.currentYear === year) &&
      (!branch || branch === 'All' || s.branch === branch) &&
      (!batch || batch === 'All' || String(s.batchYear) === batch) &&
      (!q || `${s.aadharName} ${s.ubterRollNumber} ${s.mobileNumber} ${s.address}`.toLowerCase().includes(q))
  );
}

const suffix = (p: URLSearchParams) => {
  const parts = [p.get('year'), p.get('branch')].filter(v => v && v !== 'All');
  return parts.length ? ` – ${parts.join(', ')}` : '';
};

const staffOnly = (me: SessionUser) => {
  if (me.role === 'student') throw new HttpError(403, 'Only faculty and admin can download this.');
};

export async function buildDataset(name: string, me: SessionUser, p: URLSearchParams): Promise<Dataset> {
  switch (name) {
    case 'students': {
      staffOnly(me);
      const list = await filteredRoster(p);
      return {
        title: `Student list${suffix(p)}`,
        columns: [col('Roll No.', 14), col('Name', 20), col('Branch', 9), col('Year', 9), col('Sem', 5), col('Mobile', 12), col('10th %', 7), col('12th %', 7), col('1st Yr CGPA', 8), col('2nd Yr CGPA', 8), col('Latest Sem %', 8), col('Status', 15)],
        rows: list.map(s => [
          s.ubterRollNumber,
          s.aadharName,
          s.branch.startsWith('Civil') ? 'Civil' : 'CSE',
          s.currentYear,
          s.currentSemester,
          s.mobileNumber,
          num(s.tenthPercentage),
          num(s.twelfthPercentage),
          num(s.firstYearCGPA),
          num(s.secondYearCGPA),
          num(s.semesters[s.semesters.length - 1]?.percentage),
          s.status,
        ]),
      };
    }
    case 'marks': {
      staffOnly(me);
      const list = await filteredRoster(p);
      return {
        title: `Subject-wise marks${suffix(p)}`,
        columns: [col('Roll No.', 14), col('Name', 20), col('Sem', 5), col('Code', 10), col('Subject', 34), col('Marks', 7), col('Out of', 7), col('Grade', 6)],
        rows: list.flatMap(s =>
          s.semesters.flatMap(m => m.subjects.map(x => [s.ubterRollNumber, s.aadharName, m.semNumber, x.subjectCode, x.subjectName, x.obtainedMarks, x.maxMarks, x.grade]))
        ),
      };
    }
    case 'progress': {
      staffOnly(me);
      const [students, resumes, qna, interviews] = await Promise.all([
        allStudents(),
        listItems<ResumeSubmission>('resume'),
        listItems<QnaAttempt>('qna'),
        listItems<MockInterviewResult>('interview'),
      ]);
      return {
        title: 'Student placement progress',
        columns: [col('Roll No.', 14), col('Name', 20), col('Branch / Year', 26), col('Resume score', 8), col('Q&A tests', 7), col('Attempted', 8), col('Correct', 7), col('Wrong', 7), col('Accuracy %', 8), col('Interviews', 8), col('Best interview %', 9)],
        rows: students.map(s => {
          const q = qna.filter(a => a.studentUserId === s.studentUserId);
          const i = interviews.filter(a => a.studentUserId === s.studentUserId);
          const attempted = q.reduce((t, a) => t + a.attempted, 0);
          const correct = q.reduce((t, a) => t + a.correct, 0);
          return [
            s.rollNumber,
            s.studentName,
            s.department,
            resumes.find(r => r.studentUserId === s.studentUserId)?.analysis.score ?? '',
            q.length,
            attempted,
            correct,
            q.reduce((t, a) => t + a.wrong, 0),
            attempted ? Math.round((correct / attempted) * 100) : '',
            i.length,
            i.length ? Math.max(...i.map(x => x.overallScore)) : '',
          ];
        }),
      };
    }
    case 'notices': {
      staffOnly(me);
      const [notices, students] = await Promise.all([listItems<FacultyNotice>('notice'), allStudents()]);
      return {
        title: 'Notice status',
        columns: [col('Notice', 30), col('Roll No.', 14), col('Name', 20), col('Status', 12), col('Reminders', 8), col('Completed on', 14)],
        rows: notices.flatMap(n =>
          noticeTargets(n, students).map(s => {
            const st = n.students[s.studentUserId];
            return [n.title, s.rollNumber, s.studentName, st?.acknowledgedAt ? 'Done' : 'Pending', st?.reminders.length ?? 0, st?.acknowledgedAt?.slice(0, 10) ?? ''];
          })
        ),
      };
    }
    case 'my-report': {
      const s = (await roster()).find(x => x.ubterRollNumber === (p.get('roll') && me.role !== 'student' ? p.get('roll') : me.rollNumber));
      if (!s) throw new HttpError(404, 'Student record not found.');
      return {
        title: `Marks report – ${s.aadharName} (${s.ubterRollNumber})`,
        columns: [col('Semester', 14), col('Code', 10), col('Subject', 36), col('Marks', 8), col('Out of', 8), col('Grade', 7)],
        rows: s.semesters.flatMap(m =>
          m.subjects.length ? m.subjects.map(x => [m.semName, x.subjectCode, x.subjectName, x.obtainedMarks, x.maxMarks, x.grade]) : [[m.semName, '', `Semester result: ${m.percentage}%`, '', '', '']]
        ),
      };
    }
    case 'companies': {
      const city = p.get('city');
      const list = CITY_COMPANIES.filter(c => !city || city === 'All' || c.city === city);
      return {
        title: `Companies for diploma holders${city && city !== 'All' ? ` – ${city}` : ''}`,
        columns: [col('Company', 28), col('City', 15), col('Branch', 7), col('Sector', 20), col('Jobs', 30), col('Selection', 16), col('Starting pay', 26), col('Website', 26)],
        rows: list.map(c => [c.name, c.city, c.branch, c.sector, c.roles, c.mode, c.salary, c.website]),
      };
    }
    case 'recruiters':
      return {
        title: 'Core recruiters',
        columns: [col('Company', 30), col('Branch', 10), col('Type', 9), col('Location', 24), col('Roles', 32), col('Pay', 16), col('Selection', 30)],
        rows: ALL_COMPANIES.map(c => [c.name, c.branch.startsWith('Civil') ? 'Civil' : 'CSE', c.jobType, c.location, c.hiringRoles.join(', '), c.packageRange, c.selectionProcess]),
      };
    case 'campus-record':
      return {
        title: 'Campus placement record',
        columns: [col('Year', 10), col('Branch', 8), col('Students', 8), col('Placed', 8), col('Higher study', 9), col('Not placed', 9), col('Placed %', 8), col('Highest (Rs/yr)', 12), col('Lowest (Rs/yr)', 12)],
        rows: YEAR_BRANCH_STATS.map(s => [s.year, s.branch, s.total, s.placed, s.higherEdu, s.notPlaced, s.placementPct, s.maxAnnual, s.minAnnual]),
      };
    case 'campus-recruiters':
      return {
        title: 'Companies that visited the campus',
        columns: [col('Year', 10), col('Branch', 8), col('Company', 30), col('Location', 18), col('Students', 8), col('Pay', 16)],
        rows: CAMPUS_RECRUITER_LOG.map(r => [r.year, r.branch, r.company, r.location ?? '', r.students ?? '', r.pay]),
      };
    case 'resources': {
      const list = (await allResources()).filter(r => visibleTo(r, me));
      return {
        title: 'Resource library list',
        columns: [col('Title', 36), col('Type', 16), col('Subject', 12), col('Sem', 5), col('Department', 24), col('Teacher', 18), col('Uploaded', 10), col('Downloads', 8)],
        rows: list.map(r => [r.title, r.category, r.subjectCode, r.semester, r.department, r.facultyName, r.uploadedAt, r.downloadCount]),
      };
    }
    case 'qna': {
      const cat = p.get('category');
      const subject = p.get('subject');
      const list = PLACEMENT_MCQ_BANK.filter(q => (!cat || cat === 'All' || q.category === cat) && (!subject || q.subject === subject));
      return {
        title: `Question bank${subject ? ` – ${subject}` : cat && cat !== 'All' ? ` – ${cat}` : ''}`,
        columns: [col('Section', 14), col('Question', 46), col('A', 16), col('B', 16), col('C', 16), col('D', 16), col('Answer', 18), col('Explanation', 34)],
        rows: list.map(q => [q.category, q.question, ...q.options, q.options[q.correctIndex], q.explanation]),
      };
    }
    default:
      throw new HttpError(404, 'Unknown download.');
  }
}
