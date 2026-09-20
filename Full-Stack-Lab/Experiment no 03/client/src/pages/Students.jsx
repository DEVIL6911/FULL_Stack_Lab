import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudents, deleteStudent } from '../api';
import Modal from '../components/Modal';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  GraduationCap,
  Download
} from 'lucide-react';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [status, setStatus] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadStudents();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, department, semester, status]);

  async function loadStudents() {
    try {
      setLoading(true);
      const data = await fetchStudents({ search, department, semester, status });
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(student) {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!selectedStudent) return;
    try {
      setDeleting(true);
      await deleteStudent(selectedStudent.id);
      setDeleteModalOpen(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (err) {
      alert('Failed to delete student: ' + err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Header & Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Student Records Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive database of enrolled students, parent details, and performance
          </p>
        </div>

        <Link to="/students/new" className="btn btn-primary">
          <UserPlus size={16} />
          <span>New Admission</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, roll no, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Mathematics & Computing">Mathematics & Computing</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <select
              className="form-control"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Academic Statuses</option>
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Info</th>
                <th>Roll & Enrollment</th>
                <th>Father's Name</th>
                <th>Department & Sem</th>
                <th>City</th>
                <th>Status</th>
                <th>CGPA</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading student directory...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No students match the current criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}>
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{student.first_name} {student.last_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace' }}>
                        {student.roll_number}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {student.enrollment_number || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                        {student.father_name || '-'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {student.father_phone || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{student.department}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Sem {student.semester} • Sec {student.section || 'A'}
                      </div>
                    </td>
                    <td>{student.permanent_city || '-'}</td>
                    <td>
                      <span className={`badge ${
                        student.status === 'Active' ? 'badge-success' :
                        student.status === 'Graduated' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>
                        {student.cgpa || '0.00'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/students/${student.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Full College Profile"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to={`/students/${student.id}/edit`}
                          className="btn btn-secondary btn-sm"
                          title="Edit Information"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="btn btn-danger btn-sm"
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Student Record Deletion"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Record'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              Are you sure you want to delete this student record?
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              This will permanently delete <strong>{selectedStudent?.first_name} {selectedStudent?.last_name}</strong> (Roll: {selectedStudent?.roll_number}) including all related family info, address records, marks, and attendance.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
