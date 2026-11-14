import type { PlacementMcq } from '../placementQnaBank';
import { fmt, generate, mcq, numDistractors, type Rng } from './builder';
import { pairs, type Fact } from './pairs';

// UBTER syllabus bank: one set per paper, following the IRDT unit topics. Numerical answers are calculated.
// Subject labels start with the semester, so the subject buttons read in syllabus order.
const C = 'UBTER Syllabus' as const;
export type Make = (r: Rng, id: string, i: number) => PlacementMcq | null;

export const num = (r: Rng, id: string, q: string, a: number, why: string, unit = '', step?: number) =>
  mcq(r, id, C, q, `${fmt(a)}${unit}`, numDistractors(r, a, step ?? Math.max(1, Math.round(Math.abs(a) * 0.15))).map(x => `${fmt(x)}${unit}`), why);
export const round2 = (n: number) => Math.round(n * 100) / 100;

export function paper(subject: string, prefix: string, seed: number, facts: Fact[], make?: Make, count = 48): PlacementMcq[] {
  const list = pairs(`ub-${prefix}`, seed, C, subject, facts, a => `What is ${a}?`, b => `Which term matches: ${b}?`);
  const worked = make ? generate(`ub-${prefix}n`, seed + 5000, count, make).map(q => ({ ...q, subject })) : [];
  return [...list, ...worked];
}

