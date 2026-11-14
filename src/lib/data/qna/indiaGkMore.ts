import type { PlacementMcq } from '../placementQnaBank';
import { matchedPairs, pairs, type Fact } from './pairs';
import { ARTICLES, CAPITALS, DAMS, DANCE, DAYS, HISTORY, INDIA, MONUMENTS, ORGS, PARKS, PEOPLE, POLITY, RIVERS, SCIENCE, SPORTS, UNITS } from './indiaGk';

// India & world GK, part 2: new tables (books, awards, firsts, inventions, world capitals and currencies,
// world organisations, government schemes, ISRO) plus "correctly matched pair" questions for every table.
// Facts are stable textbook facts; check yearly against an official source and correct a row if it changes.
const C = 'India GK' as const;

const BOOKS: Fact[] = [
  ['Gitanjali', 'Rabindranath Tagore'], ['The Discovery of India', 'Jawaharlal Nehru'], ['Wings of Fire', 'A.P.J. Abdul Kalam'], ['The Story of My Experiments with Truth', 'Mahatma Gandhi'], ['Godan', 'Munshi Premchand'], ['Arthashastra', 'Kautilya'], ['Abhijnanashakuntalam', 'Kalidasa'], ['The Guide', 'R.K. Narayan'], ["Midnight's Children", 'Salman Rushdie'], ['The God of Small Things', 'Arundhati Roy'], ['India Wins Freedom', 'Maulana Abul Kalam Azad'], ['Anandamath', 'Bankim Chandra Chattopadhyay'], ['Train to Pakistan', 'Khushwant Singh'], ['The White Tiger', 'Aravind Adiga'], ['Panchatantra', 'Vishnu Sharma'], ['Ramcharitmanas', 'Tulsidas'], ['Kamayani', 'Jaishankar Prasad'], ['Madhushala', 'Harivansh Rai Bachchan'], ['Annihilation of Caste', 'B.R. Ambedkar'], ['A Suitable Boy', 'Vikram Seth'], ['The Inheritance of Loss', 'Kiran Desai'], ['Baburnama', 'Babur'], ['Akbarnama', 'Abul Fazl'], ['Rajatarangini', 'Kalhana'], ['Gita Rahasya', 'Bal Gangadhar Tilak'],
];
const AWARDS: Fact[] = [
  ['Bharat Ratna', 'Highest civilian award of India'], ['Param Vir Chakra', 'Highest wartime gallantry award'], ['Ashoka Chakra', 'Highest peacetime gallantry award'], ['Dadasaheb Phalke Award', 'Lifetime contribution to Indian cinema'], ['Jnanpith Award', 'Highest literary award of India'], ['Arjuna Award', 'Outstanding performance in sports'], ['Dronacharya Award', 'Excellence in sports coaching'], ['Major Dhyan Chand Khel Ratna', 'Highest sports award of India'], ['Shanti Swarup Bhatnagar Prize', 'Science and technology research'], ['Sahitya Akademi Award', 'Literature in Indian languages'], ['Padma Vibhushan', 'Second-highest civilian award'], ['Padma Shri', 'Fourth-highest civilian award'], ['Kirti Chakra', 'Second-highest peacetime gallantry award'], ['Vyas Samman', 'Hindi literature'], ['Kalinga Prize', 'Popularising science (UNESCO)'],
];
const FIRSTS: Fact[] = [
  ['First President of India', 'Dr Rajendra Prasad'], ['First Prime Minister of India', 'Jawaharlal Nehru'], ['First woman Prime Minister of India', 'Indira Gandhi'], ['First woman President of India', 'Pratibha Patil'], ['First Indian in space', 'Rakesh Sharma'], ['First woman of Indian origin in space', 'Kalpana Chawla'], ['First Indian Governor-General of India', 'C. Rajagopalachari'], ['First Indian Nobel laureate', 'Rabindranath Tagore'], ['First Chief Justice of India', 'H.J. Kania'], ['First woman IPS officer', 'Kiran Bedi'], ['First Indian woman to climb Mount Everest', 'Bachendri Pal'], ['First Indian to win an individual Olympic gold', 'Abhinav Bindra'], ['First woman Chief Minister in India', 'Sucheta Kriplani'], ['First Vice-President of India', 'S. Radhakrishnan'], ['First Field Marshal of India', 'Sam Manekshaw'], ['First woman Governor of an Indian state', 'Sarojini Naidu'], ['First Chief Election Commissioner of India', 'Sukumar Sen'], ['First Indian Miss World', 'Reita Faria'],
];
const INVENTIONS: Fact[] = [
  ['Telephone', 'Alexander Graham Bell'], ['Practical electric light bulb', 'Thomas Edison'], ['Radio communication', 'Guglielmo Marconi'], ['Television (first working system)', 'John Logie Baird'], ['World Wide Web', 'Tim Berners-Lee'], ['Penicillin', 'Alexander Fleming'], ['Improved steam engine', 'James Watt'], ['First powered aeroplane', 'Wright brothers'], ['Dynamite', 'Alfred Nobel'], ['Printing press with movable type', 'Johannes Gutenberg'], ['Theory of relativity', 'Albert Einstein'], ['Laws of motion', 'Isaac Newton'], ['Raman effect', 'C.V. Raman'], ['X-rays', 'Wilhelm Röntgen'], ['Electric battery', 'Alessandro Volta'], ['Polio vaccine (injected)', 'Jonas Salk'], ['Analytical Engine', 'Charles Babbage'], ['Diesel engine', 'Rudolf Diesel'], ['Bose–Einstein statistics', 'Satyendra Nath Bose'], ['Crescograph', 'Jagadish Chandra Bose'], ['Periodic table', 'Dmitri Mendeleev'], ['Smallpox vaccine', 'Edward Jenner'], ['Discovery of radioactivity', 'Henri Becquerel'],
];
const WORLD_CAPITALS: Fact[] = [
  ['Nepal', 'Kathmandu'], ['Bhutan', 'Thimphu'], ['Bangladesh', 'Dhaka'], ['Pakistan', 'Islamabad'], ['Afghanistan', 'Kabul'], ['China', 'Beijing'], ['Japan', 'Tokyo'], ['Russia', 'Moscow'], ['United States', 'Washington, D.C.'], ['United Kingdom', 'London'], ['France', 'Paris'], ['Germany', 'Berlin'], ['Italy', 'Rome'], ['Canada', 'Ottawa'], ['Australia', 'Canberra'], ['Brazil', 'Brasília'], ['Egypt', 'Cairo'], ['Saudi Arabia', 'Riyadh'], ['United Arab Emirates', 'Abu Dhabi'], ['Myanmar', 'Naypyidaw'], ['Thailand', 'Bangkok'], ['South Korea', 'Seoul'], ['Spain', 'Madrid'], ['Turkey', 'Ankara'], ['Iran', 'Tehran'], ['Maldives', 'Malé'], ['Argentina', 'Buenos Aires'], ['New Zealand', 'Wellington'], ['Switzerland', 'Bern'], ['Kenya', 'Nairobi'],
];
const CURRENCIES: Fact[] = [
  ['Japan', 'Yen'], ['China', 'Renminbi (yuan)'], ['United Kingdom', 'Pound sterling'], ['Russia', 'Rouble'], ['Bangladesh', 'Taka'], ['Bhutan', 'Ngultrum'], ['Saudi Arabia', 'Riyal'], ['United Arab Emirates', 'Dirham'], ['South Africa', 'Rand'], ['Brazil', 'Real'], ['South Korea', 'Won'], ['Thailand', 'Baht'], ['Malaysia', 'Ringgit'], ['Indonesia', 'Rupiah'], ['Afghanistan', 'Afghani'], ['Myanmar', 'Kyat'], ['Switzerland', 'Swiss franc'], ['Turkey', 'Lira'], ['Kuwait', 'Kuwaiti dinar'], ['Israel', 'Shekel'], ['Vietnam', 'Dong'], ['Maldives', 'Rufiyaa'], ['Germany', 'Euro'], ['United States', 'US dollar'],
];
const WORLD_ORGS: Fact[] = [
  ['United Nations', 'New York'], ['UNESCO', 'Paris'], ['World Health Organization', 'Geneva'], ['World Bank', 'Washington, D.C.'], ['International Court of Justice', 'The Hague'], ['Food and Agriculture Organization', 'Rome'], ['SAARC Secretariat', 'Kathmandu'], ['ASEAN Secretariat', 'Jakarta'], ['OPEC', 'Vienna'], ['Interpol', 'Lyon'], ['International Olympic Committee', 'Lausanne'], ['FIFA', 'Zurich'], ['International Cricket Council', 'Dubai'], ['Asian Development Bank', 'Manila'], ['New Development Bank (BRICS)', 'Shanghai'], ['Amnesty International', 'London'],
];
const SCHEMES: Fact[] = [
  ['Make in India', '2014'], ['Swachh Bharat Mission', '2014 (Gandhi Jayanti)'], ['Pradhan Mantri Jan Dhan Yojana', '2014 (August)'], ['Digital India', '2015'], ['Skill India Mission', '2015 (July)'], ['Startup India', '2016'], ['Pradhan Mantri Ujjwala Yojana', '2016 (May)'], ['Ayushman Bharat PM-JAY', '2018'], ['PM-KISAN', '2019'], ['Jal Jeevan Mission', '2019 (August)'], ['National Education Policy', '2020'], ['Gati Shakti National Master Plan', '2021'], ['PM Vishwakarma Yojana', '2023'],
];
const ISRO: Fact[] = [
  ['Chandrayaan-3', 'Soft landing near the Moon’s south pole'], ['Aditya-L1', 'India’s first mission to study the Sun'], ['Mangalyaan (Mars Orbiter Mission)', 'India’s first mission to Mars'], ['AstroSat', 'India’s first space astronomy observatory'], ['Gaganyaan', 'India’s human spaceflight programme'], ['Aryabhata', 'India’s first satellite'], ['Chandrayaan-1', 'Found water molecules on the Moon'], ['NavIC', 'Indian regional navigation satellite system'], ['Satish Dhawan Space Centre', 'ISRO’s main launch site at Sriharikota'], ['PSLV', 'ISRO rocket known as its workhorse launcher'],
];

