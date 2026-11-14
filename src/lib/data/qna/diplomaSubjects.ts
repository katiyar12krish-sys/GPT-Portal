import type { PlacementMcq } from '../placementQnaBank';
import { fmt, fromRows, generate, mcq, numDistractors, type Row } from './builder';

// Polytechnic semester subjects. Numerical questions are calculated by code.
const C = 'Diploma Subjects' as const;
const tag = (subject: string, list: PlacementMcq[]) => list.map(q => ({ ...q, subject }));

const TRIG: Array<[string, string]> = [
  ['sin 0°', '0'], ['sin 30°', '1/2'], ['sin 45°', '1/√2'], ['sin 60°', '√3/2'], ['sin 90°', '1'],
  ['cos 0°', '1'], ['cos 30°', '√3/2'], ['cos 45°', '1/√2'], ['cos 60°', '1/2'], ['cos 90°', '0'],
  ['tan 0°', '0'], ['tan 30°', '1/√3'], ['tan 45°', '1'], ['tan 60°', '√3'],
];
const TRIG_VALUES = ['0', '1/2', '1/√2', '√3/2', '1', '√3', '1/√3', '2'];

const MATHS = [
  ...generate('dip-der', 701, 80, (r, id) => {
    const a = r.int(2, 12);
    const n = r.int(2, 7);
    const ans = `${a * n}x^${n - 1}`.replace('x^1', 'x');
    return mcq(r, id, C, `d/dx (${a}x^${n}) = ?`, ans, [`${a}x^${n - 1}`, `${a * n}x^${n}`, `${a + n}x^${n - 1}`].map(x => x.replace('x^1', 'x')), `d/dx (ax^n) = a·n·x^(n-1)`);
  }),
  ...generate('dip-int', 702, 48, (r, id) => {
    const n = r.int(1, 5);
    const a = (n + 1) * r.int(1, 6);
    const c = a / (n + 1);
    const k = (v: number) => (v === 1 ? '' : String(v));
    return mcq(r, id, C, `∫ ${a}x^${n} dx = ?`, `${k(c)}x^${n + 1} + C`, [`${k(a)}x^${n + 1} + C`, `${k(c + 1)}x^${n + 1} + C`, `${k(c)}x^${n} + C`], `∫ ax^n dx = a·x^(n+1)/(n+1) + C`);
  }),
  ...generate('dip-det', 703, 80, (r, id) => {
    const [a, b, c, d] = [r.int(1, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)];
    const ans = a * d - b * c;
    return mcq(r, id, C, `Determinant of the matrix [${a} ${b}; ${c} ${d}] is`, String(ans), [String(ans + 2), String(ans - 3), String(a * d + b * c)], `ad - bc = ${a * d} - ${b * c} = ${ans}`);
  }),
  ...fromRows('dip-trig', 704, C, TRIG.map(([q, a]) => {
    const w = TRIG_VALUES.filter(v => v !== a);
    return [`Value of ${q}`, a, w[0], w[2], w[4], `${q} = ${a}`] as Row;
  })),
  ...generate('dip-quad', 705, 48, (r, id) => {
    const p = r.int(1, 12);
    const q = r.int(1, 12);
    if (p === q) return null;
    return mcq(r, id, C, `Sum of the roots of x² - ${p + q}x + ${p * q} = 0 is`, String(p + q), [String(p * q), String(p + q + 1), String(Math.abs(p - q))], `Sum of roots = -b/a = ${p + q}`);
  }),
  ...generate('dip-ap', 706, 48, (r, id) => {
    const a = r.int(1, 20);
    const d = r.int(2, 9);
    const n = r.int(5, 25);
    const t = a + (n - 1) * d;
    return mcq(r, id, C, `In an AP with first term ${a} and common difference ${d}, the ${n}th term is`, String(t), numDistractors(r, t, d).map(String), `a + (n-1)d = ${a} + ${n - 1}×${d} = ${t}`);
  }),
  ...generate('dip-log', 707, 29, (r, id) => {
    const base = r.pick([2, 10]);
    const n = r.int(1, 9);
    const v = base ** n;
    return mcq(r, id, C, `log base ${base} of ${fmt(v).replace(/,/g, '')} = ?`, String(n), [String(n + 1), String(n + 2), String(n + 3)], `${base}^${n} = ${v}`);
  }),
];