const ENG1: Fact[] = [
  ['a noun', 'Word that names a person, place or thing'], ['a pronoun', 'Word used in place of a noun'], ['an adjective', 'Word that describes a noun'], ['a verb', 'Word that shows action or state'], ['an adverb', 'Word that describes a verb'], ['a preposition', 'Word showing the relation of a noun to another word'], ['a conjunction', 'Word that joins words or sentences'], ['an interjection', 'Word that expresses sudden feeling'], ['an article', 'A, an or the'], ['a synonym', 'Word with a similar meaning'], ['an antonym', 'Word with the opposite meaning'], ['a homophone', 'Word that sounds the same but differs in meaning'], ['one word substitution', 'Single word used for a group of words'], ['active voice', 'Subject performs the action'], ['passive voice', 'Subject receives the action'], ['direct speech', 'The exact words of a speaker'], ['indirect speech', 'The report of what a speaker said'], ['a vowel sound', 'Sound made with the air flowing freely'], ['a consonant sound', 'Sound made with the air partly blocked'], ['phonetics', 'Study of the sounds of speech'], ['a paragraph', 'Group of sentences on one idea'], ['listening', 'Receiving and understanding spoken messages'], ['a formal letter', 'Letter written for official purposes'], ['a tense', 'Verb form showing the time of action'],
];
const ENG2: Fact[] = [
  ['a resume', 'Short record of education, skills and experience'], ['a cover letter', 'Letter sent with a job application'], ['a notice', 'Short written announcement for a group'], ['a memo', 'Short note used inside an office'], ['an agenda', 'List of items for a meeting'], ['minutes of a meeting', 'Written record of what was decided'], ['a circular', 'Message sent to many people in an organisation'], ['a report', 'Organised account of facts on a subject'], ['a precis', 'Short summary of a passage'], ['comprehension', 'Understanding a passage that is read'], ['skimming', 'Reading quickly for the main idea'], ['scanning', 'Reading quickly for a specific detail'], ['a group discussion', 'Sharing views on a topic in a group'], ['an interview', 'Formal question and answer meeting'], ['body language', 'Message given by posture and gestures'], ['eye contact', 'Looking at the person you speak to'], ['a presentation', 'Planned talk given to an audience'], ['a telephone etiquette rule', 'Greet and identify yourself politely'], ['an idiom', 'Phrase with a meaning different from its words'], ['a complaint letter', 'Letter reporting a problem with a service'], ['an enquiry letter', 'Letter asking for information'], ['an email subject line', 'Short title of what a message is about'],
];
const MATH1: Fact[] = [
  ['nCr', 'Number of ways to choose r items from n'], ['nPr', 'Number of ways to arrange r items from n'], ['a determinant', 'Single value calculated from a square matrix'], ["Cramer's rule", 'Solves simultaneous equations with determinants'], ['a null matrix', 'Matrix with all elements zero'], ['an identity matrix', 'Diagonal elements 1 and all others 0'], ['a symmetric matrix', 'Matrix equal to its transpose'], ['the transpose', 'Matrix with rows and columns interchanged'], ['an empty set', 'Set with no elements'], ['a subset', 'Set whose elements all belong to another set'], ['a union of sets', 'All elements in either set'], ['an intersection of sets', 'Elements common to both sets'], ['the modulus of a complex number', 'Distance of the number from the origin'], ['the conjugate of a + ib', 'a - ib'], ["De Moivre's theorem", '(cos x + i sin x)^n = cos nx + i sin nx'], ['the imaginary unit i', 'Square root of -1'], ['sin 30°', '1/2'], ['tan 45°', '1 (value)'], ['the derivative of sin x', 'cos x'], ['the derivative of cos x', '-sin x'], ['the derivative of e^x', 'e^x'], ['the derivative of log x', '1/x'], ['a limit', 'Value a function approaches'], ['a maximum point', 'Point where dy/dx = 0 and the second derivative is negative'], ['a minimum point', 'Point where dy/dx = 0 and the second derivative is positive'],
];
const MATH2: Fact[] = [
  ['the slope-intercept form', 'y = mx + c'], ['the point-slope form', 'y - y1 = m(x - x1)'], ['the slope of a horizontal line', 'Zero'], ['the condition for perpendicular lines', 'm1 × m2 = -1'], ['the condition for parallel lines', 'm1 = m2'], ['a circle', 'Points at a fixed distance from a centre'], ['a parabola', 'Conic with eccentricity equal to 1'], ['an ellipse', 'Conic with eccentricity less than 1'], ['a hyperbola', 'Conic with eccentricity greater than 1'], ['integration', 'Inverse operation of differentiation'], ['the integral of cos x', 'sin x + C'], ['the integral of sin x', '-cos x + C'], ['the integral of e^x', 'e^x + C'], ['the integral of 1/x', 'log x + C'], ['the order of a differential equation', 'Order of the highest derivative present'], ['the degree of a differential equation', 'Power of the highest order derivative'], ['the mean', 'Sum of values divided by their number'], ['the median', 'Middle value of ordered data'], ['the mode', 'Most frequent value'], ['the standard deviation', 'Root of the mean squared deviation from the mean'], ['rank correlation', 'Relation between two ranked lists'], ['a definite integral', 'Integral with upper and lower limits'],
];
const PHY1: Fact[] = [
  ['a fundamental unit', 'Unit that does not depend on another unit'], ['a scalar', 'Quantity with magnitude only'], ['a vector', 'Quantity with magnitude and direction'], ['a systematic error', 'Error that repeats in the same direction'], ['a random error', 'Unpredictable variation between readings'], ['inertia', 'Resistance of a body to change in motion'], ['impulse', 'Force multiplied by time'], ['momentum', 'Mass multiplied by velocity'], ['centripetal force', 'Force towards the centre of a circle'], ['torque', 'Turning effect of a force'], ['moment of inertia', 'Resistance to change in rotation'], ['the radius of gyration', 'Distance where all mass may be taken to act in rotation'], ['stress', 'Force per unit area'], ['strain', 'Change in size divided by original size'], ["Hooke's law", 'Stress is proportional to strain within the limit'], ['surface tension', 'Force per unit length on a liquid surface'], ['viscosity', 'Internal friction of a fluid'], ["Stokes' law", 'Drag force on a small sphere in a fluid'], ['conduction', 'Heat transfer through a solid without flow of matter'], ['convection', 'Heat transfer by moving fluid'], ['radiation', 'Heat transfer without a medium'], ['simple harmonic motion', 'Acceleration proportional to displacement from the mean position'], ['a transverse wave', 'Particles vibrate at right angles to the wave'], ['a longitudinal wave', 'Particles vibrate along the wave'], ['resonance', 'Large vibration when frequencies match'], ['reverberation', 'Sound persisting after the source stops'], ['ultrasonic sound', 'Sound above 20 kHz'],
];
const PHY2: Fact[] = [
  ['the Bohr model', 'Electrons move in fixed energy orbits'], ['refraction', 'Bending of light between two media'], ['total internal reflection', 'Light fully returned at a boundary'], ["Coulomb's law", 'Force between two point charges'], ['electric potential', 'Work per unit charge'], ['electric flux', 'Field lines through a surface'], ["Gauss's law", 'Flux equals enclosed charge divided by permittivity'], ['capacitance', 'Charge stored per unit voltage'], ["Ohm's law", 'V = IR at constant temperature'], ['conductance', 'Reciprocal of resistance'], ["Kirchhoff's current law", 'Currents at a junction add up to zero'], ["Kirchhoff's voltage law", 'Voltages in a closed loop add up to zero'], ['a Wheatstone bridge', 'Circuit used to find an unknown resistance'], ['the Lorentz force', 'Force on a charge moving in a magnetic field'], ['a galvanometer', 'Instrument that detects small currents'], ["Faraday's law", 'Induced emf equals the rate of change of flux'], ["Lenz's law", 'Induced current opposes its cause'], ['an intrinsic semiconductor', 'Pure semiconductor'], ['an extrinsic semiconductor', 'Doped semiconductor'], ['a p-n junction diode', 'Allows current mainly in one direction'], ['a rectifier', 'Converts AC to DC'], ['a transistor', 'Device used to amplify or switch'], ['the photoelectric effect', 'Emission of electrons by light'], ['the work function', 'Least energy to free an electron'], ['a laser', 'Coherent light from stimulated emission'], ['an optical fibre', 'Carries light by total internal reflection'],
];
const CHEM1: Fact[] = [
  ['an electron', 'Negatively charged particle'], ['a proton', 'Positively charged nuclear particle'], ['a neutron', 'Neutral nuclear particle'], ['valency', 'Combining capacity of an atom'], ['the octet rule', 'Atoms tend to have eight outer electrons'], ['an ionic bond', 'Bond formed by transfer of electrons'], ['a covalent bond', 'Bond formed by sharing of electrons'], ['a hydrogen bond', 'Weak attraction involving H and an electronegative atom'], ['the modern periodic law', 'Properties depend on atomic number'], ['hard water', 'Water that does not lather easily with soap'], ['temporary hardness', 'Hardness caused by bicarbonates, removed by boiling'], ['permanent hardness', 'Hardness caused by chlorides and sulphates'], ['the permutit process', 'Softening by ion exchange with zeolite'], ['molarity', 'Moles of solute per litre of solution'], ['molality', 'Moles of solute per kg of solvent'], ['normality', 'Gram equivalents per litre of solution'], ['pH', 'Negative log of hydrogen ion concentration'], ['a buffer solution', 'Solution resisting change in pH'], ['an indicator', 'Substance that changes colour with pH'], ['an electrolyte', 'Substance that conducts when dissolved'], ['electrolysis', 'Chemical change caused by electric current'], ['a catalyst', 'Substance that changes reaction rate and remains unchanged'], ['the greenhouse effect', 'Trapping of heat by gases in the atmosphere'], ['acid rain', 'Rain made acidic by sulphur and nitrogen oxides'],
];
const CHEM2: Fact[] = [
  ['an ore', 'Mineral from which a metal is profitably extracted'], ['gangue', 'Unwanted earthy impurity in an ore'], ['a flux', 'Substance added to remove gangue as slag'], ['slag', 'Fusible waste formed in smelting'], ['roasting', 'Heating an ore strongly in air'], ['calcination', 'Heating an ore in limited air or absence of air'], ['bauxite', 'Main ore of aluminium'], ['haematite', 'Main ore of iron'], ['an alloy', 'Homogeneous mixture of a metal with other elements'], ['brass', 'Alloy of copper and zinc'], ['bronze', 'Alloy of copper and tin'], ['calorific value', 'Heat released by burning a unit mass of fuel'], ['the octane number', 'Measure of knocking resistance of petrol'], ['the cetane number', 'Measure of ignition quality of diesel'], ['water gas', 'Mixture of carbon monoxide and hydrogen'], ['power alcohol', 'Alcohol blended with petrol as fuel'], ['nuclear fission', 'Splitting of a heavy nucleus'], ['nuclear fusion', 'Joining of light nuclei'], ['corrosion', 'Slow destruction of a metal by its surroundings'], ['galvanising', 'Coating iron with zinc'], ['a lubricant', 'Substance that reduces friction'], ['a polymer', 'Large molecule made of repeating units'], ['a thermoplastic', 'Plastic that softens again on heating'], ['a thermosetting plastic', 'Plastic that does not soften again on heating'],
];
const COMP: Fact[] = [
  ['the CPU', 'Brain of the computer'], ['the ALU', 'Part performing arithmetic and logic'], ['RAM', 'Volatile main memory'], ['ROM', 'Non-volatile permanent memory'], ['an input device', 'Device that sends data to the computer'], ['an output device', 'Device that shows results'], ['system software', 'Software that controls the computer'], ['application software', 'Software for a specific user task'], ['a compiler', 'Translates a whole program at once'], ['an interpreter', 'Translates a program line by line'], ['a bit', 'Single binary digit'], ['a byte', 'Eight bits'], ['an operating system', 'Interface between user and hardware'], ['MS DOS', 'Command-line operating system'], ['the Recycle Bin', 'Holds deleted files'], ['the taskbar', 'Bar showing running programs'], ['a LAN', 'Network in a small area'], ['a web browser', 'Program used to view websites'], ['a search engine', 'Website that finds information online'], ['MS Word', 'Word processor'], ['MS Excel', 'Spreadsheet'], ['MS PowerPoint', 'Presentation software'], ['mail merge', 'Sends one letter to many addresses'], ['e-governance', 'Delivery of government services through IT'], ['a virus', 'Harmful program that spreads between files'],
];
const GRAPH1: Fact[] = [
  ['first angle projection', 'Object lies between the observer and the plane'], ['a thick continuous line', 'Visible outline of an object'], ['a thin chain line', 'Centre line'], ['a dashed line', 'Hidden edge'], ['a dimension line', 'Thin line with arrowheads showing size'], ['SP 46', 'Indian code for engineering drawing practice'], ['representative fraction', 'Drawing length divided by actual length'], ['a reducing scale', 'Scale in which the drawing is smaller than the object'], ['an enlarging scale', 'Scale in which the drawing is larger than the object'], ['a diagonal scale', 'Scale reading three units of length'], ['the top view', 'Projection on the horizontal plane'], ['the front view', 'Projection on the vertical plane'], ['the side view', 'Projection on the profile plane'], ['orthographic projection', 'Views drawn at right angles to the planes'], ['isometric projection', 'Three faces shown in one view'], ['the isometric scale', 'About 0.816 of true length'], ['the angle between isometric axes', '120 degrees'], ['a T-square', 'Instrument for drawing horizontal lines'], ['a set square', 'Triangle for drawing fixed angles'], ['a French curve', 'Tool for drawing irregular curves'], ['A4 size', '210 mm × 297 mm'], ['A0 area', 'One square metre'], ['QCAD', 'Free software for 2D drawing'],
];
const GRAPH2: Fact[] = [
  ['a sectional view', 'View showing the inside after a cut'], ['the cutting plane line', 'Line showing where a section is taken'], ['hatching', 'Thin lines showing a cut surface'], ['a full section', 'Object cut completely through'], ['a half section', 'One quarter of a symmetric object removed'], ['a rivet', 'Permanent metal fastener'], ['a lap joint', 'Plates overlap each other'], ['a butt joint', 'Plates meet edge to edge'], ['a screw thread pitch', 'Distance between adjacent threads'], ['a bolt', 'Threaded fastener used with a nut'], ['a nut', 'Threaded part that fits a bolt'], ['a washer', 'Thin plate that spreads a bolt load'], ['a locknut', 'Second nut that prevents loosening'], ['a key', 'Part locking a hub to a shaft'], ['a keyway', 'Slot cut for a key'], ['a coupling', 'Device that joins two shafts'], ['a development of surfaces', 'Flat pattern of a solid'], ['an intersection curve', 'Line where two solids meet'], ['a welding symbol', 'Drawing mark for the type of joint'], ['an assembly drawing', 'Drawing that shows all parts together'], ['a detail drawing', 'Drawing that shows one part fully'],
];
const SHOP1: Fact[] = [
  ['a bench vice', 'Holds a job in the fitting shop'], ['a file', 'Removes metal by rubbing'], ['a hacksaw', 'Cuts metal by hand'], ['a scriber', 'Marks lines on metal'], ['a centre punch', 'Marks the centre for drilling'], ['a surface plate', 'Flat reference for marking'], ['a try square', 'Checks a right angle'], ['vernier callipers', 'Measures accurate lengths'], ['a micrometer', 'Measures to 0.01 mm'], ['a chisel', 'Cuts wood or metal by striking'], ['a jack plane', 'Smooths a timber surface'], ['a mallet', 'Wooden hammer'], ['a tenon saw', 'Cuts fine joints in timber'], ['a marking gauge', 'Marks lines parallel to an edge'], ['a mortise and tenon joint', 'Projection fits into a matching hole'], ['the fuse', 'Melts to protect a circuit'], ['earthing', 'Sends fault current safely to the ground'], ['the phase wire', 'Live conductor'], ['a tester', 'Screwdriver that detects a live wire'], ['a lead-acid battery', 'Rechargeable battery with plates in acid'], ['a hydrometer', 'Measures battery acid density'], ['an inverter', 'Converts DC to AC'], ['a fire extinguisher', 'Safety device for putting out a fire'],
];
const SHOP2: Fact[] = [
  ['arc welding', 'Joining metal with heat from an electric arc'], ['gas welding', 'Joining metal with an oxy-acetylene flame'], ['soldering', 'Joining with a low melting filler'], ['brazing', 'Joining with a filler such as brass'], ['flux in welding', 'Protects the joint from oxidation'], ['a welding electrode', 'Filler rod carrying the current'], ['a welding shield', 'Protects eyes from the arc'], ['an anvil', 'Heavy block for hammering hot metal'], ['tongs', 'Hold hot metal in the smithy'], ['a hearth', 'Fire for heating metal in a smithy'], ['forging', 'Shaping hot metal by hammering'], ['upsetting', 'Increasing thickness by reducing length'], ['drawing down', 'Increasing length by reducing thickness'], ['sheet metal work', 'Making articles from thin metal plates'], ['a snip', 'Cuts thin sheet metal'], ['a lathe', 'Machine that turns a rotating job'], ['a drilling machine', 'Makes round holes'], ['a pattern', 'Model used to make a mould'], ['a cope', 'Top part of a mould box'], ['a drag', 'Bottom part of a mould box'], ['moulding sand', 'Sand used to form a casting cavity'],
];
const ENVS: Fact[] = [
  ['an ecosystem', 'Living things with their surroundings'], ['a producer', 'Organism that makes its own food'], ['a food chain', 'Transfer of energy from one organism to another'], ['biodiversity', 'Variety of life in an area'], ['air pollution', 'Harmful substances in the atmosphere'], ['BOD', 'Oxygen needed by microbes in water'], ['noise pollution', 'Unwanted sound'], ['the ozone layer', 'Layer blocking ultraviolet rays'], ['global warming', 'Rise in the average temperature of the earth'], ['solid waste', 'Discarded material such as garbage'], ['recycling', 'Making new products from used material'], ['composting', 'Turning organic waste into manure'], ['EIA', 'Study of the effect of a project on nature'], ['a renewable source', 'Energy source that is naturally replaced'], ['a non-renewable source', 'Energy source that runs out'], ['solar energy', 'Energy from the sun'], ['wind energy', 'Energy from moving air'], ['biogas', 'Gas made by the decomposition of organic waste'], ['geothermal energy', 'Heat from inside the earth'], ['an energy audit', 'Check of where energy is used and wasted'], ['an LED lamp', 'Energy-saving light source'], ['a star rating', 'Energy efficiency label of an appliance'],
];

