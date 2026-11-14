import type { PlacementMcq } from '../placementQnaBank';
import { fromRows, mcq, rng, type Row } from './builder';

// Second part of the Uttarakhand bank. Each place appears in two question forms.
const C = 'Uttarakhand GK' as const;

const PLACES: Record<string, string[]> = {
  Chamoli: ['Joshimath', 'Rudranath temple', 'Kalpeshwar temple', 'Bedni Bugyal', 'Vasudhara falls', 'Niti pass', 'Mana pass', 'Tapovan', 'Karnaprayag', 'Nandprayag', 'Gopeshwar', 'Kamet peak', 'Gwaldam', 'Tharali', 'Pipalkoti'],
  Rudraprayag: ['Madhyamaheshwar temple', 'Tungnath temple', 'Triyuginarayan temple', 'Guptkashi', 'Ukhimath', 'Chopta', 'Kalimath', 'Agastyamuni', 'Deoria Tal', 'Chorabari Tal', 'Gaurikund', 'Sonprayag'],
  Uttarkashi: ['Harsil', 'Dodital', 'Nelang valley', 'Barkot', 'Purola', 'Mukhwa', 'Dayara Bugyal', 'Bhaironghati', 'Govind Wildlife Sanctuary', 'Gangotri National Park', 'Bandarpunch peak', 'Chinyalisaur', 'Naugaon'],
  'Tehri Garhwal': ['Chamba', 'Surkanda Devi temple', 'Kunjapuri temple', 'Dhanaulti', 'Narendranagar', 'Devprayag', 'Buda Kedar', 'Khatling glacier', 'Ghansali', 'Kirtinagar'],
  'Pauri Garhwal': ['Lansdowne', 'Kotdwar', 'Srinagar (Garhwal)', 'Khirsu', 'Tarkeshwar Mahadev', 'Neelkanth Mahadev', 'Kanvashram', 'Dhari Devi temple', 'Satpuli', 'Dugadda'],
  Dehradun: ['Chakrata', 'Vikasnagar', 'Kalsi', 'Sahastradhara', 'Tapkeshwar temple', 'Lakhamandal', 'Doiwala', 'Dakpathar', 'Asan Barrage', 'Tiger Fall', 'Landour', 'Selaqui'],
  Haridwar: ['Har Ki Pauri', 'Mansa Devi temple', 'Chandi Devi temple', 'Roorkee', 'Piran Kaliyar', 'Laksar', 'Bhagwanpur', 'Kankhal', 'Shantikunj', 'Jwalapur', 'Manglaur'],
  Nainital: ['Naina Devi temple', 'Ramnagar', 'Haldwani', 'Kainchi Dham', 'Mukteshwar', 'Kathgodam', 'Garjia Devi temple', 'Kaladhungi', 'Bhowali', 'Lalkuan', 'Ramgarh'],
  Almora: ['Ranikhet', 'Jageshwar', 'Katarmal Sun Temple', 'Chitai Golu temple', 'Dwarahat', 'Kasar Devi', 'Binsar Sanctuary', 'Dunagiri', 'Bhikiyasain', 'Someshwar', 'Chaukhutia'],
  Bageshwar: ['Baijnath temple', 'Kausani', 'Kafni glacier', 'Sunderdhunga glacier', 'Bagnath temple', 'Kanda', 'Garur', 'Kapkot'],
  Pithoragarh: ['Munsiyari', 'Dharchula', 'Patal Bhuvaneshwar', 'Chaukori', 'Askot', 'Milam glacier', 'Narayan Ashram', 'Gangolihat', 'Didihat', 'Jauljibi', 'Panchachuli peaks', 'Berinag', 'Thal'],
  Champawat: ['Lohaghat', 'Banbasa', 'Abbott Mount', 'Baleshwar temple', 'Mayawati Ashram', 'Reetha Sahib', 'Devidhura', 'Barakot'],
  'Udham Singh Nagar': ['Rudrapur', 'Kashipur', 'Khatima', 'Sitarganj', 'Jaspur', 'Pantnagar', 'Nanakmatta', 'Bazpur', 'Kichha', 'Gadarpur', 'Dineshpur'],
};

