/**
 * The Placement Q&A question bank: categories and PLACEMENT_MCQ_BANK, built from the files in src/lib/data/qna/.
 * To add questions, add them to the right file in qna/ (each question: id, category, question, options, answer index, explanation).
 */
import { APTITUDE_QUESTIONS } from './qna/aptitude';
import { REASONING_QUESTIONS } from './qna/reasoning';
import { ENGLISH_QUESTIONS } from './qna/english';
import { CSE_QUESTIONS } from './qna/cseTechnical';
import { CIVIL_QUESTIONS } from './qna/civilTechnical';
import { HR_GK_QUESTIONS } from './qna/hrGk';
import { DIPLOMA_SUBJECT_QUESTIONS } from './qna/diplomaSubjects';
import { UTTARAKHAND_QUESTIONS } from './qna/uttarakhandGk';
import { UTTARAKHAND_MORE } from './qna/uttarakhandMore';
import { CODE_SUBJECTS } from './qna/subjectBankCode';
import { CORE_SUBJECTS } from './qna/subjectBankCore';
import { INDIA_QUESTIONS } from './qna/indiaGk';
import { syllabusQuestions } from './qna/syllabusBank';
import { UPPER_QUESTIONS } from './qna/syllabusUpper';
import { INDIA_MORE } from './qna/indiaGkMore';
import { CIVIL_MORE, CSE_MORE, ENGLISH_MORE, HR_MORE } from './qna/placementMore';
import { BRANCH_SUBJECTS, buildSubject, type Branch } from './qna/branchSubjects';
import { SEMESTER_SYLLABUS } from './qna/semesterSyllabus';
export type { Branch } from './qna/branchSubjects';

// Placement Q&A practice bank (MCQ). Answers are checked on the server and every attempt
// is saved to the Placement Tracker, so faculty/admin see attempted / correct / wrong per student.

export type QnaCategory = 'Aptitude' | 'Reasoning' | 'English' | 'CSE Technical' | 'Civil Technical' | 'HR & Company' | 'Diploma Subjects' | 'Uttarakhand GK' | 'Subject Bank' | 'India GK' | 'UBTER Syllabus' | 'CSE Subjects' | 'Civil Subjects' | 'Semester Syllabus';

