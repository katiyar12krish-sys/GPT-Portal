import type { PlacementMcq } from '../placementQnaBank';
import { fmt, generate, mcq, numDistractors, type Rng } from './builder';
import { matchedPairs, pairs, type Fact } from './pairs';

/**
 * Subject-wise question sets for each branch (9 CSE subjects, 9 Civil subjects, 500+ questions each).
 *
 * Each subject = the existing questions on that subject (Subject Bank, UBTER syllabus, diploma subjects – their ids are kept,
 * so old test history still opens) + new questions made here: calculation templates whose answers are computed,
 * and concept tables asked both ways. To add a subject: add a SubjectSpec below with its `sources` and `make` templates.
 */
export type Branch = 'CSE' | 'Civil';
type Make = (r: Rng, id: string) => PlacementMcq | null;
export interface SubjectSpec {
  name: string;
  sources: Array<[category: string, subject: string]>;
  extra?: PlacementMcq[]; // concept questions made from tables
  make: Make[]; // calculation templates, used in turn
  code: string; // id prefix of new questions
}

export const SUBJECT_TARGET = 500;
const X = 'Subject Bank' as const; // temporary category; the bank re-tags these as "<Branch> Subjects"

const num = (r: Rng, id: string, q: string, a: number, why: string, unit = '', step?: number) =>
  mcq(r, id, X, q, `${fmt(a)}${unit}`, numDistractors(r, a, step ?? Math.max(1, Math.round(Math.abs(a) * 0.15))).map(v => `${fmt(v)}${unit}`), why);
const str = (r: Rng, id: string, q: string, a: string, wrong: string[], why: string) => mcq(r, id, X, q, a, wrong, why);
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const words = ['delta', 'tanakpur', 'placement', 'diploma', 'python', 'student', 'network', 'college', 'campus', 'project', 'server', 'record'];
const facts = (code: string, seed: number, subject: string, f: Fact[], ask: (a: string) => string, inv: (b: string) => string, label: string) => [
  ...pairs(`${code}-f`, seed, X, subject, f, ask, inv),
  ...matchedPairs(`${code}-fm`, seed + 1, X, subject, f, label),
];