const ROWS: Row[] = [
  // ---- Administration ----
  ['Headquarters of Kumaon division', 'Nainital', 'Almora', 'Haldwani', 'Pithoragarh'],
  ['Headquarters of Garhwal division', 'Pauri', 'Dehradun', 'Tehri', 'Haridwar'],
  ['Number of districts in Garhwal division', '7', '6', '5', '8'],
  ['Number of districts in Kumaon division', '6', '7', '5', '4'],
  ['Official language of Uttarakhand', 'Hindi', 'Garhwali', 'Kumaoni', 'English only'],
  ['Haridwar district was formed in', '1988', '1960', '1997', '2000'],
  ['Udham Singh Nagar district was formed in', '1995', '1988', '1960', '2001'],
  ['Champawat became a district in', '1997', '1960', '1988', '2000'],
  ['Bageshwar became a district in', '1997', '1988', '1960', '2002'],
  ['Rudraprayag became a district in', '1997', '1960', '1988', '2005'],
  ['Uttarkashi, Chamoli and Pithoragarh districts were formed in', '1960', '1947', '1975', '1997'],
  ['State Foundation Day of Uttarakhand', '9 November', '26 January', '1 November', '15 August'],
  ['Districts of Uttarakhand touching Nepal', 'Pithoragarh, Champawat, Udham Singh Nagar', 'Dehradun, Haridwar, Tehri', 'Almora, Bageshwar, Nainital', 'Pauri, Rudraprayag, Tehri'],
  ['Districts touching China (Tibet)', 'Uttarkashi, Chamoli, Pithoragarh', 'Almora, Nainital, Pauri', 'Dehradun, Tehri, Haridwar', 'Champawat, Bageshwar, Rudraprayag'],
  ['Which state does NOT border Uttarakhand?', 'Rajasthan', 'Uttar Pradesh', 'Himachal Pradesh', 'None of these borders it'],
  // ---- Rivers & dams ----
  ['Alaknanda rises from', 'Satopanth glacier', 'Pindari glacier', 'Milam glacier', 'Kafni glacier'],
  ['Kali river rises near', 'Kalapani', 'Gaumukh', 'Yamunotri', 'Satopanth'],
  ['Gori river joins the Kali at', 'Jauljibi', 'Tanakpur', 'Rudraprayag', 'Haridwar'],
  ['Saryu and Gomti meet at', 'Bageshwar', 'Almora', 'Haridwar', 'Pauri'],
  ['Saryu joins the Kali at', 'Pancheshwar', 'Devprayag', 'Kalsi', 'Rishikesh'],
  ['Western Ramganga rises in', 'Dudhatoli hills', 'Gangotri', 'Kalapani', 'Mana'],
  ['Tons is a tributary of', 'Yamuna', 'Kali', 'Kosi', 'Ramganga'],
  ['Bhilangana is a tributary of', 'Bhagirathi', 'Yamuna', 'Kali', 'Ramganga'],
  ['Ganga enters the plains at', 'Haridwar', 'Devprayag', 'Rudraprayag', 'Tanakpur'],
  ['Number of Prayags in Panch Prayag', '5', '3', '4', '7'],
  ['Last of the Panch Prayag going downstream', 'Devprayag', 'Vishnuprayag', 'Nandprayag', 'Karnaprayag'],
  ['Koteshwar dam is on the river', 'Bhagirathi', 'Yamuna', 'Kali', 'Kosi'],
  ['Ramganga dam is at', 'Kalagarh', 'Tehri', 'Tanakpur', 'Dakpathar'],
  ['Lakhwar project is on the river', 'Yamuna', 'Bhagirathi', 'Sharda', 'Alaknanda'],
  ['Kishau project is on the river', 'Tons', 'Kali', 'Pindar', 'Gori'],
  ['Pancheshwar project is planned with', 'Nepal', 'China', 'Bhutan', 'Himachal Pradesh only'],
  ['Maneri Bhali project is on the river', 'Bhagirathi', 'Alaknanda', 'Kosi', 'Gaula'],
  ['Dhauliganga power project (NHPC) is in', 'Pithoragarh', 'Dehradun', 'Haridwar', 'Pauri'],
  ['NHPC power station near Banbasa', 'Tanakpur', 'Tehri', 'Koteshwar', 'Maneri'],
  // ---- Nature ----
  ['Number of tiger reserves in Uttarakhand', '2', '1', '4', '6'],
  ['Tiger reserves of Uttarakhand', 'Corbett and Rajaji', 'Corbett and Kanha', 'Rajaji and Dudhwa', 'Binsar and Askot'],
  ['Valley of Flowers was made known to the world by', 'Frank Smythe', 'Jim Corbett', 'P. Barron', 'George Everest'],
  ['Nanda Devi National Park became a UNESCO World Heritage Site in', '1988', '2005', '1975', '2010'],
  ['Valley of Flowers was added to the World Heritage listing in', '2005', '1988', '1995', '2015'],
  ['Asan wetland, a Ramsar site, is in', 'Dehradun', 'Nainital', 'Pauri', 'Bageshwar'],
  ['Askot sanctuary was set up mainly for', 'Musk deer', 'Tiger', 'Elephant', 'Rhino'],
  ['Musk deer breeding farm is at', 'Kanchula Kharak', 'Haridwar', 'Ramnagar', 'Rudrapur'],
  ['Nainital lake was brought to notice by', 'P. Barron (1841)', 'Jim Corbett (1936)', 'George Everest (1830)', 'Frank Smythe (1931)'],
  ['"Queen of Hills" in Uttarakhand', 'Mussoorie', 'Haldwani', 'Rudrapur', 'Kotdwar'],
  ['Town known as the "Lake District"', 'Nainital', 'Pauri', 'Uttarkashi', 'Dehradun'],
  // ---- Religion & temples ----
  ['Char Dham of Uttarakhand has how many shrines', '4', '3', '5', '7'],
  ['Panch Kedar has how many temples', '5', '4', '7', '12'],
  ['Which is a Jyotirlinga in Uttarakhand', 'Kedarnath', 'Badrinath', 'Yamunotri', 'Purnagiri'],
  ['Badrinath temple is on the bank of', 'Alaknanda', 'Bhagirathi', 'Yamuna', 'Kali'],
  ['Badrinath temple is dedicated to', 'Lord Vishnu', 'Lord Shiva', 'Goddess Durga', 'Lord Ganesh'],
  ['Golu Devta is worshipped as the god of', 'Justice', 'Rain', 'War only', 'Wealth'],
  ['Katarmal temple is dedicated to', 'Sun God', 'Lord Shiva', 'Goddess Ganga', 'Lord Hanuman'],
  ['Jageshwar group of temples is dedicated to', 'Lord Shiva', 'Lord Vishnu', 'Sun God', 'Goddess Saraswati'],
  ['Piran Kaliyar is a shrine of the', 'Sufi saint Sabir Pak', 'Sikh Gurus', 'Buddhist monks', 'Jain Tirthankaras'],
  ['Nanakmatta is a holy place of the', 'Sikhs', 'Jains', 'Buddhists', 'Parsis'],
  ['Mayawati Ashram was linked with', 'Swami Vivekananda', 'Mahatma Gandhi', 'Sri Aurobindo', 'Dayanand Saraswati'],
  // ---- Festivals, food, arts ----
  ['Jhanda Mela is held at', 'Dehradun', 'Almora', 'Tanakpur', 'Pithoragarh'],
  ['Gauchar Mela is held in', 'Chamoli', 'Haridwar', 'Dehradun', 'Nainital'],
  ['Hilljatra is linked with', 'Pithoragarh', 'Haridwar', 'Dehradun', 'Rudrapur'],
  ['Syalde Bikhauti fair is held at', 'Dwarahat', 'Rishikesh', 'Kotdwar', 'Khatima'],
  ['Kandali festival is of the', 'Chaudans valley', 'Doon valley', 'Terai', 'Bhabar'],
  ['Ghughutiya is celebrated on', 'Makar Sankranti', 'Diwali', 'Holi', 'Basant Panchami'],
  ['Ghee Sankranti is also called', 'Olgia', 'Harela', 'Khatarua', 'Bagwal'],
  ['Khatarua is a festival of', 'Autumn in Kumaon', 'Summer in Terai', 'Winter in Doon', 'Spring in Haridwar'],
  ['Bal Mithai is a famous sweet of', 'Almora', 'Haridwar', 'Dehradun', 'Rudrapur'],
  ['Kafuli is a dish made mainly from', 'Green leafy vegetables', 'Rice flour', 'Milk', 'Fish'],
  ['First product of Uttarakhand to get a GI tag', 'Tejpat', 'Basmati', 'Apple', 'Tea'],
  ['Traditional drum pair of Garhwal', 'Dhol-Damau', 'Tabla-Baya', 'Mridang-Khol', 'Nagada-Dhak'],
  ['Hurka is a', 'Hand drum', 'String instrument', 'Flute', 'Trumpet'],
  ['Jagar is a', 'Ritual song calling local deities', 'Harvest dance only', 'Boat song', 'Wedding meal'],
  ['Molaram is known for', 'Garhwal school of painting', 'Mountaineering', 'The Chipko movement', 'Cricket'],
  // ---- History ----
  ['Kumaon came under British rule in', '1815', '1857', '1790', '1947'],
  ['Ashokan rock edict in Uttarakhand is at', 'Kalsi', 'Jageshwar', 'Lansdowne', 'Khatima'],
  ['Old capital of the Garhwal kings', 'Srinagar', 'Dehradun', 'Pauri', 'Rishikesh'],
  ['Almora town was developed under the', 'Chand dynasty', 'Mauryas', 'Mughals', 'Katyuris of Delhi'],
  ['Tehri town was founded by', 'Sudarshan Shah', 'Ajay Pal', 'Pradyumn Shah', 'Balo Kalyan Chand'],
  ['Garhwal was unified by', 'Ajay Pal', 'Akbar', 'Sudarshan Shah', 'Amar Singh Thapa'],
  ['Warrior girl of Garhwal remembered in folk songs', 'Teelu Rauteli', 'Gaura Devi', 'Bachendri Pal', 'Shivani'],
  ['Madho Singh Bhandari is remembered for', 'The Malethi water tunnel', 'The Chipko movement', 'Climbing Everest', 'Writing poetry'],
  ['Who is called the "Gandhi of Uttarakhand"?', 'Indramani Badoni', 'Sunderlal Bahuguna', 'G. B. Pant', 'Badri Dutt Pandey'],
  ['Dola-Palki movement was led by', 'Jayanand Bharti', 'Sri Dev Suman', 'N. D. Tiwari', 'Gaura Devi'],
  ['"Nasha Nahi Rozgar Do" movement began in', '1984', '1921', '1973', '2000'],
  ['Maiti movement, of planting trees at weddings, was started by', 'Kalyan Singh Rawat', 'Chandi Prasad Bhatt', 'Sunderlal Bahuguna', 'Harish Rawat'],
  ['Regimental centre of the Garhwal Rifles', 'Lansdowne', 'Ranikhet', 'Dehradun', 'Pithoragarh'],
  ['Regimental centre of the Kumaon Regiment', 'Ranikhet', 'Lansdowne', 'Roorkee', 'Almora'],
  // ---- People ----
  ['Author associated with Mussoorie and Landour', 'Ruskin Bond', 'R. K. Narayan', 'Mulk Raj Anand', 'Vikram Seth'],
  ['Hunter-naturalist who wrote "Man-Eaters of Kumaon"', 'Jim Corbett', 'Ruskin Bond', 'Frank Smythe', 'George Everest'],
  ['Hindi writer known by the pen name Shivani', 'Gaura Pant', 'Mahadevi Varma', 'Mannu Bhandu', 'Krishna Sobti'],
  ['Folk singer famous for Garhwali songs', 'Narendra Singh Negi', 'Kailash Kher', 'Mohit Chauhan', 'Hariharan'],
  ['Folk song "Bedu Pako" was made popular by', 'Mohan Upreti', 'Narendra Singh Negi', 'Gopal Babu Goswami', 'Pritam Bhartwan'],
  ['India\'s first Chief of Defence Staff, from Pauri', 'General Bipin Rawat', 'General Manoj Pande', 'General V. K. Singh', 'General Dalbir Suhag'],
];

export const UTTARAKHAND_MORE: PlacementMcq[] = (() => {
  const r = rng(811);
  const districts = Object.keys(PLACES);
  const facts = districts.flatMap(d => PLACES[d].map(p => ({ p, d })));
  const out: Array<PlacementMcq | null> = [];
  facts.forEach(({ p, d }, i) => {
    const n = String(i + 1).padStart(3, '0');
    out.push(mcq(r, `uk-pl-${n}`, C, `${p} is in which district?`, d, r.shuffle(districts.filter(x => x !== d)).slice(0, 3), `${p} is in ${d} district.`));
    const others = r.shuffle(facts.filter(f => f.d !== d)).slice(0, 3).map(f => f.p);
    out.push(mcq(r, `uk-in-${n}`, C, `Which of these is in ${d} district? (${i + 1})`, p, others, `${p} is in ${d} district.`));
  });
  return [...fromRows('uk-more', 812, C, ROWS), ...out.filter((q): q is PlacementMcq => !!q)];
})();
