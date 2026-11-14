// City-wise recruiter directory for diploma (CSE + Civil) students – at least 10 companies per city.
// Includes the "50 companies for Diploma Civil" list shared by the placement cell.
// Salary = indicative starting range for diploma freshers; always confirm on the official site / with the TPO.

export type HiringMode = 'Interview based' | 'Written test + Interview' | 'Govt exam' | 'Apprenticeship (merit)';
export type CityBranch = 'Civil' | 'CSE' | 'Both';

export interface CityCompany {
  name: string;
  city: string;
  branch: CityBranch;
  sector: string;
  roles: string;
  mode: HiringMode;
  howSelected: string;
  salary: string;
  website: string;
  note?: string;
}

const PVT_CIVIL = '₹15,000–25,000/month to start; +30–50% after ~2 years';
const PVT_IT = '₹12,000–22,000/month to start';
const MFG = '₹14,000–22,000/month (trainee) to start';
const CENTRAL_JE = 'Pay Level 6 (basic ₹35,400) + allowances';
const STATE_JE = 'State pay matrix for JE + allowances';
const APPR = 'Apprentice stipend (NATS) for 1 year';
const TECH = 'As per notification (technician / technical assistant pay level)';

const INT = 'Campus / off-campus drive: aptitude or screening → technical interview → HR.';
const TEST = 'Online / written test (aptitude + technical) → technical interview → HR.';
const SSC = 'SSC JE exam (Paper I + Paper II) → document verification.';
const RRB = 'RRB JE CBT 1 → CBT 2 → document verification → medical.';
const STATE = 'State commission exam (UKSSSC / UKPSC or state PSC) → document verification.';
const NATS = 'Register on nats.education.gov.in → shortlist on diploma marks → interview / document check.';
const VERIFY = 'Company is/was under insolvency proceedings – check current status before applying.';

const c = (name: string, city: string, branch: CityBranch, sector: string, roles: string, mode: HiringMode, howSelected: string, salary: string, website: string, note?: string): CityCompany => ({
  name, city, branch, sector, roles, mode, howSelected, salary, website, note,
});

