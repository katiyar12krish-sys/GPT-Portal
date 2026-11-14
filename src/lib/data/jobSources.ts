/**
 * Where diploma jobs are published, for Job House:
 * - JOB_SITES: official recruitment websites (Uttarakhand govt, central govt, PSUs, apprenticeship) and private job portals.
 *   Links checked in November 2026; a few government sites answer slowly from outside India but are the official addresses.
 * - SEARCH_ROLES / SEARCH_PLACES / searchLinks(): ready-made searches on job portals, so a student always sees TODAY's openings
 *   for a role and city (the portal itself keeps them up to date – nothing is copied into this project).
 * To add a site: add a row to JOB_SITES. To add a role or city: add it to SEARCH_ROLES / SEARCH_PLACES.
 */

export type SiteGroup = 'Uttarakhand government' | 'Central government' | 'PSU careers' | 'Apprenticeship & internships' | 'Private job portals';
export interface JobSite {
  name: string;
  url: string;
  group: SiteGroup;
  branch: 'CSE' | 'Civil' | 'Both';
  what: string;
}

export const JOB_SITES: JobSite[] = [
  // Uttarakhand government
  { name: 'UKSSSC', url: 'https://sssc.uk.gov.in/', group: 'Uttarakhand government', branch: 'Both', what: 'Junior Engineer, technician, computer operator and other state posts' },
  { name: 'UKPSC', url: 'https://psc.uk.gov.in/', group: 'Uttarakhand government', branch: 'Both', what: 'State Junior Engineer (combined) and other commission exams' },
  { name: 'Uttarakhand PWD', url: 'https://pwd.uk.gov.in/', group: 'Uttarakhand government', branch: 'Civil', what: 'Road and building works; JE posts filled through UKSSSC / UKPSC' },
  { name: 'UJVN Ltd', url: 'https://www.ujvnl.com/', group: 'Uttarakhand government', branch: 'Both', what: 'Hydro power corporation – JE, technician and apprentice notices' },
  { name: 'UPCL', url: 'https://www.upcl.org/', group: 'Uttarakhand government', branch: 'Both', what: 'Power distribution – JE (IT / civil) and apprentice notices' },
  { name: 'PTCUL', url: 'https://www.ptcul.org/', group: 'Uttarakhand government', branch: 'Civil', what: 'Power transmission – JE (civil) and apprentice notices' },
  { name: 'ITDA Uttarakhand', url: 'https://itda.uk.gov.in/', group: 'Uttarakhand government', branch: 'CSE', what: 'State IT department – IT projects and contract posts' },
  // Central government
  { name: 'SSC', url: 'https://ssc.gov.in/', group: 'Central government', branch: 'Both', what: 'SSC JE (civil), CHSL, MTS and other central exams' },
  { name: 'RRB (Railways)', url: 'https://www.rrbapply.gov.in/', group: 'Central government', branch: 'Both', what: 'RRB JE (civil / IT), technician and other railway posts' },
  { name: 'National Career Service', url: 'https://www.ncs.gov.in/', group: 'Central government', branch: 'Both', what: 'Government job portal with private and government openings, job fairs' },
  { name: 'ISRO', url: 'https://www.isro.gov.in/', group: 'Central government', branch: 'Both', what: 'Technical Assistant and technician posts (Careers section)' },
  { name: 'DRDO', url: 'https://www.drdo.gov.in/', group: 'Central government', branch: 'Both', what: 'Senior Technical Assistant-B (CEPTAM) and apprentices' },
  { name: 'Border Roads Organisation', url: 'https://www.bro.gov.in/', group: 'Central government', branch: 'Civil', what: 'GREF posts – draughtsman, supervisor and others' },
  { name: 'CPWD', url: 'https://cpwd.gov.in/', group: 'Central government', branch: 'Civil', what: 'Central public works; JE posts through SSC' },
  { name: 'MES', url: 'https://mes.gov.in/', group: 'Central government', branch: 'Civil', what: 'Military Engineer Services – works and JE notices' },
  { name: 'NHAI', url: 'https://nhai.gov.in/', group: 'Central government', branch: 'Civil', what: 'National highways – vacancies and contractor projects' },
  { name: 'Delhi Metro (DMRC)', url: 'https://www.delhimetrorail.com/', group: 'Central government', branch: 'Both', what: 'JE, maintainer and other metro posts' },
  { name: 'Noida Metro (NMRC)', url: 'https://www.nmrcnoida.com/', group: 'Central government', branch: 'Both', what: 'Metro posts in Noida / Greater Noida' },
  // PSU careers
  { name: 'THDC India', url: 'https://www.thdc.co.in/', group: 'PSU careers', branch: 'Both', what: 'Hydro PSU in Uttarakhand – diploma trainees and apprentices' },
  { name: 'NHPC', url: 'https://www.nhpcindia.com/', group: 'PSU careers', branch: 'Both', what: 'Hydro PSU – JE / trainee and apprentice notices' },
  { name: 'NTPC', url: 'https://ntpc.co.in/', group: 'PSU careers', branch: 'Both', what: 'Diploma trainees and apprentices' },
  { name: 'SJVN', url: 'https://sjvn.nic.in/', group: 'PSU careers', branch: 'Both', what: 'Hydro PSU – field engineer / apprentice notices' },
  { name: 'POWERGRID', url: 'https://www.powergrid.in/', group: 'PSU careers', branch: 'Both', what: 'Diploma trainees (civil) and apprentices' },
  { name: 'BHEL', url: 'https://www.bhel.com/', group: 'PSU careers', branch: 'Both', what: 'Haridwar unit – apprentices and supervisor trainees' },
  { name: 'ONGC', url: 'https://ongcindia.com/', group: 'PSU careers', branch: 'Both', what: 'Dehradun HQ – apprentices (civil / computer)' },
  { name: 'IOCL', url: 'https://iocl.com/', group: 'PSU careers', branch: 'Both', what: 'Technician and graduate / diploma apprentices' },
  { name: 'BEL', url: 'https://bel-india.in/', group: 'PSU careers', branch: 'CSE', what: 'Technician and apprentice posts (electronics / computer)' },
  { name: 'HAL', url: 'https://hal-india.co.in/', group: 'PSU careers', branch: 'CSE', what: 'Diploma technician and apprentice posts' },
  { name: 'ECIL', url: 'https://www.ecil.co.in/', group: 'PSU careers', branch: 'CSE', what: 'Technical officer (contract) and apprentice posts' },
  // Apprenticeship & internships
  { name: 'NATS (diploma apprentices)', url: 'https://nats.education.gov.in/', group: 'Apprenticeship & internships', branch: 'Both', what: 'Register once; apply to PSU and company apprenticeships with stipend' },
  { name: 'Apprenticeship India (NAPS)', url: 'https://www.apprenticeshipindia.gov.in/', group: 'Apprenticeship & internships', branch: 'Both', what: 'Apprenticeships in companies under NAPS' },
  { name: 'PM Internship Scheme', url: 'https://pminternship.mca.gov.in/', group: 'Apprenticeship & internships', branch: 'Both', what: '12-month paid internships in top companies (check eligibility)' },
  { name: 'Skill India Digital Hub', url: 'https://www.skillindiadigital.gov.in/', group: 'Apprenticeship & internships', branch: 'Both', what: 'Free courses, certificates and job links' },
  { name: 'Internshala', url: 'https://internshala.com/', group: 'Apprenticeship & internships', branch: 'Both', what: 'Internships and fresher jobs' },
  // Private job portals
  { name: 'Naukri', url: 'https://www.naukri.com/', group: 'Private job portals', branch: 'Both', what: 'Largest Indian job portal' },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', group: 'Private job portals', branch: 'Both', what: 'Company jobs; keep your profile complete' },
  { name: 'Indeed', url: 'https://in.indeed.com/', group: 'Private job portals', branch: 'Both', what: 'Jobs collected from many company sites' },
  { name: 'foundit (Monster)', url: 'https://www.foundit.in/', group: 'Private job portals', branch: 'Both', what: 'Fresher and experienced jobs' },
  { name: 'Shine', url: 'https://www.shine.com/', group: 'Private job portals', branch: 'Both', what: 'Fresher and diploma jobs' },
  { name: 'Apna', url: 'https://apna.co/', group: 'Private job portals', branch: 'Both', what: 'Local jobs by city, many for diploma holders' },
  { name: 'WorkIndia', url: 'https://www.workindia.in/', group: 'Private job portals', branch: 'Both', what: 'Local jobs: operators, technicians, supervisors' },
];

