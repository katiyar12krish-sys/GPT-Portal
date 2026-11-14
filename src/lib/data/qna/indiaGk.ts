import type { PlacementMcq } from '../placementQnaBank';
import { pairs, type Fact } from './pairs';

// India general knowledge for government and placement exams.
const C = 'India GK' as const;

export const CAPITALS: Fact[] = [
  ['Andhra Pradesh', 'Amaravati'], ['Arunachal Pradesh', 'Itanagar'], ['Assam', 'Dispur'], ['Bihar', 'Patna'], ['Chhattisgarh', 'Raipur'], ['Goa', 'Panaji'], ['Gujarat', 'Gandhinagar'], ['Haryana', 'Chandigarh'], ['Himachal Pradesh', 'Shimla'], ['Jharkhand', 'Ranchi'], ['Karnataka', 'Bengaluru'], ['Kerala', 'Thiruvananthapuram'], ['Madhya Pradesh', 'Bhopal'], ['Maharashtra', 'Mumbai'], ['Manipur', 'Imphal'], ['Meghalaya', 'Shillong'], ['Mizoram', 'Aizawl'], ['Nagaland', 'Kohima'], ['Odisha', 'Bhubaneswar'], ['Rajasthan', 'Jaipur'], ['Sikkim', 'Gangtok'], ['Tamil Nadu', 'Chennai'], ['Telangana', 'Hyderabad'], ['Tripura', 'Agartala'], ['Uttar Pradesh', 'Lucknow'], ['West Bengal', 'Kolkata'], ['Puducherry', 'Puducherry city'], ['Ladakh', 'Leh'], ['Andaman and Nicobar Islands', 'Sri Vijaya Puram'], ['Lakshadweep', 'Kavaratti'],
];
export const MONUMENTS: Fact[] = [
  ['Taj Mahal', 'Agra'], ['Red Fort', 'Delhi'], ['Qutub Minar', 'Delhi (Mehrauli)'], ['Hawa Mahal', 'Jaipur'], ['Gateway of India', 'Mumbai'], ['Charminar', 'Hyderabad'], ['Victoria Memorial', 'Kolkata'], ['Golden Temple', 'Amritsar'], ['Sun Temple', 'Konark'], ['Khajuraho temples', 'Chhatarpur district, Madhya Pradesh'], ['Ajanta caves', 'Aurangabad district, Maharashtra'], ['Sanchi Stupa', 'Raisen district, Madhya Pradesh'], ['Hampi monuments', 'Vijayanagara district, Karnataka'], ['Meenakshi Temple', 'Madurai'], ['Mysore Palace', 'Mysuru'], ['Gol Gumbaz', 'Vijayapura'], ['Statue of Unity', 'Kevadia, Gujarat'], ['Jantar Mantar (largest)', 'Jaipur'], ['India Gate', 'Delhi (Kartavya Path)'], ['Lotus Temple', 'Delhi (Kalkaji)'], ['Mahabodhi Temple', 'Bodh Gaya'], ['Brihadeeswara Temple', 'Thanjavur'],
];
export const PARKS: Fact[] = [
  ['Jim Corbett National Park', 'Uttarakhand'], ['Kaziranga National Park', 'Assam'], ['Gir National Park', 'Gujarat'], ['Sundarbans National Park', 'West Bengal'], ['Ranthambore National Park', 'Rajasthan'], ['Kanha National Park', 'Madhya Pradesh'], ['Bandipur National Park', 'Karnataka'], ['Periyar Tiger Reserve', 'Kerala'], ['Keoladeo National Park', 'Rajasthan (Bharatpur)'], ['Dudhwa National Park', 'Uttar Pradesh'], ['Tadoba Tiger Reserve', 'Maharashtra'], ['Simlipal National Park', 'Odisha'], ['Hemis National Park', 'Ladakh'], ['Great Himalayan National Park', 'Himachal Pradesh'], ['Manas National Park', 'Assam (Barpeta)'], ['Silent Valley National Park', 'Kerala (Palakkad)'],
];
export const DANCE: Fact[] = [
  ['Bharatanatyam', 'Tamil Nadu'], ['Kathakali', 'Kerala'], ['Kuchipudi', 'Andhra Pradesh'], ['Odissi', 'Odisha'], ['Manipuri', 'Manipur'], ['Sattriya', 'Assam'], ['Kathak', 'Uttar Pradesh'], ['Mohiniyattam', 'Kerala (female solo)'], ['Garba', 'Gujarat'], ['Bhangra', 'Punjab'], ['Ghoomar', 'Rajasthan'], ['Lavani', 'Maharashtra'], ['Bihu', 'Assam (folk)'], ['Yakshagana', 'Karnataka'], ['Nati', 'Himachal Pradesh'],
];
export const RIVERS: Fact[] = [
  ['Patna', 'Ganga'], ['Varanasi', 'Ganga (Kashi ghats)'], ['Agra', 'Yamuna'], ['Delhi', 'Yamuna (capital)'], ['Lucknow', 'Gomti'], ['Ahmedabad', 'Sabarmati'], ['Surat', 'Tapi'], ['Jabalpur', 'Narmada'], ['Kota', 'Chambal'], ['Hyderabad', 'Musi'], ['Vijayawada', 'Krishna'], ['Nashik', 'Godavari'], ['Tiruchirappalli', 'Kaveri'], ['Cuttack', 'Mahanadi'], ['Guwahati', 'Brahmaputra'], ['Srinagar', 'Jhelum'], ['Ludhiana', 'Sutlej'], ['Kolkata', 'Hooghly'],
];
export const DAMS: Fact[] = [
  ['Bhakra Nangal Dam', 'Sutlej'], ['Hirakud Dam', 'Mahanadi'], ['Sardar Sarovar Dam', 'Narmada'], ['Tehri Dam', 'Bhagirathi'], ['Nagarjuna Sagar Dam', 'Krishna'], ['Farakka Barrage', 'Ganga'], ['Mettur Dam', 'Kaveri'], ['Ukai Dam', 'Tapi'],
];
export const DAYS: Fact[] = [
  ['Republic Day', '26 January'], ['Independence Day', '15 August'], ['Gandhi Jayanti', '2 October'], ['Teachers\' Day', '5 September'], ['Children\'s Day', '14 November'], ['National Youth Day', '12 January'], ['Army Day', '15 January'], ['National Girl Child Day', '24 January'], ['Voters\' Day', '25 January'], ['National Science Day', '28 February'], ['International Women\'s Day', '8 March'], ['World Water Day', '22 March'], ['World Health Day', '7 April'], ['Earth Day', '22 April'], ['Labour Day', '1 May'], ['World Environment Day', '5 June'], ['International Yoga Day', '21 June'], ['National Sports Day', '29 August'], ['Hindi Diwas', '14 September'], ['Engineers\' Day', '15 September'], ['Constitution Day', '26 November'], ['Air Force Day', '8 October'], ['Navy Day', '4 December'], ['National Unity Day', '31 October'],
];
export const ARTICLES: Fact[] = [
  ['Article 14', 'Equality before law'], ['Article 17', 'Abolition of untouchability'], ['Article 19', 'Freedom of speech and expression'], ['Article 21', 'Protection of life and personal liberty'], ['Article 21A', 'Right to education'], ['Article 32', 'Right to constitutional remedies'], ['Article 44', 'Uniform Civil Code as a directive'], ['Article 51A', 'Fundamental duties'], ['Article 72', 'Pardoning power of the President'], ['Article 280', 'Finance Commission'], ['Article 324', 'Election Commission'], ['Article 352', 'National emergency'], ['Article 356', 'President\'s rule in a state'], ['Article 360', 'Financial emergency'], ['Article 368', 'Amendment of the Constitution'],
];
export const POLITY: Fact[] = [
  ['Lok Sabha maximum term', '5 years'], ['Rajya Sabha member term', '6 years'], ['Minimum age for President', '35 years'], ['Minimum age for Lok Sabha member', '25 years'], ['Minimum age for Rajya Sabha member', '30 years'], ['Constitution adopted on', '26 November 1949'], ['Constitution came into force on', '26 January 1950'], ['Chairman of the Drafting Committee', 'Dr. B. R. Ambedkar'], ['President of the Constituent Assembly', 'Dr. Rajendra Prasad'], ['First President of India', 'Dr. Rajendra Prasad (1950)'], ['First Prime Minister of India', 'Jawaharlal Nehru'], ['First woman Prime Minister', 'Indira Gandhi'], ['First woman President', 'Pratibha Patil'], ['First Vice President', 'S. Radhakrishnan'], ['First Governor-General of free India', 'Lord Mountbatten'], ['Only Indian Governor-General', 'C. Rajagopalachari'], ['Chairman of the Rajya Sabha', 'Vice President of India'], ['Supreme commander of the armed forces', 'President of India'], ['Number of Fundamental Rights groups', 'Six'], ['Number of Fundamental Duties', 'Eleven'], ['Upper house of Parliament', 'Rajya Sabha'], ['Lower house of Parliament', 'Lok Sabha'], ['Voting age in India', '18 years'], ['National Emblem taken from', 'Lion Capital of Sarnath'],
];
export const HISTORY: Fact[] = [
  ['First Battle of Panipat', '1526'], ['Battle of Plassey', '1757'], ['Battle of Buxar', '1764'], ['Revolt of 1857 began at', 'Meerut'], ['Indian National Congress founded', '1885'], ['Partition of Bengal', '1905'], ['Muslim League founded', '1906'], ['Jallianwala Bagh massacre', '1919'], ['Non-Cooperation Movement', '1920'], ['Chauri Chaura incident', '1922'], ['Simon Commission came to India', '1928'], ['Dandi March', '1930'], ['Poona Pact', '1932'], ['Quit India Movement', '1942'], ['Indian independence', '1947'], ['States reorganised on language', '1956'], ['Champaran Satyagraha', '1917'], ['Rowlatt Act', '1919 (March)'], ['Lucknow Pact', '1916'], ['First Round Table Conference', '1930 (London)'], ['Indian Councils Act (Morley-Minto)', '1909'], ['Government of India Act', '1935'],
];
export const PEOPLE: Fact[] = [
  ['Father of the Nation', 'Mahatma Gandhi'], ['Iron Man of India', 'Sardar Vallabhbhai Patel'], ['Netaji', 'Subhas Chandra Bose'], ['Missile Man of India', 'A. P. J. Abdul Kalam'], ['Nightingale of India', 'Sarojini Naidu'], ['Father of the Indian Space Programme', 'Vikram Sarabhai'], ['Father of the Indian Nuclear Programme', 'Homi J. Bhabha'], ['Father of the Green Revolution in India', 'M. S. Swaminathan'], ['Father of the White Revolution', 'Verghese Kurien'], ['Lokmanya', 'Bal Gangadhar Tilak'], ['Author of the national anthem', 'Rabindranath Tagore'], ['Author of Vande Mataram', 'Bankim Chandra Chatterjee'], ['Author of Saare Jahan Se Achha', 'Muhammad Iqbal'], ['First Indian in space', 'Rakesh Sharma'], ['First Indian Nobel laureate', 'Rabindranath Tagore (1913)'], ['Nobel Prize in Physics 1930', 'C. V. Raman'], ['Founder of Arya Samaj', 'Dayanand Saraswati'], ['Founder of Ramakrishna Mission', 'Swami Vivekananda'], ['Founder of Brahmo Samaj', 'Raja Ram Mohan Roy'], ['Founder of Sikhism', 'Guru Nanak'], ['Founder of Buddhism', 'Gautama Buddha'], ['24th Tirthankara of Jainism', 'Mahavira'], ['Founder of the Maurya Empire', 'Chandragupta Maurya'], ['Founder of the Mughal Empire', 'Babur'], ['Author of Arthashastra', 'Kautilya'], ['Author of Abhijnanashakuntalam', 'Kalidasa'], ['Author of Godaan', 'Munshi Premchand'], ['Author of Discovery of India', 'Jawaharlal Nehru (book)'], ['Author of Wings of Fire', 'A. P. J. Abdul Kalam (book)'],
];
export const ORGS: Fact[] = [
  ['ISRO', 'Bengaluru'], ['DRDO', 'Delhi (Bhawan)'], ['Reserve Bank of India', 'Mumbai (Mint Road)'], ['SEBI', 'Mumbai (BKC)'], ['Supreme Court of India', 'Delhi (Tilak Marg)'], ['Indian Railways headquarters', 'Delhi (Rail Bhavan)'], ['Life Insurance Corporation', 'Mumbai (Yogakshema)'], ['State Bank of India', 'Mumbai (Corporate Centre)'], ['NABARD', 'Mumbai (Bandra)'], ['Forest Research Institute', 'Dehradun'], ['Indian Military Academy', 'Dehradun (IMA)'], ['National Defence Academy', 'Pune'], ['Indian Institute of Science', 'Bengaluru (IISc)'], ['Satish Dhawan Space Centre', 'Sriharikota'], ['Vikram Sarabhai Space Centre', 'Thiruvananthapuram (VSSC)'], ['Bhabha Atomic Research Centre', 'Mumbai (Trombay)'],
];
export const UNITS: Fact[] = [
  ['force', 'Newton'], ['energy', 'Joule'], ['power', 'Watt'], ['pressure', 'Pascal'], ['electric current', 'Ampere'], ['voltage', 'Volt'], ['resistance', 'Ohm'], ['frequency', 'Hertz'], ['luminous intensity', 'Candela'], ['temperature', 'Kelvin'],
];
export const SCIENCE: Fact[] = [
  ['Inventor of the telephone', 'Alexander Graham Bell'], ['Inventor of the practical light bulb', 'Thomas Edison'], ['Pioneer of radio communication', 'Guglielmo Marconi'], ['Discoverer of penicillin', 'Alexander Fleming'], ['Author of the theory of relativity', 'Albert Einstein'], ['Author of the laws of motion', 'Isaac Newton'], ['Vitamin C deficiency', 'Scurvy'], ['Vitamin D deficiency', 'Rickets'], ['Vitamin A deficiency', 'Night blindness'], ['Iron deficiency', 'Anaemia'], ['Iodine deficiency', 'Goitre'], ['Largest planet', 'Jupiter'], ['Red planet', 'Mars'], ['Closest planet to the Sun', 'Mercury'], ['Hardest natural substance', 'Diamond'], ['Most abundant gas in air', 'Nitrogen'], ['Chemical symbol Na', 'Sodium'], ['Chemical symbol Fe', 'Iron'], ['Chemical symbol Au', 'Gold'], ['Chemical symbol Ag', 'Silver'],
];
export const INDIA: Fact[] = [
  ['National animal of India', 'Tiger'], ['National bird of India', 'Peacock'], ['National flower of India', 'Lotus'], ['National tree of India', 'Banyan'], ['National fruit of India', 'Mango'], ['National river of India', 'Ganga (national river)'], ['National aquatic animal', 'Ganges river dolphin'], ['National heritage animal', 'Indian elephant'], ['Largest state by area', 'Rajasthan'], ['Largest state by population', 'Uttar Pradesh'], ['Smallest state by area', 'Goa (smallest)'], ['Longest river in India', 'Ganga (longest)'], ['Highest peak in India', 'Kangchenjunga'], ['Longest coastline state', 'Gujarat (coast)'], ['Spokes in the Ashoka Chakra', '24'], ['Indian Standard Time meridian', '82.5° E'], ['Number of states in India', '28'], ['Number of Union Territories', '8'], ['India\'s first satellite', 'Aryabhata'], ['India\'s first Moon mission', 'Chandrayaan-1'], ['Mission to land near the lunar south pole', 'Chandrayaan-3'], ['India\'s Mars mission', 'Mangalyaan'], ['India\'s Sun mission', 'Aditya-L1'], ['Highest civilian award', 'Bharat Ratna'], ['Highest gallantry award in war', 'Param Vir Chakra'], ['Highest sports award', 'Major Dhyan Chand Khel Ratna'], ['Highest film award', 'Dadasaheb Phalke Award'], ['Highest literary award', 'Jnanpith Award'],
];
export const SPORTS: Fact[] = [
  ['Ranji Trophy', 'Cricket'], ['Durand Cup', 'Football'], ['Beighton Cup', 'Hockey'], ['Thomas Cup', 'Badminton'], ['Davis Cup', 'Tennis'], ['Ryder Cup', 'Golf'], ['Deodhar Trophy', 'Cricket (one-day)'], ['Santosh Trophy', 'Football (states)'], ['Dhyan Chand', 'Hockey (player)'], ['Sachin Tendulkar', 'Cricket (player)'], ['Neeraj Chopra', 'Javelin throw'], ['P. V. Sindhu', 'Badminton (player)'], ['Abhinav Bindra', 'Shooting'], ['Mary Kom', 'Boxing'], ['Viswanathan Anand', 'Chess'], ['Milkha Singh', 'Sprint running'],
];