/** Every company collected so far. Other cities are kept here but not shown (see SHOWN_PLACES). */
export const ALL_DIRECTORY_COMPANIES: CityCompany[] = [
  // ───── Dehradun ─────
  c('UPCL – Uttarakhand Power Corporation', 'Dehradun', 'Both', 'State power utility', 'Junior Engineer, Technical Assistant', 'Govt exam', STATE, STATE_JE, 'https://www.upcl.org'),
  c('UJVN Ltd (hydro power)', 'Dehradun', 'Civil', 'State hydro power', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://www.ujvnl.com'),
  c('Uttarakhand PWD', 'Dehradun', 'Civil', 'Roads & buildings (state)', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://pwd.uk.gov.in'),
  c('Uttarakhand Pey Jal Nigam / Jal Sansthan', 'Dehradun', 'Civil', 'Water supply & sewerage', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),
  c('ONGC (HQ Dehradun)', 'Dehradun', 'Both', 'Oil & gas PSU', 'Diploma apprentice, Junior Technical Assistant', 'Apprenticeship (merit)', NATS, APPR, 'https://ongcindia.com'),
  c('Survey of India', 'Dehradun', 'Civil', 'National survey & mapping', 'Surveyor / Draftsman (Group C)', 'Govt exam', 'SSC / departmental recruitment exam → skill test.', 'Central pay level as per post', 'https://surveyofindia.gov.in'),
  c('THDC India Ltd (Rishikesh)', 'Dehradun', 'Civil', 'Hydro power PSU', 'Diploma apprentice, Junior Engineer trainee', 'Apprenticeship (merit)', NATS, APPR, 'https://www.thdc.co.in'),
  c('MDDA – Mussoorie Dehradun Development Authority', 'Dehradun', 'Civil', 'Urban development', 'Junior Engineer, Draftsman', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),
  c('Uttarakhand Metro Rail Corporation', 'Dehradun', 'Both', 'Metro / urban transport', 'Junior Engineer, Station / IT assistant (as notified)', 'Govt exam', 'Recruitment notification → written test → interview.', 'As per UKMRC notification', 'https://uk.gov.in'),
  c('Dehradun Smart City Ltd', 'Dehradun', 'Both', 'Smart city projects', 'Site engineer / IT support (contract)', 'Interview based', 'Contract notification → interview.', 'Contract salary as notified', 'https://smartcities.gov.in'),

  // ───── Haridwar & Roorkee (SIDCUL) ─────
  c('BHEL Haridwar', 'Haridwar', 'Both', 'Heavy electricals PSU', 'Diploma apprentice, Supervisor trainee', 'Apprenticeship (merit)', NATS, APPR, 'https://www.bhel.com'),
  c('Hero MotoCorp (Haridwar plant)', 'Haridwar', 'Both', 'Two-wheeler manufacturing', 'Diploma Engineer Trainee, Maintenance, IT support', 'Written test + Interview', TEST, MFG, 'https://www.heromotocorp.com'),
  c('Mahindra & Mahindra (Haridwar plant)', 'Haridwar', 'Both', 'Automobile manufacturing', 'Production / quality trainee', 'Written test + Interview', TEST, MFG, 'https://www.mahindra.com'),
  c('ITC Ltd (Haridwar unit)', 'Haridwar', 'Both', 'FMCG manufacturing', 'Process / maintenance associate', 'Interview based', INT, MFG, 'https://www.itcportal.com'),
  c('Hindustan Unilever (Haridwar)', 'Haridwar', 'Both', 'FMCG manufacturing', 'Production / maintenance technician', 'Interview based', INT, MFG, 'https://www.hul.co.in'),
  c('Havells India (Haridwar)', 'Haridwar', 'Both', 'Electrical goods', 'Production / QC trainee, ERP operator', 'Written test + Interview', TEST, MFG, 'https://www.havells.com'),
  c('Patanjali Ayurved (Haridwar)', 'Haridwar', 'Both', 'FMCG / food processing', 'Maintenance, civil works supervisor, IT', 'Interview based', INT, MFG, 'https://www.patanjaliayurved.net'),
  c('Kirby Building Systems (Haridwar)', 'Haridwar', 'Civil', 'Pre-engineered steel buildings', 'Site supervisor, detailing / AutoCAD draftsman', 'Interview based', INT, PVT_CIVIL, 'https://www.kirbyinternational.com'),
  c('Asahi India Glass (Roorkee)', 'Haridwar', 'Both', 'Glass manufacturing', 'Production / maintenance trainee', 'Interview based', INT, MFG, 'https://www.aisglass.com'),
  c('IIT Roorkee', 'Haridwar', 'Both', 'Institute (central)', 'Junior Technical Assistant / Lab technician', 'Govt exam', 'Institute notification → written / skill test → interview.', 'Central pay level as per post', 'https://www.iitr.ac.in'),

  // ───── Rudrapur, Pantnagar & Kashipur (Kumaon SIDCUL – nearest to Tanakpur) ─────
  c('Tata Motors (Pantnagar plant)', 'Rudrapur / Pantnagar', 'Both', 'Commercial vehicles', 'Diploma Engineer Trainee, Maintenance', 'Written test + Interview', TEST, MFG, 'https://www.tatamotors.com'),
  c('Bajaj Auto (Pantnagar plant)', 'Rudrapur / Pantnagar', 'Both', 'Two-wheeler manufacturing', 'Production / quality trainee, IT support', 'Written test + Interview', TEST, MFG, 'https://www.bajajauto.com'),
  c('Ashok Leyland (Pantnagar plant)', 'Rudrapur / Pantnagar', 'Both', 'Commercial vehicles', 'Diploma trainee (production / maintenance)', 'Written test + Interview', TEST, MFG, 'https://www.ashokleyland.com'),
  c('Mahindra & Mahindra (Rudrapur plant)', 'Rudrapur / Pantnagar', 'Both', 'Automobile manufacturing', 'Production / quality trainee', 'Written test + Interview', TEST, MFG, 'https://www.mahindra.com'),
  c('Nestlé India (Pantnagar)', 'Rudrapur / Pantnagar', 'Both', 'Food manufacturing', 'Process / maintenance associate', 'Interview based', INT, MFG, 'https://www.nestle.in'),
  c('Britannia Industries (Rudrapur)', 'Rudrapur / Pantnagar', 'Both', 'Food manufacturing', 'Production / maintenance trainee', 'Interview based', INT, MFG, 'https://britannia.co.in'),
  c('Dabur India (Pantnagar)', 'Rudrapur / Pantnagar', 'Both', 'FMCG manufacturing', 'Production / utility technician', 'Interview based', INT, MFG, 'https://www.dabur.com'),
  c('Schneider Electric (Pantnagar)', 'Rudrapur / Pantnagar', 'CSE', 'Electrical & automation', 'Production / test technician (UGIP Tanakpur recruited here in 2021-22)', 'Interview based', INT, '₹10,000–16,000/month (UGIP Tanakpur record)', 'https://www.se.com/in'),
  c('Voltas (Pantnagar)', 'Rudrapur / Pantnagar', 'Both', 'AC & cooling manufacturing', 'Production / QC trainee', 'Interview based', INT, MFG, 'https://www.voltas.com'),
  c('India Glycols (Kashipur)', 'Rudrapur / Pantnagar', 'Both', 'Chemicals', 'Plant operator / maintenance trainee', 'Interview based', INT, MFG, 'https://www.indiaglycols.com'),

  // ───── More Uttarakhand employers (added; nothing above was removed) ─────
  // Dehradun
  c('PTCUL – Power Transmission Corporation of Uttarakhand', 'Dehradun', 'Both', 'State power transmission', 'Junior Engineer, Technician', 'Govt exam', STATE, STATE_JE, 'https://www.ptcul.org'),
  c('Uttarakhand Irrigation Department', 'Dehradun', 'Civil', 'Canals, dams & flood works (state)', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),
  c('Rural Works Department (RWD), Uttarakhand', 'Dehradun', 'Civil', 'Rural roads & buildings (state)', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),
  c('ITDA – IT Development Agency, Uttarakhand', 'Dehradun', 'CSE', 'State e-governance', 'IT support / data and network staff (contract)', 'Interview based', 'Contract notification → test / interview.', 'Contract salary as notified', 'https://itda.uk.gov.in'),
  c('CSIR – Indian Institute of Petroleum', 'Dehradun', 'Both', 'National research laboratory', 'Technician, Technical Assistant', 'Govt exam', 'CSIR technician / technical assistant exam → trade or skill test.', TECH, 'https://www.iip.res.in'),
  c('Forest Research Institute (FRI)', 'Dehradun', 'Both', 'Research institute (ICFRE)', 'Technician, Technical Assistant', 'Govt exam', 'ICFRE notification → written test → skill test.', TECH, 'https://fri.icfre.gov.in'),
  c('Wadia Institute of Himalayan Geology', 'Dehradun', 'Both', 'Research institute (DST)', 'Technical Assistant', 'Govt exam', 'Institute notification → written test / skill test.', TECH, 'https://www.wihg.res.in'),
  c('DRDO – IRDE Dehradun', 'Dehradun', 'Both', 'Defence research laboratory', 'Technician / Senior Technical Assistant (CEPTAM), Apprentice', 'Govt exam', 'DRDO CEPTAM exam → skill test; apprentices through NATS.', TECH, 'https://www.drdo.gov.in'),
  c('Windlas Biotech (Dehradun)', 'Dehradun', 'Both', 'Pharmaceutical manufacturing', 'Maintenance / utility technician, IT support', 'Interview based', INT, MFG, ''),
  // Haridwar & Roorkee
  c('CSIR – Central Building Research Institute (Roorkee)', 'Haridwar', 'Civil', 'Building research laboratory', 'Technician, Technical Assistant (Civil)', 'Govt exam', 'CSIR technician / technical assistant exam → trade or skill test.', TECH, 'https://www.cbri.res.in'),
  c('National Institute of Hydrology (Roorkee)', 'Haridwar', 'Civil', 'Water resources research', 'Technical Assistant', 'Govt exam', 'Institute notification → written test / skill test.', TECH, 'https://nihroorkee.gov.in'),
  c('Akums Drugs & Pharmaceuticals (Haridwar)', 'Haridwar', 'Both', 'Pharmaceutical manufacturing', 'Production / maintenance trainee, IT support', 'Interview based', INT, MFG, 'https://www.akums.in'),
  // Kumaon: Haldwani, Nainital, Kashipur, Pantnagar
  c('Kumaon Mandal Vikas Nigam (Nainital)', 'Haldwani / Nainital', 'Both', 'State tourism corporation', 'Junior Engineer, IT / office support', 'Govt exam', 'Corporation notification → test / interview.', STATE_JE, 'https://www.kmvn.in'),
  c('G. B. Pant University of Agriculture & Technology (Pantnagar)', 'Haldwani / Nainital', 'Both', 'University', 'Technical Assistant, Junior Engineer (works)', 'Govt exam', 'University notification → written test / skill test.', TECH, 'https://www.gbpuat.ac.in'),
  c('IIM Kashipur', 'Haldwani / Nainital', 'CSE', 'Institute (central)', 'IT support / system assistant (contract)', 'Interview based', 'Institute notification → test / interview.', 'Contract salary as notified', 'https://www.iimkashipur.ac.in'),
  c('Naini Papers Ltd (Kashipur)', 'Haldwani / Nainital', 'Both', 'Paper manufacturing', 'Maintenance / production trainee', 'Interview based', INT, MFG, 'https://www.nainipapers.com'),
  // Garhwal hydro and rail projects
  c('RVNL – Rishikesh–Karnaprayag rail project', 'Garhwal (Rishikesh / Chamoli / Uttarkashi)', 'Civil', 'Railway construction PSU', 'Site / tunnel engineer through contractors, apprentices', 'Interview based', 'Contractor drives and RVNL notifications → interview.', PVT_CIVIL, 'https://rvnl.org'),
  c('BRO – Project Shivalik (Rishikesh)', 'Garhwal (Rishikesh / Chamoli / Uttarkashi)', 'Civil', 'Border roads (central)', 'Draughtsman, Supervisor, Overseer posts (GREF)', 'Govt exam', 'BRO GREF notification → written test → trade test.', TECH, 'https://www.bro.gov.in'),
  c('NTPC Tapovan-Vishnugad (Chamoli)', 'Garhwal (Rishikesh / Chamoli / Uttarkashi)', 'Civil', 'Hydro power PSU', 'Diploma Trainee, Apprentice', 'Apprenticeship (merit)', NATS, APPR, 'https://www.ntpc.co.in'),
  c('SJVN Naitwar Mori project (Uttarkashi)', 'Garhwal (Rishikesh / Chamoli / Uttarkashi)', 'Civil', 'Hydro power PSU', 'Apprentice, field engineer through contractors', 'Apprenticeship (merit)', NATS, APPR, 'https://sjvn.nic.in'),
  // Champawat & Tanakpur (nearest to the institute)
  c('NHPC Tanakpur Power Station (Banbasa)', 'Champawat / Tanakpur', 'Both', 'Hydro power PSU', 'Apprentice, Junior Engineer (NHPC exam)', 'Apprenticeship (merit)', NATS, APPR, 'https://www.nhpcindia.com'),
  c('PWD Champawat division', 'Champawat / Tanakpur', 'Civil', 'Roads & buildings (state)', 'Junior Engineer (Civil), work-charge staff', 'Govt exam', STATE, STATE_JE, 'https://pwd.uk.gov.in'),
  c('Uttarakhand Jal Sansthan (Champawat)', 'Champawat / Tanakpur', 'Civil', 'Water supply (state)', 'Junior Engineer, plumbing / pump staff', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),

  c('SIDCUL – State Industrial Development Corporation of Uttarakhand', 'Dehradun', 'Both', 'Industrial estates (state)', 'Junior Engineer (Civil / Electrical), IT support', 'Govt exam', STATE, STATE_JE, 'https://www.sidcul.com'),
  c('Uttarakhand Transport Corporation (workshops)', 'Dehradun', 'Both', 'State road transport', 'Junior Engineer, workshop technician, IT support', 'Govt exam', STATE, STATE_JE, 'https://utc.uk.gov.in'),
  c('UHUDA – Uttarakhand Housing & Urban Development Authority', 'Dehradun', 'Civil', 'Housing & urban development (state)', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),
  c('BSNL Uttarakhand Circle', 'Dehradun', 'CSE', 'Telecom PSU', 'Diploma apprentice (telecom / IT)', 'Apprenticeship (merit)', NATS, APPR, 'https://www.bsnl.co.in'),
  c('IIRS – Indian Institute of Remote Sensing (ISRO)', 'Dehradun', 'Both', 'Space / remote sensing institute', 'Technician, Technical Assistant', 'Govt exam', 'ISRO / IIRS notification → written test → skill test.', TECH, 'https://www.iirs.gov.in'),
  c('Uttarakhand Technical University (VMSBUTU)', 'Dehradun', 'Both', 'State technical university', 'IT support / lab and works staff', 'Govt exam', 'University notification → test / interview.', TECH, 'https://uktech.ac.in'),
  c('HRDA – Haridwar Roorkee Development Authority', 'Haridwar', 'Civil', 'Urban development (state)', 'Junior Engineer (Civil)', 'Govt exam', STATE, STATE_JE, 'https://uk.gov.in'),
  c('AIIMS Rishikesh', 'Garhwal (Rishikesh / Chamoli / Uttarkashi)', 'Both', 'Central hospital & institute', 'Junior Engineer (works), IT / technical staff', 'Govt exam', 'AIIMS recruitment exam → skill test → document verification.', TECH, 'https://aiimsrishikesh.edu.in'),
  c('North Eastern Railway – Kathgodam (Izzatnagar division)', 'Haldwani / Nainital', 'Both', 'Indian Railways', 'Apprentice (RRC), Junior Engineer (RRB JE)', 'Apprenticeship (merit)', 'RRC apprentice notification on merit; JE through the RRB JE exam.', APPR, 'https://ner.indianrailways.gov.in'),
  c('NHPC Dhauliganga Power Station (Pithoragarh)', 'Pithoragarh / Almora', 'Civil', 'Hydro power PSU', 'Apprentice, Junior Engineer (NHPC exam)', 'Apprenticeship (merit)', NATS, APPR, 'https://www.nhpcindia.com'),
  // Recruiters that placed UGIP Tanakpur students (from the institute's placement record)
  c('Bharti Airtel (Dehradun)', 'Dehradun', 'CSE', 'Telecom', 'Customer / network support executive', 'Interview based', INT, '₹12,000/month (UGIP campus offer, 2021-22)', 'https://www.airtel.in', 'UGIP campus recruiter'),
  c('F Techiz Solutions Pvt. Ltd. (Dehradun)', 'Dehradun', 'CSE', 'IT services', 'Junior developer / IT support trainee', 'Interview based', INT, '₹15,000/month (UGIP campus offers, 2021-23)', '', 'UGIP campus recruiter'),
  c('Prakash Pipes Ltd. (Kashipur)', 'Rudrapur / Pantnagar', 'Both', 'PVC pipes manufacturing', 'IT / ERP support, production trainee', 'Interview based', INT, '₹22,000/month (UGIP campus offer, 2024-25)', '', 'UGIP campus recruiter'),
  c('Skillzdisk Pvt. Ltd. (Pantnagar)', 'Rudrapur / Pantnagar', 'Both', 'Manpower & plant services', 'Trainee for plant / IT roles', 'Interview based', INT, '₹23,000/month (UGIP campus offers, 2024-25)', '', 'UGIP campus recruiter'),
  c('Lohar Engineering (Kashipur)', 'Rudrapur / Pantnagar', 'Civil', 'Engineering works', 'Site / fabrication supervisor trainee', 'Interview based', INT, '₹12,000–15,000/month (UGIP campus offers, 2021-24)', '', 'UGIP campus recruiter'),
  c('Anchor by Panasonic (Haridwar)', 'Haridwar', 'Both', 'Electrical products manufacturing', 'Production / quality trainee', 'Interview based', INT, '₹12,000/month (UGIP campus offer, 2022-23)', 'https://www.panasonic.com/in', 'UGIP campus recruiter'),
  c('Kansai Nerolac (Haldwani)', 'Haldwani / Nainital', 'Civil', 'Paints (sales & site support)', 'Technical / site support executive', 'Interview based', INT, '₹24,000/month (UGIP campus offer, 2023-24)', 'https://www.nerolac.com', 'UGIP campus recruiter'),
  // ───── Delhi ─────
  c('DMRC – Delhi Metro Rail Corporation', 'Delhi', 'Both', 'Metro rail', 'Junior Engineer (Civil / Electronics / IT)', 'Govt exam', 'DMRC CBT → document verification → medical.', 'DMRC pay scale for JE', 'https://www.delhimetrorail.com'),
  c('CPWD – Central Public Works Department', 'Delhi', 'Civil', 'Central govt construction', 'Junior Engineer (Civil)', 'Govt exam', SSC, CENTRAL_JE, 'https://cpwd.gov.in'),
  c('DDA – Delhi Development Authority', 'Delhi', 'Civil', 'Urban development', 'Junior Engineer (Civil)', 'Govt exam', 'DDA recruitment CBT → document verification.', CENTRAL_JE, 'https://dda.gov.in'),
  c('NBCC (India) Ltd', 'Delhi', 'Civil', 'Construction PSU', 'Junior Engineer / Site Engineer', 'Govt exam', 'NBCC notification → online test → document check.', 'PSU pay scale', 'https://www.nbccindia.in'),
  c('IRCON International', 'Delhi', 'Civil', 'Railway construction PSU', 'Site Engineer / Works Engineer (contract)', 'Interview based', 'Notification → interview / walk-in.', 'PSU contract salary as notified', 'https://www.ircon.org'),
  c('NHAI – National Highways Authority of India', 'Delhi', 'Civil', 'National highways', 'Junior Engineer / Site supervisor (via contractors)', 'Govt exam', 'Direct recruitment notices + SSC JE; contractors hire on interview.', CENTRAL_JE, 'https://nhai.gov.in'),
  c('GMR Group (Delhi Airport)', 'Delhi', 'Both', 'Airports & infrastructure', 'Junior Engineer, maintenance / IT support', 'Written test + Interview', TEST, PVT_CIVIL, 'https://www.gmrgroup.in'),
  c('Sysnet Global Technologies (Okhla)', 'Delhi', 'CSE', 'IT infrastructure services', 'IT Field Engineer apprentice', 'Interview based', INT, PVT_IT, 'https://sysnetglobal.com'),
  c('Raygain Technologies', 'Delhi', 'CSE', 'IT support services', 'Desktop support / IT jobs', 'Interview based', INT, PVT_IT, 'https://raygain.com'),
  c('TelSpiel Communications', 'Delhi', 'CSE', 'Enterprise messaging', 'Database & backend support', 'Interview based', INT, PVT_IT, 'https://telspiel.com'),
  c('Big Bee Consultant', 'Delhi', 'CSE', 'IT manpower', 'Desktop support engineer', 'Interview based', INT, PVT_IT, ''),
  c('Zealant Consulting Group', 'Delhi', 'CSE', 'IT support & manpower', 'IT support / desktop engineer', 'Interview based', INT, PVT_IT, ''),

  // ───── Noida & Greater Noida ─────
  c('HCLTech', 'Noida', 'CSE', 'IT services', 'IT support and early-career programmes', 'Written test + Interview', TEST, PVT_IT, 'https://www.hcltech.com'),
  c('Samsung (Noida factory)', 'Noida', 'CSE', 'Electronics manufacturing', 'Production / test technician', 'Written test + Interview', TEST, PVT_IT, 'https://www.samsung.com/in'),
  c('Coforge (NSEZ)', 'Noida', 'CSE', 'IT services', 'IT support / process roles', 'Written test + Interview', TEST, PVT_IT, 'https://www.coforge.com'),
  c('Nagarro (Noida office)', 'Noida', 'CSE', 'Software services', 'Junior IT / support roles', 'Written test + Interview', TEST, PVT_IT, 'https://www.nagarro.com'),
  c('Dixon Technologies', 'Noida', 'CSE', 'Electronics manufacturing', 'Production / test engineer trainee', 'Interview based', INT, MFG, 'https://www.dixoninfo.com'),
  c('Vivo / Oppo (Greater Noida plants)', 'Noida', 'CSE', 'Mobile manufacturing', 'Production / QC technician', 'Interview based', INT, MFG, 'https://www.vivo.com/in'),
  c('Jupsoft Technologies', 'Noida', 'CSE', 'School ERP / web', 'Front-end developer intern', 'Interview based', INT, PVT_IT, 'https://jupsoft.com'),
  c('ITZIP Solutions', 'Noida', 'CSE', 'IT services & placement', 'IT support / placement assistance', 'Interview based', INT, PVT_IT, 'https://itzip.in'),
  c('Dedha India HR Solutions', 'Noida', 'Both', 'HR / staffing', 'Computer operator, office roles', 'Interview based', INT, '₹10,000–16,000/month', 'https://dedhaindia.com'),
  c('Jaypee Group', 'Noida', 'Civil', 'Dams, cement, real estate', 'Junior Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.jalindia.com', VERIFY),

  // ───── Gurugram & Faridabad ─────
  c('Maruti Suzuki India', 'Gurugram', 'Both', 'Automobile manufacturing', 'Diploma trainee (production / maintenance)', 'Written test + Interview', TEST, MFG, 'https://www.marutisuzuki.com'),
  c('Honda Motorcycle & Scooter India (Manesar)', 'Gurugram', 'Both', 'Two-wheeler manufacturing', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.honda2wheelersindia.com'),
  c('DLF Limited', 'Gurugram', 'Civil', 'Real estate', 'Junior Engineer – Gurugram projects', 'Interview based', INT, PVT_CIVIL, 'https://www.dlf.in'),
  c('Raheja Developers', 'Gurugram', 'Civil', 'Real estate', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.raheja.com'),
  c('RITES Ltd', 'Gurugram', 'Civil', 'Railway / infra consultancy PSU', 'Site / technical assistant (as notified)', 'Govt exam', 'RITES notification → written test / interview.', 'PSU pay scale', 'https://www.rites.com'),
  c('AECOM India', 'Gurugram', 'Civil', 'Design & engineering MNC', 'Design support / CAD technician', 'Interview based', INT, PVT_CIVIL, 'https://aecom.com'),
  c('CBRE India', 'Gurugram', 'Civil', 'Project management (PMC)', 'Project coordinator / site supervisor', 'Interview based', INT, PVT_CIVIL, 'https://www.cbre.co.in'),
  c('Bharti Airtel', 'Gurugram', 'CSE', 'Telecom', 'Network field technician (UGIP Tanakpur recruited in 2021-22)', 'Interview based', INT, PVT_IT, 'https://www.airtel.in'),
  c('JCB India (Ballabgarh, Faridabad)', 'Gurugram', 'Both', 'Construction equipment', 'Service engineer / production trainee', 'Interview based', INT, MFG, 'https://www.jcb.com/en-in'),
  c('Punj Lloyd', 'Gurugram', 'Civil', 'Oil & gas, pipelines', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.punjlloyd.com', VERIFY),

  // ───── Mumbai ─────
  c('Larsen & Toubro (L&T Construction)', 'Mumbai', 'Civil', 'Construction & infrastructure', 'DET – Diploma Engineer Trainee (buildings, metro, roads)', 'Written test + Interview', 'DET online test → technical interview → HR (batch every year).', PVT_CIVIL, 'https://www.larsentoubro.com'),
  c('Shapoorji Pallonji', 'Mumbai', 'Civil', 'Construction (40+ countries)', 'Junior Engineer', 'Written test + Interview', TEST, PVT_CIVIL, 'https://www.shapoorjipallonji.com'),
  c('Afcons Infrastructure', 'Mumbai', 'Civil', 'Bridges, marine, tunnels', 'Site Supervisor', 'Interview based', INT, PVT_CIVIL, 'https://www.afcons.com'),
  c('Hindustan Construction Co (HCC)', 'Mumbai', 'Civil', 'Hydropower, metro, water', 'QC Engineer / site engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.hccindia.com'),
  c('Gammon India', 'Mumbai', 'Civil', 'Flyovers, bridges, power', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.gammonindia.com', VERIFY),
  c('KEC International (RPG Group)', 'Mumbai', 'Civil', 'Transmission, civil, smart infra', 'Site Engineer (takes diploma)', 'Written test + Interview', TEST, PVT_CIVIL, 'https://www.kecrpg.com'),
  c('Voltas (projects)', 'Mumbai', 'Both', 'MEP & HVAC projects', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.voltas.com'),
  c('Blue Star', 'Mumbai', 'Both', 'MEP / infrastructure projects', 'Project coordinator', 'Interview based', INT, PVT_CIVIL, 'https://www.bluestarindia.com'),
  c('Godrej Properties', 'Mumbai', 'Civil', 'Real estate', 'Site Supervisor – Mumbai / Pune', 'Interview based', INT, PVT_CIVIL, 'https://www.godrejproperties.com'),
  c('Lodha Group', 'Mumbai', 'Civil', 'Real estate', 'Billing Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.lodhagroup.com'),
  c('Oberoi Realty', 'Mumbai', 'Civil', 'Real estate', 'Supervisor', 'Interview based', INT, PVT_CIVIL, 'https://www.oberoirealty.com'),
  c('L&T Realty', 'Mumbai', 'Civil', 'Real estate', 'Junior Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.lntrealty.com'),
  c('Reliance Infrastructure', 'Mumbai', 'Civil', 'Infrastructure', 'Junior Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.rinfra.com'),
  c('Tata Consulting Engineers', 'Mumbai', 'Civil', 'Engineering consultancy', 'Junior engineer / draftsman (walk-ins in Mumbai)', 'Interview based', 'Walk-in / interview.', PVT_CIVIL, 'https://www.tce.co.in'),
  c('IRB Infrastructure', 'Mumbai', 'Civil', 'Highways (BOT/TOT)', 'Highway Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.irb.co.in'),
  c('UltraTech Cement', 'Mumbai', 'Civil', 'Cement (Aditya Birla Group)', 'Technical support / site engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.ultratechcement.com'),
  c('Jacobs Engineering', 'Mumbai', 'Civil', 'Engineering MNC', 'Junior Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.jacobs.com'),
  c('JLL India', 'Mumbai', 'Civil', 'Project management (PMC)', 'Project coordinator', 'Interview based', INT, PVT_CIVIL, 'https://www.jll.co.in'),

  // ───── Hyderabad ─────
  c('Tata Projects', 'Hyderabad', 'Civil', 'Metro, airport, industrial plants', 'Site Engineer', 'Written test + Interview', TEST, PVT_CIVIL, 'https://www.tataprojects.com'),
  c('NCC Ltd (Nagarjuna Construction)', 'Hyderabad', 'Civil', 'Housing, roads, water supply', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://ncclimited.com'),
  c('Megha Engineering & Infrastructures (MEIL)', 'Hyderabad', 'Civil', 'Irrigation, power, infra', 'Site Engineer / supervisor', 'Interview based', INT, PVT_CIVIL, 'https://meil.in'),
  c('L&T Metro Rail Hyderabad', 'Hyderabad', 'Both', 'Metro operations', 'Station / maintenance technician', 'Interview based', INT, MFG, 'https://www.ltmetro.com'),
  c('GMR Hyderabad International Airport', 'Hyderabad', 'Both', 'Airport operations', 'Maintenance / IT support', 'Written test + Interview', TEST, PVT_CIVIL, 'https://www.hyderabad.aero'),
  c('Cyient', 'Hyderabad', 'Both', 'Engineering services (GIS / CAD)', 'CAD / GIS technician', 'Written test + Interview', TEST, PVT_IT, 'https://www.cyient.com'),
  c('Aparna Constructions', 'Hyderabad', 'Civil', 'Real estate', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.aparnaconstructions.com'),
  c('Re Sustainability (formerly Ramky)', 'Hyderabad', 'Civil', 'Environment & infrastructure', 'Site supervisor', 'Interview based', INT, PVT_CIVIL, ''),
  c('IVRCL', 'Hyderabad', 'Civil', 'Irrigation & water projects', 'Supervisor', 'Interview based', INT, PVT_CIVIL, 'https://www.ivrcl.com', VERIFY),
  c('ECIL – Electronics Corporation of India', 'Hyderabad', 'CSE', 'Electronics PSU', 'Technical officer on contract / diploma apprentice', 'Apprenticeship (merit)', NATS, APPR, 'https://www.ecil.co.in'),
  c('BHEL Hyderabad', 'Hyderabad', 'Both', 'Heavy electricals PSU', 'Diploma apprentice', 'Apprenticeship (merit)', NATS, APPR, 'https://www.bhel.com'),

  // ───── Bengaluru ─────
  c('Bosch India', 'Bengaluru', 'Both', 'Auto components', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.bosch.in'),
  c('Toyota Kirloskar Motor (Bidadi)', 'Bengaluru', 'Both', 'Automobile manufacturing', 'Diploma trainee / technician', 'Written test + Interview', TEST, MFG, 'https://www.toyotabharat.com'),
  c('BEL – Bharat Electronics', 'Bengaluru', 'CSE', 'Defence electronics PSU', 'Technician / apprentice', 'Govt exam', 'BEL written test → trade/skill test (apprentices via NATS).', 'PSU pay scale', 'https://bel-india.in'),
  c('HAL – Hindustan Aeronautics', 'Bengaluru', 'Both', 'Aerospace PSU', 'Diploma technician / apprentice', 'Govt exam', 'HAL written test → document verification (apprentices via NATS).', 'PSU pay scale', 'https://hal-india.co.in'),
  c('ISRO centres', 'Bengaluru', 'Both', 'Space research', 'Technical Assistant (diploma)', 'Govt exam', 'ISRO written test → skill test.', CENTRAL_JE, 'https://www.isro.gov.in'),
  c('Sobha Limited', 'Bengaluru', 'Civil', 'Real estate', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.sobha.com'),
  c('Prestige Group', 'Bengaluru', 'Civil', 'Real estate', 'QC Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.prestigeconstructions.com'),
  c('Brigade Group', 'Bengaluru', 'Civil', 'Real estate', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.brigadegroup.com'),
  c('Atkins (AtkinsRéalis)', 'Bengaluru', 'Civil', 'Engineering design MNC', 'CAD / draftsman', 'Interview based', INT, PVT_CIVIL, 'https://www.atkinsrealis.com'),
  c('BEML Ltd', 'Bengaluru', 'Both', 'Heavy equipment PSU', 'Diploma trainee / technician', 'Govt exam', 'BEML notification → written test → document check.', 'PSU pay scale', 'https://www.bemlindia.in'),
  c('Bharat Heavy Electricals (Bengaluru units)', 'Bengaluru', 'Both', 'Electrical equipment PSU', 'Diploma apprentice', 'Apprenticeship (merit)', NATS, APPR, 'https://www.bhel.com'),

  // ───── Pune ─────
  c('Tata Motors (Pune)', 'Pune', 'Both', 'Automobile manufacturing', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.tatamotors.com'),
  c('Bajaj Auto (Akurdi / Chakan)', 'Pune', 'Both', 'Two-wheeler manufacturing', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.bajajauto.com'),
  c('Mahindra & Mahindra (Chakan)', 'Pune', 'Both', 'Automobile manufacturing', 'Production / quality trainee', 'Written test + Interview', TEST, MFG, 'https://www.mahindra.com'),
  c('Volkswagen India (Chakan)', 'Pune', 'Both', 'Automobile manufacturing', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.volkswagen.co.in'),
  c('Thermax', 'Pune', 'Both', 'Energy & environment engineering', 'Site / service engineer trainee', 'Interview based', INT, PVT_CIVIL, 'https://www.thermaxglobal.com'),
  c('Forbes Marshall', 'Pune', 'Both', 'Process engineering', 'Service technician trainee', 'Interview based', INT, MFG, 'https://www.forbesmarshall.com'),
  c('Kirloskar Brothers', 'Pune', 'Both', 'Pumps & projects', 'Site / service engineer', 'Interview based', INT, MFG, 'https://www.kirloskarpumps.com'),
  c('Bharat Forge', 'Pune', 'Both', 'Forging & components', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.bharatforge.com'),
  c('Ashoka Buildcon (Nashik, near Pune)', 'Pune', 'Civil', 'Roads & highways', 'Road Project Supervisor', 'Interview based', INT, PVT_CIVIL, 'https://ashokabuildcon.com'),
  c('Cummins India', 'Pune', 'Both', 'Engines & power systems', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.cummins.com/en/in'),
  c('Sandvik Asia', 'Pune', 'Both', 'Tools & mining equipment', 'Diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.home.sandvik'),

  // ───── Kolkata ─────
  c('Simplex Infrastructures', 'Kolkata', 'Civil', 'Railways, high-rise buildings', 'Billing / Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.simplexinfra.com', 'Check current hiring status (financial restructuring reported).'),
  c('Coal India Ltd', 'Kolkata', 'Both', 'Mining PSU', 'Junior overman / technician / apprentice', 'Govt exam', 'Subsidiary notification → CBT (apprentices via NATS).', 'PSU pay scale', 'https://www.coalindia.in'),
  c('Garden Reach Shipbuilders (GRSE)', 'Kolkata', 'Both', 'Defence shipbuilding PSU', 'Diploma apprentice / supervisor', 'Govt exam', 'Notification → written test / merit.', 'PSU pay scale', 'https://grse.in'),
  c('Bridge & Roof Co. (India)', 'Kolkata', 'Civil', 'Construction PSU', 'Junior Engineer / site supervisor', 'Govt exam', 'Notification → written test → interview.', 'PSU pay scale', 'https://www.bridgeroof.co.in'),
  c('CESC Ltd', 'Kolkata', 'Both', 'Power distribution', 'Technician / diploma trainee', 'Written test + Interview', TEST, MFG, 'https://www.cesc.co.in'),
  c('Exide Industries', 'Kolkata', 'Both', 'Batteries', 'Production / service trainee', 'Interview based', INT, MFG, 'https://www.exideindustries.com'),
  c('ITC Ltd (HQ)', 'Kolkata', 'Both', 'FMCG / hotels / paper', 'Maintenance / process associate', 'Interview based', INT, MFG, 'https://www.itcportal.com'),
  c('Britannia Industries (HQ)', 'Kolkata', 'Both', 'Food manufacturing', 'Production trainee', 'Interview based', INT, MFG, 'https://britannia.co.in'),
  c('Kolkata Metro Railway', 'Kolkata', 'Both', 'Metro rail (Indian Railways)', 'Junior Engineer', 'Govt exam', RRB, CENTRAL_JE, 'https://mtp.indianrailways.gov.in'),
  c('Titagarh Rail Systems', 'Kolkata', 'Both', 'Rail wagons & coaches manufacturing', 'Diploma trainee', 'Interview based', INT, MFG, 'https://titagarh.in'),

  // ───── All-India Govt / PSU (posting anywhere) ─────
  c('Indian Railways (RRB JE)', 'All-India (Govt / PSU)', 'Both', 'Railways', 'Junior Engineer (Civil / IT)', 'Govt exam', RRB, CENTRAL_JE, 'https://indianrailways.gov.in'),
  c('SSC JE (CPWD, MES, CWC, BRO…)', 'All-India (Govt / PSU)', 'Civil', 'Central govt departments', 'Junior Engineer (Civil)', 'Govt exam', SSC, CENTRAL_JE, 'https://ssc.gov.in'),
  c('State PWD (any state)', 'All-India (Govt / PSU)', 'Civil', 'State roads & buildings', 'Junior Engineer', 'Govt exam', STATE, STATE_JE, 'https://psc.uk.gov.in'),
  c('MES – Military Engineer Services', 'All-India (Govt / PSU)', 'Civil', 'Defence works', 'Junior Engineer', 'Govt exam', SSC, CENTRAL_JE, 'https://mes.gov.in'),
  c('NTPC / NHPC', 'All-India (Govt / PSU)', 'Both', 'Power PSUs', 'Diploma trainee / apprentice', 'Govt exam', 'Diploma Trainee exam when notified; apprentices via NATS.', 'PSU pay scale', 'https://www.ntpc.co.in'),
  c('MPMRCL / other metro corporations', 'All-India (Govt / PSU)', 'Both', 'Metro rail', 'JE posts (as notified)', 'Govt exam', 'Metro CBT → document verification.', 'Metro pay scale', 'https://www.mpmetrorail.com'),
  c('Adani Infrastructure (ports & airports)', 'All-India (Govt / PSU)', 'Civil', 'Ports, airports (private)', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.adani.com'),
  c('Dilip Buildcon (Bhopal)', 'All-India (Govt / PSU)', 'Civil', 'Highways (private)', 'Highway Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.dilipbuildcon.com'),
  c('ACC / Ambuja Cement (Adani)', 'All-India (Govt / PSU)', 'Civil', 'Cement (private)', 'Site Engineer / technical sales', 'Interview based', INT, PVT_CIVIL, 'https://www.acclimited.com'),
  c('Saint-Gobain India', 'All-India (Govt / PSU)', 'Civil', 'Building materials (private)', 'Site Coordinator', 'Interview based', INT, PVT_CIVIL, 'https://www.saint-gobain.co.in'),
  c('Leighton (CIMIC) India', 'All-India (Govt / PSU)', 'Civil', 'Construction MNC', 'Site Engineer', 'Interview based', INT, PVT_CIVIL, 'https://www.cimic.com.au', 'Check whether it is still operating in India before applying.'),
];

/** Places inside Uttarakhand; the directory shows them together under one button. */
export const UTTARAKHAND_CITIES = ['Dehradun', 'Haridwar', 'Rudrapur / Pantnagar', 'Haldwani / Nainital', 'Garhwal (Rishikesh / Chamoli / Uttarkashi)', 'Pithoragarh / Almora', 'Champawat / Tanakpur'];
export const ALL_UTTARAKHAND = 'Uttarakhand (all)';
/** Places shown in the portal: Uttarakhand first, then New Delhi and Noida. */
export const SHOWN_PLACES = [...UTTARAKHAND_CITIES, 'Delhi', 'Noida'];
export const CITY_COMPANIES = ALL_DIRECTORY_COMPANIES.filter(x => SHOWN_PLACES.includes(x.city));
export const COMPANY_CITIES = SHOWN_PLACES.filter(c => CITY_COMPANIES.some(x => x.city === c));
export const HIRING_MODES: HiringMode[] = ['Interview based', 'Written test + Interview', 'Govt exam', 'Apprenticeship (merit)'];

// ───────────── Detailed job insight (by type of employer) ─────────────
export interface JobInsight {
  type: string;
  workplace: string;
  firstYear: string;
  performance: string;
  growth: string;
  probation: string;
  documents: string;
}

const DOCS = 'Resume (2 copies), 10th / 12th / all diploma mark-sheets, Aadhaar, PAN, passport photos, bank passbook';

export function companyInsight(x: CityCompany): JobInsight {
  if (x.mode === 'Govt exam' && (x.salary === CENTRAL_JE || x.salary === STATE_JE)) {
    return {
      type: 'Government department (JE / technical post)',
      workplace: 'Office + field inspections of works; fixed hours, transfers within the state / zone every few years.',
      firstYear: 'Training and probation: measurement books, estimates, site inspection, file work and tender procedure.',
      performance: 'Annual Performance Appraisal Report (APAR) by your senior officer: work quality, punctuality, integrity and conduct.',
      growth: 'JE → AE (by departmental promotion / exam, usually 8–12 years) → EE. Job security, pension (NPS), DA and HRA.',
      probation: 'Usually 2 years probation; document & police verification and medical before joining.',
      documents: `${DOCS}, caste / domicile certificate if claimed, admit card & result of the exam`,
    };
  }
  if (x.mode === 'Govt exam' || x.mode === 'Apprenticeship (merit)') {
    return {
      type: 'PSU / Government company',
      workplace: 'Large plant / project sites with set procedures, safety rules and shift work at some units.',
      firstYear: 'Apprenticeship or trainee period: rotation across departments, logbook and training report.',
      performance: 'Trainee report by your supervisor; later yearly appraisal (KPIs on output, safety and attendance).',
      growth: 'Apprentice → contract / regular technician or supervisor (through the company exam). Apprentice experience counts in later PSU and private hiring.',
      probation: 'Apprenticeship: 1 year with stipend; regular posts have 1 year probation.',
      documents: `${DOCS}, NATS registration ID (for apprenticeship), medical fitness certificate`,
    };
  }
  const mfgSector = /manufactur|automobile|vehicle|wheeler|fmcg|food|electrical|electronics|glass|chemical|batter|forging|pumps|components|equipment|cooling|process engineering/i.test(x.sector);
  const civilWork = x.salary === PVT_CIVIL || (!mfgSector && x.branch === 'Civil') || /smart city|construction|real estate|infra/i.test(x.sector);
  const itWork = x.salary === PVT_IT || (!mfgSector && !civilWork && x.branch === 'CSE') || /staffing|HR \/|IT /i.test(x.sector);
  if (civilWork) {
    return {
      type: 'Construction / infrastructure / real estate',
      workplace: 'Mostly on site (6 days a week is common); you may move from project to project and city to city. Site accommodation is often provided.',
      firstYear: 'Supervise labour and contractors, check levels, shuttering, reinforcement and concrete pours, keep daily progress reports (DPR) and measurement records.',
      performance: 'Judged on work done vs schedule, quality (no rework), safety record, correct measurements / billing and how well you handle the site team.',
      growth: 'Diploma Engineer Trainee → Junior Engineer → Site Engineer → Senior Engineer → Project Manager. +30–50% pay after ~2 years; AutoCAD, estimation and billing skills speed this up.',
      probation: '6–12 months training / probation; some companies (e.g. DET schemes) have a service bond – read the offer letter.',
      documents: DOCS,
    };
  }
  if (itWork) {
    return {
      type: 'IT / IT-enabled services',
      workplace: 'Office or client site, 5-day week in most firms; night / rotational shifts in support and BPO roles.',
      firstYear: 'Desktop / network support, ticket handling, testing or basic development under a senior; company training in the first weeks.',
      performance: 'Measured on tickets closed / SLA met, quality audits, client feedback, certifications completed and attendance. Yearly appraisal with a rating.',
      growth: 'Support / Associate → Senior → Team Lead. Certifications (CCNA, AWS, Azure, Python) and a part-time degree help you move into developer roles.',
      probation: '3–6 months probation; some freshers sign a 1–2 year service agreement.',
      documents: DOCS,
    };
  }
  return {
    type: 'Manufacturing / plant',
    workplace: 'Plant shop floor in rotational shifts (A / B / C); canteen and bus facility are common. Safety shoes and uniform are given.',
    firstYear: 'Trainee in production, maintenance or quality: machine operation, preventive maintenance, inspection checklists, 5S and safety rules.',
    performance: 'Judged on output targets, rejection / defect rate, machine downtime, safety (no accidents), attendance and kaizen (improvement) ideas.',
    growth: 'Trainee → Technician / Junior Engineer → Engineer → Senior Engineer / Shift In-charge. Many do a part-time B.Tech while working.',
    probation: '1–2 years trainee period (often under NAPS / company scheme) before confirmation.',
    documents: `${DOCS}, medical fitness certificate`,
  };
}