const CPROG: Fact[] = [
  ['an algorithm', 'Step-by-step solution of a problem'], ['a flow chart', 'Diagram of the steps of a program'], ['a compiler in C', 'Translates source code to object code'], ['a linker', 'Combines object files into an executable'], ['a token', 'Smallest unit of a C program'], ['a keyword', 'Reserved word of C'], ['an identifier', 'Name given to a variable or function'], ['type casting', 'Converting a value to another type'], ['the else-if ladder', 'Checks conditions one after another'], ['switch', 'Selects one case from many'], ['a do-while loop', 'Runs its body at least once'], ['break', 'Leaves a loop immediately'], ['continue', 'Skips to the next iteration'], ['an array', 'Items of one type stored together'], ['strlen', 'Returns the length of a string'], ['strcat', 'Joins two strings'], ['strcmp', 'Compares two strings'], ['a static variable', 'Keeps its value between function calls'], ['recursion', 'Function calling itself'], ['a structure', 'Groups members of different types'], ['a union', 'Members share the same memory'], ['a pointer', 'Variable holding an address'], ['malloc', 'Allocates a block of memory'], ['calloc', 'Allocates zeroed memory blocks'], ['realloc', 'Changes the size of allocated memory'], ['free', 'Releases allocated memory'], ['fopen', 'Opens a file'], ['fseek', 'Moves to a position in a file'], ['argc', 'Count of command line arguments'], ['argv', 'Array of command line arguments'],
];
const DIGT: Fact[] = [
  ['an intrinsic material', 'Pure semiconductor material'], ['an analog signal', 'Signal with continuous values'], ['a digital signal', 'Signal with discrete values'], ['BCD', 'Each decimal digit in four bits'], ['ASCII', 'Seven-bit character code'], ['a parity bit', 'Extra bit for detecting an error'], ['a universal gate', 'NAND or NOR'], ['an XOR gate', 'Output high when inputs differ'], ['TTL', 'Logic family using bipolar transistors'], ['CMOS', 'Low-power logic family'], ['VLSI', 'Very large number of gates on a chip'], ['the duality principle', 'Interchanging AND with OR and 0 with 1'], ["De Morgan's theorem", 'NOT of a product equals the sum of NOTs'], ['a Karnaugh map', 'Grid for simplifying Boolean expressions'], ['a half adder', 'Adds two bits'], ['a full adder', 'Adds three bits'], ['a half subtractor', 'Subtracts one bit from another'], ['a multiplexer', 'Many inputs to one output'], ['a demultiplexer', 'One input to many outputs'], ['a comparator', 'Finds whether two numbers are equal'], ['a master-slave flip-flop', 'Two flip-flops that avoid the race condition'], ['the race condition', 'Output toggles repeatedly in one clock pulse'], ['a ripple counter', 'Asynchronous counter'], ['a decade counter', 'Counter with ten states'], ['SISO', 'Serial input, serial output register'], ['PIPO', 'Parallel input, parallel output register'],
];
const OSYS: Fact[] = [
  ['a real-time OS', 'Responds within strict time limits'], ['a distributed OS', 'Runs across many networked computers'], ['a time-sharing OS', 'Gives each user a slice of CPU time'], ['an embedded OS', 'Runs inside a device with a fixed function'], ['a system call', 'Request by a program to the kernel'], ['a monolithic kernel', 'All services in one large kernel'], ['a microkernel', 'Only essential services in the kernel'], ['booting', 'Loading the OS at startup'], ['the PCB', 'Data structure describing a process'], ['context switching', 'Saving one process and loading another'], ['a thread', 'Lightweight unit of execution'], ['FCFS', 'Serves in order of arrival'], ['Round Robin', 'Fixed time slice for each process'], ['preemptive scheduling', 'A running process can be interrupted'], ['a critical section', 'Code that uses shared data'], ['mutual exclusion', 'Only one process in the shared code'], ['a semaphore', 'Signalling variable for synchronisation'], ['a deadlock', 'Processes wait for each other forever'], ["the banker's algorithm", 'Avoids deadlock'], ['external fragmentation', 'Free memory scattered in small holes'], ['compaction', 'Moves processes to join free memory'], ['paging', 'Fixed-size division of memory'], ['a page fault', 'Referenced page is not in memory'], ['demand paging', 'Pages are loaded only when needed'], ['the dirty bit', 'Shows that a page was modified'], ['LRU', 'Replaces the page unused for the longest time'], ['FIFO replacement', 'Replaces the oldest page'], ['the working set', 'Pages used by a process recently'], ['a directory', 'Holds information about files'],
];
const IOTS: Fact[] = [
  ['IoT', 'Physical objects connected through the internet'], ['M2M', 'Direct communication between machines'], ['SDN', 'Separates network control from forwarding'], ['the request-response model', 'A client asks and a server replies'], ['the publish-subscribe model', 'Messages pass through a broker to subscribers'], ['the REST API', 'Web interface based on resources'], ['the WebSocket API', 'Two-way connection over one channel'], ['a sensor node', 'Device that senses and sends data'], ['a MAC protocol', 'Controls access to a shared wireless medium'], ['node discovery', 'Finding neighbouring devices'], ['data aggregation', 'Combining data from many sensors'], ['data dissemination', 'Spreading data through the network'], ['home automation', 'Control of lights and appliances from anywhere'], ['smart surveillance', 'Automatic monitoring with cameras and sensors'], ['the Raspberry Pi', 'Small computer that runs Python'], ['GPIO', 'Pins for connecting sensors'], ['Python in IoT', 'Language used to program embedded boards'], ['a device security issue', 'Weak passwords on connected devices'], ['interoperability', 'Devices of different makers working together'], ['scalability', 'Handling a growing number of devices'],
];
const OFFICE: Fact[] = [
  ['the gutter margin', 'Extra space for binding'], ['a header', 'Text at the top of each page'], ['a footer', 'Text at the bottom of each page'], ['a page break', 'Starts a new page'], ['find and replace', 'Changes a word through a document'], ['a template', 'Ready-made document layout'], ['a spell check', 'Finds spelling mistakes'], ['mail merge in Word', 'Personalises one letter for many people'], ['a cell', 'Meeting point of a row and a column'], ['a worksheet', 'Single sheet of a spreadsheet'], ['the SUM function', 'Adds a range of values'], ['the AVERAGE function', 'Finds the mean of a range'], ['the IF function', 'Returns a value based on a condition'], ['the VLOOKUP function', 'Finds a value in a table'], ['an absolute reference', '$A$1'], ['a chart', 'Graph of worksheet data'], ['a slide', 'One page of a presentation'], ['slide transition', 'Effect between two slides'], ['Ctrl + C', 'Copies a selection'], ['Ctrl + V', 'Pastes a selection'], ['Ctrl + Z', 'Undoes the last action'], ['Ctrl + S', 'Saves a file'],
];
const DCOM: Fact[] = [
  ['the body behind the Ethernet standard', 'IEEE'], ['the OSI model', 'Seven-layer reference model'], ['the TCP/IP model', 'Four-layer internet model'], ['a star topology', 'All nodes connect to a hub'], ['a tree topology', 'Hierarchy of star networks'], ['circuit switching', 'Dedicated path for the whole call'], ['packet switching', 'Data sent as small independent units'], ['FDM', 'Divides a channel by frequency'], ['TDM', 'Divides a channel by time slots'], ['WDM', 'Multiplexes light of different colours'], ['framing', 'Dividing a bit stream into blocks'], ['flow control', 'Stops a fast sender flooding a receiver'], ['ARQ', 'Retransmits frames that are lost'], ['the Hamming code', 'Corrects single-bit errors'], ['CRC', 'Detects errors using polynomial division'], ['HDLC', 'Bit-oriented data link protocol'], ['flooding', 'Sends a packet on every outgoing line'], ['distance vector routing', 'Routers share tables with neighbours'], ['link state routing', 'Routers know the whole topology'], ['congestion control', 'Limits traffic to avoid overload'], ['a bridge', 'Joins two LAN segments'], ['a modem', 'Converts digital and analog signals'], ['a proxy server', 'Acts between a client and the internet'], ['a wireless access point', 'Connects Wi-Fi devices to a network'],
];

