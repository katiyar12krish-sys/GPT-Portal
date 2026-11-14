// UGIP Tanakpur – official placement records 2021-22 → 2025-26
// Source: placement_details_2026_charts.xlsx (college TPO sheets) + PLACEMENT_CLUB_2025.docx

export interface YearBranchStat {
  year: string;
  branch: 'CSE' | 'Civil';
  total: number;
  placed: number;
  higherEdu: number;
  notPlaced: number;
  placementPct: number;
  /** Annual ₹. The 2025-26 sheet wrongly multiplied annual pay by 12 again (₹27.36 L); corrected to ₹2.28 L / ₹2.88 L. */
  maxAnnual: number;
  minAnnual: number;
}

export const YEAR_BRANCH_STATS: YearBranchStat[] = [
  { year: '2021-22', branch: 'CSE',   total: 11, placed: 7,  higherEdu: 2, notPlaced: 2, placementPct: 63.6, maxAnnual: 180000,  minAnnual: 120000 },
  { year: '2021-22', branch: 'Civil', total: 16, placed: 6,  higherEdu: 6, notPlaced: 4, placementPct: 37.5, maxAnnual: 144000,  minAnnual: 144000 },
  { year: '2022-23', branch: 'CSE',   total: 8,  placed: 2,  higherEdu: 3, notPlaced: 3, placementPct: 25.0, maxAnnual: 180000,  minAnnual: 180000 },
  { year: '2022-23', branch: 'Civil', total: 15, placed: 6,  higherEdu: 6, notPlaced: 3, placementPct: 40.0, maxAnnual: 204000,  minAnnual: 108000 },
  { year: '2023-24', branch: 'CSE',   total: 16, placed: 11, higherEdu: 5, notPlaced: 0, placementPct: 68.8, maxAnnual: 300000,  minAnnual: 120000 },
  { year: '2023-24', branch: 'Civil', total: 17, placed: 7,  higherEdu: 3, notPlaced: 7, placementPct: 41.2, maxAnnual: 288000,  minAnnual: 180000 },
  { year: '2024-25', branch: 'CSE',   total: 21, placed: 17, higherEdu: 0, notPlaced: 4, placementPct: 81.0, maxAnnual: 360000,  minAnnual: 162000 },
  { year: '2024-25', branch: 'Civil', total: 18, placed: 9,  higherEdu: 0, notPlaced: 9, placementPct: 50.0, maxAnnual: 300000,  minAnnual: 192000 },
  { year: '2025-26', branch: 'CSE',   total: 29, placed: 28, higherEdu: 0, notPlaced: 1, placementPct: 96.6, maxAnnual: 228000,  minAnnual: 168000 },
  { year: '2025-26', branch: 'Civil', total: 24, placed: 20, higherEdu: 0, notPlaced: 4, placementPct: 83.3, maxAnnual: 288000,  minAnnual: 180000 },
];

export const PLACEMENT_YEARS = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];

export interface CampusRecruiterRecord {
  year: string;
  branch: 'CSE' | 'Civil';
  company: string;
  location?: string;
  students: number | null;
  pay: string;
}