const PHYSICS = [
  ...generate('dip-ohm', 710, 56, (r, id) => {
    const i = r.int(1, 12);
    const R = r.int(2, 25);
    return mcq(r, id, C, `A current of ${i} A flows through a ${R} Ω resistor. Voltage across it?`, `${i * R} V`, numDistractors(r, i * R, R).map(x => `${x} V`), `V = IR = ${i} × ${R} = ${i * R} V`);
  }),
  ...generate('dip-force', 711, 48, (r, id) => {
    const m = r.int(2, 40);
    const a = r.int(2, 12);
    return mcq(r, id, C, `Force needed to give a ${m} kg mass an acceleration of ${a} m/s²?`, `${m * a} N`, numDistractors(r, m * a, a).map(x => `${x} N`), `F = ma = ${m * a} N`);
  }),
  ...generate('dip-ke', 712, 40, (r, id) => {
    const m = r.int(1, 10) * 2;
    const v = r.int(2, 12);
    const e = (m * v * v) / 2;
    return mcq(r, id, C, `Kinetic energy of a ${m} kg body moving at ${v} m/s?`, `${e} J`, numDistractors(r, e, v).map(x => `${x} J`), `KE = ½mv² = ${e} J`);
  }),
  ...generate('dip-work', 713, 40, (r, id) => {
    const f = r.int(5, 60);
    const d = r.int(2, 15);
    return mcq(r, id, C, `A force of ${f} N moves a body ${d} m in its own direction. Work done?`, `${f * d} J`, numDistractors(r, f * d, d).map(x => `${x} J`), `W = F × d = ${f * d} J`);
  }),
  ...generate('dip-power', 714, 32, (r, id) => {
    const t = r.int(2, 12);
    const p = r.int(5, 40);
    return mcq(r, id, C, `${p * t} J of work is done in ${t} s. Power?`, `${p} W`, numDistractors(r, p, 3).map(x => `${x} W`), `P = W/t = ${p} W`);
  }),
  ...generate('dip-series', 715, 56, (r, id) => {
    const a = r.pick([2, 3, 4, 6, 8, 10, 12, 15, 20, 30]);
    const b = r.pick([2, 3, 4, 6, 8, 10, 12, 15, 20, 30, 60]);
    if (r.next() < 0.5) return mcq(r, id, C, `Resistors of ${a} Ω and ${b} Ω in series. Total resistance?`, `${a + b} Ω`, numDistractors(r, a + b, 2).map(x => `${x} Ω`), `Series: R = R1 + R2`);
    const p = (a * b) / (a + b);
    return mcq(r, id, C, `Resistors of ${a} Ω and ${b} Ω in parallel. Total resistance?`, `${fmt(p)} Ω`, [`${a + b} Ω`, ...numDistractors(r, p, 1).map(x => `${fmt(x)} Ω`)], `Parallel: R = R1R2/(R1+R2) = ${fmt(p)} Ω`);
  }),
  ...generate('dip-density', 716, 32, (r, id) => {
    const v = r.int(2, 12);
    const d = r.int(2, 9) * 100;
    return mcq(r, id, C, `Mass ${fmt(v * d)} kg, volume ${v} m³. Density?`, `${d} kg/m³`, numDistractors(r, d, 100).map(x => `${x} kg/m³`), `Density = mass / volume`);
  }),
];

const MECHANICS = [
  ...generate('dip-moment', 720, 48, (r, id) => {
    const f = r.int(5, 50);
    const d = r.int(2, 9);
    return mcq(r, id, C, `A force of ${f} kN acts at ${d} m from a point. Moment about the point?`, `${f * d} kN·m`, numDistractors(r, f * d, d).map(x => `${x} kN·m`), `Moment = force × perpendicular distance`);
  }),
  ...generate('dip-stress', 721, 48, (r, id) => {
    const a = r.int(1, 9) * 100;
    const s = r.int(2, 20);
    return mcq(r, id, C, `A load of ${fmt(a * s)} N acts on an area of ${a} mm². Stress?`, `${s} N/mm²`, numDistractors(r, s, 2).map(x => `${x} N/mm²`), `Stress = load / area`);
  }),
  ...generate('dip-strain', 722, 32, (r, id) => {
    const l = r.int(1, 9) * 1000;
    const k = r.pick([1, 2, 5]);
    const dl = (l * k) / 1000;
    return mcq(r, id, C, `A ${l} mm bar extends by ${dl} mm. Strain?`, `0.00${k}`, [`0.0${k}`, `0.${k}`, `${k}`], `Strain = change in length / original length`);
  }),
  ...generate('dip-beam', 723, 40, (r, id) => {
    const w = r.int(2, 20) * 2;
    const L = r.int(2, 10);
    return mcq(r, id, C, `A simply supported beam of span ${L} m carries a central point load of ${w} kN. Reaction at each support?`, `${w / 2} kN`, numDistractors(r, w / 2, 2).map(x => `${x} kN`), `Symmetric loading: each reaction = W/2`);
  }),
  ...generate('dip-flow', 724, 40, (r, id) => {
    const A = r.int(1, 8);
    const v = r.int(2, 9);
    return mcq(r, id, C, `Water flows through a ${A} m² section at ${v} m/s. Discharge?`, `${A * v} m³/s`, numDistractors(r, A * v, 2).map(x => `${x} m³/s`), `Q = A × V`);
  }),
];