const FLUID: Fact[] = [
  ['density', 'Mass per unit volume'], ['specific gravity', 'Density relative to water'], ['capillarity', 'Rise of liquid in a thin tube'], ["Pascal's law", 'Pressure at a point is equal in all directions'], ['gauge pressure', 'Pressure above atmospheric'], ['absolute pressure', 'Gauge plus atmospheric pressure'], ['a piezometer', 'Simple tube for measuring pressure'], ['a manometer', 'U-tube for measuring pressure'], ['a Bourdon gauge', 'Curved tube pressure gauge'], ['the centre of pressure', 'Point where total pressure acts'], ['steady flow', 'Properties do not change with time'], ['uniform flow', 'Velocity does not change along the flow'], ['the continuity equation', 'A1V1 = A2V2'], ["Bernoulli's theorem", 'Total energy head stays constant'], ['a venturimeter', 'Measures discharge in a pipe'], ['a pitot tube', 'Measures velocity at a point'], ['a notch', 'Opening for measuring flow in a small channel'], ['a weir', 'Structure across a channel measuring flow'], ['the Reynolds number', 'Ratio of inertia to viscous forces'], ['water hammer', 'Pressure rise when a valve closes suddenly'], ["Chezy's formula", 'V = C√(RS)'], ["Manning's n", 'Roughness coefficient of a channel'], ['a centrifugal pump', 'Lifts water by rotating an impeller'], ['a Pelton wheel', 'Impulse turbine'], ['a Francis turbine', 'Reaction turbine'],
];
const SURV3: Fact[] = [
  ['the working from whole to part', 'Basic principle of surveying'], ['ranging', 'Keeping a chain line straight'], ['an offset', 'Short lateral measurement from a chain line'], ['a metric chain', 'Chain of 20 m or 30 m'], ['field notes', 'Measurements recorded in the survey book'], ['a prismatic compass', 'Reads bearings through a prism'], ['a true meridian', 'Line to the geographic poles'], ['a magnetic meridian', 'Direction shown by a free needle'], ['magnetic dip', 'Tilt of a free needle'], ['declination', 'Angle between true and magnetic meridians'], ['local attraction', 'Needle deflected by nearby iron'], ['a datum', 'Level surface for measuring heights'], ['a bench mark', 'Point of known level'], ['an auto level', 'Level with self-setting line of sight'], ['the two-peg test', 'Checks adjustment of a level'], ['the height of collimation method', 'Reduces levels using instrument height'], ['the rise and fall method', 'Reduces levels using staff differences'], ['fly levelling', 'Carries a level between distant points'], ['profile levelling', 'Finds ground levels along a line'], ["Simpson's rule", 'Finds area with parabolic strips'], ['a planimeter', 'Measures a plotted area'], ['the Ceylon ghat tracer', 'Marks a gradient on a hillside'], ['a pantograph', 'Copies a plan to another scale'], ['an Abney level', 'Hand instrument for finding slope'],
];
const BMC3: Fact[] = [
  ['an igneous rock', 'Rock formed from cooled magma'], ['a sedimentary rock', 'Rock formed in layers'], ['a metamorphic rock', 'Rock changed by heat and pressure'], ['quarrying', 'Extracting stone from the ground'], ['a clamp', 'Temporary brick burning structure'], ["Hoffman's kiln", 'Continuous brick kiln'], ['a fineness test', 'Checks the particle size of cement'], ['calcination of limestone', 'Produces quicklime'], ['slaking', 'Adding water to quicklime'], ['a knot', 'Timber defect at a branch base'], ['plywood', 'Thin veneers glued in layers'], ['varnish', 'Transparent protective coating'], ['a spread footing', 'Widened base of a wall'], ['dewatering', 'Removing water from an excavation'], ['a retaining wall', 'Holds back earth'], ['a cavity wall', 'Wall with two leaves and a gap'], ['a partition wall', 'Non-load-bearing dividing wall'], ['a closer', 'Brick cut to complete a bond'], ['ashlar masonry', 'Finely dressed stone with thin joints'], ['rubble masonry', 'Rough undressed stone work'], ['a keystone', 'Top central stone of an arch'], ['a terrazzo floor', 'Marble chips set in cement and polished'], ['a pitched roof', 'Sloping roof'], ['a dog-legged stair', 'Two flights in opposite directions'], ['distempering', 'Water-based wall finish'],
];
const BDRAW: Fact[] = [
  ['the plan of a building', 'Horizontal section at window level'], ['the elevation', 'Outside view of a building'], ['the sectional elevation', 'Vertical cut through a building'], ['a site plan', 'Building shown on its plot'], ['a line plan', 'Single-line room layout'], ['the plinth protection', 'Paving around the outer walls'], ['the footing offset', 'Step in a foundation width'], ['a T junction', 'Meeting of a wall with another wall at mid-length'], ['a basement', 'Storey below ground level'], ['a joist', 'Beam supporting a wooden floor'], ['a flush door', 'Door with a smooth flat face'], ['a panelled door', 'Door framed around thin panels'], ['a glazed door', 'Door fitted with glass'], ['a wire-gauze door', 'Door keeping out insects'], ['a door frame', 'Fixed part holding the shutter'], ['the shutter', 'Moving part of a door'], ['a parapet', 'Low wall around a terrace'], ['a conglomerate floor', 'Concrete floor of cement and small aggregate'], ['a vitrified tile', 'Hard tile with very low water absorption'], ['thermal insulation', 'Layer reducing heat through a roof'], ['AutoCAD', 'Software for computer drawing'],
];
const EME: Fact[] = [
  ['a belt drive', 'Transmits power between pulleys'], ['a V-belt', 'Belt of wedge section'], ['a cross belt', 'Reverses the direction of rotation'], ['a gear train', 'Set of meshing gears'], ['a four-stroke engine', 'One power stroke in two revolutions'], ['a two-stroke engine', 'One power stroke in each revolution'], ['a diesel engine', 'Ignites fuel by compression'], ['a petrol engine', 'Ignites fuel with a spark plug'], ['a refrigerant', 'Fluid that carries heat in a refrigerator'], ['a split AC', 'Air conditioner with indoor and outdoor units'], ['a reciprocating pump', 'Moves water with a piston'], ['a thermal station', 'Generates power by burning coal'], ['a hydro station', 'Generates power from falling water'], ['a nuclear station', 'Generates power from fission heat'], ['an energy meter', 'Records units consumed'], ['a distribution board', 'Divides supply into circuits'], ['an MCB', 'Trips automatically on overload'], ['an earth wire', 'Carries fault current to ground'], ['a DOL starter', 'Connects a motor directly to the supply'], ['a star-delta starter', 'Reduces starting current of a motor'], ['PBX', 'Private telephone exchange'], ['a generator', 'Converts mechanical to electrical energy'], ['an electric motor', 'Converts electrical to mechanical energy'], ['concealed wiring', 'Wires hidden inside walls'],
];
const MECH: Fact[] = [
  ['statics', 'Study of bodies at rest'], ['dynamics', 'Study of bodies in motion'], ['a rigid body', 'Body whose shape does not change under load'], ['the transmissibility principle', 'A force may slide along its line of action'], ['a free body diagram', 'Sketch of a body with all forces'], ['the resultant', 'Single force replacing a system'], ['the equilibrant', 'Force balancing a system'], ["Lami's theorem", 'Three forces in equilibrium, each proportional to sine of opposite angle'], ['a moment', 'Force multiplied by perpendicular distance'], ["Varignon's theorem", 'Moment of the resultant equals sum of moments'], ['a couple', 'Two equal, opposite, parallel forces'], ['the centroid', 'Centre of area of a plane figure'], ['the second moment of area', 'Moment of inertia of a section'], ['the parallel axis theorem', 'I = Ig + Ah²'], ['the section modulus', 'Moment of inertia divided by extreme distance'], ['mechanical advantage', 'Load divided by effort'], ['velocity ratio', 'Effort distance divided by load distance'], ['a reversible machine', 'Efficiency above 50%'], ['a self-locking machine', 'Efficiency below 50%'], ['a screw jack', 'Lifts heavy loads with a threaded rod'], ['a perfect frame', 'Members equal to 2j - 3'], ['a redundant frame', 'More members than needed'], ['a deficient frame', 'Fewer members than needed'], ['the method of joints', 'Solves a truss joint by joint'], ['the method of sections', 'Solves a truss by a cutting line'],
];