// Company-wise campus placement log, exactly as in the TPO sheets (spelling cleaned up).
export const CAMPUS_RECRUITER_LOG: CampusRecruiterRecord[] = [
  // 2021-22 CSE
  { year: '2021-22', branch: 'CSE', company: 'Schneider Electric', location: 'Pantnagar', students: 4, pay: '₹10,000/mo' },
  { year: '2021-22', branch: 'CSE', company: 'Airtel', location: 'Dehradun', students: 1, pay: '₹12,000/mo' },
  { year: '2021-22', branch: 'CSE', company: 'F Techiz Solutions Pvt. Ltd.', location: 'Dehradun', students: 1, pay: '₹15,000/mo' },
  { year: '2021-22', branch: 'CSE', company: 'VVDN Technologies', location: 'Gurugram', students: 1, pay: '₹14,000/mo' },
  // 2021-22 Civil
  { year: '2021-22', branch: 'Civil', company: 'Lohar Pvt. Ltd.', location: 'Kashipur', students: 1, pay: '₹12,000/mo' },
  // 2022-23 CSE
  { year: '2022-23', branch: 'CSE', company: 'F Tech Solutions Pvt. Ltd.', location: 'Dehradun', students: 2, pay: '₹15,000/mo' },
  // 2022-23 Civil
  { year: '2022-23', branch: 'Civil', company: 'Bajaj', location: 'Pantnagar', students: 3, pay: '₹12,000/mo' },
  { year: '2022-23', branch: 'Civil', company: 'Anchor (Panasonic)', location: 'Haridwar', students: 1, pay: '₹12,000/mo' },
  { year: '2022-23', branch: 'Civil', company: 'Devbhumi', location: 'Rudrapur', students: 1, pay: '₹9,000/mo' },
  { year: '2022-23', branch: 'Civil', company: 'Cozent Pvt. Ltd.', location: 'Bareilly', students: 1, pay: '₹17,000/mo' },
  // 2023-24 CSE
  { year: '2023-24', branch: 'CSE', company: 'BPO Process (Shipracket)', location: 'Noida Sec-45', students: 1, pay: '₹17,000/mo' },
  { year: '2023-24', branch: 'CSE', company: 'Digital Training Lab', students: 3, pay: '₹18,000/mo' },
  { year: '2023-24', branch: 'CSE', company: 'VVDN Technologies', students: 1, pay: '₹14,500/mo' },
  { year: '2023-24', branch: 'CSE', company: 'BPO', location: 'Noida Sec-45', students: 1, pay: '₹15,000/mo' },
  { year: '2023-24', branch: 'CSE', company: 'Channel Play Ltd.', students: 1, pay: '₹17,000/mo' },
  { year: '2023-24', branch: 'CSE', company: 'Self-employment', students: 4, pay: '₹10,000–₹25,000/mo' },
  // 2023-24 Civil
  { year: '2023-24', branch: 'Civil', company: 'Railways (Pantry Staff)', students: 1, pay: '₹15,000/mo' },
  { year: '2023-24', branch: 'Civil', company: 'Lohar Engineering', location: 'Kashipur', students: 2, pay: '₹15,000/mo' },
  { year: '2023-24', branch: 'Civil', company: 'Nerolac', location: 'Haldwani', students: 1, pay: '₹24,000/mo' },
  { year: '2023-24', branch: 'Civil', company: 'Family construction contracting', students: 1, pay: '₹15,000/mo' },
  { year: '2023-24', branch: 'Civil', company: 'Tourism (Champawat)', students: 1, pay: '₹15,000/mo' },
  { year: '2023-24', branch: 'Civil', company: 'Railways Construction', students: 1, pay: '₹15,000/mo' },
  // 2024-25 CSE
  { year: '2024-25', branch: 'CSE', company: 'Dixon Technologies', students: 11, pay: '₹15,000/mo' },
  { year: '2024-25', branch: 'CSE', company: 'Zanthium Technosoft', students: 1, pay: '₹30,000/mo' },
  { year: '2024-25', branch: 'CSE', company: 'Prakash Pipes Ltd.', location: 'Kashipur', students: 1, pay: '₹22,000/mo' },
  { year: '2024-25', branch: 'CSE', company: 'Skillzdisk Pvt. Ltd.', location: 'Pantnagar', students: 1, pay: '₹23,000/mo' },
  { year: '2024-25', branch: 'CSE', company: 'LabourNet Services India Pvt. Ltd.', students: 1, pay: '₹25,000/mo' },
  { year: '2024-25', branch: 'CSE', company: 'Dedrecarb Pvt. Ltd.', location: 'Noida', students: 1, pay: '₹13,500/mo' },
  // 2024-25 Civil
  { year: '2024-25', branch: 'Civil', company: 'Sankei Gikken India Pvt. Ltd.', students: 2, pay: '₹19,000/mo' },
  { year: '2024-25', branch: 'Civil', company: 'V-Guard Consumer Products Ltd.', students: 2, pay: '₹16,000/mo' },
  { year: '2024-25', branch: 'Civil', company: 'Skillzdisk Pvt. Ltd.', location: 'Pantnagar', students: 3, pay: '₹23,000/mo' },
  { year: '2024-25', branch: 'Civil', company: 'LabourNet Services India', students: 1, pay: '₹25,000/mo' },
  { year: '2024-25', branch: 'Civil', company: 'Agniveer Selection', students: 1, pay: 'As per Agniveer scheme' },
  // 2025-26 CSE
  { year: '2025-26', branch: 'CSE', company: 'KP Reliable Technique India Pvt. Ltd.', students: 23, pay: '₹2.28 LPA' },
  { year: '2025-26', branch: 'CSE', company: 'VVDN Technologies', students: 22, pay: '₹1.80 LPA' },
  { year: '2025-26', branch: 'CSE', company: 'Advik Hi-Tech', students: 16, pay: '₹2.16 LPA' },
  { year: '2025-26', branch: 'CSE', company: 'Huhtamaki Paper Products Ltd.', students: 3, pay: '₹2.16 LPA' },
  { year: '2025-26', branch: 'CSE', company: 'Hanon Climate Systems', location: 'Bhiwandi', students: 1, pay: '₹2.00 LPA' },
  { year: '2025-26', branch: 'CSE', company: 'Bajaj Auto Ltd.', location: 'Pantnagar', students: 3, pay: '₹1.68 LPA' },
  // 2025-26 Civil
  { year: '2025-26', branch: 'Civil', company: 'Hanon Climate Systems', location: 'Bhiwandi', students: 16, pay: '₹2.00 LPA' },
  { year: '2025-26', branch: 'Civil', company: 'Quality Testing & Research Centre', students: 2, pay: '₹1.80 LPA' },
  { year: '2025-26', branch: 'Civil', company: 'TVS', students: 3, pay: '₹2.88 LPA' },
  { year: '2025-26', branch: 'Civil', company: 'KP Reliable Technique India Pvt. Ltd.', students: 18, pay: '₹2.28 LPA' },
];

