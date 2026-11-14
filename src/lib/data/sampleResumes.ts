// Sample one-page resumes for diploma students. Names and contact details are made up: replace every part with your own.

export interface SampleResume {
  id: string;
  title: string;
  forWhom: string;
  name: string;
  contact: string;
  sections: Array<[heading: string, lines: string[]]>;
}

const COLLEGE = 'Uttarakhand Government Institute of Polytechnic, Tanakpur (UBTER)';

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'cse-fresher',
    title: 'Computer Science – fresher',
    forWhom: 'Final-year CSE student with college projects only',
    name: 'Aman Bisht',
    contact: 'Tanakpur, Champawat · 98XXXXXXXX · aman.bisht@email.com · github.com/your-id',
    sections: [
      ['Career objective', ['Diploma student in Computer Science looking for an IT support or junior developer role where I can use my skills in web development and networking.']],
      ['Education', [`Diploma in Computer Science & Engineering – ${COLLEGE}, 2023–2026, 72% (till 5th semester)`, 'Class 12 (PCM) – Uttarakhand Board, 2023, 68%', 'Class 10 – Uttarakhand Board, 2021, 74%']],
      ['Technical skills', ['Languages: C, Python, HTML, CSS, JavaScript', 'Database: MySQL (queries, joins)', 'Tools: VS Code, Git, MS Excel', 'Networking: IP addressing, LAN setup, basic troubleshooting']],
      ['Projects', ['College notice board website – built with HTML, CSS and JavaScript; students see notices by branch and semester.', 'Student marks system – Python and MySQL program that stores marks and prints a result sheet.']],
      ['Training', ['4-week summer training in web development, [company name], Haldwani – made a product listing page.']],
      ['Achievements', ['Second prize in the college coding quiz, 2025', 'NSS volunteer, 2024']],
      ['Personal details', ['Languages: Hindi, English · Date of birth: [DD-MM-YYYY]']],
    ],
  },
  {
    id: 'cse-internship',
    title: 'Computer Science – with internship',
    forWhom: 'CSE student who has done an internship or apprenticeship',
    name: 'Neha Joshi',
    contact: 'Haldwani · 97XXXXXXXX · neha.joshi@email.com · linkedin.com/in/your-id',
    sections: [
      ['Summary', ['Computer Science diploma holder with 3 months of IT support experience. Comfortable with Windows, networking and helping users quickly.']],
      ['Experience', ['IT Support Intern – [company name], Rudrapur (Jan–Mar 2026)', '• Set up 25 desktop computers and printers for a new office', '• Solved 10–15 user tickets a day: login, email, printer and network issues', '• Kept an Excel record of all hardware and software licences']],
      ['Education', [`Diploma in Computer Science & Engineering – ${COLLEGE}, 2026, 75%`, 'Class 12 – CBSE, 2023, 70%']],
      ['Skills', ['Windows and Linux basics, LAN / Wi-Fi setup, MS Office, Python, SQL', 'Good at explaining things to non-technical people']],
      ['Projects', ['Library management app in Python with a MySQL database (issue, return, fine).']],
      ['Certificates', ['Python Basics (online course), 2025', 'Typing speed: 35 wpm English, 25 wpm Hindi']],
    ],
  },
  {
    id: 'civil-fresher',
    title: 'Civil – fresher',
    forWhom: 'Final-year Civil student looking for a site or drafting job',
    name: 'Rohit Mahar',
    contact: 'Banbasa, Champawat · 96XXXXXXXX · rohit.mahar@email.com',
    sections: [
      ['Career objective', ['Civil diploma student seeking a site supervisor or AutoCAD draftsman role in a construction company.']],
      ['Education', [`Diploma in Civil Engineering – ${COLLEGE}, 2023–2026, 70% (till 5th semester)`, 'Class 12 – Uttarakhand Board, 2023, 65%', 'Class 10 – Uttarakhand Board, 2021, 71%']],
      ['Technical skills', ['AutoCAD 2D drawings (plan, elevation, section)', 'Surveying: dumpy level, theodolite, total station (basic)', 'Estimation and BOQ in MS Excel', 'Concrete tests: slump test, cube test']],
      ['Project', ['Design of a two-room residential building – drawings in AutoCAD, quantity estimate in Excel.']],
      ['Training', ['4-week summer training at PWD Champawat division – checked road work, learnt measurement book entries.']],
      ['Strengths', ['Can work on site for long hours, ready to relocate, honest record keeping.']],
    ],
  },
  {
    id: 'civil-site',
    title: 'Civil – site trainee experience',
    forWhom: 'Civil student who has worked as a trainee or apprentice on site',
    name: 'Pooja Rawat',
    contact: 'Rudrapur · 95XXXXXXXX · pooja.rawat@email.com',
    sections: [
      ['Summary', ['Civil diploma holder with 6 months of site experience on a road project. Knows layout, levelling, quantity checks and daily progress reports.']],
      ['Experience', ['Site Trainee – [contractor name], NH widening project, Kashipur (Jul–Dec 2025)', '• Marked centre line and levels with an auto level for 3 km of road', '• Checked quantities of earthwork and concrete against drawings', '• Wrote daily progress reports and labour records']],
      ['Education', [`Diploma in Civil Engineering – ${COLLEGE}, 2025, 74%`]],
      ['Skills', ['AutoCAD, MS Excel, auto level, total station, bar bending schedule', 'Safety on site: PPE, barricading, toolbox talks']],
      ['Certificates', ['AutoCAD Civil 2D course, 2024', 'NATS apprenticeship certificate, 2025']],
    ],
  },
];

/** "Not this – write this": the most common mistakes in diploma resumes. */
export const RESUME_FIXES: Array<[wrong: string, right: string]> = [
  ['Objective: "To get a job in a reputed company."', 'Objective: "Civil diploma student looking for a site supervisor role where I can use my surveying and AutoCAD skills."'],
  ['Skills: "MS Office, Internet, hard working."', 'Skills: "AutoCAD 2D, MS Excel (estimation), total station" – name real tools you can use.'],
  ['Project: "Made a website."', 'Project: "Built a college notice board website in HTML, CSS and JavaScript; students filter notices by branch."'],
  ['A photo-scanned resume or a WhatsApp image', 'A text PDF or DOCX made in Word / Google Docs, so the software and HR can read it'],
  ['Three pages with father’s occupation, hobbies and a long declaration', 'One page: contact, objective, education, skills, projects, training, achievements'],
  ['Email like "cutepiyu123@…"', 'A simple email with your name: firstname.lastname@…'],
];