export interface PlacementMcq {
  id: string;
  category: QnaCategory;
  subject?: string;
  /** CSE / Civil for branch sections; empty = common to both branches. */
  branch?: Branch;
  /** Set on questions added by faculty in the portal. */
  addedBy?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** Sections every student sees, whatever the branch. */
export const COMMON_CATEGORIES: QnaCategory[] = ['Aptitude', 'Reasoning', 'English', 'HR & Company', 'India GK', 'Uttarakhand GK'];
/** Sections of one branch only. */
export const BRANCH_CATEGORIES: Record<Branch, QnaCategory[]> = { CSE: ['CSE Technical', 'CSE Subjects'], Civil: ['Civil Technical', 'Civil Subjects'] };
/** v4.23: semester-wise questions that follow the UBTER syllabus (first year common, Sem III CSE). */
export const SYLLABUS_CATEGORY: QnaCategory = 'Semester Syllabus';
/** Every visible section, in display order. */
export const QNA_CATEGORIES: QnaCategory[] = [...COMMON_CATEGORIES, ...BRANCH_CATEGORIES.CSE, ...BRANCH_CATEGORIES.Civil, SYLLABUS_CATEGORY];
/** Planned size of each section (the bank trims to these numbers). */
export const SECTION_SIZE: Partial<Record<QnaCategory, number>> = { Aptitude: 800, Reasoning: 600, English: 500, 'HR & Company': 300, 'India GK': 1500, 'CSE Technical': 800, 'Civil Technical': 1000 };

const CORE_MCQS: PlacementMcq[] = [
  // ---------- Aptitude ----------
  { id: 'apt-01', category: 'Aptitude', question: 'A shop gives 20% discount on a ₹750 item. Selling price?', options: ['₹550', '₹600', '₹620', '₹650'], correctIndex: 1, explanation: '750 × 0.8 = 600.' },
  { id: 'apt-02', category: 'Aptitude', question: '12 workers finish a job in 10 days. How many days will 15 workers take?', options: ['6', '7.5', '8', '9'], correctIndex: 2, explanation: '12×10 = 120 man-days; 120 ÷ 15 = 8.' },
  { id: 'apt-03', category: 'Aptitude', question: 'Simple interest on ₹5,000 at 8% per year for 3 years?', options: ['₹1,000', '₹1,200', '₹1,250', '₹1,400'], correctIndex: 1, explanation: '5000 × 8 × 3 / 100 = 1200.' },
  { id: 'apt-04', category: 'Aptitude', question: 'A train 200 m long runs at 72 km/h. Time to cross a pole?', options: ['8 s', '10 s', '12 s', '20 s'], correctIndex: 1, explanation: '72 km/h = 20 m/s; 200 ÷ 20 = 10 s.' },
  { id: 'apt-05', category: 'Aptitude', question: 'Ratio of boys to girls is 3:2. If there are 60 students, girls = ?', options: ['20', '24', '30', '36'], correctIndex: 1, explanation: '60 × 2/5 = 24.' },
  { id: 'apt-06', category: 'Aptitude', question: 'Average of 10, 20, 30, 40, 50 is', options: ['25', '30', '35', '40'], correctIndex: 1, explanation: '150 ÷ 5 = 30.' },
  { id: 'apt-07', category: 'Aptitude', question: 'Cost price ₹400, selling price ₹460. Profit %?', options: ['12%', '15%', '18%', '60%'], correctIndex: 1, explanation: '60/400 × 100 = 15%.' },

  // ---------- Reasoning ----------
  { id: 'rea-01', category: 'Reasoning', question: 'Next number: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '36'], correctIndex: 1, explanation: 'Differences 4, 6, 8, 10, 12 → 42.' },
  { id: 'rea-02', category: 'Reasoning', question: 'If CAT = 24, then DOG = ?', options: ['26', '24', '27', '30'], correctIndex: 0, explanation: 'Sum of letter positions: D4 + O15 + G7 = 26.' },
  { id: 'rea-03', category: 'Reasoning', question: 'Odd one out: Mango, Apple, Potato, Banana', options: ['Mango', 'Apple', 'Potato', 'Banana'], correctIndex: 2, explanation: 'Potato is a vegetable.' },
  { id: 'rea-04', category: 'Reasoning', question: 'Ravi walks 5 km north, turns right and walks 3 km. Which direction is he from the start?', options: ['North-East', 'North-West', 'South-East', 'East'], correctIndex: 0, explanation: 'North then east → north-east.' },
  { id: 'rea-05', category: 'Reasoning', question: 'A is B\'s brother. C is A\'s mother. How is C related to B?', options: ['Aunt', 'Mother', 'Sister', 'Grandmother'], correctIndex: 1, explanation: 'A and B are siblings, so C is B\'s mother too.' },
  { id: 'rea-06', category: 'Reasoning', question: 'Next letters: AZ, BY, CX, ?', options: ['DW', 'DV', 'EW', 'DX'], correctIndex: 0, explanation: 'First letter +1, second −1.' },

  // ---------- English ----------
  { id: 'eng-01', category: 'English', question: 'Choose the correct sentence.', options: ['He don\'t know.', 'He doesn\'t knows.', 'He doesn\'t know.', 'He not know.'], correctIndex: 2, explanation: 'Does + base verb.' },
  { id: 'eng-02', category: 'English', question: 'Synonym of "Diligent"', options: ['Lazy', 'Hard-working', 'Careless', 'Angry'], correctIndex: 1, explanation: 'Diligent = hard-working.' },
  { id: 'eng-03', category: 'English', question: 'Antonym of "Expand"', options: ['Grow', 'Increase', 'Contract', 'Extend'], correctIndex: 2, explanation: 'Contract is the opposite.' },
  { id: 'eng-04', category: 'English', question: 'Fill in: I have been working here ___ 2024.', options: ['for', 'since', 'from', 'by'], correctIndex: 1, explanation: '"Since" with a point in time.' },
  { id: 'eng-05', category: 'English', question: 'Best opening line in an interview "Tell me about yourself":', options: ['I am from a poor family…', 'My name is …, a final-year diploma student in CSE at UGIP Tanakpur …', 'I don\'t know what to say.', 'Read my resume.'], correctIndex: 1, explanation: 'Name, course, college, then skills and goal.' },

  // ---------- CSE Technical ----------
  { id: 'cse-01', category: 'CSE Technical', question: 'Which data structure works on LIFO?', options: ['Queue', 'Stack', 'Array', 'Tree'], correctIndex: 1, explanation: 'Stack = Last In First Out.' },
  { id: 'cse-02', category: 'CSE Technical', question: 'Which SQL command removes all rows but keeps the table?', options: ['DROP', 'DELETE TABLE', 'TRUNCATE', 'REMOVE'], correctIndex: 2, explanation: 'TRUNCATE empties the table.' },
  { id: 'cse-03', category: 'CSE Technical', question: 'Default port of HTTPS?', options: ['80', '21', '443', '8080'], correctIndex: 2, explanation: 'HTTPS = 443.' },
  { id: 'cse-04', category: 'CSE Technical', question: 'Which OOP feature lets one function name have many forms?', options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'], correctIndex: 2, explanation: 'Poly = many, morph = forms.' },
  { id: 'cse-05', category: 'CSE Technical', question: 'IP address 192.168.1.10 belongs to class', options: ['A', 'B', 'C', 'D'], correctIndex: 2, explanation: '192–223 is class C.' },
  { id: 'cse-06', category: 'CSE Technical', question: 'Which is NOT an operating system?', options: ['Linux', 'Windows', 'Oracle', 'macOS'], correctIndex: 2, explanation: 'Oracle is a database company/product.' },
  { id: 'cse-07', category: 'CSE Technical', question: 'Time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctIndex: 1, explanation: 'Halves the search space each step.' },
  { id: 'cse-08', category: 'CSE Technical', question: 'HTML tag for the largest heading?', options: ['<head>', '<h6>', '<h1>', '<header>'], correctIndex: 2, explanation: '<h1> is the largest.' },
  { id: 'cse-09', category: 'CSE Technical', question: 'Primary key in a table must be', options: ['Unique and not null', 'Null allowed', 'Duplicate allowed', 'Only numbers'], correctIndex: 0, explanation: 'Unique + NOT NULL.' },

  // ---------- Civil Technical ----------
  { id: 'civ-01', category: 'Civil Technical', question: 'Standard size of a modular brick (cm)?', options: ['19 × 9 × 9', '23 × 11 × 7', '20 × 10 × 10', '25 × 12 × 8'], correctIndex: 0, explanation: 'Modular brick 19 × 9 × 9 cm (20 × 10 × 10 with mortar).' },
  { id: 'civ-02', category: 'Civil Technical', question: 'Mix ratio of M20 concrete (nominal)?', options: ['1:1:2', '1:1.5:3', '1:2:4', '1:3:6'], correctIndex: 1, explanation: 'M20 ≈ 1 : 1.5 : 3.' },
  { id: 'civ-03', category: 'Civil Technical', question: 'Initial setting time of OPC should not be less than', options: ['10 min', '30 min', '60 min', '600 min'], correctIndex: 1, explanation: 'IS: not less than 30 minutes.' },
  { id: 'civ-04', category: 'Civil Technical', question: 'Instrument used for measuring horizontal and vertical angles', options: ['Dumpy level', 'Theodolite', 'Planimeter', 'Chain'], correctIndex: 1, explanation: 'Theodolite.' },
  { id: 'civ-05', category: 'Civil Technical', question: 'Slump test checks concrete\'s', options: ['Strength', 'Workability', 'Durability', 'Density'], correctIndex: 1, explanation: 'Slump = workability.' },
  { id: 'civ-06', category: 'Civil Technical', question: 'Curing of concrete is normally done for at least', options: ['1 day', '3 days', '7 days', '60 days'], correctIndex: 2, explanation: 'Minimum 7 days for OPC.' },
  { id: 'civ-07', category: 'Civil Technical', question: 'Software mostly used for structural analysis', options: ['AutoCAD', 'STAAD Pro', 'MS Word', 'Tally'], correctIndex: 1, explanation: 'STAAD Pro.' },

  // ---------- HR & Company ----------
  { id: 'hr-01', category: 'HR & Company', question: '"Why should we hire you?" – best approach', options: ['I need money', 'Match your skills/projects to the job and show willingness to learn', 'I am the best', 'My friend works here'], correctIndex: 1, explanation: 'Link your skills to their needs.' },
  { id: 'hr-02', category: 'HR & Company', question: 'Interviewer asks about your weakness. You should', options: ['Say you have none', 'Name a real minor weakness and how you are improving', 'Talk about salary', 'Change the topic'], correctIndex: 1, explanation: 'Honest + improvement plan.' },
  { id: 'hr-03', category: 'HR & Company', question: 'NATS / apprenticeship for diploma holders is run under', options: ['Board of Apprenticeship Training', 'UPSC', 'RBI', 'ISRO'], correctIndex: 0, explanation: 'BOAT runs NATS.' },
  { id: 'hr-04', category: 'HR & Company', question: 'Best thing to carry for a campus drive', options: ['Only phone', 'Printed resume, ID, mark-sheets, pen', 'Nothing', 'Laptop only'], correctIndex: 1, explanation: 'Documents + resume copies.' },
  { id: 'hr-05', category: 'HR & Company', question: 'At the end of an interview when asked "Any questions?"', options: ['No', 'Ask about the role, training or growth', 'Ask about leave first', 'Ask if you passed'], correctIndex: 1, explanation: 'Shows interest in the role.' },
];

/**
 * Every question ever written (old sections included). Kept so that tests taken earlier still open in history.
 * Generated sets use fixed seeds, so ids and answers are identical on server and browser.
 */
const RAW_MCQS: PlacementMcq[] = [
  ...CORE_MCQS,
  ...APTITUDE_QUESTIONS,
  ...REASONING_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...CSE_QUESTIONS,
  ...CIVIL_QUESTIONS,
  ...HR_GK_QUESTIONS,
  ...DIPLOMA_SUBJECT_QUESTIONS,
  ...UTTARAKHAND_QUESTIONS,
  ...UTTARAKHAND_MORE,
  ...CODE_SUBJECTS,
  ...CORE_SUBJECTS,
  ...INDIA_QUESTIONS,
  ...syllabusQuestions(UPPER_QUESTIONS),
];

/** One section: old questions first, then the new ones; duplicates of the same text are dropped; trimmed to SECTION_SIZE. */
function section(category: QnaCategory, more: PlacementMcq[] = [], branch?: Branch): PlacementMcq[] {
  const seen = new Set<string>();
  const out: PlacementMcq[] = [];
  for (const q of [...RAW_MCQS.filter(x => x.category === category), ...more.map(x => ({ ...x, category }))]) {
    if (seen.has(q.question)) continue;
    seen.add(q.question);
    out.push(branch ? { ...q, branch } : q);
  }
  const size = SECTION_SIZE[category];
  return size ? out.slice(0, size) : out;
}

function branchSubjects(branch: Branch): PlacementMcq[] {
  return BRANCH_SUBJECTS[branch].flatMap((spec, i) =>
    buildSubject(spec, RAW_MCQS, 7000 + i * 17 + (branch === 'Civil' ? 500 : 0)).map(q => ({ ...q, category: `${branch} Subjects` as QnaCategory, subject: spec.name, branch }))
  );
}

/** The bank students see: common placement sections + the CSE sets + the Civil sets. */
export const PLACEMENT_MCQ_BANK: PlacementMcq[] = [
  ...section('Aptitude'),
  ...section('Reasoning'),
  ...section('English', ENGLISH_MORE),
  ...section('HR & Company', HR_MORE),
  ...section('India GK', INDIA_MORE),
  ...section('Uttarakhand GK'),
  ...section('CSE Technical', CSE_MORE, 'CSE'),
  ...branchSubjects('CSE'),
  ...section('Civil Technical', CIVIL_MORE, 'Civil'),
  ...branchSubjects('Civil'),
  ...SEMESTER_SYLLABUS, // v4.23 – first year for both branches, Sem III for CSE
];

/** Questions one branch practises: the common sections + its own technical section and subjects. */
export const bankFor = (branch: Branch) => PLACEMENT_MCQ_BANK.filter(q => !q.branch || q.branch === branch);
export const branchOf = (department?: string | null): Branch => (/civil/i.test(department ?? '') ? 'Civil' : 'CSE');

const BY_ID = new Map([...RAW_MCQS, ...PLACEMENT_MCQ_BANK].map(q => [q.id, q]));
/** Questions added by faculty (loaded from /api/questions) – registered so tests and history can show them. */
export const registerQuestions = (list: PlacementMcq[]) => list.forEach(q => BY_ID.set(q.id, q));
export const mcqById = (id: string) => BY_ID.get(id);

/** Subjects of a section with their counts, in bank order; empty for sections without subjects. */
export const subjectsOf = (category: string, list: PlacementMcq[] = PLACEMENT_MCQ_BANK) => {
  const m = new Map<string, number>();
  list.forEach(q => q.category === category && q.subject && m.set(q.subject, (m.get(q.subject) ?? 0) + 1));
  return [...m].map(([subject, count]) => ({ subject, count }));
};
