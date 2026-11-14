// Full data export of the UGIP Tanakpur Portal.   Run:  npm run data:export
//
// Writes the folder data-export/ with EVERY piece of data the portal has:
//   1. Built-in content: every exported list/table in src/lib/data/** (question banks, companies, jobs, syllabus questions,
//      interview papers, guides …). Found automatically, so a new data file is exported without changing this script.
//   2. Portal records saved while it runs: .demo-data/tracker.json (demo mode) and, when DATABASE_URL is set,
//      every table of the PostgreSQL database.
//   3. The English → Hindi dictionary.
// Output, all with comments:
//   ugip-full-database.sql   – PostgreSQL: CREATE TABLE + COMMENT ON TABLE/COLUMN + INSERT for every dataset
//   csv/<table>.csv          – one CSV per table (UTF-8 with BOM, opens in Excel with Hindi intact)
//   json/<table>.json        – the same data as JSON
//   data-dictionary.csv      – every table and column with what it means
//   README.md                – index: table, rows, source
// Private values are never exported: passwords / hashes / OTPs become "[removed]", Aadhaar keeps only the last 4 digits.
import './env';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = 'data-export';
type Row = Record<string, unknown>;
interface Table { name: string; source: string; what: string; rows: Row[] }
const tables: Table[] = [];

// ---------- what each dataset is (anything not listed gets a generic description) ----------
const WHAT: Record<string, string> = {
  PLACEMENT_MCQ_BANK: 'Placement Q&A question bank shown to students (common sections + CSE and Civil sets)',
  INTERVIEW_ROUNDS: 'Mock interview question papers: round, paper number, question, key points, tip',
  INTERVIEW_TRACKS: 'Mock interview papers by track key (used for scoring)',
  UTTARAKHAND_JOBS: 'Uttarakhand government posts open after a diploma',
  ALL_INDIA_GOVT_JOBS: 'All-India government exams and posts open after a diploma',
  ALL_DIRECTORY_COMPANIES: 'Every company in the city directory (all cities, including hidden ones)',
  CITY_COMPANIES: 'Companies shown in the portal (Uttarakhand, New Delhi, Noida)',
  ALL_REGIONAL_COMPANIES: 'Regional recruiters with hiring details (all zones)',
  ALL_COMPANIES: 'Core recruiter profiles (CSE and Civil)',
  INITIAL_INTERVIEW_QA: 'Interview questions with model answers',
  JOB_SITES: 'Official recruitment websites and private job portals',
  SAMPLE_RESUMES: 'Sample resumes (fictional people) for students to copy the format',
  RESUME_FIXES: 'Common resume mistakes and the right way',
  INITIAL_STUDENTS_ROSTER: 'Student roster (sample / demo data)',
  INITIAL_FACULTY_CREDENTIALS: 'Faculty records (passwords removed)',
  INITIAL_USERS: 'Portal user profiles (sample / demo data)',
  YEAR_BRANCH_STATS: 'Placement statistics by year and branch (SAMPLE figures – replace with real ones)',
  CAMPUS_RECRUITER_LOG: 'Campus recruiters and drives by year',
  INITIAL_ACADEMIC_RESOURCES: 'Built-in academic resource library entries',
  ALL_ATTENDANCE_DATABASE: 'Attendance records (sample data)',
  EN_TO_HI: 'English → Hindi translations used by the language switch',
};
const FIELD: Record<string, string> = {
  id: 'Unique id of the row', question: 'Question text', options: 'Answer options (JSON list)', correctIndex: 'Position of the correct option: 0 = A, 1 = B, 2 = C, 3 = D',
  explanation: 'Why the answer is correct', category: 'Section / category', subject: 'Subject or topic', branch: 'Branch: CSE, Civil, Both or empty for all',
  name: 'Name', title: 'Title', city: 'City', website: 'Official website', link: 'Official link', salary: 'Pay', eligibility: 'Who can apply',
  createdAt: 'When the record was created (ISO date-time)', updatedAt: 'When the record was last changed', _kind: 'Kind of portal record (resume, qna, interview …)',
};

// ---------- privacy ----------
const SECRET = /password|passwordhash|passwordplain|passwordencrypted|issuedpassword|otp|secret|token|hash/i;
const AADHAAR = /aadha?ar/i;
function clean(v: unknown, key = ''): unknown {
  if (key && SECRET.test(key)) return v ? '[removed]' : v;
  if (key && AADHAAR.test(key) && typeof v === 'string' && /\d{4}/.test(v)) return `XXXX-XXXX-${v.replace(/\D/g, '').slice(-4)}`;
  if (Array.isArray(v)) return v.map(x => clean(x));
  if (v && typeof v === 'object' && !(v instanceof RegExp)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x, k)]));
  if (v instanceof RegExp) return v.source;
  return v;
}