// Note: for 2025-26 the college sheet lists the same company under several branches with the
// "students" column representing offers; one student can hold more than one offer, which is why
// company counts are higher than the number of placed students.

// ---------------------------------------------------------------------------
// Placement Club master plan (PLACEMENT_CLUB_2025.docx) – condensed for the portal
// ---------------------------------------------------------------------------
export interface PlacementClubPhase {
  phase: string;
  months: string;
  actions: string[];
}

export const PLACEMENT_CLUB_PLAN = {
  vision:
    'Bridge the gap between students and their dream careers through a structured system for internships and job placements, skill development, industry relations and alumni engagement.',
  committees: [
    { name: 'Training & Development', focus: 'Skill-building workshops, mock interviews, GD practice' },
    { name: 'Industry Relations', focus: 'Company partnerships, placement drives, MoUs, industrial visits' },
    { name: 'Alumni Connect', focus: 'Mentorship and job referrals from alumni' },
    { name: 'Publicity & Outreach', focus: 'Events, notices and social-media presence' },
  ],
  phases: [
    { phase: 'Phase 1 – Foundation', months: 'Months 1-3', actions: ['Form core team & committees', 'Identify industry partners and alumni networks', 'Student orientation session'] },
    { phase: 'Phase 2 – Skill Building', months: 'Months 4-6', actions: ['Workshops & training sessions', 'Launch centralised resource hub'] },
    { phase: 'Phase 3 – Industry Integration', months: 'Months 7-9', actions: ['First placement drive', 'Industrial visits & alumni webinars'] },
    { phase: 'Phase 4 – Evaluation & Expansion', months: 'Months 10-12', actions: ['Collect stakeholder feedback', 'Expand collaborations and training'] },
  ] as PlacementClubPhase[],
  metrics: [
    '% of students placed in core and allied sectors',
    'Growth in number of companies in placement drives',
    'Positive feedback from recruiters and students',
    'Increase in average salary package offered',
  ],
  targetCompanies: ['Infosys', 'TCS', 'Wipro', 'HCL Technologies', 'Larsen & Toubro (L&T)'],
};

// Placement-focused resources that complement the Academic Resource Library
export interface PlacementResource {
  id: string;
  title: string;
  type: 'Aptitude' | 'Resume & Interview' | 'Technical Prep' | 'Govt Exam' | 'Online Course' | 'Portal';
  branch: 'Civil' | 'CSE' | 'Common';
  description: string;
  url: string;
}