const math1: Make = (r, id, i) => {
  const n = r.int(4, 12);
  const k = r.int(1, 3);
  const [a, b, c, d] = [r.int(1, 9), r.int(1, 9), r.int(1, 9), r.int(1, 9)];
  const [p, q, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
  const ncr = k === 1 ? n : k === 2 ? (n * (n - 1)) / 2 : (n * (n - 1) * (n - 2)) / 6;
  switch (i % 4) {
    case 0: return num(r, id, `Value of ${n}C${k}?`, ncr, `n!/(r!(n-r)!)`);
    case 1: return mcq(r, id, C, `Value of the determinant |${a} ${b}; ${c} ${d}|?`, String(a * d - b * c), [a * d + b * c, a * d - b * c + 2, b * c - a * d].map(String), `ad - bc`);
    case 2: return num(r, id, `Modulus of ${p} + ${q}i?`, h, `√(${p}² + ${q}²)`, '', 1);
    default: return num(r, id, `If y = x^${n}, value of dy/dx at x = 1?`, n, `dy/dx = ${n}x^${n - 1}`, '', 1);
  }
};
const math2: Make = (r, id, i) => {
  const [p, q, h] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]]);
  const a = r.int(1, 9);
  const m = r.int(2, 9);
  const data = [r.int(5, 40), r.int(5, 40), r.int(5, 40), r.int(5, 40)];
  switch (i % 4) {
    case 0: return num(r, id, `Distance between (${a}, ${m}) and (${a + p}, ${m + q})?`, h, `√(${p}² + ${q}²)`, '', 1);
    case 1: return num(r, id, `Radius of the circle x² + y² = ${h * h}?`, h, `r² = ${h * h}`, '', 1);
    case 2: return num(r, id, `Value of the integral of ${2 * m}x from 0 to ${a}?`, m * a * a, `[${m}x²] from 0 to ${a}`);
    default: return num(r, id, `Mean of ${data.join(', ')}?`, data.reduce((s, x) => s + x, 0) / 4, `Sum / 4`, '', 2);
  }
};
const phy1: Make = (r, id, i) => {
  const m = r.int(2, 20);
  const v = r.int(2, 20);
  const t = r.int(2, 10);
  switch (i % 4) {
    case 0: return num(r, id, `Force on a ${m} kg mass with acceleration ${v} m/s²?`, m * v, `F = ma`, ' N');
    case 1: return num(r, id, `Kinetic energy of ${m} kg moving at ${v} m/s?`, (m * v * v) / 2, `½mv²`, ' J');
    case 2: return num(r, id, `Momentum of ${m} kg moving at ${v} m/s?`, m * v, `p = mv`, ' kg m/s');
    default: return num(r, id, `${m * t * 10} J of work is done in ${t} s. Power?`, m * 10, `P = W/t`, ' W');
  }
};
const phy2: Make = (r, id, i) => {
  const a = r.int(2, 12);
  const b = r.int(2, 12);
  const c = r.pick([2, 3, 4, 6]);
  switch (i % 4) {
    case 0: return num(r, id, `Current ${a} A flows through ${b} Ω. Voltage?`, a * b, `V = IR`, ' V');
    case 1: return num(r, id, `Resistors ${a} Ω and ${b} Ω in series. Total resistance?`, a + b, `R1 + R2`, ' Ω', 1);
    case 2: return num(r, id, `Two equal ${a * c} Ω resistors in parallel. Total resistance?`, (a * c) / 2, `R/2`, ' Ω', 1);
    default: return num(r, id, `${a} A at ${b * 10} V. Electrical power?`, a * b * 10, `P = VI`, ' W');
  }
};
const chem1: Make = (r, id, i) => {
  const n = r.int(1, 13);
  const moles = r.int(1, 8) / 2;
  const l = r.pick([0.5, 1, 2]);
  const w = r.int(2, 10);
  switch (i % 3) {
    case 0: return mcq(r, id, C, `[H+] = 10^-${n} mol/L. pH?`, String(n), [n + 1, n + 2, n + 3].map(String), `pH = -log[H+]`);
    case 1: return num(r, id, `${moles} mol of solute in ${l} L of solution. Molarity?`, moles / l, `moles / litres`, ' M', 0.5);
    default: return num(r, id, `Moles in ${w * 40} g of NaOH (molar mass 40)?`, w, `mass / molar mass`, ' mol', 1);
  }
};
const compfund: Make = (r, id, i) => {
  const n = r.int(5, 250);
  const kb = r.int(2, 64);
  switch (i % 3) {
    case 0: return num(r, id, `Binary ${n.toString(2)} in decimal?`, n, `Add the place values`, '', 3);
    case 1: return mcq(r, id, C, `Decimal ${n} in binary?`, n.toString(2), [(n + 1).toString(2), (n + 2).toString(2), (n + 4).toString(2)], `Repeated division by 2`);
    default: return num(r, id, `${kb} KB equals how many bytes?`, kb * 1024, `1 KB = 1024 bytes`);
  }
};
const cprog: Make = (r, id, i) => {
  const a = r.int(7, 60);
  const b = r.int(2, 9);
  switch (i % 3) {
    case 0: return num(r, id, `printf("%d", ${a} / ${b});`, Math.floor(a / b), `Integer division`, '', 1);
    case 1: return mcq(r, id, C, `printf("%d", ${a} % ${b});`, String(a % b), [a % b + 1, a % b + 2, a % b + 3].map(String), `Remainder`);
    default: return num(r, id, `int a[${b * 5}]: bytes used with a 4-byte int?`, b * 20, `size × 4`, '', 4);
  }
};
const digital: Make = (r, id, i) => {
  const n = r.int(16, 250);
  const v = r.int(3, 6);
  switch (i % 3) {
    case 0: return mcq(r, id, C, `Decimal ${n} in hexadecimal?`, n.toString(16).toUpperCase(), [n + 1, n + 3, n + 16].map(x => x.toString(16).toUpperCase()), `Divide by 16`);
    case 1: return mcq(r, id, C, `Decimal ${n} in octal?`, n.toString(8), [n + 1, n + 3, n + 8].map(x => x.toString(8)), `Divide by 8`);
    default: return num(r, id, `A mod-${2 ** v} counter needs how many flip-flops?`, v, `2^n states`, '', 1);
  }
};
const dcom: Make = (r, id, i) => {
  const d = r.int(1, 255).toString(2).padStart(8, '0');
  const ones = d.split('1').length - 1;
  const n = r.int(3, 30);
  switch (i % 2) {
    case 0: return mcq(r, id, C, `Even parity bit for ${d}?`, String(ones % 2), [String(1 - ones % 2), 'Cannot be found', 'Both 0 and 1'], `${ones} ones`);
    default: return num(r, id, `Full mesh of ${n} nodes: number of links?`, (n * (n - 1)) / 2, `n(n-1)/2`);
  }
};
const fluid: Make = (r, id, i) => {
  const h = r.int(2, 30);
  const a = r.int(1, 8) / 10;
  const v = r.int(1, 9);
  switch (i % 3) {
    case 0: return num(r, id, `Water pressure at ${h} m depth (ρ = 1000, g = 9.81)?`, round2(9.81 * h), `ρgh`, ' kN/m²');
    case 1: return num(r, id, `Pipe area ${a} m², velocity ${v} m/s. Discharge?`, round2(a * v), `Q = AV`, ' m³/s', 0.1);
    default: return num(r, id, `Velocity ${v} m/s, diameter ${a} m, kinematic viscosity 0.000001 m²/s. Reynolds number?`, Math.round((v * a) / 0.000001), `VD/ν`);
  }
};
const survey: Make = (r, id, i) => {
  const bs = r.int(10, 35) / 10;
  const fs = r.int(10, 35) / 10;
  const rl = r.int(100, 300);
  const len = r.int(4, 25) * 10;
  switch (i % 2) {
    case 0: return mcq(r, id, C, `RL of A is ${rl} m, BS on A ${round2(fs + bs)} m, FS on B ${bs} m. RL of B?`, `${fmt(round2(rl + fs))} m`, [`${fmt(round2(rl - fs))} m`, `${fmt(round2(rl + bs))} m`, `${fmt(round2(rl + fs + 1))} m`], `RL + BS - FS`);
    default: return num(r, id, `A ${len * 2} m line measured with a 20 m chain: chain lengths?`, len / 10, `${len * 2} / 20`, '', 2);
  }
};
const eme: Make = (r, id, i) => {
  const hp = r.int(1, 15);
  const kw = r.int(1, 9);
  const h = r.int(2, 10);
  const rate = r.int(4, 9);
  switch (i % 2) {
    case 0: return num(r, id, `${hp} HP motor in watts?`, hp * 746, `1 HP = 746 W`);
    default: return num(r, id, `${kw} kW load for ${h} hours at ₹${rate} per unit. Cost?`, kw * h * rate, `kWh × rate`, ' rupees');
  }
};
const mech: Make = (r, id, i) => {
  const [p, q, h] = r.pick([[30, 40, 50], [50, 120, 130], [60, 80, 100], [90, 120, 150]]);
  const f = r.int(5, 50);
  const d = r.int(2, 9);
  const e = r.int(5, 20);
  switch (i % 3) {
    case 0: return num(r, id, `Forces of ${p} N and ${q} N act at right angles. Resultant?`, h, `√(P² + Q²)`, ' N', 10);
    case 1: return num(r, id, `Force ${f} N at ${d} m perpendicular distance. Moment?`, f * d, `F × d`, ' N m');
    default: return num(r, id, `Load ${e * d} N lifted by effort ${e} N. Mechanical advantage?`, d, `Load / effort`, '', 1);
  }
};

