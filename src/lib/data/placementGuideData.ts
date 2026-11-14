/**
 * Text of the Placement Guidance and Salary Guide pages (src/components/placement/hub/PlacementGuideTab.tsx).
 * Kept here, apart from the screen, so it is easy to update every year and is included in the data export.
 * Pay figures are indicative starting ranges for diploma freshers; the offer letter or official notification is final.
 */
export type Band = [role: string, pay: string, employers: string];

export const SALARY_CSE: Band[] = [
  ['IT / desktop support engineer', '₹12,000 – 20,000 / month', 'HCLTech, Sysnet, Coforge, IT staffing partners in Dehradun & Noida'],
  ['Network support / NOC trainee', '₹14,000 – 22,000 / month', 'ISPs, data centres, system integrators (Noida, Delhi)'],
  ['Junior web developer / tester', '₹12,000 – 25,000 / month', 'Software firms in Dehradun, Noida, Delhi'],
  ['Data entry / back office (computer)', '₹10,000 – 15,000 / month', 'Banks’ vendors, hospitals, government projects on contract'],
  ['CCTV / hardware technician', '₹12,000 – 18,000 / month', 'Security & electronics companies'],
];

export const SALARY_CIVIL: Band[] = [
  ['Site supervisor / junior engineer (private)', '₹15,000 – 25,000 / month', 'L&T, Tata Projects, Shapoorji, NCC, road and hydro contractors'],
  ['AutoCAD draftsman', '₹12,000 – 20,000 / month', 'Architects, consultancies, PMC firms'],
  ['Surveyor (total station / GPS)', '₹14,000 – 22,000 / month', 'Survey agencies, highway and railway contractors'],
  ['QS / billing engineer', '₹15,000 – 25,000 / month', 'Contractors and real-estate developers'],
  ['Lab / quality-control technician', '₹12,000 – 18,000 / month', 'Material testing labs, ready-mix concrete plants'],
];

export const SALARY_COMMON: Band[] = [
  ['Manufacturing trainee (production / maintenance / QC)', '₹14,000 – 22,000 / month', 'Tata Motors, Bajaj, Hero, Maruti and SIDCUL plants (Haridwar, Pantnagar)'],
  ['Apprentice (NATS) – PSU or large company', 'Stipend about ₹8,000+ / month (check the NATS portal)', 'BHEL, ONGC, THDC, NTPC, NHPC, HAL'],
];

export const GOVT_PAY: Band[] = [
  ['Central JE (SSC JE, RRB JE, CPWD, MES)', 'Pay Level 6: basic ₹35,400 + DA + HRA + TA', 'Staff Selection Commission, Railway Recruitment Boards'],
  ['Uttarakhand JE (PWD, Irrigation, Jal Nigam, RWD)', 'Pay Level 7: basic ₹44,900 + DA + HRA', 'UKPSC / UKSSSC (check each notification)'],
  ['PSU diploma trainee / technician', 'About ₹25,000 – 40,000 / month during training', 'NTPC, THDC, NHPC, BHEL, ISRO, DRDO'],
  ['Technician / lab assistant (state)', 'Pay level as per notification', 'UKSSSC, technical education and health departments'],
];

export const GROWTH: Array<[string, string, string]> = [
  ['First job (0–1 year)', '₹12,000 – 25,000', 'Learn on the job, finish probation, get one certificate.'],
  ['After 2 years', '₹20,000 – 35,000', 'Change of role (e.g. supervisor → site engineer) or a better company.'],
  ['After 5 years', '₹30,000 – 55,000', 'Senior / in-charge roles. A B.Tech (lateral entry) or AMIE adds more.'],
];

export const TERMS: Array<[string, string]> = [
  ['CTC (cost to company)', 'Everything the company spends on you in a year, including its own PF share. It is not what reaches your bank.'],
  ['Gross salary', 'Monthly pay before your deductions: basic + HRA + allowances.'],
  ['In-hand / net salary', 'What reaches your bank account after PF, ESI and other deductions.'],
  ['PF (provident fund)', '12% of basic is cut from your pay and the company adds the same. It is your savings, withdrawable later.'],
  ['ESI', 'If gross pay is ₹21,000 a month or less, 0.75% is cut for free medical cover for you and your family.'],
  ['DA, HRA, TA (government)', 'Dearness, house-rent and travel allowances added on top of the basic pay in government jobs.'],
  ['Probation and bond', 'Probation is a trial period (3–12 months). A bond is a promise to stay for a time – read the amount before signing.'],
];

export const STEPS: Array<[string, string]> = [
  ['Pre-placement talk', 'Company explains role, salary, location and bond. Note these down – ask questions at the end.'],
  ['Aptitude / written test', 'Quant, reasoning, English and basic technical MCQs (30–60 min). Practise in Placement Q&A.'],
  ['Group discussion (some companies)', 'Speak early, give one clear point with an example, let others speak.'],
  ['Technical interview', 'Your branch basics + your project. Explain what YOU did. Be honest about what you don\'t know.'],
  ['HR interview', 'About you, why this company, relocation / shifts, salary expectation. Practise in Mock Interview.'],
  ['Offer letter', 'Check role, CTC, in-hand pay, location, joining date, probation and bond before accepting.'],
  ['Joining formalities', 'Documents, medical test, background verification, bank account and PF/UAN.'],
];

export const AFTER_JOINING: Array<[string, string]> = [
  ['Probation (3–12 months)', 'You are confirmed only if your supervisor rates you satisfactory. Never skip days without informing.'],
  ['What is measured', 'Attendance & punctuality, quality of work (no rework / defects), safety record, targets met, learning new skills, team behaviour.'],
  ['Appraisal', 'Usually once a year: you get a rating (e.g. 1–5). Increment and promotion depend on this rating.'],
  ['How to grow faster', 'Get one certification a year (AutoCAD / Revit / CCNA / Python), keep a work diary of what you did, and take ownership of small tasks.'],
];

// How to judge an offer: a good first job after diploma is about learning, stability and honest pay, not only the CTC figure.
export const GOOD_JOB: Array<[string, string]> = [
  ['Matches your diploma', 'The role uses your branch: site, drawing, survey, QS for Civil; IT support, networking, testing, coding for CSE.'],
  ['Honest pay', 'Offer letter shows CTC and in-hand pay, PF and ESI. See the Salary Guide for usual starting pay.'],
  ['Learning', 'You get training, a senior to learn from and a chance to earn a certificate (AutoCAD, Revit, CCNA, Python).'],
  ['Stability', 'A registered company or a government / PSU unit, with probation and leave rules in writing.'],
  ['Safe and fair', 'Safety gear on site, fixed working hours or paid overtime, no money asked from you.'],
  ['Growth', 'Clear path: trainee → junior engineer → engineer, or room to study further (B.Tech lateral entry, AMIE).'],
];

export const DOCUMENTS = [
  'Diploma certificate and all semester marksheets (UBTER), with no active backlog',
  'High school and intermediate marksheets',
  'Aadhaar, PAN card and a bank account in your own name',
  'Domicile and category certificates for Uttarakhand government jobs',
  'Character certificate from the institute and passport-size photos',
  'One-page resume, training / internship certificates and skill certificates',
  'Registration on the NATS portal for apprenticeship',
];

export const RED_FLAGS = [
  'Any company asking money for “registration”, “training kit” or “security deposit” to give a job.',
  'Offer letter from a Gmail / Yahoo address or without company letterhead and HR contact.',
  'Interview over chat only, or a job promising very high pay for no skills.',
  'Ask the TPO before paying or signing anything you don\'t understand.',
];
