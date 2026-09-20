# Student Academic Portal (Experiment no 03)

A full-stack, college-grade **Student Academic Portal** Single Page Application (SPA) built with **Node.js, Express, SQLite, and React.js**.

## Overview & Architecture

- **Frontend**: React.js (Vite), React Router v6, Lucide Icons, Modern Responsive Design System.
- **Backend**: Node.js & Express RESTful API with CORS.
- **Database**: SQLite (`academic.db`) with Foreign Key constraints and cascading deletes.
- **Key Features**:
  - **Dashboard**: KPI statistics (enrolled students, active students, courses, average CGPA, attendance rate), department breakdown, recent admissions.
  - **Student Management (Full CRUD)**:
    - Search by student name, roll number, enrollment number, email.
    - Filter by Department, Semester (1-8), and Academic Status (Active, Graduated, On Leave, Suspended).
    - Expanded college profile with:
      - **Personal Information** (DOB, Blood group, Gender, Category, Nationality).
      - **Family & Parents** (Father's name, occupation, phone, email, Mother's name, occupation, phone, email, Guardian, Annual income).
      - **Academic History** (Enrollment, Roll, Program, Branch, Semester, Batch, 10th & 12th schools, percentages, Entrance exam score, CGPA).
      - **Addresses & Emergency Contact** (Permanent and current/hostel addresses, emergency contact person).
      - **Attendance Tracking** (Subject-wise attended/total classes, percentage progress bars).
      - **Marks & Gradebook** (Internal 30 + External 70 = Total 100, automatic letter grade).
      - **Document Verification** (Checklist with verification status).
  - **Curriculum & Subjects Catalog (Full CRUD)**: Code, Course name, Credits, Semester, Department.
  - **Marks & Gradebook**: Record internal and external marks, auto-compute total and grades (`A+`, `A`, `B+`, `B`, `C`, `P`, `F`).

---

## Getting Started

### 1. Install Backend & Frontend Dependencies

Open your terminal in `Experiment no 03`:

```bash
# In "Experiment no 03"
npm install
npm run client:install
```

### 2. Seed Sample College Data

Pre-populate the SQLite database with realistic college student records (MITS Gwalior, Mathematics & Computing / CSE), subjects, family details, marks, and attendance:

```bash
npm run seed
```

### 3. Build & Run

#### Option A: Unified Production Mode (Fast & Single Port)
Build the React frontend into `client/dist` and let the Express server serve both the REST API and the React SPA on port `5000`:

```bash
npm run client:build
npm start
```
Then open: **http://localhost:5000**

#### Option B: Development Mode (Vite Hot-Reload)
Run the Express backend:
```bash
npm run dev
```
In another terminal, run the Vite frontend:
```bash
npm run client:dev
```
Then open: **http://localhost:5173** (Vite automatically proxies `/api` to port 5000).

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Academic KPI metrics and department distribution |
| `GET` | `/api/students` | List students with search, filters (dept, sem, status) |
| `GET` | `/api/students/:id` | Full student profile including family, address, marks, attendance |
| `POST` | `/api/students` | Create complete student profile |
| `PUT` | `/api/students/:id` | Update student profile and nested records |
| `DELETE` | `/api/students/:id` | Delete student and cascade |
| `GET` / `POST` / `PUT` / `DELETE` | `/api/subjects` | Subjects catalog CRUD |
| `GET` / `POST` / `DELETE` | `/api/marks` | Record and manage examination marks |
| `GET` / `POST` | `/api/attendance` | Subject-wise attendance records |
| `PUT` | `/api/documents/:id` | Toggle verification status of document |