export const SITE_GROUPS: SiteGroup[] = ['Uttarakhand government', 'Central government', 'PSU careers', 'Apprenticeship & internships', 'Private job portals'];

/** Roles diploma holders are hired for; each becomes a search on the portals below. */
export const SEARCH_ROLES: Record<'CSE' | 'Civil', string[]> = {
  CSE: ['Diploma computer science fresher', 'IT support engineer', 'Desktop support engineer', 'Network engineer fresher', 'Hardware and networking', 'Junior web developer', 'Computer operator', 'Data entry operator', 'Technical support executive', 'CCTV technician'],
  Civil: ['Diploma civil engineer fresher', 'Site supervisor civil', 'Junior engineer civil', 'AutoCAD draftsman civil', 'Surveyor total station', 'Quantity surveyor', 'Billing engineer civil', 'Material testing lab technician', 'Highway site engineer', 'Civil site engineer'],
};
export const SEARCH_PLACES = ['Uttarakhand', 'Dehradun', 'Haridwar', 'Rudrapur', 'Haldwani', 'Delhi', 'Noida', 'India'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const enc = encodeURIComponent;

/** Ready-made searches: each opens the portal's own, always-current results for the role and place. */
export function searchLinks(role: string, place: string): Array<{ portal: string; url: string }> {
  const anywhere = place === 'India';
  return [
    { portal: 'Naukri', url: anywhere ? `https://www.naukri.com/${slug(role)}-jobs` : `https://www.naukri.com/${slug(role)}-jobs-in-${slug(place)}` },
    { portal: 'LinkedIn', url: `https://www.linkedin.com/jobs/search/?keywords=${enc(role)}&location=${enc(anywhere ? 'India' : place)}` },
    { portal: 'Indeed', url: `https://in.indeed.com/jobs?q=${enc(role)}&l=${enc(anywhere ? '' : place)}` },
    { portal: 'foundit', url: `https://www.foundit.in/srp/results?query=${enc(role)}${anywhere ? '' : `&locations=${enc(place)}`}` },
    { portal: 'Shine', url: anywhere ? `https://www.shine.com/job-search/${slug(role)}-jobs` : `https://www.shine.com/job-search/${slug(role)}-jobs-in-${slug(place)}` },
    { portal: 'Google Jobs', url: `https://www.google.com/search?q=${enc(`${role} jobs ${anywhere ? 'India' : place}`)}&ibp=htl;jobs` },
  ];
}