const PROGRAMMING = [
  ...generate('dip-cmod', 730, 64, (r, id) => {
    const a = r.int(10, 99);
    const b = r.int(2, 9);
    if (r.next() < 0.5) return mcq(r, id, C, `In C, the value of ${a} % ${b} is`, String(a % b), [String((a % b) + 1), String(b), String(Math.floor(a / b))].filter(x => x !== String(a % b)).concat(String(a + b)), `Remainder of ${a} ÷ ${b}`);
    return mcq(r, id, C, `In C, with int values, ${a} / ${b} gives`, String(Math.floor(a / b)), [String(Math.floor(a / b) + 1), fmt(a / b + 0.5), String(a % b + 50)], `Integer division drops the fraction`);
  }),
  ...generate('dip-loop', 731, 48, (r, id) => {
    const n = r.int(3, 20);
    const s = r.int(1, 3);
    const c = Math.ceil(n / s);
    return mcq(r, id, C, `How many times does this run? for (i = 0; i < ${n}; i += ${s})`, String(c), [String(c + 1), String(c + 2), String(n + 5)], `i takes ${c} values below ${n}`);
  }),
  ...generate('dip-logic', 732, 38, (r, id, i) => {
    const gates: Array<[string, (a: number, b: number) => number]> = [['AND', (a, b) => a & b], ['OR', (a, b) => a | b], ['XOR', (a, b) => a ^ b], ['NAND', (a, b) => 1 - (a & b)], ['NOR', (a, b) => 1 - (a | b)], ['XNOR', (a, b) => 1 - (a ^ b)]];
    const [name, f] = gates[i % 6];
    const a = (i >> 3) & 1;
    const b = ((i % 12) >> 2) & 1;
    return mcq(r, id, C, `Output of a ${name} gate when A = ${a}, B = ${b} (case ${i + 1})`, String(f(a, b)), [String(1 - f(a, b)), 'Undefined', 'High impedance'], `${name}(${a}, ${b}) = ${f(a, b)}`);
  }),
];

