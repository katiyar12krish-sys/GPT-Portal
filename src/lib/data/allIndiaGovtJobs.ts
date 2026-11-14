// Central (All-India) government jobs and trainee schemes open to diploma holders.
// Posts, vacancies, age and pay change with every notification, so the card always sends the student to the official site.

export interface CentralJob {
  post: string;
  branch: 'Civil' | 'CSE' | 'Both';
  conductedBy: string;
  eligibility: string;
  selection: string;
  pay: string;
  where: string;
  prepare: string;
  link: string;
  /** Question bank sections to practise: [section, subject] ('All' = whole section). */
  practice: Array<[string, string]>;
}

export const ALL_INDIA_GOVT_JOBS: CentralJob[] = [
  {
    post: 'Junior Engineer (Civil) – SSC JE',
    branch: 'Civil',
    conductedBy: 'Staff Selection Commission (SSC)',
    eligibility: 'Diploma in Civil Engineering (some departments ask for work experience – read the notification)',
    selection: 'Paper I (computer based) → Paper II (technical) → document verification',
    pay: 'Pay Level 6 (central) + allowances',
    where: 'CPWD, MES, Central Water Commission, BRO and other central departments',
    prepare: 'Civil technical subjects, reasoning, general awareness',
    link: 'https://ssc.gov.in',
    practice: [['Civil Technical', 'All'], ['Reasoning', 'All'], ['India GK', 'All']],
  },
  {
    post: 'Junior Engineer – RRB JE (Railways)',
    branch: 'Both',
    conductedBy: 'Railway Recruitment Boards (RRB)',
    eligibility: 'Diploma in the engineering branch listed for each post in the notification (Civil posts every cycle; check which posts accept Computer Science)',
    selection: 'CBT 1 → CBT 2 → document verification → medical test',
    pay: 'Pay Level 6 (central) + railway allowances',
    where: 'Indian Railways zones across India',
    prepare: 'Maths, reasoning, general science, your branch technical subjects, basics of computers',
    link: 'https://indianrailways.gov.in',
    practice: [['Aptitude', 'All'], ['Reasoning', 'All'], ['Civil Technical', 'All']],
  },
  {
    post: 'Technical Assistant – ISRO centres',
    branch: 'Both',
    conductedBy: 'ISRO / its centres (each centre advertises separately)',
    eligibility: 'First-class diploma in the discipline named in the advertisement (Computer Science and Civil appear in many cycles)',
    selection: 'Written test → skill test',
    pay: 'Pay Level 7 (central) as per notification',
    where: 'ISRO centres including IIRS Dehradun',
    prepare: 'Core technical subjects of your branch; C, Linux and databases for CSE',
    link: 'https://www.isro.gov.in',
    practice: [['Subject Bank', 'C Programming'], ['UBTER Syllabus', 'Sem 3 CSE Operating System'], ['UBTER Syllabus', 'Sem 5 CSE Database Management System']],
  },
  {
    post: 'Senior Technical Assistant-B – DRDO CEPTAM',
    branch: 'Both',
    conductedBy: 'DRDO (CEPTAM)',
    eligibility: 'Diploma (or B.Sc) in the subject listed for each post code',
    selection: 'Tier I (screening CBT) → Tier II (subject CBT)',
    pay: 'Pay Level 6 (central)',
    where: 'DRDO laboratories, including IRDE Dehradun',
    prepare: 'Aptitude, reasoning, English, general science and your branch subjects',
    link: 'https://www.drdo.gov.in',
    practice: [['Aptitude', 'All'], ['English', 'All'], ['CSE Technical', 'All']],
  },
  {
    post: 'Junior Engineer / Supervisor – Hydro power PSUs (NHPC, THDC, SJVN)',
    branch: 'Civil',
    conductedBy: 'The company itself',
    eligibility: 'Regular diploma in Civil Engineering with the minimum marks in the advertisement',
    selection: 'Online test → document verification',
    pay: 'PSU pay scale (IDA) + perks',
    where: 'Hydro projects in Uttarakhand, Himachal, J&K and the North-East',
    prepare: 'Civil technical subjects (fluid mechanics, RCC, surveying), reasoning, general awareness',
    link: 'https://www.nhpcindia.com',
    practice: [['Civil Technical', 'All'], ['UBTER Syllabus', 'Sem 3 Civil Fluid Mechanics'], ['UBTER Syllabus', 'Sem 5 Civil Reinforced Concrete Design']],
  },
  {
    post: 'Junior Engineer – Metro rail (DMRC and other metros)',
    branch: 'Civil',
    conductedBy: 'DMRC / the metro corporation',
    eligibility: 'Diploma in Civil (and other engineering branches for their posts)',
    selection: 'CBT → document verification → medical test',
    pay: 'Metro pay scale as per notification',
    where: 'Delhi Metro and other metro projects',
    prepare: 'Civil technical subjects, reasoning, general awareness',
    link: 'https://www.delhimetrorail.com',
    practice: [['Civil Technical', 'All'], ['Reasoning', 'All']],
  },
  {
    post: 'Stipendiary Trainee (Category I) – BARC / NPCIL',
    branch: 'Both',
    conductedBy: 'Department of Atomic Energy units',
    eligibility: 'Diploma in the engineering discipline named in the advertisement, with minimum marks',
    selection: 'Online test → skill / interview → training with stipend → absorbed as Scientific Assistant',
    pay: 'Stipend during training, then Pay Level 6',
    where: 'BARC Mumbai and nuclear power stations',
    prepare: 'Branch technical subjects, maths and science',
    link: 'https://www.barc.gov.in',
    practice: [['Diploma Subjects', 'All'], ['Aptitude', 'All']],
  },
  {
    post: 'Diploma apprentice in central PSUs (BHEL, NTPC, ONGC, IOCL, BEL)',
    branch: 'Both',
    conductedBy: 'Each PSU, through the NATS portal',
    eligibility: 'Diploma passed in the last few years (as per the PSU’s notice); not done apprenticeship before',
    selection: 'Merit list on diploma marks → document check (some PSUs hold a test or interview)',
    pay: 'Apprentice stipend for one year',
    where: 'PSU plants and offices across India, including BHEL Haridwar',
    prepare: 'Register on nats.education.gov.in; keep diploma marksheets ready',
    link: 'https://nats.education.gov.in',
    practice: [['HR & Company', 'All'], ['Aptitude', 'All']],
  },
  {
    post: 'Draughtsman / Supervisor posts – Border Roads (GREF)',
    branch: 'Civil',
    conductedBy: 'Border Roads Organisation (GREF centre)',
    eligibility: 'Diploma or certificate as required for each post; physical standards apply',
    selection: 'Written test → trade / skill test → medical',
    pay: 'Central pay level as per post',
    where: 'Border road projects, including Uttarakhand',
    prepare: 'Engineering drawing, surveying, general awareness',
    link: 'https://www.bro.gov.in',
    practice: [['UBTER Syllabus', 'Sem 1 Engineering Graphics-I'], ['UBTER Syllabus', 'Sem 3 Civil Basic Surveying']],
  },
];
