import type { PlacementMcq } from '../placementQnaBank';
import { fmt, generate, mcq, numDistractors, type Rng } from './builder';
import { pairs, type Fact } from './pairs';

// Subject Bank, part 2: core CSE and Civil subjects. Numerical answers are calculated.
const C = 'Subject Bank' as const;
const tag = (subject: string, list: PlacementMcq[]) => list.map(q => ({ ...q, subject }));
const num = (r: Rng, id: string, q: string, a: number, why: string, unit = '', step?: number) =>
  mcq(r, id, C, q, `${fmt(a)}${unit}`, numDistractors(r, a, step ?? Math.max(1, Math.round(Math.abs(a) * 0.15))).map(x => `${fmt(x)}${unit}`), why);

const DSF: Fact[] = [
  ['Stack', 'Last In First Out structure'], ['Queue', 'First In First Out structure'], ['Deque', 'Insert and delete at both ends'], ['Priority queue', 'Removes the highest priority item first'], ['Linked list', 'Nodes connected by pointers'], ['Doubly linked list', 'Nodes with next and previous pointers'], ['Circular linked list', 'Last node points to the first'], ['Binary tree', 'Each node has at most two children'], ['Binary search tree', 'Left values smaller, right values larger'], ['AVL tree', 'Self-balancing search tree'], ['Heap', 'Tree where a parent is ordered against its children'], ['Graph', 'Vertices connected by edges'], ['Hash table', 'Maps keys to positions with a function'], ['Trie', 'Tree used to store strings by prefix'], ['Bubble sort', 'Repeatedly swaps adjacent wrong pairs'], ['Selection sort', 'Picks the smallest item in each pass'], ['Insertion sort', 'Places each item in the sorted part'], ['Merge sort', 'Splits, sorts and merges lists'], ['Quick sort', 'Partitions around a pivot'], ['Heap sort', 'Sorts using a heap'], ['Linear search', 'Checks items one by one'], ['Binary search', 'Halves a sorted list each step'], ['BFS', 'Graph traversal using a queue'], ['DFS', 'Graph traversal using a stack'], ['Inorder traversal', 'Left, root, right'], ['Preorder traversal', 'Root, left, right'], ['Postorder traversal', 'Left, right, root'], ['Overflow', 'Inserting into a full structure'], ['Underflow', 'Removing from an empty structure'], ['Recursion', 'A function calling itself'], ['Collision', 'Two keys map to one hash position'], ['Spanning tree', 'Connects all vertices without a cycle'], ['Dijkstra algorithm', 'Finds shortest paths from one source'], ['Kruskal algorithm', 'Builds a minimum spanning tree from edges'],
];
const DBF: Fact[] = [
  ['Primary key', 'Uniquely identifies each row'], ['Foreign key', 'Refers to a key in another table'], ['Candidate key', 'Any column set that can be a primary key'], ['Composite key', 'Key made of two or more columns'], ['Tuple', 'A row of a table'], ['Attribute', 'A column of a table'], ['Schema', 'Logical design of a database'], ['View', 'Virtual table from a query'], ['Index', 'Speeds up data search'], ['Trigger', 'Runs automatically on a table event'], ['Stored procedure', 'Saved set of SQL statements'], ['Transaction', 'A unit of work that succeeds or fails fully'], ['COMMIT', 'Saves a transaction permanently'], ['ROLLBACK', 'Undoes a transaction'], ['SELECT', 'Reads rows'], ['INSERT', 'Adds rows'], ['UPDATE', 'Changes rows'], ['DELETE', 'Removes selected rows'], ['CREATE TABLE', 'Makes a new table'], ['ALTER TABLE', 'Changes a table structure'], ['DROP TABLE', 'Removes a table completely'], ['GROUP BY', 'Forms groups of rows'], ['ORDER BY', 'Sorts the result'], ['HAVING', 'Filters groups'], ['WHERE', 'Filters rows'], ['DISTINCT', 'Removes duplicate values'], ['INNER JOIN', 'Returns matching rows of both tables'], ['LEFT JOIN', 'Returns all rows of the left table'], ['1NF', 'Every cell holds a single value'], ['2NF', 'No partial dependency on the key'], ['3NF', 'No transitive dependency'], ['Atomicity', 'All or nothing execution'], ['Consistency', 'Data stays valid after a transaction'], ['Isolation', 'Transactions do not disturb each other'], ['Durability', 'Committed data survives failure'],
];
const NETF: Fact[] = [
  ['Physical layer', 'Sends raw bits'], ['Data link layer', 'Handles frames and MAC addresses'], ['Network layer', 'Routes packets using IP'], ['Transport layer', 'Provides end-to-end delivery'], ['Session layer', 'Manages sessions between applications'], ['Presentation layer', 'Handles format and encryption'], ['Application layer', 'Provides services to users'], ['Router', 'Connects different networks'], ['Switch', 'Forwards frames using MAC addresses'], ['Hub', 'Repeats signals to all ports'], ['Repeater', 'Boosts a weak signal'], ['Gateway', 'Connects networks using different protocols'], ['Firewall', 'Filters network traffic'], ['DNS', 'Converts names to IP addresses'], ['DHCP', 'Gives IP addresses automatically'], ['ARP', 'Finds a MAC address from an IP address'], ['ICMP', 'Carries error messages, used by ping'], ['TCP', 'Reliable connection-oriented protocol'], ['UDP', 'Fast connectionless protocol'], ['HTTP', 'Transfers web pages'], ['HTTPS', 'Transfers web pages securely'], ['FTP', 'Transfers files'], ['SMTP', 'Sends email'], ['POP3', 'Downloads email'], ['IMAP', 'Reads email kept on the server'], ['SSH', 'Secure remote login'], ['Telnet', 'Unsecured remote login'], ['SNMP', 'Manages network devices'], ['LAN', 'Network within a building'], ['WAN', 'Network across cities or countries'], ['Star topology', 'All devices connect to a centre'], ['Bus topology', 'All devices share one cable'], ['Ring topology', 'Devices form a closed loop'], ['Mesh topology', 'Devices connect to each other directly'], ['NAT', 'Maps private addresses to a public address'], ['VPN', 'Secure tunnel over a public network'],
];
const OSF: Fact[] = [
  ['Process', 'A program in execution'], ['Thread', 'Smallest unit of CPU scheduling'], ['Kernel', 'Core part of an operating system'], ['Shell', 'Command interface to the OS'], ['System call', 'Program request to the kernel'], ['Deadlock', 'Processes wait for each other forever'], ['Starvation', 'A process waits indefinitely for resources'], ['Semaphore', 'Variable used for synchronisation'], ['Mutex', 'Lock allowing one thread at a time'], ['Critical section', 'Code that uses shared resources'], ['Paging', 'Divides memory into fixed-size blocks'], ['Segmentation', 'Divides memory into variable logical parts'], ['Virtual memory', 'Uses disk to extend main memory'], ['Page fault', 'A needed page is not in memory'], ['Thrashing', 'Too much time spent swapping pages'], ['Context switch', 'CPU changes from one process to another'], ['FCFS', 'Runs processes in arrival order'], ['SJF', 'Runs the shortest job first'], ['Round Robin', 'Gives each process a time slice'], ['Priority scheduling', 'Runs the most important process first'], ['Spooling', 'Holds print jobs in a queue'], ['Bootloader', 'Loads the OS at startup'], ['Device driver', 'Lets the OS control hardware'], ['File system', 'Organises data on a disk'], ['ls', 'Lists files in Linux'], ['cd', 'Changes directory in Linux'], ['pwd', 'Shows the current directory in Linux'], ['mkdir', 'Creates a directory in Linux'], ['rm', 'Deletes a file in Linux'], ['cp', 'Copies a file in Linux'], ['mv', 'Moves or renames a file in Linux'], ['chmod', 'Changes file permissions in Linux'], ['ps', 'Lists running processes in Linux'], ['kill', 'Stops a process in Linux'], ['grep', 'Searches text in Linux'], ['sudo', 'Runs a command as administrator in Linux'],
];
const IOTF: Fact[] = [
  ['Arduino Uno', 'Microcontroller board based on ATmega328P'], ['Raspberry Pi', 'Small single-board computer'], ['ESP8266', 'Low-cost Wi-Fi microcontroller'], ['ESP32', 'Microcontroller with Wi-Fi and Bluetooth'], ['Sensor', 'Converts a physical quantity to a signal'], ['Actuator', 'Converts a signal to physical action'], ['Relay', 'Electrically operated switch'], ['Servo motor', 'Motor that rotates to a set angle'], ['DHT11', 'Temperature and humidity sensor'], ['LM35', 'Analog temperature sensor'], ['Ultrasonic HC-SR04', 'Measures distance using sound'], ['PIR sensor', 'Detects motion of warm bodies'], ['LDR', 'Resistance changes with light'], ['MQ-2', 'Detects gas and smoke'], ['MQTT', 'Lightweight publish-subscribe protocol'], ['CoAP', 'Lightweight web protocol for small devices'], ['Zigbee', 'Low-power short-range mesh radio'], ['LoRa', 'Long-range low-power radio'], ['BLE', 'Bluetooth designed for low energy'], ['NFC', 'Very short range radio communication'], ['RFID', 'Identifies tags using radio waves'], ['ADC', 'Converts analog signals to digital'], ['DAC', 'Converts digital signals to analog'], ['PWM', 'Controls average power by pulse width'], ['GPIO', 'General-purpose input and output pins'], ['I2C', 'Two-wire serial bus'], ['SPI', 'Fast four-wire serial bus'], ['UART', 'Asynchronous serial communication'], ['Gateway', 'Connects devices to the internet'], ['Edge computing', 'Processes data close to the device'], ['Cloud platform', 'Stores and analyses device data online'], ['setup()', 'Arduino function that runs once'], ['loop()', 'Arduino function that repeats forever'], ['digitalWrite()', 'Sets an Arduino pin HIGH or LOW'], ['analogRead()', 'Reads an analog value on Arduino'], ['Smart home', 'Remote control of household devices'],
];
const DIGF: Fact[] = [
  ['AND gate', 'Output 1 only when all inputs are 1'], ['OR gate', 'Output 1 when any input is 1'], ['NOT gate', 'Inverts the input'], ['NAND gate', 'Output 0 only when all inputs are 1'], ['NOR gate', 'Output 1 only when all inputs are 0'], ['XOR gate', 'Output 1 when inputs differ'], ['XNOR gate', 'Output 1 when inputs are equal'], ['Half adder', 'Adds two bits'], ['Full adder', 'Adds three bits'], ['Multiplexer', 'Selects one of many inputs'], ['Demultiplexer', 'Sends one input to one of many outputs'], ['Encoder', 'Converts active input to a binary code'], ['Decoder', 'Converts a binary code to one active output'], ['SR flip-flop', 'Basic latch with set and reset'], ['D flip-flop', 'Stores the data input on a clock edge'], ['JK flip-flop', 'Toggles when both inputs are 1'], ['T flip-flop', 'Toggles on each clock when T is 1'], ['Register', 'Group of flip-flops storing bits'], ['Counter', 'Counts clock pulses'], ['Shift register', 'Moves bits by one position each clock'], ['K-map', 'Graphical way to simplify Boolean expressions'], ['De Morgan theorem', 'Complement of a product is the sum of complements'], ['Universal gate', 'A gate that can build every other gate'], ['BCD', 'Each decimal digit coded in 4 bits'], ['Gray code', 'Adjacent numbers differ by one bit'], ['Parity bit', 'Extra bit used to detect errors'], ['RAM', 'Volatile read and write memory'], ['ROM', 'Non-volatile read-only memory'], ['Combinational circuit', 'Output depends only on present inputs'], ['Sequential circuit', 'Output depends on inputs and past state'],
];
const SURVF: Fact[] = [
  ['Chain surveying', 'Uses linear measurements only'], ['Compass surveying', 'Uses bearings and lengths'], ['Plane table surveying', 'Plots the map in the field'], ['Theodolite', 'Measures horizontal and vertical angles'], ['Dumpy level', 'Finds height differences'], ['Total station', 'Measures angles and distances electronically'], ['Levelling staff', 'Graduated rod read through a level'], ['Ranging rod', 'Marks points on a survey line'], ['Bench mark', 'Fixed point of known elevation'], ['Back sight', 'First reading after setting up the level'], ['Fore sight', 'Last reading before moving the level'], ['Change point', 'Point with both back and fore sights'], ['Contour line', 'Joins points of equal elevation'], ['Contour interval', 'Vertical gap between contours'], ['Datum', 'Reference surface for levels'], ['Reduced level', 'Height of a point above the datum'], ['Whole circle bearing', 'Measured clockwise from north, 0 to 360 degrees'], ['Reduced bearing', 'Measured from north or south, up to 90 degrees'], ['Magnetic declination', 'Angle between true and magnetic north'], ['Local attraction', 'Disturbance of a compass by nearby iron'], ['Traverse', 'Connected series of survey lines'], ['Closing error', 'Gap at the end of a closed traverse'], ['Offset', 'Short measurement from a chain line'], ['Tie line', 'Line used to check the survey'], ['Trapezoidal rule', 'Finds area by treating strips as trapezia'], ['Simpson rule', 'Finds area assuming curved boundaries'], ['GPS', 'Finds position from satellites'], ['GIS', 'Stores and analyses map data'], ['EDM', 'Measures distance electronically'], ['Curve setting', 'Marking road curves on the ground'], ['Planimeter', 'Measures area on a map'], ['Clinometer', 'Measures slope angles'],
];
const MATF: Fact[] = [
  ['OPC', 'Ordinary Portland Cement'], ['PPC', 'Portland Pozzolana Cement'], ['Gypsum', 'Added to control cement setting'], ['Fly ash', 'Pozzolanic power plant waste'], ['Fine aggregate', 'Particles passing the 4.75 mm sieve'], ['Coarse aggregate', 'Particles retained on the 4.75 mm sieve'], ['Stretcher', 'Brick laid along the wall face'], ['Header', 'Brick laid across the wall face'], ['Frog', 'Depression on a brick face'], ['Queen closer', 'Brick cut in half lengthwise'], ['Efflorescence', 'White salt deposit on a wall'], ['DPC', 'Layer stopping rising damp'], ['Lintel', 'Beam over a door or window opening'], ['Plinth', 'Part between ground and floor level'], ['Sill', 'Bottom member of a window'], ['Parapet', 'Low wall at a roof edge'], ['Chajja', 'Projection above a window for shade'], ['Tread', 'Horizontal part of a stair step'], ['Riser', 'Vertical part of a stair step'], ['Scaffolding', 'Temporary working platform'], ['Shoring', 'Temporary support for an unsafe structure'], ['Underpinning', 'Strengthening an existing foundation'], ['Pile foundation', 'Transfers load to deep strong soil'], ['Raft foundation', 'Slab under the whole building'], ['Isolated footing', 'Footing under one column'], ['Seasoning', 'Removing moisture from timber'], ['English bond', 'Alternate header and stretcher courses'], ['Flemish bond', 'Headers and stretchers in each course'], ['Mortar', 'Binder paste for masonry'], ['Plaster', 'Protective coat on walls'], ['Pointing', 'Finishing masonry joints'], ['Bitumen', 'Binder used in road surfacing'],
];
const RCCF: Fact[] = [
  ['Slump test', 'Measures workability on site'], ['Compaction factor test', 'Measures workability in the lab'], ['Vee-Bee test', 'Measures workability of stiff concrete'], ['Cube test', 'Measures compressive strength'], ['Curing', 'Keeps concrete moist while it gains strength'], ['Segregation', 'Coarse aggregate separates from the mix'], ['Bleeding', 'Water rises to the surface'], ['Honeycombing', 'Voids from poor compaction'], ['Laitance', 'Weak cement layer on the surface'], ['Accelerator', 'Speeds up setting'], ['Retarder', 'Delays setting'], ['Plasticiser', 'Improves workability'], ['Water-cement ratio', 'Mass of water divided by mass of cement'], ['M20', 'Concrete of 20 N/mm² characteristic strength'], ['Fe 415', 'Steel of 415 N/mm² yield strength'], ['IS 456', 'Code for plain and reinforced concrete'], ['IS 10262', 'Code for concrete mix design'], ['IS 875', 'Code for design loads'], ['IS 1893', 'Code for earthquake design'], ['Clear cover', 'Concrete between bar and surface'], ['Stirrup', 'Bar resisting shear in a beam'], ['Lateral tie', 'Bar holding column main bars'], ['One-way slab', 'Bends mainly in one direction'], ['Two-way slab', 'Bends in both directions'], ['Singly reinforced beam', 'Steel in the tension zone only'], ['Doubly reinforced beam', 'Steel in tension and compression zones'], ['Limit state method', 'Design using safety limits'], ['Bar bending schedule', 'List of bar shapes and lengths'], ['Development length', 'Bar length needed to transfer force'], ['Lap length', 'Overlap where two bars join'], ['Formwork', 'Temporary mould for concrete'], ['Prestressed concrete', 'Compressed before service load is applied'],
];