// ---------- turn any value into rows ----------
const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toLowerCase().replace(/^_|_$/g, '');
function toRows(v: unknown): Row[] {
  if (Array.isArray(v)) return v.map((x, i) => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Row) : { position: i + 1, value: x }));
  if (v && typeof v === 'object') {
    // a map: one row per key; nested lists are spread (e.g. INTERVIEW_ROUNDS: round → papers → questions)
    const out: Row[] = [];
    for (const [k, x] of Object.entries(v as Row)) {
      if (Array.isArray(x) && x.length && Array.isArray(x[0])) x.forEach((paper, pi) => (paper as unknown[]).forEach((q, qi) => out.push({ key: k, paper: pi + 1, position: qi + 1, ...(q && typeof q === 'object' ? (q as Row) : { value: q }) })));
      else if (Array.isArray(x)) x.forEach((q, qi) => out.push({ key: k, position: qi + 1, ...(q && typeof q === 'object' && !Array.isArray(q) ? (q as Row) : { value: q }) }));
      else out.push({ key: k, ...(x && typeof x === 'object' ? (x as Row) : { value: x }) });
    }
    return out;
  }
  return [{ value: v }];
}
function add(name: string, source: string, what: string, v: unknown) {
  const rows = toRows(clean(v));
  if (rows.length) tables.push({ name, source, what, rows });
}

async function main() {
  // 1. built-in content
  const dirs = ['src/lib/data', 'src/lib/data/qna'];
  for (const d of dirs) {
    for (const f of fs.readdirSync(d).filter(x => x.endsWith('.ts')).sort()) {
      const file = `${d}/${f}`;
      const mod = await import(pathToFileURL(path.resolve(file)).href);
      for (const [k, v] of Object.entries(mod)) {
        if (!v || typeof v !== 'object' || typeof v === 'function') continue;
        if (!Array.isArray(v) && Object.keys(v as object).length === 0) continue;
        const prefix = d.endsWith('qna') ? 'qna_' : '';
        add(`${prefix}${snake(f.replace('.ts', ''))}__${snake(k)}`, `${file} → ${k}`, WHAT[k] ?? `${k} from ${f}`, v);
      }
    }
  }
  // 2a. Hindi dictionary
  const dict = await import(pathToFileURL(path.resolve('src/lib/i18n/dictionary.ts')).href);
  add('i18n__en_to_hi', 'src/lib/i18n/dictionary.ts → EN_TO_HI', WHAT.EN_TO_HI, Object.entries(dict.EN_TO_HI ?? {}).map(([en, hi]) => ({ en, hi })));
  if (dict.PATTERNS) add('i18n__patterns', 'src/lib/i18n/dictionary.ts → PATTERNS', 'Hindi patterns for sentences with numbers or names', (dict.PATTERNS as Array<[RegExp, string]>).map(([re, hi]) => ({ pattern: re.source, hindi: hi })));

  // 2b. records saved by the running portal (demo mode)
  const demo = '.demo-data/tracker.json';
  if (fs.existsSync(demo)) {
    const items = JSON.parse(fs.readFileSync(demo, 'utf8')) as Array<{ id: string; kind: string; ownerId: string | null; data: Row; createdAt: string }>;
    const kinds = [...new Set(items.map(i => i.kind))].sort();
    for (const k of kinds) add(`portal__${snake(k)}`, `${demo} (kind "${k}")`, `Portal records of kind "${k}" saved in demo mode`, items.filter(i => i.kind === k).map(i => ({ _kind: i.kind, _owner: i.ownerId, _createdAt: i.createdAt, ...i.data })));
  }

  // 2c. the real database, when configured
  if (process.env.DATABASE_URL) {
    const { query, pool } = await import('../src/lib/server/db');
    const list = await query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    for (const { table_name } of list) {
      const rows = await query(`SELECT * FROM "${table_name}"`);
      add(`db__${table_name}`, `PostgreSQL table ${table_name}`, `Live database table ${table_name}`, rows.map(r => ({ ...r, file: r.file ? `[file of ${(r.file as Buffer).length} bytes – not exported]` : r.file })));
    }
    await pool().end();
  }

  write();
}

// ---------- writers ----------
const cell = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
const sqlStr = (s: string) => `'${s.replace(/'/g, "''")}'`;
const sqlVal = (v: unknown) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' && Number.isFinite(v) ? String(v) : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : sqlStr(cell(v)));
const colType = (rows: Row[], c: string) => {
  const vals = rows.map(r => r[c]).filter(v => v !== null && v !== undefined);
  if (vals.length && vals.every(v => typeof v === 'number')) return 'NUMERIC';
  if (vals.length && vals.every(v => typeof v === 'boolean')) return 'BOOLEAN';
  if (vals.some(v => typeof v === 'object')) return 'JSONB';
  return 'TEXT';
};