export const PLACEMENT_RESOURCES: PlacementResource[] = [
  { id: 'pr-01', title: 'NATS – National Apprenticeship Training Scheme', type: 'Portal', branch: 'Common', description: 'Register for apprenticeships at BHEL, Bajaj, Tata, Maruti vendors and PSUs. Diploma apprenticeship is a recognised experience.', url: 'https://nats.education.gov.in' },
  { id: 'pr-02', title: 'National Career Service (NCS) Portal', type: 'Portal', branch: 'Common', description: 'Government job portal with free job fairs, career counselling and Uttarakhand/Delhi vacancies.', url: 'https://www.ncs.gov.in' },
  { id: 'pr-03', title: 'Employment News / Rozgar Samachar', type: 'Govt Exam', branch: 'Common', description: 'Weekly government vacancy notifications – check for JE, Technician and Apprentice posts.', url: 'https://www.employmentnews.gov.in' },
  { id: 'pr-04', title: 'UKPSC – Uttarakhand Public Service Commission', type: 'Govt Exam', branch: 'Civil', description: 'Junior Engineer and other state-level technical posts in Uttarakhand.', url: 'https://psc.uk.gov.in' },
  { id: 'pr-05', title: 'UKSSSC – Subordinate Service Selection Commission', type: 'Govt Exam', branch: 'Common', description: 'Group-C technical and junior posts in Uttarakhand departments.', url: 'https://sssc.uk.gov.in' },
  { id: 'pr-06', title: 'SSC JE – Staff Selection Commission', type: 'Govt Exam', branch: 'Civil', description: 'Central government Junior Engineer (Civil) exam for CPWD, MES, CWC, BRO etc.', url: 'https://ssc.gov.in' },
  { id: 'pr-07', title: 'RRB JE / Technician – Indian Railways', type: 'Govt Exam', branch: 'Common', description: 'Railway Junior Engineer and Technician recruitment by Railway Recruitment Boards.', url: 'https://www.rrbcdg.gov.in' },
  { id: 'pr-08', title: 'freeCodeCamp – Web & Programming', type: 'Online Course', branch: 'CSE', description: 'Free full-length courses on HTML/CSS/JavaScript, Python and databases with certificates.', url: 'https://www.freecodecamp.org' },
  { id: 'pr-09', title: 'NPTEL – Free IIT Courses', type: 'Online Course', branch: 'Common', description: 'Free engineering video lectures and certification exams from IITs and IISc.', url: 'https://nptel.ac.in' },
  { id: 'pr-10', title: 'SWAYAM – Government MOOC Platform', type: 'Online Course', branch: 'Common', description: 'Free MOOCs with credit-transfer options approved by AICTE/UGC.', url: 'https://swayam.gov.in' },
  { id: 'pr-11', title: 'Coursera / LinkedIn Learning (Placement Club plan)', type: 'Online Course', branch: 'Common', description: 'Planned subscription in the Placement Club master plan – ask the TPO about student access.', url: 'https://www.coursera.org' },
  { id: 'pr-12', title: 'IndiaBix – Aptitude Practice', type: 'Aptitude', branch: 'Common', description: 'Quantitative aptitude, reasoning and verbal ability practice for company tests.', url: 'https://www.indiabix.com' },
  { id: 'pr-13', title: 'Resume + ATS Checklist (use the Resume Hub tab)', type: 'Resume & Interview', branch: 'Common', description: 'One-page resume, action-verb bullets, projects with outcomes, GitHub/LinkedIn links. Build it inside the portal Resume Hub.', url: '#resume' },
  { id: 'pr-14', title: 'AutoCAD / STAAD.Pro / Revit Basics', type: 'Technical Prep', branch: 'Civil', description: 'Core design software that civil recruiters ask about in interviews. Practise with student-version software and tutorials.', url: 'https://www.autodesk.com/education' },
  { id: 'pr-15', title: 'SQL, DSA and Git Practice', type: 'Technical Prep', branch: 'CSE', description: 'LeetCode Easy, HackerRank SQL and Git basics are enough for most diploma-level interviews.', url: 'https://www.hackerrank.com' },
];
