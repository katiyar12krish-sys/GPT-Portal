// Uttarakhand state jobs a diploma holder can try for.
// Vacancies, age limits and pay change in every notification, so always read the latest advertisement.

export interface StateJob {
  post: string;
  branch: 'Civil' | 'CSE' | 'Both';
  departments: string;
  conductedBy: string;
  eligibility: string;
  selection: string;
  prepare: string;
  link: string;
  /** Question bank sections to practise for this post: [section, subject] (subject 'All' = whole section). */
  practice: Array<[string, string]>;
}

export const UTTARAKHAND_JOBS: StateJob[] = [
  {
    post: 'Junior Engineer (Civil)',
    branch: 'Civil',
    departments: 'PWD, Irrigation, Minor Irrigation, Rural Works, Peyjal Nigam, Jal Sansthan',
    conductedBy: 'UKPSC / UKSSSC (as per notification)',
    eligibility: 'Diploma in Civil Engineering, Uttarakhand rules for domicile and age',
    selection: 'Written exam → document verification',
    prepare: 'Civil Technical + Diploma Subjects + Uttarakhand GK + Hindi and English',
    link: 'https://psc.uk.gov.in/',
    practice: [['Civil Technical', 'All'], ['UBTER Syllabus', 'Sem 4 Civil Mechanics of Structures'], ['Uttarakhand GK', 'All']],
  },
  {
    post: 'Technical / Junior Engineer posts in state power companies',
    branch: 'Civil',
    departments: 'UJVN Ltd, UPCL, PTCUL',
    conductedBy: 'UKSSSC or the company itself',
    eligibility: 'Diploma in the notified branch',
    selection: 'Written exam → document verification',
    prepare: 'Civil Technical + Uttarakhand GK',
    link: 'https://sssc.uk.gov.in/',
    practice: [['Civil Technical', 'All'], ['UBTER Syllabus', 'Sem 3 Civil Fluid Mechanics'], ['Uttarakhand GK', 'All']],
  },
  {
    post: 'Draftsman / Surveyor / Map-related posts',
    branch: 'Civil',
    departments: 'PWD, Irrigation, Town Planning, Forest and Revenue (when notified)',
    conductedBy: 'UKSSSC',
    eligibility: 'As notified: usually diploma or ITI in the trade',
    selection: 'Written exam, plus a skill test for some posts',
    prepare: 'Engineering Drawing + Surveying + Uttarakhand GK',
    link: 'https://sssc.uk.gov.in/',
    practice: [['UBTER Syllabus', 'Sem 3 Civil Basic Surveying'], ['UBTER Syllabus', 'Sem 4 Civil Advanced Surveying'], ['Uttarakhand GK', 'All']],
  },
  {
    post: 'Computer Operator / Data Entry posts',
    branch: 'CSE',
    departments: 'Various state departments, secretariat and district offices',
    conductedBy: 'UKSSSC',
    eligibility: 'As notified: computer qualification with typing speed in Hindi and English',
    selection: 'Written exam → typing skill test',
    prepare: 'Computer Fundamentals + Uttarakhand GK + daily typing practice',
    link: 'https://sssc.uk.gov.in/',
    practice: [['UBTER Syllabus', 'Sem 1 Computer Fundamentals'], ['UBTER Syllabus', 'Sem 3 CSE Office Application'], ['Uttarakhand GK', 'All']],
  },
  {
    post: 'Lab / Technical Assistant in polytechnics and state institutions',
    branch: 'Both',
    departments: 'Technical Education and other state departments',
    conductedBy: 'UKSSSC',
    eligibility: 'Diploma in the relevant branch',
    selection: 'Written exam → document verification',
    prepare: 'Your branch subjects + Uttarakhand GK',
    link: 'https://sssc.uk.gov.in/',
    practice: [['Diploma Subjects', 'All'], ['Reasoning', 'All'], ['Uttarakhand GK', 'All']],
  },
  {
    post: 'Apprenticeship in state and central units in Uttarakhand',
    branch: 'Both',
    departments: 'BHEL Haridwar, THDC, ONGC Dehradun, NHPC Tanakpur and others',
    conductedBy: 'Each unit, through the NATS portal',
    eligibility: 'Diploma passed in the last few years; check each advertisement',
    selection: 'Merit in diploma, then document check or interview',
    prepare: 'Keep marksheets and your NATS registration ready',
    link: 'https://nats.education.gov.in/',
    practice: [['Aptitude', 'All'], ['English', 'All'], ['HR & Company', 'All']],
  },
];