function write() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(`${OUT}/csv`, { recursive: true });
  fs.mkdirSync(`${OUT}/json`, { recursive: true });
  const stamp = new Date().toISOString();
  const sql: string[] = [
    '-- =====================================================================================',
    '-- UGIP Tanakpur Portal – full data export (PostgreSQL)',
    `-- Created: ${stamp}   by: npm run data:export (scripts/export-all-data.ts)`,
    `-- Tables: ${tables.length}   Rows: ${tables.reduce((s, t) => s + t.rows.length, 0)}`,
    '-- Every table and column carries a COMMENT. Passwords/OTPs are "[removed]"; Aadhaar keeps the last 4 digits only.',
    '-- Load into an empty database:  psql "$DATABASE_URL" -f ugip-full-database.sql',
    '-- =====================================================================================',
    'BEGIN;',
    '',
  ];
  const dictRows: string[][] = [['table', 'column', 'type', 'meaning', 'source']];
  const readme: string[] = ['# UGIP Tanakpur Portal – full data export', '', `Created ${stamp} with \`npm run data:export\`.`, '', '| Table | Rows | Source | What it is |', '| --- | --- | --- | --- |'];

  for (const t of tables) {
    const cols = [...new Set(t.rows.flatMap(r => Object.keys(r)))];
    const types = Object.fromEntries(cols.map(c => [c, colType(t.rows, c)]));
    // CSV + JSON
    const csv = [cols.map(c => `"${c}"`).join(','), ...t.rows.map(r => cols.map(c => `"${cell(r[c]).replace(/"/g, '""')}"`).join(','))].join('\r\n');
    fs.writeFileSync(`${OUT}/csv/${t.name}.csv`, '﻿' + csv + '\r\n', 'utf8');
    fs.writeFileSync(`${OUT}/json/${t.name}.json`, JSON.stringify(t.rows, null, 1), 'utf8');
    // SQL with comments
    sql.push('-- -------------------------------------------------------------------------------------');
    sql.push(`-- Table: ${t.name}`);
    sql.push(`-- What:  ${t.what}`);
    sql.push(`-- From:  ${t.source}`);
    sql.push(`-- Rows:  ${t.rows.length}`);
    sql.push('-- -------------------------------------------------------------------------------------');
    sql.push(`DROP TABLE IF EXISTS "${t.name}";`);
    sql.push(`CREATE TABLE "${t.name}" (\n${cols.map(c => `  "${c}" ${types[c]}`).join(',\n')}\n);`);
    sql.push(`COMMENT ON TABLE "${t.name}" IS ${sqlStr(`${t.what} – from ${t.source}`)};`);
    for (const c of cols) {
      const meaning = FIELD[c] ?? `Field "${c}" of ${t.source.split(' → ').pop()}`;
      sql.push(`COMMENT ON COLUMN "${t.name}"."${c}" IS ${sqlStr(meaning)};`);
      dictRows.push([t.name, c, types[c], meaning, t.source]);
    }
    for (let i = 0; i < t.rows.length; i += 500) {
      const chunk = t.rows.slice(i, i + 500);
      sql.push(`INSERT INTO "${t.name}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES\n${chunk.map(r => `(${cols.map(c => (types[c] === 'JSONB' && r[c] !== null && r[c] !== undefined ? `${sqlStr(JSON.stringify(r[c]))}::jsonb` : sqlVal(r[c]))).join(', ')})`).join(',\n')};`);
    }
    sql.push('');
    readme.push(`| \`${t.name}\` | ${t.rows.length} | ${t.source} | ${t.what} |`);
  }
  sql.push('COMMIT;');
  fs.writeFileSync(`${OUT}/ugip-full-database.sql`, sql.join('\n') + '\n', 'utf8');
  fs.writeFileSync(`${OUT}/data-dictionary.csv`, '﻿' + dictRows.map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(',')).join('\r\n') + '\r\n', 'utf8');
  readme.push('', 'Files: `ugip-full-database.sql` (all tables, with comments), `csv/` (one CSV per table), `json/` (same as JSON), `data-dictionary.csv` (every column explained).');
  readme.push('', 'Some tables are views of others (for example `city_companies_data__city_companies` is the shown part of `…__all_directory_companies`); both are kept so nothing is missing.');
  fs.writeFileSync(`${OUT}/README.md`, readme.join('\n') + '\n', 'utf8');
  console.log(`Exported ${tables.length} tables, ${tables.reduce((s, t) => s + t.rows.length, 0)} rows → ${OUT}/`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