const THEORY: Array<[string, Row[]]> = [
  ['Applied Chemistry', [
    ['Atomic number of carbon', '6', '12', '8', '14'],
    ['pH below 7 means the solution is', 'Acidic', 'Basic', 'Neutral', 'Saline'],
    ['Chemical formula of common salt', 'NaCl', 'KCl', 'CaCO3', 'NaOH'],
    ['Rusting of iron is an example of', 'Oxidation', 'Reduction', 'Distillation', 'Filtration'],
    ['Temporary hardness of water is due to', 'Bicarbonates of Ca and Mg', 'Chlorides of Na', 'Sulphates of Ca', 'Nitrates of K'],
    ['Lubricants are used to reduce', 'Friction', 'Mass', 'Voltage', 'Density'],
    ['Main constituent of LPG', 'Butane and propane', 'Methane only', 'Hydrogen', 'Nitrogen'],
    ['Electrolyte in a lead-acid battery', 'Dilute sulphuric acid', 'Hydrochloric acid', 'Pure water', 'Ammonia'],
    ['Plastic that softens on heating', 'Thermoplastic', 'Thermosetting', 'Ceramic', 'Elastomer'],
    ['Valency of oxygen', '2', '1', '3', '4'],
  ]],
  ['Communication Skills', [
    ['Formal letters end with', 'Yours faithfully', 'Love', 'Bye', 'Cheers'],
    ['Listening is a part of', 'Communication', 'Accounting', 'Drawing', 'Welding'],
    ['A short written record of a meeting is called', 'Minutes', 'Résumé', 'Memoir', 'Novel'],
    ['Non-verbal communication includes', 'Body language', 'E-mail', 'Letters', 'Reports'],
    ['A CV should be', 'Short and truthful', 'Very long', 'Handwritten always', 'Without contact details'],
    ['Subject line of an e-mail should be', 'Clear and short', 'Empty', 'Full of capital letters', 'A long paragraph'],
    ['Feedback in communication comes from the', 'Receiver', 'Noise', 'Channel', 'Printer'],
    ['A notice is usually written in the', 'Third person', 'First person only', 'Poetic style', 'Dialogue form'],
  ]],
  ['Environmental Studies', [
    ['Main gas responsible for global warming', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Argon'],
    ['Ozone layer is in the', 'Stratosphere', 'Troposphere', 'Mesosphere', 'Ionosphere'],
    ['Ozone layer protects from', 'Ultraviolet rays', 'Sound', 'Rain', 'Wind'],
    ['Example of a renewable energy source', 'Solar energy', 'Coal', 'Diesel', 'Natural gas'],
    ['Acid rain is caused mainly by', 'Sulphur and nitrogen oxides', 'Oxygen', 'Helium', 'Water vapour'],
    ['Producers in a food chain are', 'Green plants', 'Lions', 'Fungi only', 'Humans'],
    ['Noise level is measured in', 'Decibels', 'Hertz only', 'Pascals', 'Lux'],
    ['3R stands for reduce, reuse and', 'Recycle', 'Remove', 'Repair', 'Rebuild'],
    ['Environment Protection Act of India was passed in', '1986', '1974', '2000', '1950'],
  ]],
  ['Workshop Practice', [
    ['Tool used to cut metal sheets', 'Snips', 'Chisel for wood', 'Trowel', 'Spirit level'],
    ['Vernier caliper measures', 'Small lengths accurately', 'Temperature', 'Current', 'Weight'],
    ['Least count of a common metric vernier caliper', '0.02 mm', '1 mm', '0.5 mm', '2 mm'],
    ['Lathe is mainly used for', 'Turning', 'Welding', 'Soldering', 'Painting'],
    ['Filler metal melts and joins pieces in', 'Welding', 'Filing', 'Marking', 'Sawing'],
    ['Tool used to check right angles', 'Try square', 'Hacksaw', 'Pliers', 'Scriber'],
    ['Hacksaw is used to cut', 'Metal', 'Cloth', 'Glass only', 'Paper'],
    ['Safety item for welding', 'Face shield', 'Sandals', 'Scarf', 'Sunglasses'],
  ]],
  ['Engineering Drawing', [
    ['Standard drawing sheet size A4 (mm)', '210 × 297', '297 × 420', '420 × 594', '148 × 210'],
    ['First angle projection symbol is used in', 'India (BIS default)', 'Only USA', 'Maps only', 'Electrical drawings only'],
    ['Line used for hidden edges', 'Dashed', 'Thick continuous', 'Chain', 'Zig-zag'],
    ['Line used for centre lines', 'Long chain thin', 'Thick continuous', 'Dashed thick', 'Wavy'],
    ['Scale 1:100 means the drawing is', '100 times smaller', '100 times bigger', 'Same size', '10 times smaller'],
    ['Isometric axes are inclined at', '120° to each other', '90° to each other', '45° to each other', '60° to each other'],
    ['Plan is the view from the', 'Top', 'Front', 'Left side', 'Rear'],
    ['Elevation is the view from the', 'Front', 'Top', 'Bottom', 'Inside'],
    ['AutoCAD command for a straight line', 'LINE', 'CIRCLE', 'TRIM', 'ZOOM'],
    ['AutoCAD command to remove part of an object', 'TRIM', 'COPY', 'OFFSET', 'LAYER'],
  ]],
  ['Hydraulics & Soil', [
    ['Unit weight of water', '9.81 kN/m³', '25 kN/m³', '78.5 kN/m³', '1 kN/m³'],
    ['Pressure at a depth in water depends on', 'Depth', 'Shape of tank', 'Colour', 'Tank material only'],
    ['Instrument to measure liquid pressure', 'Manometer', 'Hygrometer', 'Barometer only', 'Ammeter'],
    ['Pitot tube measures', 'Flow velocity', 'Density', 'Viscosity', 'Temperature'],
    ['Reynolds number below about 2000 in a pipe means', 'Laminar flow', 'Turbulent flow', 'No flow', 'Critical flow always'],
    ['Soil with the smallest particle size', 'Clay', 'Sand', 'Gravel', 'Silt'],
    ['Plasticity index equals', 'Liquid limit - plastic limit', 'Liquid limit + plastic limit', 'Plastic limit - liquid limit', 'Liquid limit × plastic limit'],
    ['Compaction removes', 'Air from soil', 'Water only', 'Soil particles', 'Clay'],
    ['Consolidation removes', 'Water from soil over time', 'Air quickly', 'Sand', 'Gravel'],
    ['Safe bearing capacity = ultimate bearing capacity divided by', 'Factor of safety', 'Depth', 'Width', 'Unit weight'],
  ]],
  ['Computer Fundamentals', [
    ['Which is an input device?', 'Keyboard', 'Monitor', 'Printer', 'Speaker'],
    ['Which is an output device?', 'Printer', 'Mouse', 'Scanner', 'Keyboard'],
    ['ALU stands for', 'Arithmetic Logic Unit', 'Array Logic Unit', 'Auto Load Unit', 'Access Line Unit'],
    ['Binary number system has base', '2', '8', '10', '16'],
    ['Compiler converts', 'Whole source code to machine code', 'Machine code to source', 'Text to images', 'Audio to text'],
    ['Interpreter translates', 'Line by line', 'Only once at the end', 'Images', 'Only databases'],
    ['Flowchart symbol for a decision', 'Diamond', 'Circle', 'Rectangle', 'Arrow'],
    ['Flowchart symbol for a process', 'Rectangle', 'Diamond', 'Oval', 'Parallelogram'],
    ['SSD stores data using', 'Flash memory', 'Magnetic platters', 'Optical laser', 'Paper tape'],
    ['Number of bits in one nibble', '4', '8', '2', '16'],
  ]],
  ['Software Engineering', [
    ['SDLC stands for', 'Software Development Life Cycle', 'System Data Logic Code', 'Simple Design Life Cycle', 'Software Design Language Code'],
    ['Waterfall model works in', 'Sequential phases', 'Random order', 'One step only', 'Reverse order'],
    ['Testing individual modules is', 'Unit testing', 'System testing', 'Beta testing', 'Load testing'],
    ['Testing by real users outside the company', 'Beta testing', 'Unit testing', 'White box testing', 'Code review'],
    ['Agile work cycles are called', 'Sprints', 'Loops', 'Threads', 'Stages'],
    ['Black box testing checks', 'Inputs and outputs only', 'Internal code', 'Hardware', 'Compiler'],
    ['SRS document contains', 'Software requirements', 'Salary details', 'Hardware bills', 'Test results only'],
    ['Fixing a bug after release is', 'Maintenance', 'Design', 'Planning', 'Deployment only'],
  ]],
  ['Estimation & Construction Management', [
    ['Length × breadth × height gives', 'Volume', 'Area', 'Perimeter', 'Weight'],
    ['Earthwork is measured in', 'Cubic metres', 'Square metres', 'Kilograms', 'Numbers'],
    ['Painting is measured in', 'Square metres', 'Cubic metres', 'Kilograms', 'Litres only'],
    ['Contingency in an estimate is usually about', '3 – 5%', '30 – 50%', '60%', '0.1%'],
    ['A bar chart in construction is also called a', 'Gantt chart', 'Pie chart', 'Flow chart', 'Mohr chart'],
    ['Critical path is the', 'Longest path in a network', 'Shortest path', 'Cheapest path', 'First activity only'],
    ['Measurement book records', 'Work done on site', 'Student marks', 'Salary only', 'Attendance only'],
    ['Tender is invited to', 'Select a contractor', 'Hire students', 'Buy land only', 'Close a project'],
    ['Earnest money is deposited by the', 'Tenderer', 'Labourer', 'Architect', 'Bank'],
    ['Rate analysis finds the cost of', 'One unit of work', 'Whole building only', 'Land', 'Taxes only'],
  ]],
];

export const DIPLOMA_SUBJECT_QUESTIONS: PlacementMcq[] = [
  ...tag('Applied Mathematics', MATHS),
  ...tag('Applied Physics', PHYSICS),
  ...tag('Mechanics & Hydraulics', MECHANICS),
  ...tag('Programming & Digital Logic', PROGRAMMING),
  ...THEORY.flatMap(([subject, rows], i) => tag(subject, fromRows(`dip-th${i + 1}`, 740 + i, C, rows))),
];

export const DIPLOMA_SUBJECTS = Array.from(new Set(DIPLOMA_SUBJECT_QUESTIONS.map(q => q.subject as string)));
