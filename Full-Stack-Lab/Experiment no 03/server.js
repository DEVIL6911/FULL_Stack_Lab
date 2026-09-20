require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, runQuery, getQuery, allQuery } = require('./database');
const { seedData } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static React build if available
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Helper to calculate letter grade
function computeGrade(total) {
  if (total >= 90) return 'A+';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B+';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'P';
  return 'F';
}

// -------------------------------------------------------------
// 1. DASHBOARD STATS
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalStudentsRow = await getQuery('SELECT COUNT(*) as count FROM students');
    const activeStudentsRow = await getQuery("SELECT COUNT(*) as count FROM students WHERE status = 'Active'");
    const totalSubjectsRow = await getQuery('SELECT COUNT(*) as count FROM subjects');
    const avgCgpaRow = await getQuery('SELECT AVG(cgpa) as avg_cgpa FROM students WHERE cgpa > 0');
    const avgAttendanceRow = await getQuery('SELECT AVG(percentage) as avg_att FROM attendance');

    const departmentStats = await allQuery(`
      SELECT department, COUNT(*) as count 
      FROM students 
      GROUP BY department
    `);

    const recentStudents = await allQuery(`
      SELECT id, roll_number, enrollment_number, first_name, last_name, department, semester, cgpa, status
      FROM students
      ORDER BY id DESC
      LIMIT 5
    `);

    res.json({
      totalStudents: totalStudentsRow ? totalStudentsRow.count : 0,
      activeStudents: activeStudentsRow ? activeStudentsRow.count : 0,
      totalSubjects: totalSubjectsRow ? totalSubjectsRow.count : 0,
      avgCgpa: avgCgpaRow && avgCgpaRow.avg_cgpa ? Number(avgCgpaRow.avg_cgpa.toFixed(2)) : 0,
      avgAttendance: avgAttendanceRow && avgAttendanceRow.avg_att ? Number(avgAttendanceRow.avg_att.toFixed(1)) : 0,
      departmentStats,
      recentStudents
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. STUDENTS CRUD
// -------------------------------------------------------------

// List students with search, filters & pagination
app.get('/api/students', async (req, res) => {
  try {
    const { search, department, semester, status } = req.query;
    let sql = `
      SELECT s.*, 
        f.father_name, f.mother_name, f.father_phone, f.annual_family_income,
        (SELECT city FROM student_addresses WHERE student_id = s.id AND address_type = 'permanent' LIMIT 1) as permanent_city
      FROM students s
      LEFT JOIN student_family f ON s.id = f.student_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (
        s.first_name LIKE ? OR 
        s.last_name LIKE ? OR 
        s.roll_number LIKE ? OR 
        s.enrollment_number LIKE ? OR
        s.email LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (department) {
      sql += ' AND s.department = ?';
      params.push(department);
    }

    if (semester) {
      sql += ' AND s.semester = ?';
      params.push(semester);
    }

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY s.id DESC';

    const students = await allQuery(sql, params);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student full profile
app.get('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await getQuery('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Fetch Family
    const family = await getQuery('SELECT * FROM student_family WHERE student_id = ?', [studentId]);

    // Fetch Addresses
    const addresses = await allQuery('SELECT * FROM student_addresses WHERE student_id = ?', [studentId]);

    // Fetch Emergency Contact
    const emergency = await getQuery('SELECT * FROM student_emergency WHERE student_id = ?', [studentId]);

    // Fetch Marks with Subject Details
    const marks = await allQuery(`
      SELECT m.*, sub.code as subject_code, sub.name as subject_name, sub.credits, sub.semester as subject_semester
      FROM marks m
      JOIN subjects sub ON m.subject_id = sub.id
      WHERE m.student_id = ?
    `, [studentId]);

    // Fetch Attendance with Subject Details
    const attendance = await allQuery(`
      SELECT a.*, sub.code as subject_code, sub.name as subject_name
      FROM attendance a
      JOIN subjects sub ON a.subject_id = sub.id
      WHERE a.student_id = ?
    `, [studentId]);

    // Fetch Documents
    const documents = await allQuery('SELECT * FROM student_documents WHERE student_id = ?', [studentId]);

    res.json({
      ...student,
      family: family || {},
      addresses: addresses || [],
      emergency: emergency || {},
      marks: marks || [],
      attendance: attendance || [],
      documents: documents || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new student
app.post('/api/students', async (req, res) => {
  try {
    const {
      first_name, middle_name, last_name, roll_number, enrollment_number, admission_number,
      date_of_birth, gender, blood_group, category, nationality,
      email, phone, course, branch, department, academic_year, semester, section, batch,
      admission_date, admission_type, status,
      tenth_school, tenth_board, tenth_percentage,
      twelfth_school, twelfth_board, twelfth_percentage,
      entrance_exam, entrance_percentile, cgpa,
      family, permanent_address, current_address, emergency
    } = req.body;

    if (!first_name || !last_name || !roll_number) {
      return res.status(400).json({ error: 'First Name, Last Name and Roll Number are required.' });
    }

    const insertStudentSql = `
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
    `;

    const result = await runQuery(insertStudentSql, [
      enrollment_number || '', admission_number || '', roll_number,
      first_name, middle_name || '', last_name,
      date_of_birth || '', gender || 'Male', blood_group || 'O+', category || 'General', nationality || 'Indian',
      email || '', phone || '', course || 'B.Tech', branch || department || '', department || 'Engineering',
      academic_year || '2026-27', semester || 1, section || 'A', batch || '2024-28',
      admission_date || '', admission_type || 'Regular', status || 'Active',
      tenth_school || '', tenth_board || 'CBSE', Number(tenth_percentage) || 0,
      twelfth_school || '', twelfth_board || 'CBSE', Number(twelfth_percentage) || 0,
      entrance_exam || 'JEE Main', Number(entrance_percentile) || 0, Number(cgpa) || 0
    ]);

    const studentId = result.id;

    // Insert Family
    if (family) {
      await runQuery(`
        INSERT INTO student_family (
          student_id, father_name, father_occupation, father_phone, father_email,
          mother_name, mother_occupation, mother_phone, mother_email,
          guardian_name, guardian_relationship, guardian_phone, annual_family_income
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        family.father_name || '', family.father_occupation || '', family.father_phone || '', family.father_email || '',
        family.mother_name || '', family.mother_occupation || '', family.mother_phone || '', family.mother_email || '',
        family.guardian_name || '', family.guardian_relationship || '', family.guardian_phone || '',
        family.annual_family_income || ''
      ]);
    }

    // Insert Addresses
    if (permanent_address) {
      await runQuery(`
        INSERT INTO student_addresses (
          student_id, address_type, address_line1, address_line2, city, district, state, pincode, country
        ) VALUES (?, 'permanent', ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        permanent_address.address_line1 || '', permanent_address.address_line2 || '',
        permanent_address.city || '', permanent_address.district || '',
        permanent_address.state || '', permanent_address.pincode || '',
        permanent_address.country || 'India'
      ]);
    }

    if (current_address) {
      await runQuery(`
        INSERT INTO student_addresses (
          student_id, address_type, address_line1, address_line2, city, district, state, pincode, country
        ) VALUES (?, 'current', ?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        current_address.address_line1 || '', current_address.address_line2 || '',
        current_address.city || '', current_address.district || '',
        current_address.state || '', current_address.pincode || '',
        current_address.country || 'India'
      ]);
    }

    // Insert Emergency Contact
    if (emergency) {
      await runQuery(`
        INSERT INTO student_emergency (
          student_id, contact_name, relationship, phone, alternate_phone, email
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        emergency.contact_name || '', emergency.relationship || '',
        emergency.phone || '', emergency.alternate_phone || '',
        emergency.email || ''
      ]);
    }

    // Standard Document checklist
    const defaultDocs = [
      'Student Photo', '10th Marksheet', '12th Marksheet',
      'JEE Scorecard', 'College ID Card', 'Aadhaar Card'
    ];
    for (const doc of defaultDocs) {
      await runQuery(`
        INSERT INTO student_documents (student_id, document_name, status, upload_date)
        VALUES (?, ?, 'Pending', date('now'))
      `, [studentId, doc]);
    }

    res.status(201).json({ id: studentId, message: 'Student created successfully' });
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      first_name, middle_name, last_name, roll_number, enrollment_number, admission_number,
      date_of_birth, gender, blood_group, category, nationality,
      email, phone, course, branch, department, academic_year, semester, section, batch,
      admission_date, admission_type, status,
      tenth_school, tenth_board, tenth_percentage,
      twelfth_school, twelfth_board, twelfth_percentage,
      entrance_exam, entrance_percentile, cgpa,
      family, permanent_address, current_address, emergency
    } = req.body;

    const updateStudentSql = `
      UPDATE students SET
        enrollment_number = ?, admission_number = ?, roll_number = ?,
        first_name = ?, middle_name = ?, last_name = ?,
        date_of_birth = ?, gender = ?, blood_group = ?, category = ?, nationality = ?,
        email = ?, phone = ?, course = ?, branch = ?, department = ?,
        academic_year = ?, semester = ?, section = ?, batch = ?,
        admission_date = ?, admission_type = ?, status = ?,
        tenth_school = ?, tenth_board = ?, tenth_percentage = ?,
        twelfth_school = ?, twelfth_board = ?, twelfth_percentage = ?,
        entrance_exam = ?, entrance_percentile = ?, cgpa = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await runQuery(updateStudentSql, [
      enrollment_number || '', admission_number || '', roll_number,
      first_name, middle_name || '', last_name,
      date_of_birth || '', gender || 'Male', blood_group || 'O+', category || 'General', nationality || 'Indian',
      email || '', phone || '', course || 'B.Tech', branch || '', department || '',
      academic_year || '2026-27', semester || 1, section || 'A', batch || '2024-28',
      admission_date || '', admission_type || 'Regular', status || 'Active',
      tenth_school || '', tenth_board || 'CBSE', Number(tenth_percentage) || 0,
      twelfth_school || '', twelfth_board || 'CBSE', Number(twelfth_percentage) || 0,
      entrance_exam || 'JEE Main', Number(entrance_percentile) || 0, Number(cgpa) || 0,
      studentId
    ]);

    // Update or Insert Family
    if (family) {
      const famExists = await getQuery('SELECT id FROM student_family WHERE student_id = ?', [studentId]);
      if (famExists) {
        await runQuery(`
          UPDATE student_family SET
            father_name = ?, father_occupation = ?, father_phone = ?, father_email = ?,
            mother_name = ?, mother_occupation = ?, mother_phone = ?, mother_email = ?,
            guardian_name = ?, guardian_relationship = ?, guardian_phone = ?, annual_family_income = ?
          WHERE student_id = ?
        `, [
          family.father_name || '', family.father_occupation || '', family.father_phone || '', family.father_email || '',
          family.mother_name || '', family.mother_occupation || '', family.mother_phone || '', family.mother_email || '',
          family.guardian_name || '', family.guardian_relationship || '', family.guardian_phone || '',
          family.annual_family_income || '',
          studentId
        ]);
      } else {
        await runQuery(`
          INSERT INTO student_family (
            student_id, father_name, father_occupation, father_phone, father_email,
            mother_name, mother_occupation, mother_phone, mother_email,
            guardian_name, guardian_relationship, guardian_phone, annual_family_income
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          studentId,
          family.father_name || '', family.father_occupation || '', family.father_phone || '', family.father_email || '',
          family.mother_name || '', family.mother_occupation || '', family.mother_phone || '', family.mother_email || '',
          family.guardian_name || '', family.guardian_relationship || '', family.guardian_phone || '',
          family.annual_family_income || ''
        ]);
      }
    }

    // Update Permanent Address
    if (permanent_address) {
      const permExists = await getQuery("SELECT id FROM student_addresses WHERE student_id = ? AND address_type = 'permanent'", [studentId]);
      if (permExists) {
        await runQuery(`
          UPDATE student_addresses SET
            address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, pincode = ?, country = ?
          WHERE id = ?
        `, [
          permanent_address.address_line1 || '', permanent_address.address_line2 || '',
          permanent_address.city || '', permanent_address.district || '',
          permanent_address.state || '', permanent_address.pincode || '',
          permanent_address.country || 'India',
          permExists.id
        ]);
      } else {
        await runQuery(`
          INSERT INTO student_addresses (
            student_id, address_type, address_line1, address_line2, city, district, state, pincode, country
          ) VALUES (?, 'permanent', ?, ?, ?, ?, ?, ?, ?)
        `, [
          studentId,
          permanent_address.address_line1 || '', permanent_address.address_line2 || '',
          permanent_address.city || '', permanent_address.district || '',
          permanent_address.state || '', permanent_address.pincode || '',
          permanent_address.country || 'India'
        ]);
      }
    }

    // Update Current Address
    if (current_address) {
      const currExists = await getQuery("SELECT id FROM student_addresses WHERE student_id = ? AND address_type = 'current'", [studentId]);
      if (currExists) {
        await runQuery(`
          UPDATE student_addresses SET
            address_line1 = ?, address_line2 = ?, city = ?, district = ?, state = ?, pincode = ?, country = ?
          WHERE id = ?
        `, [
          current_address.address_line1 || '', current_address.address_line2 || '',
          current_address.city || '', current_address.district || '',
          current_address.state || '', current_address.pincode || '',
          current_address.country || 'India',
          currExists.id
        ]);
      } else {
        await runQuery(`
          INSERT INTO student_addresses (
            student_id, address_type, address_line1, address_line2, city, district, state, pincode, country
          ) VALUES (?, 'current', ?, ?, ?, ?, ?, ?, ?)
        `, [
          studentId,
          current_address.address_line1 || '', current_address.address_line2 || '',
          current_address.city || '', current_address.district || '',
          current_address.state || '', current_address.pincode || '',
          current_address.country || 'India'
        ]);
      }
    }

    // Update Emergency Contact
    if (emergency) {
      const emExists = await getQuery('SELECT id FROM student_emergency WHERE student_id = ?', [studentId]);
      if (emExists) {
        await runQuery(`
          UPDATE student_emergency SET
            contact_name = ?, relationship = ?, phone = ?, alternate_phone = ?, email = ?
          WHERE student_id = ?
        `, [
          emergency.contact_name || '', emergency.relationship || '',
          emergency.phone || '', emergency.alternate_phone || '',
          emergency.email || '',
          studentId
        ]);
      } else {
        await runQuery(`
          INSERT INTO student_emergency (
            student_id, contact_name, relationship, phone, alternate_phone, email
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          studentId,
          emergency.contact_name || '', emergency.relationship || '',
          emergency.phone || '', emergency.alternate_phone || '',
          emergency.email || ''
        ]);
      }
    }

    res.json({ message: 'Student profile updated successfully' });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    await runQuery('DELETE FROM students WHERE id = ?', [studentId]);
    res.json({ message: 'Student and related records deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. SUBJECTS CRUD
// -------------------------------------------------------------
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await allQuery('SELECT * FROM subjects ORDER BY semester ASC, code ASC');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { code, name, credits, semester, department } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Subject code and name are required' });
    }
    const result = await runQuery(
      'INSERT INTO subjects (code, name, credits, semester, department) VALUES (?, ?, ?, ?, ?)',
      [code, name, Number(credits) || 3, Number(semester) || 1, department || 'Computer Science']
    );
    res.status(201).json({ id: result.id, message: 'Subject created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { code, name, credits, semester, department } = req.body;
    await runQuery(
      'UPDATE subjects SET code = ?, name = ?, credits = ?, semester = ?, department = ? WHERE id = ?',
      [code, name, Number(credits) || 3, Number(semester) || 1, department, req.params.id]
    );
    res.json({ message: 'Subject updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. MARKS CRUD
// -------------------------------------------------------------
app.get('/api/marks', async (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = `
      SELECT m.*, 
        s.first_name, s.last_name, s.roll_number,
        sub.code as subject_code, sub.name as subject_name, sub.credits
      FROM marks m
      JOIN students s ON m.student_id = s.id
      JOIN subjects sub ON m.subject_id = sub.id
    `;
    const params = [];
    if (student_id) {
      sql += ' WHERE m.student_id = ?';
      params.push(student_id);
    }
    sql += ' ORDER BY m.id DESC';

    const marks = await allQuery(sql, params);
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/marks', async (req, res) => {
  try {
    const { student_id, subject_id, internal_marks, external_marks } = req.body;
    if (!student_id || !subject_id) {
      return res.status(400).json({ error: 'Student and Subject are required' });
    }

    const internal = Number(internal_marks) || 0;
    const external = Number(external_marks) || 0;
    const total = internal + external;
    const grade = computeGrade(total);

    // Check if mark already exists for this student and subject
    const existing = await getQuery('SELECT id FROM marks WHERE student_id = ? AND subject_id = ?', [student_id, subject_id]);
    if (existing) {
      await runQuery(
        'UPDATE marks SET internal_marks = ?, external_marks = ?, total_marks = ?, grade = ? WHERE id = ?',
        [internal, external, total, grade, existing.id]
      );
      return res.json({ id: existing.id, message: 'Marks updated successfully' });
    }

    const result = await runQuery(
      'INSERT INTO marks (student_id, subject_id, internal_marks, external_marks, total_marks, grade) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, subject_id, internal, external, total, grade]
    );

    res.status(201).json({ id: result.id, message: 'Marks recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/marks/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM marks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mark entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. ATTENDANCE CRUD
// -------------------------------------------------------------
app.get('/api/attendance', async (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = `
      SELECT a.*,
        s.first_name, s.last_name, s.roll_number,
        sub.code as subject_code, sub.name as subject_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN subjects sub ON a.subject_id = sub.id
    `;
    const params = [];
    if (student_id) {
      sql += ' WHERE a.student_id = ?';
      params.push(student_id);
    }
    sql += ' ORDER BY a.id DESC';

    const attendance = await allQuery(sql, params);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { student_id, subject_id, total_classes, attended_classes } = req.body;
    if (!student_id || !subject_id) {
      return res.status(400).json({ error: 'Student and Subject are required' });
    }

    const total = Number(total_classes) || 40;
    const attended = Number(attended_classes) || 0;
    const percentage = total > 0 ? Math.round((attended / total) * 100 * 10) / 10 : 0;

    const existing = await getQuery('SELECT id FROM attendance WHERE student_id = ? AND subject_id = ?', [student_id, subject_id]);
    if (existing) {
      await runQuery(
        'UPDATE attendance SET total_classes = ?, attended_classes = ?, percentage = ? WHERE id = ?',
        [total, attended, percentage, existing.id]
      );
      return res.json({ id: existing.id, message: 'Attendance updated successfully' });
    }

    const result = await runQuery(
      'INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes, percentage) VALUES (?, ?, ?, ?, ?)',
      [student_id, subject_id, total, attended, percentage]
    );

    res.status(201).json({ id: result.id, message: 'Attendance recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. DOCUMENTS STATUS UPDATE
// -------------------------------------------------------------
app.put('/api/documents/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await runQuery('UPDATE student_documents SET status = ?, upload_date = date("now") WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Document status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Student Academic Portal</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Student Academic Portal API Server</h2>
          <p>The Express backend is running smoothly on port ${PORT}.</p>
          <p>Please run <code>npm run client:dev</code> or <code>npm run client:build</code> to access the React SPA interface.</p>
        </body>
        </html>
      `);
    }
  });
});

// Initialize database and start server
initDatabase().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`🚀 Student Academic Portal Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