const LOWER_QUESTIONS: PlacementMcq[] = [
  ...paper('Sem 1 English & Communication-I', 'en1', 2001, ENG1),
  ...paper('Sem 1 Applied Mathematics-I', 'ma1', 2002, MATH1, math1),
  ...paper('Sem 1 Applied Physics-I', 'ph1', 2003, PHY1, phy1),
  ...paper('Sem 1 Applied Chemistry-I', 'ch1', 2004, CHEM1, chem1, 40),
  ...paper('Sem 1 Computer Fundamentals', 'cf', 2005, COMP, compfund),
  ...paper('Sem 1 Engineering Graphics-I', 'eg1', 2006, GRAPH1),
  ...paper('Sem 1 Workshop Practice-I', 'ws1', 2007, SHOP1),
  ...paper('Sem 2 English & Communication-II', 'en2', 2008, ENG2),
  ...paper('Sem 2 Applied Mathematics-II', 'ma2', 2009, MATH2, math2),
  ...paper('Sem 2 Applied Physics-II', 'ph2', 2010, PHY2, phy2),
  ...paper('Sem 2 Applied Chemistry-II', 'ch2', 2011, CHEM2),
  ...paper('Sem 2 Environmental Science & Energy', 'evs', 2012, ENVS),
  ...paper('Sem 2 Engineering Graphics-II', 'eg2', 2013, GRAPH2),
  ...paper('Sem 2 Workshop Practice-II', 'ws2', 2014, SHOP2),
  ...paper('Sem 3 CSE Concepts of C Programming', 'cp', 2015, CPROG, cprog),
  ...paper('Old scheme CSE Digital Techniques', 'dt', 2016, DIGT, digital),
  ...paper('Sem 3 CSE Operating System', 'os', 2017, OSYS),
  ...paper('Sem 6 CSE Internet of Things', 'it', 2018, IOTS),
  ...paper('Sem 3 CSE Office Application', 'oa', 2019, OFFICE),
  ...paper('Old scheme CSE Data Communication', 'dc', 2020, DCOM, dcom, 32),
  ...paper('Sem 3 Civil Fluid Mechanics', 'fm', 2021, FLUID, fluid),
  ...paper('Sem 3 Civil Basic Surveying', 'bs', 2022, SURV3, survey, 32),
  ...paper('Sem 3 Civil Building Material & Construction', 'bm', 2023, BMC3),
  ...paper('Sem 3 Civil Building Drawing', 'bd', 2024, BDRAW),
  ...paper('Old scheme Civil Electrical & Mechanical Systems', 'em', 2025, EME, eme, 32),
  ...paper('Sem 3 Civil Engineering Mechanics', 'mc', 2026, MECH, mech),
];

/** Semester order; papers from the old scheme come last. Called by the bank so both files finish loading first. */
export const syllabusQuestions = (upper: PlacementMcq[]) => {
  const sem = (q: PlacementMcq) => Number(q.subject?.match(/^Sem (\d)/)?.[1] ?? 9);
  return [...LOWER_QUESTIONS, ...upper].sort((a, b) => sem(a) - sem(b));
};