const set = (prefix: string, seed: number, subject: string, f: Fact[], ask: (a: string) => string, inv: (b: string) => string) => pairs(prefix, seed, C, subject, f, ask, inv);

export const INDIA_MORE: PlacementMcq[] = [
  ...set('in2-bk', 1301, 'Books & Authors', BOOKS, a => `Who wrote "${a}"?`, b => `Which book was written by ${b}?`),
  ...set('in2-aw', 1302, 'Awards', AWARDS, a => `The ${a} is given for?`, b => `Which award is the ${b.charAt(0).toLowerCase() + b.slice(1)}?`),
  ...set('in2-fs', 1303, 'Indian Firsts', FIRSTS, a => `${a}?`, b => `${b} was the?`),
  ...set('in2-iv', 1304, 'Inventions & Discoveries', INVENTIONS, a => `${a} is credited to?`, b => `${b} is known for?`),
  ...set('in2-wc', 1305, 'World Capitals', WORLD_CAPITALS, a => `Capital of ${a}?`, b => `${b} is the capital of?`),
  ...set('in2-cu', 1306, 'World Currencies', CURRENCIES, a => `Currency of ${a}?`, b => `${b} is the currency of?`),
  ...set('in2-wo', 1307, 'World Organisations', WORLD_ORGS, a => `Headquarters of ${a}?`, b => `Which organisation has its headquarters in ${b}?`),
  ...set('in2-sc', 1308, 'Government Schemes', SCHEMES, a => `${a} was launched in?`, b => `Which scheme was launched in ${b}?`),
  ...set('in2-is', 1309, 'Space (ISRO)', ISRO, a => `What is ${a}?`, b => `Which ISRO mission or item matches: ${b}?`),
  // "correctly matched pair" – new tables
  ...matchedPairs('in2-bkm', 1311, C, 'Books & Authors', BOOKS, 'Books – Authors'),
  ...matchedPairs('in2-awm', 1312, C, 'Awards', AWARDS, 'Awards – Purpose'),
  ...matchedPairs('in2-fsm', 1313, C, 'Indian Firsts', FIRSTS, 'Indian firsts'),
  ...matchedPairs('in2-ivm', 1314, C, 'Inventions & Discoveries', INVENTIONS, 'Inventions – Inventors'),
  ...matchedPairs('in2-wcm', 1315, C, 'World Capitals', WORLD_CAPITALS, 'Countries – Capitals'),
  ...matchedPairs('in2-cum', 1316, C, 'World Currencies', CURRENCIES, 'Countries – Currencies'),
  ...matchedPairs('in2-wom', 1317, C, 'World Organisations', WORLD_ORGS, 'Organisations – Headquarters'),
  ...matchedPairs('in2-scm', 1318, C, 'Government Schemes', SCHEMES, 'Schemes – Launch year'),
  ...matchedPairs('in2-ism', 1319, C, 'Space (ISRO)', ISRO, 'ISRO missions'),
  // "correctly matched pair" – tables from part 1
  ...matchedPairs('in2-capm', 1321, C, 'States & Capitals', CAPITALS, 'States – Capitals'),
  ...matchedPairs('in2-monm', 1322, C, 'Monuments', MONUMENTS, 'Monuments – Places'),
  ...matchedPairs('in2-prkm', 1323, C, 'National Parks', PARKS, 'National parks – States'),
  ...matchedPairs('in2-danm', 1324, C, 'Dance & Culture', DANCE, 'Dances – States'),
  ...matchedPairs('in2-rivm', 1325, C, 'Rivers', RIVERS, 'Cities – Rivers'),
  ...matchedPairs('in2-damm', 1326, C, 'Rivers', DAMS, 'Dams – Rivers'),
  ...matchedPairs('in2-daym', 1327, C, 'Important Days', DAYS, 'Days – Dates'),
  ...matchedPairs('in2-artm', 1328, C, 'Constitution', ARTICLES, 'Articles – Subjects'),
  ...matchedPairs('in2-polm', 1329, C, 'Constitution', POLITY, 'Polity facts'),
  ...matchedPairs('in2-hism', 1330, C, 'History', HISTORY, 'History'),
  ...matchedPairs('in2-pplm', 1331, C, 'Famous People', PEOPLE, 'Famous people'),
  ...matchedPairs('in2-orgm', 1332, C, 'Institutions', ORGS, 'Institutions – Locations'),
  ...matchedPairs('in2-scim', 1333, C, 'Science', SCIENCE, 'Science'),
  ...matchedPairs('in2-untm', 1334, C, 'Science', UNITS, 'Quantities – SI units'),
  ...matchedPairs('in2-indm', 1335, C, 'India Facts', INDIA, 'India facts'),
  ...matchedPairs('in2-spom', 1336, C, 'Sports', SPORTS, 'Sports'),
  // "NOT correctly matched" – a second exam format, used to reach the target size
  ...matchedPairs('in2-capn', 1341, C, 'States & Capitals', CAPITALS, 'States – Capitals', true),
  ...matchedPairs('in2-wcn', 1342, C, 'World Capitals', WORLD_CAPITALS, 'Countries – Capitals', true),
  ...matchedPairs('in2-bkn', 1343, C, 'Books & Authors', BOOKS, 'Books – Authors', true),
  ...matchedPairs('in2-ivn', 1344, C, 'Inventions & Discoveries', INVENTIONS, 'Inventions – Inventors', true),
  ...matchedPairs('in2-monn', 1345, C, 'Monuments', MONUMENTS, 'Monuments – Places', true),
  ...matchedPairs('in2-artn', 1346, C, 'Constitution', ARTICLES, 'Articles – Subjects', true),
];