const set = (prefix: string, seed: number, subject: string, f: Fact[], ask: (a: string) => string, inv: (b: string) => string) => pairs(prefix, seed, C, subject, f, ask, inv);

export const INDIA_QUESTIONS: PlacementMcq[] = [
  ...set('in-cap', 1201, 'States & Capitals', CAPITALS, a => `Capital of ${a}?`, b => `${b} is the capital of?`),
  ...set('in-mon', 1202, 'Monuments', MONUMENTS, a => `Where is ${a}?`, b => `Which of these is at ${b}?`),
  ...set('in-prk', 1203, 'National Parks', PARKS, a => `${a} is in?`, b => `Which park is in ${b}?`),
  ...set('in-dan', 1204, 'Dance & Culture', DANCE, a => `${a} belongs to?`, b => `Which dance is from ${b}?`),
  ...set('in-riv', 1205, 'Rivers', RIVERS, a => `${a} is on which river?`, b => `Which city is on the ${b}?`),
  ...set('in-dam', 1206, 'Rivers', DAMS, a => `${a} is on which river?`, b => `Which dam or barrage is on the ${b}?`),
  ...set('in-day', 1207, 'Important Days', DAYS, a => `${a} is observed on?`, b => `Which day is observed on ${b}?`),
  ...set('in-art', 1208, 'Constitution', ARTICLES, a => `What is ${a} about?`, b => `Which article deals with: ${b}?`),
  ...set('in-pol', 1209, 'Constitution', POLITY, a => `${a}?`, b => `"${b}" is the answer to?`),
  ...set('in-his', 1210, 'History', HISTORY, a => `${a}: when or where?`, b => `Which event matches: ${b}?`),
  ...set('in-ppl', 1211, 'Famous People', PEOPLE, a => `${a}?`, b => `${b} is known as?`),
  ...set('in-org', 1212, 'Institutions', ORGS, a => `Where is ${a} located?`, b => `What is located at ${b}?`),
  ...set('in-sci', 1213, 'Science', SCIENCE, a => `${a}?`, b => `${b} matches which item?`),
  ...set('in-unt', 1216, 'Science', UNITS, a => `SI unit of ${a}?`, b => `${b} is the SI unit of?`),
  ...set('in-ind', 1214, 'India Facts', INDIA, a => `${a}?`, b => `"${b}" is the answer to?`),
  ...set('in-spo', 1215, 'Sports', SPORTS, a => `${a} is linked with?`, b => `Which is linked with ${b}?`),
];