const scheduling = (r: Rng, id: string) => {
  const b = [r.int(2, 12), r.int(2, 12), r.int(2, 12)];
  const avg = (0 + b[0] + (b[0] + b[1])) / 3;
  return num(r, id, `FCFS: burst times ${b.join(', ')} ms, all arriving at 0. Average waiting time?`, Math.round(avg * 100) / 100, `Waits are 0, ${b[0]} and ${b[0] + b[1]}`, ' ms', 2);
};

export const CORE_SUBJECTS: PlacementMcq[] = [
  ...pairs('sb-ds', 1101, C, 'Data Structures', DSF, a => `What is ${a}?`, b => `Which data structure or method matches: ${b}?`),
  ...tag('Data Structures', generate('sb-dsn', 1102, 99, (r, id, i) => {
    const h = r.int(2, 9);
    const n = r.int(4, 60);
    const m = r.pick([7, 9, 10, 11, 13]);
    const k = r.int(20, 400);
    const base = r.int(1, 9) * 100;
    switch (i % 6) {
      case 0:
        return num(r, id, `Maximum nodes at level ${h} of a binary tree (root at level 0)?`, 2 ** h, `2^level`, '', 2);
      case 1:
        return num(r, id, `Maximum nodes in a binary tree of height ${h} (root height 0)?`, 2 ** (h + 1) - 1, `2^(h+1) - 1`);
      case 2:
        return num(r, id, `Using h(k) = k mod ${m}, where does key ${k} go?`, k % m, `${k} mod ${m}`, '', 1);
      case 3:
        return num(r, id, `An int array starts at address ${base} with 4-byte items. Address of a[${n}]?`, base + 4 * n, `base + 4 × index`, '', 4);
      case 4:
        return num(r, id, `Bubble sort comparisons in the worst case for ${n} items?`, (n * (n - 1)) / 2, `n(n-1)/2`);
      default:
        return num(r, id, `A complete undirected graph has ${n} vertices. Number of edges?`, (n * (n - 1)) / 2, `n(n-1)/2 edges`);
    }
  })),
  ...pairs('sb-db', 1103, C, 'DBMS & SQL', DBF, a => `In DBMS, what does ${a} mean?`, b => `In DBMS, which term matches: ${b}?`),
  ...tag('DBMS & SQL', generate('sb-dbn', 1104, 96, (r, id, i) => {
    const marks = [r.int(30, 95), r.int(30, 95), r.int(30, 95), r.int(30, 95), r.int(30, 95)];
    const lim = r.int(40, 80);
    const col = `marks: ${marks.join(', ')}`;
    switch (i % 4) {
      case 0:
        return num(r, id, `Table has ${col}. Result of SELECT COUNT(*) WHERE marks > ${lim}?`, marks.filter(x => x > lim).length, `Count of values above ${lim}`, '', 1);
      case 1:
        return num(r, id, `Table has ${col}. Result of SELECT SUM(marks)?`, marks.reduce((a, b) => a + b, 0), `Adds all values`);
      case 2:
        return num(r, id, `Table has ${col}. Result of SELECT MAX(marks)?`, Math.max(...marks), `Largest value`, '', 3);
      default:
        return num(r, id, `Table has ${col}. Result of SELECT MIN(marks)?`, Math.min(...marks), `Smallest value`, '', 3);
    }
  })),
  ...pairs('sb-net', 1105, C, 'Computer Networks', NETF, a => `What does ${a} do in a network?`, b => `Which network term matches: ${b}?`),
  ...tag('Computer Networks', generate('sb-netn', 1106, 93, (r, id, i) => {
    const p = r.int(16, 30);
    const a = r.int(1, 223);
    const mb = r.int(1, 40) * 10;
    const sp = r.pick([2, 4, 5, 8, 10, 20]);
    switch (i % 4) {
      case 0:
        return num(r, id, `Usable hosts in a /${p} IPv4 network?`, 2 ** (32 - p) - 2, `2^(32-${p}) - 2`);
      case 1: {
        const cls = a < 127 ? 'A' : a < 128 ? 'Loopback' : a < 192 ? 'B' : 'C';
        if (cls === 'Loopback') return null;
        return mcq(r, id, C, `IP address ${a}.${r.int(0, 255)}.${r.int(0, 255)}.${r.int(1, 254)} belongs to which class?`, `Class ${cls}`, ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'].filter(c => c !== `Class ${cls}`), `First octet ${a}`);
      }
      case 2:
        return num(r, id, `Time to send ${mb} megabytes at ${sp} Mbps (ignore overhead)?`, (mb * 8) / sp, `${mb} × 8 / ${sp}`, ' s');
      default:
        return num(r, id, `${sp * 1000} kbps equals how many Mbps?`, sp, `1000 kbps = 1 Mbps`, ' Mbps', 1);
    }
  })),
  ...pairs('sb-os', 1107, C, 'Operating Systems', OSF, a => `What is ${a}?`, b => `Which operating system term matches: ${b}?`),
  ...tag('Operating Systems', generate('sb-osn', 1108, 83, (r, id, i) => {
    const pg = r.pick([1, 2, 4, 8]);
    const mem = pg * r.int(4, 64);
    const addr = r.int(1000, 60000);
    switch (i % 3) {
      case 0:
        return scheduling(r, id);
      case 1:
        return num(r, id, `A ${mem} KB process with ${pg} KB pages needs how many pages?`, mem / pg, `${mem} / ${pg}`, '', 2);
      default:
        return num(r, id, `With ${pg} KB pages, which page number holds address ${addr}?`, Math.floor(addr / (pg * 1024)), `floor(${addr} / ${pg * 1024})`, '', 2);
    }
  })),
  ...pairs('sb-iot', 1109, C, 'IoT', IOTF, a => `In IoT, what is ${a}?`, b => `In IoT, which item matches: ${b}?`),
  ...tag('IoT', generate('sb-iotn', 1110, 93, (r, id, i) => {
    const bits = r.pick([8, 10, 12, 16]);
    const v = r.pick([3.3, 5]);
    const R1 = r.int(1, 10);
    const R2 = r.int(1, 10);
    const cap = r.int(5, 40) * 100;
    const cur = r.pick([10, 20, 50, 100, 200]);
    const reading = r.int(100, 1000);
    switch (i % 5) {
      case 0:
        return num(r, id, `How many levels does a ${bits}-bit ADC have?`, 2 ** bits, `2^${bits}`);
      case 1:
        return num(r, id, `Arduino 10-bit ADC with 5 V reference reads ${reading}. Input voltage (approx.)?`, Math.round((reading / 1023) * 500) / 100, `reading / 1023 × 5`, ' V', 0.5);
      case 2:
        return num(r, id, `Voltage divider: ${v} V supply, R1 ${R1} kΩ, R2 ${R2} kΩ. Voltage across R2?`, Math.round(((v * R2) / (R1 + R2)) * 100) / 100, `V × R2 / (R1 + R2)`, ' V', 0.3);
      case 3:
        return num(r, id, `A ${cap} mAh battery powers a ${cur} mA device. Hours of use (ideal)?`, cap / cur, `${cap} / ${cur}`, ' h');
      default:
        return num(r, id, `Arduino analogWrite(pin, ${Math.round(reading / 4)}): duty cycle, approx.?`, Math.round((Math.round(reading / 4) / 255) * 100), `value / 255 × 100`, '%', 5);
    }
  })),
  ...pairs('sb-dig', 1111, C, 'Digital Electronics', DIGF, a => `What is ${a}?`, b => `Which digital item matches: ${b}?`),
  ...tag('Digital Electronics', generate('sb-dign', 1112, 99, (r, id, i) => {
    const n = r.int(2, 6);
    const a = r.int(8, 120);
    const b = r.int(8, 120);
    switch (i % 5) {
      case 0:
        return num(r, id, `A multiplexer with ${2 ** n} inputs needs how many select lines?`, n, `2^${n} inputs`, '', 1);
      case 1:
        return num(r, id, `A decoder with ${n} input lines has how many output lines?`, 2 ** n, `2^n outputs`, '', 2);
      case 2:
        return mcq(r, id, C, `Binary addition: ${a.toString(2)} + ${b.toString(2)} = ?`, (a + b).toString(2), [(a + b + 1).toString(2), (a + b + 2).toString(2), (a + b + 4).toString(2)], `${a} + ${b} = ${a + b}`);
      case 3: {
        const v = a % 127 + 1;
        const tc = (256 - v).toString(2).padStart(8, '0');
        return mcq(r, id, C, `8-bit two's complement of ${v.toString(2).padStart(8, '0')}?`, tc, [(255 - v).toString(2).padStart(8, '0'), v.toString(2).padStart(8, '0'), (257 - v).toString(2).padStart(8, '0')], `Invert the bits and add 1`);
      }
      default:
        return num(r, id, `A counter with ${n + 1} flip-flops counts up to how many states?`, 2 ** (n + 1), `2^flip-flops`, '', 2);
    }
  })),
  ...pairs('sb-sur', 1113, C, 'Surveying', SURVF, a => `In surveying, what is ${a}?`, b => `In surveying, which term matches: ${b}?`),
  ...tag('Surveying', generate('sb-surn', 1114, 90, (r, id, i) => {
    const w = r.int(5, 355);
    const hi = r.int(100, 300) + r.int(0, 9) / 10;
    const s = r.int(5, 35) / 10;
    switch (i % 3) {
      case 0: {
        if (w % 90 === 0) return null;
        const q = w < 90 ? [`N ${w}° E`] : w < 180 ? [`S ${180 - w}° E`] : w < 270 ? [`S ${w - 180}° W`] : [`N ${360 - w}° W`];
        const d = w % 90;
        return mcq(r, id, C, `Whole circle bearing ${w}°. Reduced bearing?`, q[0], [`N ${d}° E`, `S ${d}° W`, `N ${90 - d}° W`, `S ${90 - d}° E`].filter(x => x !== q[0]), `Convert by quadrant`);
      }
      case 1:
        return num(r, id, `Height of instrument ${hi} m, staff reading ${s} m. RL of the point?`, Math.round((hi - s) * 100) / 100, `HI - staff reading`, ' m', 0.5);
      default:
        return mcq(r, id, C, `Fore bearing of a line is ${w}°. Back bearing?`, `${(w + 180) % 360}°`, [`${w}°`, `${(w + 90) % 360}°`, `${(w + 270) % 360}°`], `Add or subtract 180°`);
    }
  })),
  ...pairs('sb-mat', 1115, C, 'Building Materials & Construction', MATF, a => `In construction, what is ${a}?`, b => `In construction, which term matches: ${b}?`),
  ...tag('Building Materials & Construction', generate('sb-matn', 1116, 90, (r, id, i) => {
    const l = r.int(3, 20);
    const h = r.int(2, 5);
    const bags = r.int(2, 60);
    switch (i % 3) {
      case 0:
        return num(r, id, `Plaster area of a wall ${l} m long and ${h} m high (one side)?`, l * h, `L × H`, ' m²');
      case 1:
        return num(r, id, `Bricks in ${l} m³ of masonry, at 500 bricks per m³ (approx.)?`, l * 500, `${l} × 500`, '', 100);
      default:
        return num(r, id, `Weight of ${bags} cement bags?`, bags * 50, `Each bag is 50 kg`, ' kg');
    }
  })),
  ...pairs('sb-rcc', 1117, C, 'Concrete & RCC', RCCF, a => `In concrete work, what is ${a}?`, b => `In concrete work, which term matches: ${b}?`),
  ...tag('Concrete & RCC', generate('sb-rccn', 1118, 90, (r, id, i) => {
    const c = r.int(4, 12) * 25;
    const wc = r.pick([0.4, 0.45, 0.5, 0.55, 0.6]);
    const l = r.int(3, 12);
    const b = r.int(3, 9);
    const d = r.pick([125, 150, 200]);
    const dia = r.pick([8, 10, 12, 16, 20]);
    switch (i % 3) {
      case 0:
        return num(r, id, `${c} kg of cement with water-cement ratio ${wc}. Water needed?`, Math.round(c * wc * 10) / 10, `${c} × ${wc}`, ' kg', 5);
      case 1:
        return num(r, id, `Concrete in a slab ${l} m × ${b} m × ${d} mm?`, Math.round(l * b * d) / 1000, `L × B × D`, ' m³', 0.5);
      default:
        return num(r, id, `Weight of 1 m of ${dia} mm bar (d²/162)?`, Math.round(((dia * dia) / 162) * 100) / 100, `${dia}² / 162`, ' kg', 0.2);
    }
  })),
];
