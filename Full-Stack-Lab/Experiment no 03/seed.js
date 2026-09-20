const { initDatabase, runQuery, getQuery, allQuery } = require('./database');

async function seedData() {
  console.log('🌱 Initializing tables and seeding college demo data...');
  await initDatabase();

  // Check if already seeded
  const existingCount = await getQuery('SELECT COUNT(*) as count FROM students');
  if (existingCount && existingCount.count > 0) {
    console.log('Database already has students. Skipping seed.');
    return;
  }

  // 1. Seed Subjects
  const subjectsList = [
    { code: 'CS501', name: 'Design and Analysis of Algorithms', credits: 4, semester: 5, department: 'Mathematics & Computing' },
    { code: 'CS502', name: 'Machine Learning', credits: 4, semester: 5, department: 'Mathematics & Computing' },
    { code: 'CS503', name: 'Computer Networks', credits: 4, semester: 5, department: 'Computer Science & Engineering' },
    { code: 'CS504', name: 'Operating Systems', credits: 4, semester: 5, department: 'Computer Science & Engineering' },
    { code: 'MA501', name: 'Optimization Techniques', credits: 3, semester: 5, department: 'Mathematics & Computing' },
    { code: 'CS301', name: 'Data Structures and Algorithms', credits: 4, semester: 3, department: 'Computer Science & Engineering' },
    { code: 'EC501', name: 'Digital Signal Processing', credits: 3, semester: 5, department: 'Electronics & Communication' }
  ];

  const subjectIds = [];
  for (const s of subjectsList) {
    const res = await runQuery(
      'INSERT INTO subjects (code, name, credits, semester, department) VALUES (?, ?, ?, ?, ?)',
      [s.code, s.name, s.credits, s.semester, s.department]
    );
    subjectIds.push(res.id);
  }
  console.log(`✅ Seeded ${subjectsList.length} subjects.`);

  // 2. Seed Students
  const studentsList = [
    {
      enrollment_number: '0901MC221001',
      admission_number: 'ADM2022/045',
      roll_number: '22MAC001',
      first_name: 'Ayush',
      middle_name: '',
      last_name: 'Gupta',
      date_of_birth: '2004-05-14',
      gender: 'Male',
      blood_group: 'O+',
      category: 'General',
      nationality: 'Indian',
      email: 'ayush.gupta@mits.ac.in',
      phone: '+91 98765 43210',
      course: 'B.Tech',
      branch: 'Mathematics & Computing',
      department: 'Mathematics & Computing',
      academic_year: '2026-27',
      semester: 5,
      section: 'A1',
      batch: '2024-28',
      admission_date: '2024-08-10',
      admission_type: 'Regular',
      status: 'Active',
      tenth_school: 'Delhi Public School',
      tenth_board: 'CBSE',
      tenth_percentage: 92.4,
      twelfth_school: 'Delhi Public School',
      twelfth_board: 'CBSE',
      twelfth_percentage: 94.6,
      entrance_exam: 'JEE Main',
      entrance_percentile: 98.2,
      cgpa: 8.85,
      family: {
        father_name: 'Rajesh Gupta',
        father_occupation: 'Senior Software Architect',
        father_phone: '+91 98765 11111',
        father_email: 'rajesh.gupta@corp.com',
        mother_name: 'Sunita Gupta',
        mother_occupation: 'Professor of Mathematics',
        mother_phone: '+91 98765 22222',
        mother_email: 'sunita.gupta@edu.in',
        guardian_name: 'Rajesh Gupta',
        guardian_relationship: 'Father',
        guardian_phone: '+91 98765 11111',
        annual_family_income: '₹ 18,00,000'
      },
      addresses: [
        {
          address_type: 'permanent',
          address_line1: 'Flat 402, Royal Palms Residency',
          address_line2: 'Maharaj Bada Road',
          city: 'Gwalior',
          district: 'Gwalior',
          state: 'Madhya Pradesh',
          pincode: '474005',
          country: 'India'
        },
        {
          address_type: 'current',
          address_line1: 'Hostel Block 4, Room 218',
          address_line2: 'MITS Campus, Racecourse Road',
          city: 'Gwalior',
          district: 'Gwalior',
          state: 'Madhya Pradesh',
          pincode: '474005',
          country: 'India'
        }
      ],
      emergency: {
        contact_name: 'Rajesh Gupta',
        relationship: 'Father',
        phone: '+91 98765 11111',
        alternate_phone: '+91 98765 22222',
        email: 'rajesh.gupta@corp.com'
      },
      marks: [
        { subject_id: subjectIds[0], internal: 27, external: 62 },
        { subject_id: subjectIds[1], internal: 29, external: 65 },
        { subject_id: subjectIds[4], internal: 28, external: 60 }
      ],
      attendance: [
        { subject_id: subjectIds[0], total: 42, attended: 39 },
        { subject_id: subjectIds[1], total: 40, attended: 38 },
        { subject_id: subjectIds[4], total: 36, attended: 34 }
      ]
    },
    {
      enrollment_number: '0901CS221045',
      admission_number: 'ADM2022/112',
      roll_number: '22CSE045',
      first_name: 'Rahul',
      middle_name: 'Kumar',
      last_name: 'Sharma',
      date_of_birth: '2004-09-21',
      gender: 'Male',
      blood_group: 'B+',
      category: 'OBC',
      nationality: 'Indian',
      email: 'rahul.sharma@mits.ac.in',
      phone: '+91 98234 56789',
      course: 'B.Tech',
      branch: 'Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      academic_year: '2026-27',
      semester: 5,
      section: 'B1',
      batch: '2024-28',
      admission_date: '2024-08-12',
      admission_type: 'Regular',
      status: 'Active',
      tenth_school: 'Kendriya Vidyalaya No. 1',
      tenth_board: 'CBSE',
      tenth_percentage: 88.0,
      twelfth_school: 'Kendriya Vidyalaya No. 1',
      twelfth_board: 'CBSE',
      twelfth_percentage: 91.2,
      entrance_exam: 'JEE Main',
      entrance_percentile: 97.4,
      cgpa: 8.45,
      family: {
        father_name: 'Manoj Sharma',
        father_occupation: 'Civil Engineer (PWD)',
        father_phone: '+91 98234 11111',
        father_email: 'manoj.sharma@gov.in',
        mother_name: 'Rekha Sharma',
        mother_occupation: 'Homemaker',
        mother_phone: '+91 98234 22222',
        mother_email: '',
        guardian_name: 'Manoj Sharma',
        guardian_relationship: 'Father',
        guardian_phone: '+91 98234 11111',
        annual_family_income: '₹ 12,00,000'
      },
      addresses: [
        {
          address_type: 'permanent',
          address_line1: '12, Shanti Nagar, Near Railway Station',
          address_line2: '',
          city: 'Bhopal',
          district: 'Bhopal',
          state: 'Madhya Pradesh',
          pincode: '462001',
          country: 'India'
        },
        {
          address_type: 'current',
          address_line1: 'Hostel Block 2, Room 104',
          address_line2: 'MITS Campus',
          city: 'Gwalior',
          district: 'Gwalior',
          state: 'Madhya Pradesh',
          pincode: '474005',
          country: 'India'
        }
      ],
      emergency: {
        contact_name: 'Manoj Sharma',
        relationship: 'Father',
        phone: '+91 98234 11111',
        alternate_phone: '+91 98234 22222',
        email: 'manoj.sharma@gov.in'
      },
      marks: [
        { subject_id: subjectIds[2], internal: 26, external: 58 },
        { subject_id: subjectIds[3], internal: 25, external: 54 }
      ],
      attendance: [
        { subject_id: subjectIds[2], total: 40, attended: 35 },
        { subject_id: subjectIds[3], total: 38, attended: 32 }
      ]
    },
    {
      enrollment_number: '0901MC221018',
      admission_number: 'ADM2022/078',
      roll_number: '22MAC018',
      first_name: 'Priya',
      middle_name: '',
      last_name: 'Singh',
      date_of_birth: '2005-01-30',
      gender: 'Female',
      blood_group: 'A+',
      category: 'General',
      nationality: 'Indian',
      email: 'priya.singh@mits.ac.in',
      phone: '+91 97123 45678',
      course: 'B.Tech',
      branch: 'Mathematics & Computing',
      department: 'Mathematics & Computing',
      academic_year: '2026-27',
      semester: 5,
      section: 'A2',
      batch: '2024-28',
      admission_date: '2024-08-11',
      admission_type: 'Regular',
      status: 'Active',
      tenth_school: 'St. Mary Convent High School',
      tenth_board: 'ICSE',
      tenth_percentage: 95.2,
      twelfth_school: 'St. Mary Convent High School',
      twelfth_board: 'ISC',
      twelfth_percentage: 96.0,
      entrance_exam: 'JEE Main',
      entrance_percentile: 99.1,
      cgpa: 9.32,
      family: {
        father_name: 'Vikram Singh',
        father_occupation: 'Bank Manager (SBI)',
        father_phone: '+91 97123 11111',
        father_email: 'vikram.singh@sbi.co.in',
        mother_name: 'Kavita Singh',
        mother_occupation: 'High School Teacher',
        mother_phone: '+91 97123 22222',
        mother_email: 'kavita.singh@gmail.com',
        guardian_name: 'Vikram Singh',
        guardian_relationship: 'Father',
        guardian_phone: '+91 97123 11111',
        annual_family_income: '₹ 15,50,000'
      },
      addresses: [
        {
          address_type: 'permanent',
          address_line1: 'B-45, Vijay Nagar',
          address_line2: 'AB Road',
          city: 'Indore',
          district: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452010',
          country: 'India'
        },
        {
          address_type: 'current',
          address_line1: 'Girls Hostel Block A, Room 302',
          address_line2: 'MITS Campus',
          city: 'Gwalior',
          district: 'Gwalior',
          state: 'Madhya Pradesh',
          pincode: '474005',
          country: 'India'
        }
      ],
      emergency: {
        contact_name: 'Vikram Singh',
        relationship: 'Father',
        phone: '+91 97123 11111',
        alternate_phone: '+91 97123 22222',
        email: 'vikram.singh@sbi.co.in'
      },
      marks: [
        { subject_id: subjectIds[0], internal: 30, external: 68 },
        { subject_id: subjectIds[1], internal: 29, external: 67 },
        { subject_id: subjectIds[4], internal: 29, external: 66 }
      ],
      attendance: [
        { subject_id: subjectIds[0], total: 42, attended: 41 },
        { subject_id: subjectIds[1], total: 40, attended: 39 },
        { subject_id: subjectIds[4], total: 36, attended: 35 }
      ]
    }
  ];

  function calculateGrade(total) {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B+';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 40) return 'P';
    return 'F';
  }

  for (const st of studentsList) {
    const res = await runQuery(`
      INSERT INTO students (
        enrollment_number, admission_number, roll_number,
        first_name, middle_name, last_name,
        date_of_birth, gender, blood_group, category, nationality,
        email, phone, course, branch, department,
        academic_year, semester, section, batch,
        admission_date, admission_type, status,
        tenth_school, tenth_board, tenth_percentage,
        twelfth_school, twelfth_board, twelfth_percentage,
        entrance_exam, entrance_percentile, cgpa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      st.enrollment_number, st.admission_number, st.roll_number,
      st.first_name, st.middle_name, st.last_name,
      st.date_of_birth, st.gender, st.blood_group, st.category, st.nationality,
      st.email, st.phone, st.course, st.branch, st.department,
      st.academic_year, st.semester, st.section, st.batch,
      st.admission_date, st.admission_type, st.status,
      st.tenth_school, st.tenth_board, st.tenth_percentage,
      st.twelfth_school, st.twelfth_board, st.twelfth_percentage,
      st.entrance_exam, st.entrance_percentile, st.cgpa
    ]);

    const studentId = res.id;

    // Seed Family
    if (st.family) {
      await runQuery(`
        INSERT INTO student_family (
          student_id, father_name, father_occupation, father_phone, father_email,
          mother_name, mother_occupation, mother_phone, mother_email,
          guardian_name, guardian_relationship, guardian_phone, annual_family_income
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId, st.family.father_name, st.family.father_occupation, st.family.father_phone, st.family.father_email,
        st.family.mother_name, st.family.mother_occupation, st.family.mother_phone, st.family.mother_email,
        st.family.guardian_name, st.family.guardian_relationship, st.family.guardian_phone, st.family.annual_family_income
      ]);
    }

    // Seed Addresses
    if (st.addresses) {
      for (const addr of st.addresses) {
        await runQuery(`
          INSERT INTO student_addresses (
            student_id, address_type, address_line1, address_line2,
            city, district, state, pincode, country
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          studentId, addr.address_type, addr.address_line1, addr.address_line2,
          addr.city, addr.district, addr.state, addr.pincode, addr.country
        ]);
      }
    }

    // Seed Emergency Contact
    if (st.emergency) {
      await runQuery(`
        INSERT INTO student_emergency (
          student_id, contact_name, relationship, phone, alternate_phone, email
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        studentId, st.emergency.contact_name, st.emergency.relationship,
        st.emergency.phone, st.emergency.alternate_phone, st.emergency.email
      ]);
    }

    // Seed Marks
    if (st.marks) {
      for (const m of st.marks) {
        const total = m.internal + m.external;
        const grade = calculateGrade(total);
        await runQuery(`
          INSERT INTO marks (student_id, subject_id, internal_marks, external_marks, total_marks, grade)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [studentId, m.subject_id, m.internal, m.external, total, grade]);
      }
    }

    // Seed Attendance
    if (st.attendance) {
      for (const a of st.attendance) {
        const pct = Math.round((a.attended / a.total) * 100 * 10) / 10;
        await runQuery(`
          INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes, percentage)
          VALUES (?, ?, ?, ?, ?)
        `, [studentId, a.subject_id, a.total, a.attended, pct]);
      }
    }

    // Seed Documents checklist
    const docs = [
      { name: 'Student Photo', status: 'Uploaded' },
      { name: '10th Marksheet', status: 'Verified' },
      { name: '12th Marksheet', status: 'Verified' },
      { name: 'JEE Scorecard', status: 'Verified' },
      { name: 'College ID Card', status: 'Uploaded' },
      { name: 'Aadhaar Card', status: 'Uploaded' },
      { name: 'Migration Certificate', status: 'Pending' }
    ];

    for (const d of docs) {
      await runQuery(`
        INSERT INTO student_documents (student_id, document_name, status, upload_date)
        VALUES (?, ?, ?, date('now'))
      `, [studentId, d.name, d.status]);
    }
  }

  console.log(`✅ Seeded ${studentsList.length} complete student profiles with family, addresses, marks & attendance.`);
}

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 Seeding successfully completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedData };
