import { NextRequest, NextResponse } from 'next/server';

interface StudentCareerRequest {
  studentName?: string;
  branch?: string;
  currentYear?: string;
  cgpa?: number;
  category?: string;
}

/** Career guidance after a diploma, based on the student's branch and marks. */
export async function POST(req: NextRequest) {
  const { studentName = 'Student', branch = 'Computer Science & Engineering', currentYear = '3rd Year', cgpa = 0, category = 'General' }: StudentCareerRequest = await req.json();
  const civil = branch.includes('Civil');

  const mentorAdvice = `
### Career plan for ${studentName} (${civil ? 'Civil' : 'CSE'})
${cgpa ? `${cgpa} CGPA` : 'Marks not entered'} | ${currentYear} | Category: ${category}

---

#### 1. Private job after diploma
* **Skills to build**: ${
    civil
      ? 'AutoCAD, site measurement, BBS, estimation and billing, levelling and total station.'
      : 'Computer hardware and networking, Windows and Linux support, SQL basics, HTML/CSS and one programming language.'
  }
* **Companies that hire diploma holders**: ${
    civil
      ? 'L&T (DET), Tata Projects, Shapoorji Pallonji, NCC, Dilip Buildcon, local contractors.'
      : 'HCLTech, Sysnet Global, Raygain, Dixon, VVDN, Airtel, SIDCUL plants (IT support).'
  }
* **Realistic start**: ${civil ? '₹15,000 – 25,000' : '₹12,000 – 22,000'} per month. Pay usually rises after 2 years of experience.

---

#### 2. Government job after diploma
* **Uttarakhand**: UKSSSC and UKPSC Junior Engineer, PWD, Jal Sansthan, Pey Jal Nigam, UPCL, UJVN Ltd, Forest and Revenue technical posts when notified.
* **Central**: ${civil ? 'SSC JE, RRB JE, MES, BRO.' : 'RRB JE (IT), DRDO CEPTAM, ISRO Technical Assistant, DMRC.'}
* Practise in the portal: Placement Q&A → Diploma Subjects and Uttarakhand GK.
* Results and notices: [SSC](https://ssc.gov.in/) · [UBTER Student Login](https://ubterex.in/student_login)

---

#### 3. Apprenticeship
Register on [NATS](https://nats.education.gov.in/). One year of paid training at BHEL, ONGC, THDC, NTPC or a big private company counts as real experience.

---

#### 4. Further study
B.Tech lateral entry joins you directly in the 2nd year. Check the current Uttarakhand counselling notice for dates and eligibility.

---

#### 5. Next 30 days
1. Upload your resume and fix what the analysis shows.
2. Finish 10 questions a day in Placement Q&A.
3. Do one voice mock interview a week.
4. Book a panel interview with your faculty before the next drive.
`;

  return NextResponse.json({ success: true, mentorAdvice, source: 'portal' });
}