// ============================ CSE templates ============================
const cProg: Make[] = [
  (r, id) => { const a = r.int(10, 99), b = r.int(2, 9); return num(r, id, `In C, int a = ${a}, b = ${b}; what is a / b?`, Math.trunc(a / b), 'Integer division drops the decimal part.', '', 1); },
  (r, id) => { const a = r.int(10, 99), b = r.int(2, 9); return num(r, id, `In C, what is ${a} % ${b}?`, a % b, 'Remainder after division.', '', 1); },
  (r, id) => { const s = r.int(0, 5), e = r.int(12, 40), k = r.int(2, 5); return num(r, id, `How many times does for (i = ${s}; i < ${e}; i += ${k}) run?`, Math.ceil((e - s) / k), `Values ${s}, ${s + k}, … below ${e}.`, '', 1); },
  (r, id) => { const a = r.int(2, 30), b = r.int(1, 20); return num(r, id, `int x = ${a}; int y = x++ + ${b}; What is y?`, a + b, 'Post-increment uses the old value of x.', '', 1); },
  (r, id) => { const a = r.int(2, 30), b = r.int(1, 20); return num(r, id, `int x = ${a}; int y = ++x + ${b}; What is y?`, a + 1 + b, 'Pre-increment adds 1 before use.', '', 1); },
  (r, id) => { const a = r.int(5, 60), b = r.int(5, 60); return num(r, id, `In C, what is ${a} & ${b} (bitwise AND)?`, a & b, `${a.toString(2)} AND ${b.toString(2)}.`, '', 1); },
  (r, id) => { const a = r.int(5, 60), b = r.int(5, 60); return num(r, id, `In C, what is ${a} | ${b} (bitwise OR)?`, a | b, `${a.toString(2)} OR ${b.toString(2)}.`, '', 1); },
  (r, id) => { const a = r.int(5, 60), b = r.int(5, 60); return num(r, id, `In C, what is ${a} ^ ${b} (bitwise XOR)?`, a ^ b, `${a.toString(2)} XOR ${b.toString(2)}.`, '', 1); },
  (r, id) => { const a = r.int(1, 15), k = r.int(1, 4); return num(r, id, `In C, what is ${a} << ${k}?`, a << k, `Left shift by ${k} multiplies by ${2 ** k}.`, '', 1); },
  (r, id) => { const a = r.int(16, 200), k = r.int(1, 3); return num(r, id, `In C, what is ${a} >> ${k}?`, a >> k, `Right shift by ${k} divides by ${2 ** k} (integer).`, '', 1); },
  (r, id) => { const n = r.int(5, 100); return num(r, id, `For int arr[${n}];, what is the last valid index?`, n - 1, 'Indexes start at 0.', '', 1); },
  (r, id) => { const k = r.int(1, 25); return num(r, id, `printf("%d", 'A' + ${k}); prints?`, 65 + k, "'A' is 65 in ASCII.", '', 1); },
  (r, id) => { const a = r.int(1, 50), b = r.int(1, 50); return num(r, id, `In C, what is (${a} > ${b}) ? ${a} : ${b}?`, Math.max(a, b), 'The ternary operator picks the larger here.', '', 1); },
];
const ds: Make[] = [
  (r, id) => { const [a, b, c] = [r.int(1, 99), r.int(1, 99), r.int(1, 99)]; return num(r, id, `Stack: push(${a}), push(${b}), push(${c}), pop(). Top element now?`, b, 'pop() removes the last pushed item.', '', 3); },
  (r, id) => { const [a, b, c] = [r.int(1, 99), r.int(1, 99), r.int(1, 99)]; return num(r, id, `Queue: enqueue(${a}), enqueue(${b}), enqueue(${c}), dequeue(). Front element now?`, b, 'dequeue() removes the first item.', '', 3); },
  (r, id) => { const n = r.int(10, 5000); return num(r, id, `Maximum comparisons in binary search on ${n} sorted items?`, Math.floor(Math.log2(n)) + 1, 'floor(log2 n) + 1.', '', 1); },
  (r, id) => { const base = r.int(10, 90) * 100, s = r.pick([2, 4, 8]), i = r.int(1, 40); return num(r, id, `Array base address ${base}, element size ${s} bytes. Address of A[${i}] (index from 0)?`, base + i * s, `${base} + ${i} × ${s}.`, '', s); },
  (r, id) => { const n = r.int(5, 200); return num(r, id, `A tree with ${n} nodes has how many edges?`, n - 1, 'A tree always has n − 1 edges.', '', 1); },
  (r, id) => { const n = r.int(4, 40); return num(r, id, `Worst-case comparisons of bubble sort on ${n} items?`, (n * (n - 1)) / 2, 'n(n − 1)/2.'); },
  (r, id) => { const n = r.int(3, 30); return num(r, id, `Maximum edges in a simple undirected graph with ${n} vertices?`, (n * (n - 1)) / 2, 'n(n − 1)/2.'); },
  (r, id) => { const n = r.int(2, 1000); return num(r, id, `Minimum height of a binary tree with ${n} nodes (root at height 0)?`, Math.floor(Math.log2(n)), 'floor(log2 n).', '', 1); },
];
const dbms: Make[] = [
  (r, id) => { const a = r.int(2, 40), b = r.int(2, 40); return num(r, id, `CROSS JOIN of a table with ${a} rows and a table with ${b} rows returns how many rows?`, a * b, 'Every row pairs with every row.'); },
  (r, id) => { const c = r.int(3, 15), t = r.int(10, 500); return num(r, id, `A relation has ${c} attributes and ${t} tuples. Its degree is?`, c, 'Degree = number of attributes.', '', 1); },
  (r, id) => { const c = r.int(3, 15), t = r.int(10, 500); return num(r, id, `A relation has ${c} attributes and ${t} tuples. Its cardinality is?`, t, 'Cardinality = number of tuples (rows).'); },
  (r, id) => { const n = r.int(20, 200), m = r.int(1, 19); return num(r, id, `A table has ${n} rows; column phone is NULL in ${m} rows. SELECT COUNT(phone) returns?`, n - m, 'COUNT(column) skips NULLs.'); },
  (r, id) => { const v = [r.int(40, 99), r.int(40, 99), r.int(40, 99), r.int(40, 99)]; return num(r, id, `marks column holds ${v.join(', ')}. SELECT SUM(marks) returns?`, v.reduce((s, x) => s + x, 0), 'SUM adds every value.'); },
  (r, id) => { const v = [r.int(40, 99), r.int(40, 99), r.int(40, 99), r.int(40, 99)]; return num(r, id, `marks column holds ${v.join(', ')}. SELECT MAX(marks) - MIN(marks) returns?`, Math.max(...v) - Math.min(...v), 'Highest minus lowest.', '', 2); },
  (r, id) => { const v = [r.int(10, 50) * 2, r.int(10, 50) * 2, r.int(10, 50) * 2, r.int(10, 50) * 2]; return num(r, id, `price column holds ${v.join(', ')}. SELECT AVG(price) returns?`, v.reduce((s, x) => s + x, 0) / 4, 'Total ÷ count.', '', 2); },
];
const os: Make[] = [
  (r, id) => { const b = [r.int(2, 12), r.int(2, 12), r.int(2, 12)]; return num(r, id, `FCFS, burst times ${b.join(', ')} ms, all arrive at 0. Average turnaround time?`, round((b[0] + (b[0] + b[1]) + (b[0] + b[1] + b[2])) / 3), 'Average of completion times.', ' ms', 2); },
  (r, id) => { const b = [r.int(2, 12), r.int(2, 12), r.int(2, 12)]; const s = [...b].sort((x, y) => x - y); return num(r, id, `SJF (non-preemptive), bursts ${b.join(', ')} ms, all arrive at 0. Average waiting time?`, round((0 + s[0] + (s[0] + s[1])) / 3), `Run in order ${s.join(', ')}.`, ' ms', 2); },
  (r, id) => { const p = r.int(4, 12), k = r.int(8, 14); return num(r, id, `${2 ** p} pages, page size ${2 ** k} bytes. Bits in a logical address?`, p + k, `${p} bits for page + ${k} bits for offset.`, '', 1); },
  (r, id) => { const n = r.int(10, 200), ps = r.pick([4, 8, 16]); return num(r, id, `Process size ${n} KB, page size ${ps} KB. Pages needed?`, Math.ceil(n / ps), 'Round up.', '', 1); },
  (r, id) => { const ps = r.pick([4, 8, 16]); const n = r.int(2, 30) * ps + r.int(1, ps - 1); return num(r, id, `Process size ${n} KB, page size ${ps} KB. Internal fragmentation in the last page?`, Math.ceil(n / ps) * ps - n, 'Unused space of the last page.', ' KB', 1); },
  (r, id) => { const n = r.int(2, 10); return num(r, id, `With ${n} processes, how many different FCFS orders are possible?`, [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800][n], `${n}! orders.`); },
];
const mask = (n: number) => [0, 1, 2, 3].map(i => Math.max(0, Math.min(8, n - i * 8))).map(b => 256 - 2 ** (8 - b)).join('.');
const net: Make[] = [
  (r, id) => { const n = r.int(16, 30); return num(r, id, `Usable host addresses in a /${n} subnet?`, 2 ** (32 - n) - 2, '2^(32 − prefix) − 2.'); },
  (r, id) => { const n = r.int(9, 30); return str(r, id, `Subnet mask of a /${n} network?`, mask(n), [mask(n - 1), mask(n + 1 > 30 ? n - 2 : n + 1), mask(n - 3 < 8 ? n + 2 : n - 3)], `${n} ones followed by zeros.`); },
  (r, id) => { const size = r.int(2, 40) * 10, rate = r.pick([10, 20, 50, 100]); return num(r, id, `Time to send ${size} Mb over a ${rate} Mbps link?`, size / rate, 'Size ÷ rate.', ' s', 1); },
  (r, id) => { const n = r.int(3, 20); return num(r, id, `Cables needed for a full mesh of ${n} devices?`, (n * (n - 1)) / 2, 'n(n − 1)/2.'); },
  (r, id) => { const o = r.int(1, 254); return str(r, id, `An IPv4 address starting with ${o} belongs to which class?`, o < 128 ? 'Class A' : o < 192 ? 'Class B' : o < 224 ? 'Class C' : o < 240 ? 'Class D' : 'Class E', ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'].filter(c => c !== (o < 128 ? 'Class A' : o < 192 ? 'Class B' : o < 224 ? 'Class C' : o < 240 ? 'Class D' : 'Class E')), 'A 1–127, B 128–191, C 192–223, D 224–239.'); },
  (r, id) => { const v = r.int(1, 255); return num(r, id, `Binary octet ${v.toString(2).padStart(8, '0')} in decimal?`, v, 'Add the place values.', '', 3); },
];
const OOPF: Fact[] = [
  ['Encapsulation', 'Wrapping data and methods in one unit'], ['Abstraction', 'Showing only essential features'], ['Inheritance', 'A class acquiring properties of another'], ['Polymorphism', 'One name, many forms'], ['Constructor', 'Initialises an object when it is created'], ['Destructor', 'Cleans up when an object is destroyed (C++)'], ['Method overloading', 'Same method name, different parameters'], ['Method overriding', 'Child class redefines a parent method'], ['Interface', 'Contract of methods a class must implement'], ['Abstract class', 'Class that cannot be instantiated'], ['static', 'Belongs to the class, not the object'], ['final (Java)', 'Cannot be changed or overridden'], ['this', 'Refers to the current object'], ['super (Java)', 'Refers to the parent class'], ['Virtual function', 'Allows run-time polymorphism in C++'], ['Friend function', 'Non-member that can access private data (C++)'], ['JVM', 'Runs Java bytecode'], ['Garbage collection', 'Automatic memory clean-up in Java'], ['Exception', 'Error event handled with try-catch'], ['Package (Java)', 'Group of related classes'],
];
const oop: Make[] = [
  (r, id) => { const a = r.int(2, 40), b = r.int(1, 20); return num(r, id, `Java: int a = ${a}; a += ${b}; System.out.println(a * 2); prints?`, (a + b) * 2, `(${a} + ${b}) × 2.`); },
  (r, id) => { const w = r.pick(words); return num(r, id, `Java: "${w}".length() returns?`, w.length, 'Number of characters.', '', 1); },
  (r, id) => { const a = r.int(10, 99), b = r.int(2, 9); return num(r, id, `Java: System.out.println(${a} / ${b}); prints?`, Math.trunc(a / b), 'int / int gives an int.', '', 1); },
  (r, id) => { const n = r.int(2, 50); return num(r, id, `Java: new int[${n}].length is?`, n, 'Array length is fixed at creation.', '', 1); },
  (r, id) => { const a = r.int(10, 99), b = r.int(2, 9); return num(r, id, `C++: cout << ${a} % ${b}; prints?`, a % b, 'Remainder.', '', 1); },
  (r, id) => { const a = r.int(1, 99), b = r.int(1, 99); return num(r, id, `Java: Math.max(${a}, ${b}) returns?`, Math.max(a, b), 'The larger value.', '', 1); },
];
const py: Make[] = [
  (r, id) => { const w = r.pick(words); return num(r, id, `Python: len("${w}") returns?`, w.length, 'Counts characters.', '', 1); },
  (r, id) => { const w = r.pick(words); const i = r.int(0, w.length - 1); return str(r, id, `Python: "${w}"[${i}] returns?`, `'${w[i]}'`, [...new Set(w.split('').filter(c => c !== w[i]))].slice(0, 3).map(c => `'${c}'`), 'Index starts at 0.'); },
  (r, id) => { const a = r.int(10, 99), b = r.int(2, 9); return num(r, id, `Python: ${a} // ${b} returns?`, Math.floor(a / b), '// is floor division.', '', 1); },
  (r, id) => { const a = r.int(2, 6), b = r.int(2, 4); return num(r, id, `Python: ${a} ** ${b} returns?`, a ** b, '** is power.'); },
  (r, id) => { const s = r.int(0, 9), e = r.int(12, 40); return num(r, id, `Python: len(list(range(${s}, ${e}))) returns?`, e - s, 'range stops before the end value.', '', 1); },
  (r, id) => { const n = r.int(3, 20), k = r.int(2, 9); return num(r, id, `Python: [x * ${k} for x in range(${n})][-1] returns?`, (n - 1) * k, 'Last item uses x = n − 1.'); },
  (r, id) => { const n = r.int(3, 40); return num(r, id, `Python: sum(range(${n})) returns?`, (n * (n - 1)) / 2, '0 + 1 + … + (n − 1).'); },
];
const web: Make[] = [
  (r, id) => { const w = r.int(100, 600), p = r.int(5, 30), b = r.int(1, 5); return num(r, id, `CSS (content-box): width ${w}px, padding ${p}px and border ${b}px on each side. Total width?`, w + 2 * p + 2 * b, 'width + 2 × padding + 2 × border.', 'px'); },
  (r, id) => { const a = r.int(1, 9), b = r.int(1, 9); return str(r, id, `JavaScript: "${a}" + ${b} gives?`, `"${a}${b}"`, [String(a + b), `"${a + b}"`, 'NaN'], 'With a string, + joins text.'); },
  (r, id) => { const a = r.int(2, 9), b = r.int(1, 9); return num(r, id, `JavaScript: "${a}" * ${b} gives?`, a * b, '* converts the string to a number.', '', 1); },
  (r, id) => { const n = r.int(2, 9); const arr = Array.from({ length: n }, (_, i) => i + 1); return num(r, id, `JavaScript: [${arr.join(', ')}].length is?`, n, 'Number of items.', '', 1); },
  (r, id) => { const n = r.int(10, 900); return num(r, id, `JavaScript: parseInt("${n}px") returns?`, n, 'Reads the number at the start.'); },
  (r, id) => { const v = r.int(16, 255); const hex = v.toString(16).padStart(2, '0'); return num(r, id, `CSS colour #${hex}0000: what is its red value (0–255)?`, v, `${hex} in hexadecimal = ${v}.`, '', 3); },
];
const dig: Make[] = [
  (r, id) => { const v = r.int(5, 255); return num(r, id, `Binary ${v.toString(2)} in decimal?`, v, 'Sum of place values.', '', 3); },
  (r, id) => { const v = r.int(5, 255); return str(r, id, `Decimal ${v} in binary?`, v.toString(2), [(v + 1).toString(2), (v - 1).toString(2), (v ^ 2).toString(2)].filter(x => x !== v.toString(2)), 'Repeated division by 2.'); },
  (r, id) => { const v = r.int(16, 4095); return num(r, id, `Hexadecimal ${v.toString(16).toUpperCase()} in decimal?`, v, 'Powers of 16.'); },
  (r, id) => { const n = r.pick([2, 4, 8, 16, 32, 64]); return num(r, id, `Select lines needed for a ${n}:1 multiplexer?`, Math.log2(n), 'log2(inputs).', '', 1); },
  (r, id) => { const n = r.int(2, 6); return num(r, id, `A ${n}-to-${2 ** n} decoder has how many outputs?`, 2 ** n, '2^n.', '', 2); },
  (r, id) => { const n = r.int(3, 100); return num(r, id, `Minimum flip-flops for a mod-${n} counter?`, Math.ceil(Math.log2(n)), 'ceil(log2 N).', '', 1); },
  (r, id) => { const bits = r.pick([8, 10, 12]), v = r.pick([5, 3.3]); return num(r, id, `Step size of a ${bits}-bit ADC with ${v} V reference (in mV)?`, round((v / 2 ** bits) * 1000, 2), 'Vref ÷ 2^n.', ' mV'); },
  (r, id) => { const on = r.int(1, 9), off = r.int(1, 9); return num(r, id, `PWM: ON ${on} ms, OFF ${off} ms. Duty cycle?`, round((on / (on + off)) * 100, 1), 'ON ÷ period × 100.', '%'); },
];

// ============================ Civil templates ============================
const rb = (t: number) => (t < 90 ? `N${t}°E` : t < 180 ? `S${180 - t}°E` : t < 270 ? `S${t - 180}°W` : `N${360 - t}°W`);
const surv: Make[] = [
  (r, id) => { const rl = r.int(100, 900) + r.int(0, 99) / 100, bs = r.int(50, 390) / 100, fs = r.int(50, 390) / 100; return num(r, id, `BM RL ${fmt(rl)} m, back sight ${fmt(bs)} m, fore sight ${fmt(fs)} m. RL of the point?`, round(rl + bs - fs), 'RL = BM + BS − FS.', ' m', 0.1); },
  (r, id) => { const t = r.int(1, 359); if (t % 90 === 0) return null; const other = [rb((t + 90) % 360 || 1), rb((t + 180) % 360 || 2), rb((360 - t) % 360 || 3)]; return str(r, id, `Whole circle bearing ${t}°. Reduced bearing?`, rb(t), other, 'Measure from N or S towards E or W.'); },
  (r, id) => { const t = r.int(1, 359); return num(r, id, `Fore bearing of a line is ${t}°. Its back bearing?`, t < 180 ? t + 180 : t - 180, 'Back bearing = FB ± 180°.', '°', 10); },
  (r, id) => { const k = r.pick([10, 20, 25, 50, 100]), d = r.int(2, 30); return num(r, id, `Map scale 1 cm = ${k} m. ${d} cm on the map is how many metres on the ground?`, k * d, 'Map distance × scale.', ' m'); },
  (r, id) => { const ci = r.pick([1, 2, 5]), hd = r.int(5, 60) * ci; return num(r, id, `Contour interval ${ci} m, horizontal distance between contours ${hd} m. Gradient is 1 in?`, hd / ci, 'Horizontal ÷ vertical.'); },
  (r, id) => { const o1 = r.int(2, 20), o2 = r.int(2, 20), d = r.int(5, 30); return num(r, id, `Offsets ${o1} m and ${o2} m, ${d} m apart. Area of the strip by the trapezoidal rule?`, ((o1 + o2) / 2) * d, '(o1 + o2)/2 × d.', ' m²'); },
  (r, id) => { const L = r.int(100, 900), c = r.pick([20, 30]), e = r.int(1, 9); return num(r, id, `A ${c} m tape is ${e} cm too long. Measured length ${L} m. True length?`, round((L * (c + e / 100)) / c), 'True = measured × actual tape ÷ nominal tape.', ' m', 0.5); },
];
const mat: Make[] = [
  (r, id) => { const v = r.int(2, 40); return num(r, id, `About how many modular bricks (with mortar, 20 × 10 × 10 cm) are in ${v} m³ of brickwork?`, v * 500, '1 m³ ≈ 500 bricks.'); },
  (r, id) => { const v = r.int(1, 12); return num(r, id, `How many 50 kg cement bags make ${v} m³ of cement (1440 kg/m³)?`, round((v * 1440) / 50, 1), '1440 ÷ 50 = 28.8 bags per m³.'); },
  (r, id) => { const h = r.pick([300, 320, 330, 340, 350]), rs = r.pick([15, 16, 17.5, 20]); if (!Number.isInteger(h / rs)) return null; return num(r, id, `Floor height ${h} cm, riser ${rs} cm. Number of risers?`, h / rs, 'Height ÷ riser.', '', 1); },
  (r, id) => { const l = r.int(3, 15), h = r.int(3, 4); return num(r, id, `Wall ${l} m long and ${h} m high, plastered on both faces. Plaster area?`, 2 * l * h, '2 × length × height.', ' m²'); },
  (r, id) => { const l = r.int(3, 15), t = r.pick([0.1, 0.2, 0.23, 0.3]), h = r.int(3, 4); return num(r, id, `Brick wall ${l} m × ${t} m × ${h} m. Volume of brickwork?`, round(l * t * h), 'l × t × h.', ' m³', 0.2); },
  (r, id) => { const n = r.pick([3, 4, 5, 6]); return num(r, id, `In 1:${n} cement mortar, what percentage of the dry volume is cement?`, round(100 / (1 + n), 1), '1 ÷ (1 + n).', '%', 2); },
  (r, id) => { const l = r.int(3, 12), b = r.int(3, 10), t = r.pick([0.3, 0.6]); return num(r, id, `Floor ${l} m × ${b} m laid with ${t * 100} cm × ${t * 100} cm tiles. Tiles needed (no wastage)?`, Math.ceil((l * b) / (t * t)), 'Floor area ÷ area of one tile.'); },
  (r, id) => { const A = r.int(20, 400), c = r.pick([8, 10, 12, 15]); return num(r, id, `Wall area ${A} m², one coat of paint covers ${c} m² per litre. Paint needed?`, round(A / c, 2), 'Area ÷ coverage.', ' L'); },
];
const rcc: Make[] = [
  (r, id) => { const c = r.int(300, 450), wc = r.pick([0.4, 0.45, 0.5, 0.55]); return num(r, id, `Cement ${c} kg, water ${round(c * wc, 1)} kg. Water-cement ratio?`, wc, 'Water ÷ cement.', '', 0.05); },
  (r, id) => { const f = r.pick([15, 20, 25, 30, 35]), s = r.pick([3.5, 4, 5]); return num(r, id, `Target mean strength of M${f} with standard deviation ${s} N/mm²?`, round(f + 1.65 * s, 2), 'fck + 1.65 s.', ' N/mm²', 1); },
  (r, id) => { const d = r.pick([8, 10, 12, 16, 20, 25]), L = r.int(2, 12); return num(r, id, `Weight of a ${d} mm bar, ${L} m long?`, round(((d * d) / 162) * L, 2), 'd²/162 kg per m.', ' kg'); },
  (r, id) => { const P = r.int(300, 900); return num(r, id, `A 150 mm cube fails at ${P} kN. Compressive strength?`, round((P * 1000) / 22500, 2), 'Load ÷ (150 × 150).', ' N/mm²', 1); },
  (r, id) => { const D = r.int(30, 70) * 10, c = r.pick([20, 25, 30, 40]), d = r.pick([12, 16, 20, 25]); return num(r, id, `Overall depth ${D} mm, clear cover ${c} mm, bar ${d} mm. Effective depth?`, D - c - d / 2, 'D − cover − bar/2.', ' mm', 5); },
  (r, id) => { const a = r.pick([1, 1.5, 2]), b = r.pick([2, 3, 4]), v = r.int(1, 10); return num(r, id, `Nominal mix 1:${a}:${b}, ${v} m³ wet concrete (dry volume factor 1.54). Cement volume?`, round((1.54 * v) / (1 + a + b), 2), '1.54 × V ÷ (sum of parts).', ' m³', 0.05); },
];
const mech: Make[] = [
  (r, id) => { const W = r.int(10, 120), L = r.int(2, 12); return num(r, id, `Simply supported beam, span ${L} m, point load ${W} kN at centre. Maximum bending moment?`, (W * L) / 4, 'WL/4.', ' kN·m'); },
  (r, id) => { const w = r.int(5, 40), L = r.int(2, 10); return num(r, id, `Simply supported beam, span ${L} m, UDL ${w} kN/m. Maximum bending moment?`, round((w * L * L) / 8, 2), 'wL²/8.', ' kN·m'); },
  (r, id) => { const w = r.int(5, 40), L = r.int(2, 10); return num(r, id, `Simply supported beam, span ${L} m, UDL ${w} kN/m. Each support reaction?`, (w * L) / 2, 'wL/2.', ' kN'); },
  (r, id) => { const W = r.int(5, 60), L = r.int(1, 6); return num(r, id, `Cantilever ${L} m long with ${W} kN at the free end. Moment at the support?`, W * L, 'W × L.', ' kN·m'); },
  (r, id) => { const P = r.int(10, 200), A = r.pick([100, 200, 250, 400, 500, 1000]); return num(r, id, `Axial load ${P} kN on an area of ${A} mm². Stress?`, round((P * 1000) / A, 2), 'P ÷ A.', ' N/mm²'); },
  (r, id) => { const b = r.int(10, 40), d = r.int(20, 60); return num(r, id, `Moment of inertia of a ${b} cm × ${d} cm rectangle about its centroid (bd³/12)?`, round((b * d ** 3) / 12, 1), 'bd³/12.', ' cm⁴'); },
  (r, id) => { const dl = r.int(1, 9) / 10, L = r.int(1, 5) * 1000; return num(r, id, `A bar ${L} mm long extends ${dl} mm. Strain in micro-strain (× 10⁻⁶)?`, round((dl / L) * 1e6, 0), 'δ ÷ L, then × 10⁶.', '', 10); },
];
const fluid: Make[] = [
  (r, id) => { const h = r.int(2, 50); return num(r, id, `Water pressure at ${h} m depth (ρg = 9.81 kN/m³)?`, round(9.81 * h, 2), 'p = ρgh.', ' kPa'); },
  (r, id) => { const d = r.pick([0.1, 0.15, 0.2, 0.3, 0.5]), v = r.int(1, 4); return num(r, id, `Pipe diameter ${d} m, velocity ${v} m/s. Discharge in litres per second?`, round(((Math.PI * d * d * v) / 4) * 1000, 1), 'Q = A × V, then × 1000.', ' L/s'); },
  (r, id) => { const d1 = r.pick([0.2, 0.3, 0.4]), d2 = r.pick([0.1, 0.15]), v1 = r.int(1, 3); return num(r, id, `Pipe narrows from ${d1} m to ${d2} m; velocity in the wider part ${v1} m/s. Velocity in the narrow part?`, round(v1 * (d1 / d2) ** 2, 2), 'A1V1 = A2V2.', ' m/s'); },
  (r, id) => { const p = r.int(20, 500); return num(r, id, `A pressure of ${p} kPa equals how many metres of water head?`, round(p / 9.81, 2), 'h = p ÷ 9.81.', ' m'); },
  (r, id) => { const q = r.pick([0.01, 0.02, 0.05, 0.1]); return num(r, id, `A flow of ${q} m³/s for one full day equals?`, round(q * 86400), 'Q × 86,400 s.', ' m³'); },
  (r, id) => { const v = r.int(1, 3), d = r.pick([0.05, 0.1, 0.2]); return num(r, id, `Water (ν = 1 × 10⁻⁶ m²/s), V = ${v} m/s, D = ${d} m. Reynolds number?`, round((v * d) / 1e-6, 0), 'Re = VD/ν.'); },
];
const SOILF: Fact[] = [
  ['Liquid limit', 'Water content at which soil starts to flow'], ['Plastic limit', 'Water content at which soil starts to crumble when rolled'], ['Shrinkage limit', 'Water content below which volume does not reduce'], ['Plasticity index', 'Liquid limit minus plastic limit'], ['Void ratio', 'Volume of voids ÷ volume of solids'], ['Porosity', 'Volume of voids ÷ total volume'], ['Degree of saturation', 'Volume of water ÷ volume of voids'], ['Permeability', 'Ease with which water flows through soil'], ['Consolidation', 'Slow volume decrease as water is squeezed out'], ['Compaction', 'Increasing density by removing air'], ['Optimum moisture content', 'Water content for maximum dry density'], ['Bearing capacity', 'Load per unit area soil can safely carry'], ['Shear strength', 'Resistance of soil to sliding failure'], ['Cohesion', 'Attraction between clay particles'], ['Angle of internal friction', 'Frictional resistance between soil grains'], ['Quick sand', 'Sand that loses strength under upward water flow'], ['Black cotton soil', 'Clayey soil that swells and shrinks a lot'], ['Boulders', 'Particles larger than 300 mm'], ['Sieve analysis', 'Particle size distribution of coarse soil'], ['Hydrometer test', 'Particle size distribution of fine soil'], ['Direct shear test', 'Shear strength on a fixed plane'], ['Triaxial test', 'Shear strength under all-round pressure'], ['Standard penetration test', 'Field test giving N value of soil'], ['Retaining wall', 'Holds back soil at a slope'], ['Pile', 'Long column transferring load to deep strata'],
];
const geo: Make[] = [
  (r, id) => { const ws = r.int(80, 300), ww = r.int(5, 60); return num(r, id, `Wet soil: water ${ww} g, dry solids ${ws} g. Water content?`, round((ww / ws) * 100, 2), 'w = Ww ÷ Ws × 100.', '%'); },
  (r, id) => { const n = r.pick([0.25, 0.3, 0.35, 0.4, 0.45, 0.5]); return num(r, id, `Porosity ${n}. Void ratio?`, round(n / (1 - n), 2), 'e = n ÷ (1 − n).', '', 0.05); },
  (r, id) => { const e = r.pick([0.4, 0.5, 0.6, 0.7, 0.8, 1]); return num(r, id, `Void ratio ${e}. Porosity?`, round(e / (1 + e), 2), 'n = e ÷ (1 + e).', '', 0.03); },
  (r, id) => { const rho = r.int(17, 21) / 10, w = r.pick([5, 8, 10, 12, 15, 20]); return num(r, id, `Bulk density ${rho} g/cc, water content ${w}%. Dry density?`, round(rho / (1 + w / 100), 2), 'ρd = ρ ÷ (1 + w).', ' g/cc', 0.05); },
  (r, id) => { const w = r.pick([10, 15, 20, 25]), G = r.pick([2.6, 2.65, 2.7]), e = r.pick([0.6, 0.7, 0.8]); const S = (w / 100) * G / e; if (S > 1) return null; return num(r, id, `Water content ${w}%, G = ${G}, e = ${e}. Degree of saturation?`, round(S * 100, 1), 'S = wG ÷ e.', '%', 5); },
  (r, id) => { const ll = r.int(30, 70), pl = r.int(15, 29); return num(r, id, `Liquid limit ${ll}%, plastic limit ${pl}%. Plasticity index?`, ll - pl, 'PI = LL − PL.', '%', 2); },
  (r, id) => { const k = r.pick([0.001, 0.002, 0.005]), i = r.pick([0.5, 1, 1.5]), A = r.int(1, 10); return num(r, id, `Darcy's law: k = ${k} m/s, hydraulic gradient ${i}, area ${A} m². Discharge in litres per second?`, round(k * i * A * 1000, 2), 'q = k i A, then × 1000.', ' L/s'); },
];
const EST_UNITS: Fact[] = [
  ['Earthwork in excavation', 'Cubic metre'], ['Plastering', 'Square metre'], ['Reinforcement steel', 'Kilogram or quintal'], ['Skirting', 'Running metre'], ['Number of doors', 'Number (each)'], ['Lime (dry)', 'Cubic metre by volume'], ['Cement', 'Bags of 50 kg'], ['Bitumen', 'Tonne'],
];
const ESTF: Fact[] = [
  ['Preliminary estimate', 'Rough estimate for administrative approval'], ['Detailed estimate', 'Item-wise quantities and rates'], ['Revised estimate', 'Prepared when cost exceeds the sanction by more than 5%'], ['Supplementary estimate', 'For extra work added later'], ['Plinth area estimate', 'Cost = plinth area × rate per m²'], ['Contingencies', 'Allowance for unforeseen costs (about 3–5%)'], ['Work-charged establishment', 'Staff paid from the project cost'], ['Schedule of rates', 'Official list of item rates'], ['Bill of quantities', 'List of items with quantities for tender'], ['Measurement book', 'Official record of measured work'], ['Running bill', 'Part payment during the work'], ['Final bill', 'Last payment after completion'], ['Tender', 'Offer by a contractor to do the work'], ['Earnest money', 'Deposit given with a tender'], ['Security deposit', 'Amount held to ensure proper work'], ['Valuation', 'Finding the present value of a property'], ['Depreciation', 'Loss in value with age'],
];
const est: Make[] = [
  (r, id) => { const q = r.int(10, 500), rate = r.int(50, 900); return num(r, id, `Quantity ${q} m³ at ₹${rate} per m³. Cost?`, q * rate, 'Quantity × rate.', '', undefined); },
  (r, id) => { const l = r.int(5, 40), b = r.pick([0.6, 0.8, 1, 1.2]), d = r.pick([0.6, 0.9, 1, 1.5]); return num(r, id, `Trench ${l} m × ${b} m × ${d} m. Earthwork quantity?`, round(l * b * d), 'l × b × d.', ' m³', 0.5); },
  (r, id) => { const l = r.int(3, 8), b = r.int(3, 6), t = r.pick([0.1, 0.12, 0.125, 0.15]); return num(r, id, `RCC slab ${l} m × ${b} m × ${t} m. Concrete quantity?`, round(l * b * t, 3), 'l × b × t.', ' m³', 0.2); },
  (r, id) => { const c = r.int(5, 90) * 10000, p = r.pick([5, 10, 15]); return num(r, id, `Estimated cost ₹${c.toLocaleString('en-IN')} plus ${p}% contractor's profit. Total?`, round(c * (1 + p / 100)), `Cost × (1 + ${p}/100).`); },
  (r, id) => { const c = r.int(10, 200) * 10000, k = r.pick([3, 4, 5]); return num(r, id, `Contingency of ${k}% on ₹${c.toLocaleString('en-IN')}?`, (c * k) / 100, 'Cost × rate ÷ 100.'); },
  (r, id) => { const a = r.int(50, 300), rate = r.int(15, 35) * 1000; return num(r, id, `Plinth area ${a} m² at ₹${rate.toLocaleString('en-IN')} per m². Plinth area estimate?`, a * rate, 'Area × rate.'); },
  (r, id) => { const v = r.int(5, 60), rate = r.pick([7, 8, 9, 10]); return num(r, id, `${v} m³ of brickwork needs about 500 bricks per m³. Cost of bricks at ₹${rate} each?`, v * 500 * rate, 'Volume × 500 × rate.'); },
];
const TRANSF: Fact[] = [
  ['Broad gauge', '1676 mm'], ['Metre gauge', '1000 mm'], ['Narrow gauge', '762 mm'], ['Camber', 'Cross slope given for drainage'], ['Superelevation', 'Raising the outer edge of a road on a curve'], ['Kerb', 'Boundary between carriageway and footpath'], ['Shoulder', 'Strip beside the carriageway for emergency stops'], ['WBM', 'Water bound macadam'], ['PCU', 'Passenger car unit used for traffic volume'], ['Ballast', 'Stones that hold sleepers and drain water'], ['Sleeper', 'Supports rails and keeps the gauge'], ['Fish plate', 'Joins two rails end to end'], ['Creep of rails', 'Lengthwise movement of rails'], ['Runway', 'Strip for take-off and landing'], ['Taxiway', 'Path between runway and apron'], ['Apron', 'Parking area for aircraft'], ['Culvert', 'Small bridge with span up to 6 m'], ['Abutment', 'End support of a bridge'], ['Pier', 'Intermediate support of a bridge'], ['Expansion joint', 'Gap that allows movement due to temperature'], ['Tunnel portal', 'Entrance of a tunnel'], ['Grade separator', 'Roads crossing at different levels'], ['Rotary', 'Roundabout intersection'], ['IRC', 'Indian Roads Congress'], ['NHAI', 'National Highways Authority of India'],
];
const trans: Make[] = [
  (r, id) => { const V = r.pick([40, 50, 60, 65, 80, 100]), R = r.int(10, 50) * 10; return num(r, id, `Design speed ${V} km/h, curve radius ${R} m. Superelevation (V²/127R)?`, round((V * V) / (127 * R), 2), 'e = V² ÷ 127R.', '', 0.01); },
  (r, id) => { const V = r.pick([40, 50, 60, 80]), t = 2.5, f = r.pick([0.35, 0.37, 0.4]); return num(r, id, `Stopping sight distance at ${V} km/h, reaction time ${t} s, f = ${f}?`, round(0.278 * V * t + (V * V) / (254 * f), 1), '0.278Vt + V²/(254f).', ' m', 3); },
  (r, id) => { const w = r.pick([7, 7.5, 10, 12]), n = r.pick([40, 48, 50, 60]); return num(r, id, `Carriageway ${w} m wide, camber 1 in ${n}. Rise of the crown above the edge?`, round(((w / 2) / n) * 100, 2), '(w/2) ÷ n.', ' cm', 1); },
  (r, id) => { const h = r.int(1, 20), l = r.int(10, 400) * h; return num(r, id, `A road rises ${h} m over ${l} m. Gradient is 1 in?`, l / h, 'Horizontal ÷ rise.'); },
  (r, id) => { const v = r.int(20, 120); return num(r, id, `${v} km/h in metres per second?`, round(v / 3.6, 2), 'Divide by 3.6.', ' m/s'); },
];
const ENVF: Fact[] = [
  ['BOD', 'Oxygen used by bacteria to break down organic matter'], ['COD', 'Oxygen needed to oxidise matter chemically'], ['pH 7', 'Neutral water'], ['Turbidity', 'Cloudiness of water'], ['Coagulation', 'Adding alum to join fine particles'], ['Sedimentation', 'Settling of suspended particles'], ['Rapid sand filter', 'Filter cleaned by backwashing'], ['Slow sand filter', 'Filter with a biological layer on top'], ['Chlorination', 'Disinfection of water with chlorine'], ['Residual chlorine', 'Chlorine left after disinfection'], ['Septic tank', 'Settles and digests household sewage'], ['Activated sludge process', 'Aerated biological sewage treatment'], ['Trickling filter', 'Sewage trickles over stones with bacteria'], ['Oxidation pond', 'Shallow pond treating sewage by algae and bacteria'], ['Manhole', 'Opening for inspecting sewers'], ['Sullage', 'Waste water from kitchens and baths'], ['MLD', 'Million litres per day'], ['lpcd', 'Litres per capita per day'], ['Hardness of water', 'Caused by calcium and magnesium salts'], ['Fluorosis', 'Disease from excess fluoride in water'], ['Grit chamber', 'Removes sand and grit from sewage'], ['Sludge digester', 'Breaks down sludge without oxygen'], ['Landfill', 'Engineered site for solid waste disposal'], ['Composting', 'Turning organic waste into manure'], ['Rainwater harvesting', 'Collecting rain for use or recharge'],
];
const env: Make[] = [
  (r, id) => { const P = r.int(5, 200) * 1000, q = r.pick([70, 100, 135, 150]); return num(r, id, `Population ${P.toLocaleString('en-IN')}, demand ${q} lpcd. Daily demand?`, round((P * q) / 1e6, 2), 'P × q ÷ 10⁶.', ' MLD', 0.1); },
  (r, id) => { const V = r.int(100, 2000), Q = r.int(50, 500); return num(r, id, `Tank volume ${V} m³, flow ${Q} m³/h. Detention time?`, round(V / Q, 2), 'Volume ÷ flow.', ' h', 0.2); },
  (r, id) => { const q = r.int(1, 50), d = r.pick([0.5, 1, 1.5, 2]); return num(r, id, `${q} MLD of water treated with ${d} mg/L chlorine. Chlorine needed per day?`, round(q * d, 2), 'MLD × mg/L = kg/day.', ' kg'); },
  (r, id) => { const i = r.int(150, 400), o = r.int(10, 60); return num(r, id, `BOD in ${i} mg/L, BOD out ${o} mg/L. Removal efficiency?`, round(((i - o) / i) * 100, 1), '(in − out) ÷ in × 100.', '%', 2); },
  (r, id) => { const P = r.int(20, 100) * 1000, x = r.int(1, 5) * 1000, n = r.int(1, 4); return num(r, id, `Arithmetic increase: population ${P.toLocaleString('en-IN')}, average increase ${x.toLocaleString('en-IN')} per decade. Population after ${n} decades?`, P + n * x, 'P + n × x.'); },
];

// ============================ subject lists ============================
export const BRANCH_SUBJECTS: Record<Branch, SubjectSpec[]> = {
  CSE: [
    { name: 'C Programming', code: 'bs-c', sources: [['Subject Bank', 'C Programming'], ['UBTER Syllabus', 'Sem 3 CSE Concepts of C Programming']], make: cProg },
    { name: 'Data Structures', code: 'bs-ds', sources: [['Subject Bank', 'Data Structures'], ['UBTER Syllabus', 'Sem 4 CSE Data Structures Using C']], make: ds },
    { name: 'DBMS & SQL', code: 'bs-db', sources: [['Subject Bank', 'DBMS & SQL'], ['UBTER Syllabus', 'Sem 5 CSE Database Management System']], make: dbms },
    { name: 'Operating Systems', code: 'bs-os', sources: [['Subject Bank', 'Operating Systems'], ['UBTER Syllabus', 'Sem 3 CSE Operating System']], make: os },
    { name: 'Computer Networks', code: 'bs-cn', sources: [['Subject Bank', 'Computer Networks'], ['UBTER Syllabus', 'Sem 4 CSE Computer Networks'], ['UBTER Syllabus', 'Old scheme CSE Data Communication']], make: net },
    { name: 'OOP with C++ & Java', code: 'bs-oop', sources: [['Subject Bank', 'C++'], ['Subject Bank', 'Java'], ['UBTER Syllabus', 'Sem 4 CSE Object Oriented Java']], extra: facts('bs-oop', 3101, 'OOP with C++ & Java', OOPF, a => `In OOP, what is ${a}?`, b => `Which OOP term means: ${b}?`, 'OOP terms'), make: oop },
    { name: 'Python', code: 'bs-py', sources: [['Subject Bank', 'Python'], ['UBTER Syllabus', 'Sem 5 CSE Python Programming'], ['UBTER Syllabus', 'Sem 6 CSE Web Development Using Python']], make: py },
    { name: 'Web Technology (HTML, CSS, JavaScript)', code: 'bs-web', sources: [['Subject Bank', 'HTML'], ['Subject Bank', 'CSS'], ['Subject Bank', 'JavaScript'], ['UBTER Syllabus', 'Sem 3 CSE Internet & Web Design']], make: web },
    { name: 'Digital Electronics & IoT', code: 'bs-dig', sources: [['Subject Bank', 'Digital Electronics'], ['Subject Bank', 'IoT'], ['UBTER Syllabus', 'Old scheme CSE Digital Techniques'], ['UBTER Syllabus', 'Sem 6 CSE Internet of Things']], make: dig },
  ],
  Civil: [
    { name: 'Surveying', code: 'bs-sur', sources: [['Subject Bank', 'Surveying'], ['UBTER Syllabus', 'Sem 3 Civil Basic Surveying'], ['UBTER Syllabus', 'Sem 4 Civil Advanced Surveying']], make: surv },
    { name: 'Building Materials & Construction', code: 'bs-bmc', sources: [['Subject Bank', 'Building Materials & Construction'], ['UBTER Syllabus', 'Sem 3 Civil Building Material & Construction'], ['UBTER Syllabus', 'Sem 3 Civil Building Drawing'], ['UBTER Syllabus', 'Sem 6 Civil Building Restoration & Maintenance']], make: mat },
    { name: 'Concrete Technology & RCC', code: 'bs-rcc', sources: [['Subject Bank', 'Concrete & RCC'], ['UBTER Syllabus', 'Sem 4 Civil Concrete Technology'], ['UBTER Syllabus', 'Sem 5 Civil Reinforced Concrete Design']], make: rcc },
    { name: 'Mechanics & Structures', code: 'bs-mos', sources: [['UBTER Syllabus', 'Sem 3 Civil Engineering Mechanics'], ['UBTER Syllabus', 'Sem 4 Civil Mechanics of Structures'], ['UBTER Syllabus', 'Sem 6 Civil Steel Structure Design'], ['UBTER Syllabus', 'Sem 6 Civil Structural Drawing']], make: mech },
    { name: 'Fluid Mechanics & Hydraulics', code: 'bs-hyd', sources: [['UBTER Syllabus', 'Sem 3 Civil Fluid Mechanics'], ['UBTER Syllabus', 'Sem 4 Civil Water Resources Engineering'], ['UBTER Syllabus', 'Sem 4 Civil Environmental & Irrigation Drawing'], ['Diploma Subjects', 'Mechanics & Hydraulics']], make: fluid },
    { name: 'Geotechnical Engineering', code: 'bs-geo', sources: [['UBTER Syllabus', 'Sem 5 Civil Geotechnical Engineering'], ['Diploma Subjects', 'Hydraulics & Soil']], extra: facts('bs-geo', 3201, 'Geotechnical Engineering', SOILF, a => `In soil mechanics, what is ${a}?`, b => `Which soil term matches: ${b}?`, 'Soil terms'), make: geo },
    { name: 'Estimating & Costing', code: 'bs-est', sources: [['UBTER Syllabus', 'Sem 5 Civil Estimating & Costing'], ['UBTER Syllabus', 'Sem 6 Civil Construction Management & Accounts'], ['Diploma Subjects', 'Estimation & Construction Management'], ['UBTER Syllabus', 'Sem 5 Civil Computer Application']], extra: [...facts('bs-est', 3203, 'Estimating & Costing', ESTF, a => `In estimating, what is "${a}"?`, b => `Which estimating term matches: ${b}?`, 'Estimating terms'), ...pairs('bs-estu', 3209, X, 'Estimating & Costing', EST_UNITS, a => `Unit of measurement for ${a}?`, b => `Which item is measured in: ${b}?`)], make: est },
    { name: 'Transportation Engineering', code: 'bs-trn', sources: [['UBTER Syllabus', 'Sem 5 Civil Highway & Airport Engineering'], ['UBTER Syllabus', 'Sem 5 Civil Railways, Bridges & Tunnels']], extra: facts('bs-trn', 3205, 'Transportation Engineering', TRANSF, a => `In transportation engineering, what is ${a}?`, b => `Which term matches: ${b}?`, 'Transportation terms'), make: trans },
    { name: 'Environmental & Water Supply Engineering', code: 'bs-env', sources: [['UBTER Syllabus', 'Sem 4 Civil Water Supply & Waste Water'], ['UBTER Syllabus', 'Sem 6 Civil Seismology & Disaster Management'], ['UBTER Syllabus', 'Sem 3 Civil Building Automation Systems']], extra: facts('bs-env', 3207, 'Environmental & Water Supply Engineering', ENVF, a => `In environmental engineering, what is ${a}?`, b => `Which term matches: ${b}?`, 'Environmental terms'), make: env },
  ],
};

/** Builds one subject: existing questions first, then new ones until SUBJECT_TARGET is reached. */
export function buildSubject(spec: SubjectSpec, raw: PlacementMcq[], seed: number): PlacementMcq[] {
  const seen = new Set<string>();
  const out: PlacementMcq[] = [];
  const add = (q: PlacementMcq) => {
    if (seen.has(q.question)) return;
    seen.add(q.question);
    out.push(q);
  };
  for (const [cat, sub] of spec.sources) raw.filter(q => q.category === cat && q.subject === sub).forEach(add);
  (spec.extra ?? []).forEach(add);
  if (out.length < SUBJECT_TARGET) {
    const need = SUBJECT_TARGET - out.length;
    const more = generate(`${spec.code}-g`, seed, need + 80, (r, id, i) => spec.make[i % spec.make.length](r, id));
    for (const q of more) {
      if (out.length >= SUBJECT_TARGET) break;
      add(q);
    }
  }
  return out;
}
