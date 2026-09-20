const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'academic.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to academic SQLite database at:', DB_PATH);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Students Table
      db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enrollment_number TEXT UNIQUE,
        admission_number TEXT,
        roll_number TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        blood_group TEXT,
        category TEXT,
        nationality TEXT DEFAULT 'Indian',
        email TEXT,
        phone TEXT,
        course TEXT DEFAULT 'B.Tech',
        branch TEXT,
        department TEXT,
        academic_year TEXT DEFAULT '2026-27',
        semester INTEGER DEFAULT 1,
        section TEXT DEFAULT 'A',
        batch TEXT DEFAULT '2024-28',
        admission_date TEXT,
        admission_type TEXT DEFAULT 'Regular',
        status TEXT DEFAULT 'Active',
        tenth_school TEXT,
        tenth_board TEXT,
        tenth_percentage REAL,
        twelfth_school TEXT,
        twelfth_board TEXT,
        twelfth_percentage REAL,
        entrance_exam TEXT,
        entrance_percentile REAL,
        cgpa REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 2. Family Table
      db.run(`CREATE TABLE IF NOT EXISTS student_family (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER UNIQUE NOT NULL,
        father_name TEXT,
        father_occupation TEXT,
        father_phone TEXT,
        father_email TEXT,
        mother_name TEXT,
        mother_occupation TEXT,
        mother_phone TEXT,
        mother_email TEXT,
        guardian_name TEXT,
        guardian_relationship TEXT,
        guardian_phone TEXT,
        annual_family_income TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      )`);

      // 3. Addresses Table
      db.run(`CREATE TABLE IF NOT EXISTS student_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        address_type TEXT NOT NULL, -- 'permanent' or 'current'
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        district TEXT,
        state TEXT,
        pincode TEXT,
        country TEXT DEFAULT 'India',
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      )`);

      // 4. Emergency Contact Table
      db.run(`CREATE TABLE IF NOT EXISTS student_emergency (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER UNIQUE NOT NULL,
        contact_name TEXT,
        relationship TEXT,
        phone TEXT,
        alternate_phone TEXT,
        email TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      )`);

      // 5. Subjects Table
      db.run(`CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        credits INTEGER NOT NULL DEFAULT 3,
        semester INTEGER NOT NULL,
        department TEXT NOT NULL
      )`);

      // 6. Marks Table
      db.run(`CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        internal_marks REAL DEFAULT 0,
        external_marks REAL DEFAULT 0,
        total_marks REAL DEFAULT 0,
        grade TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )`);

      // 7. Attendance Table
      db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        total_classes INTEGER DEFAULT 40,
        attended_classes INTEGER DEFAULT 0,
        percentage REAL DEFAULT 0.0,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )`);

      // 8. Documents Table
      db.run(`CREATE TABLE IF NOT EXISTS student_documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        document_name TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        upload_date TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

// Helpers for async query execution
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  initDatabase,
  runQuery,
  getQuery,
  allQuery
};
