// Mock interview question papers. `keywords` are the points the scorer looks for (lower case, matched inside the answer).
// Each round has several papers of 6 questions; every paper is its own "track" so results and scoring stay per paper.

export interface InterviewQuestion {
  q: string;
  keywords: string[];
  tip: string;
}

type Paper = InterviewQuestion[];
const Q = (q: string, keywords: string[], tip: string): InterviewQuestion => ({ q, keywords, tip });

export const INTERVIEW_ROUNDS: Record<string, Paper[]> = {
  'HR & Communication': [
    [
      Q('Tell me about yourself.', ['name', 'diploma', 'polytechnic', 'tanakpur', 'skills', 'project', 'goal', 'family', 'hobby', 'learn'], 'Name → course & college → 2 skills → 1 project → career goal (60–90 s).'),
      Q('Why should we hire you?', ['skills', 'learn', 'team', 'hard', 'project', 'contribute', 'company', 'quick', 'dedicated', 'responsible'], 'Match your skills to the job and show willingness to learn.'),
      Q('What are your strengths and one weakness?', ['strength', 'weakness', 'improve', 'working', 'time', 'team', 'learning', 'practice'], 'Give a real minor weakness and what you are doing to fix it.'),
      Q('Where do you see yourself in 5 years?', ['grow', 'senior', 'skills', 'company', 'responsibility', 'learn', 'certification', 'lead'], 'Growth inside the company, more responsibility, new skills.'),
      Q('Are you ready to relocate and work in shifts?', ['yes', 'ready', 'relocate', 'shift', 'flexible', 'adjust', 'learn'], 'Be honest; show flexibility.'),
      Q('Do you have any questions for us?', ['training', 'role', 'team', 'growth', 'learn', 'expect', 'first', 'project'], 'Always ask 1–2 questions: training given, what the first months look like.'),
    ],
    [
      Q('Why did you choose a diploma instead of a B.Tech?', ['early', 'practical', 'skills', 'job', 'family', 'interest', 'hands-on', 'later', 'lateral'], 'Practical skills, early earning, plan to study further (lateral entry) later.'),
      Q('What do you know about our company?', ['product', 'service', 'customer', 'founded', 'location', 'website', 'work', 'clients'], 'Read the company website before the interview: what they make, where they work.'),
      Q('Tell me about a time you worked in a team.', ['team', 'project', 'role', 'divided', 'helped', 'result', 'together', 'task'], 'Situation → your task → what you did → result (STAR method).'),
      Q('How do you handle pressure or a deadline?', ['plan', 'priority', 'list', 'time', 'calm', 'deadline', 'break', 'complete'], 'Plan the work, do the most important first, stay calm, finish on time.'),
      Q('What are your salary expectations?', ['company', 'standard', 'learn', 'fresher', 'negotiable', 'growth', 'policy', 'per'], 'As a fresher: “As per company norms for freshers; learning matters most to me.”'),
      Q('What was your biggest achievement in college?', ['project', 'prize', 'first', 'won', 'marks', 'event', 'organised', 'certificate'], 'One clear example with a number: rank, prize, marks or people helped.'),
    ],
    [
      Q('Describe a failure and what you learnt from it.', ['failed', 'mistake', 'learnt', 'learned', 'improve', 'next', 'time', 'changed'], 'Small real failure, then what you changed – end on the lesson.'),
      Q('How do you keep learning new things?', ['youtube', 'course', 'nptel', 'practice', 'books', 'online', 'project', 'certificate'], 'Name real sources: NPTEL, YouTube channels, books, practice projects.'),
      Q('Would you leave us if you get a government job?', ['honest', 'learn', 'experience', 'commit', 'notice', 'responsible', 'company', 'grow'], 'Be honest but show commitment: you will serve your notice and finish work properly.'),
      Q('Tell me about your hometown and family.', ['from', 'district', 'family', 'father', 'mother', 'support', 'uttarakhand', 'values'], 'Keep it short and positive: place, family support, what it taught you.'),
      Q('What do you do in your free time?', ['read', 'sports', 'practice', 'learn', 'music', 'play', 'coding', 'volunteer'], 'Hobbies that show discipline or learning; be ready for a follow-up question.'),
      Q('How would your friends describe you?', ['helpful', 'honest', 'hard', 'calm', 'reliable', 'friendly', 'punctual', 'team'], 'Two or three qualities with a quick example for one of them.'),
    ],
    [
      Q('Introduce yourself in Hindi and then in English.', ['naam', 'name', 'diploma', 'college', 'skills', 'goal', 'tanakpur', 'project'], 'Same structure in both languages; speak slowly and clearly.'),
      Q('What does professionalism mean to you?', ['time', 'punctual', 'respect', 'honest', 'responsible', 'dress', 'deadline', 'quality'], 'Punctuality, honesty, finishing work on time, respectful behaviour.'),
      Q('How do you deal with a person you do not get along with?', ['listen', 'respect', 'talk', 'calm', 'understand', 'senior', 'work', 'solution'], 'Stay calm, talk privately, focus on the work, ask a senior if needed.'),
      Q('What motivates you to work?', ['learn', 'family', 'growth', 'result', 'skills', 'responsibility', 'appreciation', 'goal'], 'Learning, supporting family, seeing the result of your work.'),
      Q('Why are your marks lower in one semester?', ['reason', 'improved', 'health', 'focus', 'learnt', 'next', 'better', 'honest'], 'Give the honest reason briefly, then show how marks improved afterwards.'),
      Q('Can you start immediately and sign a bond, if needed?', ['yes', 'join', 'date', 'result', 'bond', 'read', 'terms', 'commit'], 'Give your real joining date; say you will read the bond terms before signing.'),
    ],
  ],

  'CSE Technical': [
    [
      Q('What is the difference between a stack and a queue?', ['lifo', 'fifo', 'push', 'pop', 'enqueue', 'dequeue', 'last', 'first'], 'Stack = LIFO (push/pop), queue = FIFO (enqueue/dequeue) + one real use.'),
      Q('Explain OOP concepts with an example.', ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'example'], 'Cover the 4 pillars with a simple example (Car, Student).'),
      Q('What is a primary key and a foreign key?', ['unique', 'null', 'table', 'reference', 'relation', 'primary', 'foreign'], 'Primary = unique + not null; foreign key refers to another table\'s primary key.'),
      Q('What happens when you type a URL in the browser?', ['dns', 'ip', 'http', 'https', 'server', 'request', 'response', 'tcp', 'html'], 'DNS → IP → TCP/TLS → HTTP request → response → render.'),
      Q('Describe your best project and your role in it.', ['project', 'built', 'developed', 'database', 'frontend', 'backend', 'team', 'problem', 'language'], 'Problem → tech used → your part → result.'),
      Q('What is the difference between an array and a linked list?', ['contiguous', 'memory', 'index', 'node', 'pointer', 'insert', 'delete', 'size'], 'Array: fixed, contiguous, fast index. Linked list: nodes + pointers, easy insert/delete.'),
    ],
    [
      Q('What is the difference between C and C++?', ['procedural', 'object', 'class', 'oop', 'overloading', 'c++', 'structure', 'stl'], 'C is procedural; C++ adds classes, objects, overloading and the STL.'),
      Q('What is a pointer? Why is it used?', ['address', 'memory', 'variable', 'dynamic', 'array', 'function', 'malloc', 'reference'], 'Stores a memory address; used for dynamic memory, arrays and passing by reference.'),
      Q('Explain call by value and call by reference.', ['copy', 'value', 'reference', 'address', 'original', 'change', 'function', 'pointer'], 'By value = copy, original unchanged; by reference = address, original can change.'),
      Q('What is recursion? Give an example.', ['function', 'itself', 'base', 'case', 'factorial', 'fibonacci', 'stack', 'condition'], 'A function calling itself with a base case – factorial is the usual example.'),
      Q('Explain linear search and binary search.', ['sorted', 'middle', 'half', 'one by one', 'log', 'compare', 'faster', 'n'], 'Linear checks one by one (O(n)); binary halves a sorted list (O(log n)).'),
      Q('What is the difference between compiler and interpreter?', ['whole', 'line', 'translate', 'machine', 'faster', 'error', 'python', 'java'], 'Compiler translates the whole program first; interpreter runs line by line.'),
    ],
    [
      Q('What is normalisation in DBMS?', ['redundancy', 'table', '1nf', '2nf', '3nf', 'dependency', 'split', 'anomaly'], 'Splitting tables to remove repeated data – explain 1NF, 2NF, 3NF briefly.'),
      Q('Write a SQL query to find the second highest salary.', ['select', 'max', 'salary', 'where', '<', 'order by', 'limit', 'from'], 'SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);'),
      Q('What is the difference between DELETE, TRUNCATE and DROP?', ['rows', 'where', 'table', 'structure', 'rollback', 'all', 'remove', 'ddl'], 'DELETE removes chosen rows; TRUNCATE all rows; DROP removes the table itself.'),
      Q('What are joins? Name the types.', ['inner', 'left', 'right', 'full', 'outer', 'combine', 'tables', 'matching'], 'Combine rows of two tables: inner, left, right and full outer join.'),
      Q('What are ACID properties?', ['atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'commit'], 'Atomicity, Consistency, Isolation, Durability – with a bank transfer example.'),
      Q('What is the difference between SQL and NoSQL databases?', ['table', 'schema', 'document', 'mongodb', 'mysql', 'relational', 'flexible', 'scale'], 'SQL = tables with fixed schema (MySQL); NoSQL = flexible documents (MongoDB).'),
    ],
    [
      Q('Explain the OSI model layers.', ['physical', 'data link', 'network', 'transport', 'session', 'presentation', 'application', 'seven'], '7 layers from Physical to Application – one line on each.'),
      Q('What is the difference between TCP and UDP?', ['connection', 'reliable', 'acknowledg', 'fast', 'video', 'order', 'udp', 'tcp'], 'TCP is connection-based and reliable; UDP is faster with no guarantee (video, games).'),
      Q('What is an IP address and a subnet mask?', ['address', 'network', 'host', 'ipv4', 'ipv6', '255', 'subnet', 'device'], 'IP identifies a device; the subnet mask separates the network part from the host part.'),
      Q('What is the difference between a hub, a switch and a router?', ['broadcast', 'mac', 'ip', 'network', 'forward', 'lan', 'internet', 'port'], 'Hub broadcasts; switch uses MAC addresses in a LAN; router joins networks using IP.'),
      Q('A user says “internet is not working”. How will you troubleshoot?', ['cable', 'wifi', 'ping', 'ip', 'restart', 'dns', 'router', 'check'], 'Check cable/Wi-Fi → IP (ipconfig) → ping gateway → ping 8.8.8.8 → DNS.'),
      Q('What are DHCP and DNS?', ['automatic', 'ip', 'assign', 'name', 'domain', 'resolve', 'server', 'address'], 'DHCP gives IP addresses automatically; DNS turns names into IP addresses.'),
    ],
    [
      Q('What is the difference between HTML, CSS and JavaScript?', ['structure', 'style', 'behaviour', 'behavior', 'design', 'logic', 'page', 'interactive'], 'HTML = structure, CSS = look, JavaScript = behaviour.'),
      Q('What is an operating system? Name its functions.', ['process', 'memory', 'file', 'device', 'manage', 'user', 'hardware', 'interface'], 'Manages processes, memory, files and devices; interface between user and hardware.'),
      Q('What is the difference between a process and a thread?', ['program', 'execution', 'memory', 'share', 'lightweight', 'process', 'thread', 'independent'], 'A process is a running program; threads are light parts that share its memory.'),
      Q('What is Git and why is it used?', ['version', 'control', 'commit', 'branch', 'history', 'team', 'github', 'merge'], 'Version control: track changes, work in branches, share code on GitHub.'),
      Q('What is an API?', ['application', 'interface', 'request', 'response', 'json', 'server', 'data', 'communicate'], 'A way for two programs to talk: request → server → JSON response.'),
      Q('How would you keep a computer lab virus-free?', ['antivirus', 'update', 'firewall', 'usb', 'password', 'backup', 'scan', 'user'], 'Antivirus + updates, block unknown USB, user accounts with passwords, backups.'),
    ],
  ],

  'Civil Technical': [
    [
      Q('What is the difference between OPC and PPC cement?', ['ordinary', 'portland', 'pozzolana', 'fly ash', 'strength', 'heat', 'durability', 'setting'], 'PPC has fly ash/pozzolana → less heat, better durability; OPC → faster early strength.'),
      Q('Explain the slump test.', ['workability', 'cone', 'concrete', 'height', 'mm', 'fresh', 'layers', 'tamping'], 'Cone, 3 layers, 25 blows each, lift, measure drop in mm.'),
      Q('What are the steps of building construction on site?', ['layout', 'excavation', 'foundation', 'plinth', 'column', 'beam', 'slab', 'brick', 'plaster', 'finishing'], 'Layout → excavation → foundation → plinth → superstructure → finishing.'),
      Q('How do you calculate the quantity of bricks for a wall?', ['volume', 'length', 'height', 'thickness', 'mortar', 'size', 'cubic', 'wastage'], 'Wall volume ÷ volume of one brick with mortar, then add wastage.'),
      Q('Which surveying instruments have you used?', ['dumpy', 'level', 'theodolite', 'total station', 'chain', 'tape', 'compass', 'gps'], 'Name instruments + what you measured in your survey camp.'),
      Q('What are the grades of concrete and what does M20 mean?', ['m20', '20', 'n/mm', 'mpa', 'compressive', '28 days', 'cube', 'mix'], 'M = mix; 20 = 20 N/mm² cube strength at 28 days. M20 ≈ 1:1.5:3.'),
    ],
    [
      Q('What is the initial and final setting time of cement?', ['30', 'minutes', '600', '10 hours', 'vicat', 'initial', 'final', 'setting'], 'Initial ≥ 30 min, final ≤ 600 min (10 h); tested with the Vicat apparatus.'),
      Q('What is curing and why is it important?', ['water', 'moisture', 'strength', 'hydration', 'days', 'cracks', 'temperature', '7'], 'Keeping concrete moist (at least 7–14 days) for hydration and strength, fewer cracks.'),
      Q('What are the qualities of good bricks?', ['size', 'colour', 'sound', 'water absorption', '20%', 'strength', 'efflorescence', 'burnt'], 'Uniform size and colour, ringing sound, absorption < 20%, no efflorescence.'),
      Q('What is the water–cement ratio and its effect?', ['water', 'cement', 'ratio', 'strength', 'workability', '0.4', '0.5', 'less'], 'More water → more workable but weaker. Usual 0.4–0.5.'),
      Q('Name the tests done on aggregates.', ['crushing', 'impact', 'abrasion', 'los angeles', 'sieve', 'specific gravity', 'water absorption', 'flakiness'], 'Sieve analysis, crushing, impact, Los Angeles abrasion, flakiness, specific gravity.'),
      Q('What is the difference between fine and coarse aggregate?', ['4.75', 'mm', 'sand', 'gravel', 'sieve', 'fine', 'coarse', 'size'], 'Passing 4.75 mm sieve = fine (sand); retained = coarse (gravel).'),
    ],
    [
      Q('What is levelling? Explain the rise and fall method.', ['level', 'staff', 'reading', 'rise', 'fall', 'reduced', 'benchmark', 'back sight'], 'Find heights of points from a benchmark using staff readings; rise/fall from consecutive readings.'),
      Q('What are back sight and fore sight?', ['first', 'last', 'reading', 'known', 'benchmark', 'instrument', 'change point', 'staff'], 'BS = first reading after setting up (on a known point); FS = last reading before shifting.'),
      Q('What is a total station and what can it measure?', ['distance', 'angle', 'horizontal', 'vertical', 'coordinates', 'edm', 'theodolite', 'electronic'], 'Electronic theodolite + EDM: angles, distances and coordinates.'),
      Q('What is a contour and what are its properties?', ['same', 'elevation', 'line', 'cross', 'close', 'steep', 'flat', 'interval'], 'Line joining points of equal height; close lines = steep, never cross (except overhang).'),
      Q('How do you mark the layout of a building on site?', ['centre line', 'pegs', 'diagonal', 'tape', 'drawing', 'reference', 'right angle', '3-4-5'], 'Centre-line method from the drawing, 3-4-5 rule for right angles, check diagonals.'),
      Q('What is a benchmark in surveying?', ['fixed', 'point', 'known', 'elevation', 'reference', 'gts', 'temporary', 'permanent'], 'A fixed point of known level; GTS, permanent and temporary benchmarks.'),
    ],
    [
      Q('What is the difference between a one-way and a two-way slab?', ['ratio', 'long', 'short', 'span', '2', 'bend', 'direction', 'support'], 'Long/short span > 2 → one-way; ≤ 2 → two-way (bends in both directions).'),
      Q('What is the clear cover for slab, beam and column?', ['20', '25', '40', 'mm', 'cover', 'slab', 'beam', 'column'], 'Typical: slab 20 mm, beam 25 mm, column 40 mm, footing 50 mm.'),
      Q('What is a bar bending schedule (BBS)?', ['bar', 'length', 'shape', 'diameter', 'number', 'weight', 'steel', 'cutting'], 'Table of each bar: diameter, shape, cut length, number and weight of steel.'),
      Q('Why are stirrups used in beams?', ['shear', 'hold', 'main bars', 'position', 'crack', 'diagonal', 'confine', 'buckling'], 'Resist shear (diagonal cracks) and hold the main bars in place.'),
      Q('How do you find the weight of a steel bar?', ['d²', 'd2', '162', 'diameter', 'length', 'kg', 'weight', 'per metre'], 'Weight (kg/m) = d²/162, with d in mm.'),
      Q('What are the types of foundation?', ['shallow', 'deep', 'isolated', 'combined', 'raft', 'pile', 'strip', 'footing'], 'Shallow (isolated, combined, strip, raft) and deep (pile, well).'),
    ],
    [
      Q('What are the layers of a flexible road pavement?', ['subgrade', 'sub-base', 'base', 'surface', 'wearing', 'bitumen', 'wbm', 'layer'], 'Subgrade → sub-base → base → surface/wearing course.'),
      Q('What is the difference between flexible and rigid pavement?', ['bitumen', 'concrete', 'load', 'layers', 'slab', 'life', 'cost', 'joints'], 'Flexible = bitumen, spreads load through layers; rigid = concrete slab, longer life.'),
      Q('What is camber and why is it given?', ['slope', 'cross', 'drain', 'water', 'centre', 'rain', 'surface', 'road'], 'Cross slope from the centre so rain water drains off the road.'),
      Q('What is soil compaction? Name a test for it.', ['density', 'air', 'voids', 'proctor', 'moisture', 'optimum', 'roller', 'strength'], 'Removing air to increase density; Proctor test gives optimum moisture content.'),
      Q('What precautions do you take for construction in hilly areas?', ['slope', 'retaining wall', 'drainage', 'landslide', 'soil', 'stability', 'rain', 'protection'], 'Slope stability, retaining walls, good drainage, avoid cutting toe of slopes.'),
      Q('What is BOD and why is it tested in water supply/sewage?', ['oxygen', 'biological', 'demand', 'organic', 'pollution', '5 days', 'sewage', 'bacteria'], 'Biological oxygen demand = oxygen used by bacteria in 5 days; shows organic pollution.'),
    ],
  ],

  'Government Job Interview': [
    [
      Q('Why do you want a government job (JE / technician)?', ['serve', 'public', 'state', 'stability', 'development', 'responsibility', 'society', 'skills'], 'Serving the public and the state’s development – not only job security.'),
      Q('Tell us about Uttarakhand: districts, capital and a major project.', ['13', 'districts', 'dehradun', 'gairsain', 'char dham', 'railway', 'rishikesh', 'karnaprayag'], '13 districts, Dehradun (winter) / Gairsain (summer), e.g. Rishikesh–Karnaprayag rail line.'),
      Q('What will you do if a contractor offers you money to pass poor work?', ['refuse', 'honest', 'report', 'senior', 'quality', 'rules', 'vigilance', 'never'], 'Refuse clearly, record the issue, inform your senior – quality and honesty first.'),
      Q('What is the role of a Junior Engineer in a department like PWD or Jal Sansthan?', ['site', 'measurement', 'estimate', 'supervision', 'quality', 'contractor', 'record', 'mb'], 'Estimates, site supervision, quality checks, measurement book and bills.'),
      Q('How will you handle villagers who are unhappy with a project?', ['listen', 'explain', 'calm', 'meeting', 'senior', 'solution', 'respect', 'problem'], 'Listen first, explain the work, solve what you can, inform seniors.'),
      Q('Name some central or state schemes related to your branch.', ['pmgsy', 'jal jeevan', 'digital india', 'smart city', 'awas', 'bharatnet', 'amrut', 'mission'], 'Civil: PMGSY, Jal Jeevan Mission, PM Awas. CSE: Digital India, BharatNet.'),
    ],
    [
      Q('What do you understand by e-governance? Give examples.', ['online', 'services', 'digital', 'aadhaar', 'portal', 'transparent', 'apuni sarkar', 'digilocker'], 'Government services online: DigiLocker, Apuni Sarkar portal, e-district, online tenders.'),
      Q('How is disaster management important in Uttarakhand?', ['earthquake', 'landslide', 'flood', 'cloudburst', 'sdrf', 'zone', 'planning', 'kedarnath'], 'Seismic zone, landslides, floods (2013 Kedarnath); SDRF, safe building and planning.'),
      Q('What is the Right to Information (RTI) Act?', ['2005', 'information', 'citizen', '30 days', 'public', 'transparency', 'pio', 'apply'], 'RTI 2005: citizens can ask public offices for information; reply within 30 days.'),
      Q('How will you balance development and environment in hill areas?', ['environment', 'trees', 'slope', 'eia', 'waste', 'sustainable', 'local', 'planning'], 'Plan with EIA, protect trees and slopes, manage debris and waste, involve locals.'),
      Q('What will you do on your first day in a new posting?', ['meet', 'senior', 'staff', 'records', 'site', 'understand', 'files', 'learn'], 'Meet seniors and staff, study files and ongoing works, visit sites.'),
      Q('Why should the board select you over other candidates?', ['skills', 'diploma', 'training', 'local', 'honest', 'hard', 'knowledge', 'serve'], 'Technical skill + local knowledge + honesty + readiness for hill postings.'),
    ],
  ],

  'Situation & Workplace': [
    [
      Q('Your senior gives you a task you do not know how to do. What will you do?', ['ask', 'learn', 'search', 'understand', 'try', 'senior', 'deadline', 'update'], 'Understand the task, try/search first, then ask with specific questions; give updates.'),
      Q('You made a mistake that cost the team time. How do you handle it?', ['accept', 'inform', 'senior', 'fix', 'learn', 'honest', 'sorry', 'again'], 'Admit it quickly, inform your senior, fix it, make sure it does not happen again.'),
      Q('Two tasks are due at the same time. What do you do?', ['priority', 'senior', 'deadline', 'important', 'plan', 'inform', 'time', 'first'], 'Check priority with your senior, do the most urgent first, inform about delays early.'),
      Q('On site you see a worker without a helmet. What will you do?', ['safety', 'helmet', 'stop', 'ppe', 'explain', 'supervisor', 'rule', 'accident'], 'Stop the work politely, give/ask for PPE, explain the risk, inform the supervisor.'),
      Q('A customer is angry on the phone about a problem. How do you respond?', ['listen', 'calm', 'sorry', 'understand', 'solution', 'follow', 'polite', 'time'], 'Listen calmly, apologise for the trouble, give a solution or a time, follow up.'),
      Q('You are asked to work late on a festival day. What will you say?', ['understand', 'work', 'team', 'adjust', 'family', 'urgent', 'manage', 'complete'], 'Show you understand the urgency; offer to finish the key part and agree a plan.'),
    ],
    [
      Q('How will you learn a new software or machine at work quickly?', ['manual', 'practice', 'senior', 'video', 'notes', 'training', 'try', 'daily'], 'Read the manual, watch videos, practise daily, keep notes, ask seniors.'),
      Q('What will you do if you finish your work early?', ['help', 'team', 'learn', 'senior', 'ask', 'improve', 'extra', 'check'], 'Check your work, then ask for more or help a teammate.'),
      Q('How do you write a daily work report?', ['date', 'task', 'done', 'pending', 'problem', 'next', 'hours', 'short'], 'Date, tasks done, pending work, problems and plan for tomorrow – short points.'),
      Q('A teammate is not doing their share. What will you do?', ['talk', 'understand', 'help', 'senior', 'calm', 'work', 'divide', 'team'], 'Talk privately first, understand the reason, help; inform the senior only if needed.'),
      Q('What does punctuality mean at the workplace?', ['time', 'early', 'meeting', 'deadline', 'inform', 'late', 'respect', 'plan'], 'Being on time for work, meetings and deadlines; inform early if late.'),
      Q('How do you keep company data and passwords safe?', ['password', 'share', 'lock', 'secure', 'usb', 'email', 'phishing', 'policy'], 'Never share passwords, lock the screen, avoid unknown links/USB, follow policy.'),
    ],
  ],
};

/** "CSE Technical – Paper 2". The track key that results are saved and scored under. */
export const paperKey = (round: string, i: number) => `${round} – Paper ${i + 1}`;

/** Round names, shown to students and used for panel interview requests. */
export const INTERVIEW_TRACK_NAMES = Object.keys(INTERVIEW_ROUNDS);

/** Every paper as its own track, plus each round name (= its first paper, for results saved before papers existed). */
export const INTERVIEW_TRACKS: Record<string, InterviewQuestion[]> = Object.fromEntries(
  INTERVIEW_TRACK_NAMES.flatMap(round => [
    [round, INTERVIEW_ROUNDS[round][0]] as const,
    ...INTERVIEW_ROUNDS[round].map((p, i) => [paperKey(round, i), p] as const),
  ])
);

export const INTERVIEW_PAPER_COUNT = INTERVIEW_TRACK_NAMES.reduce((t, r) => t + INTERVIEW_ROUNDS[r].length, 0);
export const INTERVIEW_QUESTION_COUNT = INTERVIEW_TRACK_NAMES.reduce((t, r) => t + INTERVIEW_ROUNDS[r].flat().length, 0);
