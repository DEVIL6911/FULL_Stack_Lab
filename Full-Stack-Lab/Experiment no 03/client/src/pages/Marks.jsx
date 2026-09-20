import React, { useEffect, useState } from 'react';
import { fetchMarks, fetchStudents, fetchSubjects, saveMarks, deleteMark } from '../api';
import Modal from '../components/Modal';
import { Award, Plus, Trash2, Calculator, CheckCircle2 } from 'lucide-react';

export default function Marks() {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    subject_id: '',
    internal_marks: 25,
    external_marks: 60
  });

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [marksData, studentsData, subjectsData] = await Promise.all([
        fetchMarks(),
        fetchStudents(),
        fetchSubjects()
      ]);
      setMarks(marksData);
      setStudents(studentsData);
      setSubjects(subjectsData);

      if (studentsData.length > 0 && subjectsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          student_id: studentsData[0].id,
          subject_id: subjectsData[0].id
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const computedTotal = (Number(formData.internal_marks) || 0) + (Number(formData.external_marks) || 0);
  const computedGrade = (() => {
    if (computedTotal >= 90) return 'A+';
    if (computedTotal >= 80) return 'A';
    if (computedTotal >= 70) return 'B+';
    if (computedTotal >= 60) return 'B';
    if (computedTotal >= 50) return 'C';
    if (computedTotal >= 40) return 'P';
    return 'F';
  })();

  async function handleSaveMarks(e) {
    e.preventDefault();
    if (!formData.student_id || !formData.subject_id) {
      alert('Please select both a student and a subject');
      return;
    }

    try {
      await saveMarks(formData);
      setModalOpen(false);
      const updatedMarks = await fetchMarks();
      setMarks(updatedMarks);
    } catch (err) {
      alert('Failed to save marks: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this examination marks entry?')) return;
    try {
      await deleteMark(id);
      const updatedMarks = await fetchMarks();
      setMarks(updatedMarks);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Examination Marks & Gradebook</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Record internal assessment, end-semester evaluation, and calculate letter grades
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Record Marks Entry</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Subject</th>
                <th>Internal (30)</th>
                <th>External (70)</th>
                <th>Total (100)</th>
                <th>Grade</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading grade records...
                  </td>
                </tr>
              ) : marks.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No marks records found. Click "Record Marks Entry" to add marks.
                  </td>
                </tr>
              ) : (
                marks.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{m.roll_number}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{m.subject_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {m.subject_code} • {m.credits} Credits
                      </div>
                    </td>
                    <td>{m.internal_marks}</td>
                    <td>{m.external_marks}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#ffffff' }}>{m.total_marks}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        m.grade?.startsWith('A') ? 'badge-success' :
                        m.grade?.startsWith('B') ? 'badge-info' : 'badge-warning'
                      }`}>
                        {m.grade}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Mark"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Marks Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Student Examination Marks"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveMarks}>
              Save Marks
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveMarks}>
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select
              className="form-control"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.roll_number}) - Sem {s.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Subject *</label>
            <select
              className="form-control"
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Internal Assessment (Max 30)</label>
              <input
                type="number"
                min="0"
                max="30"
                className="form-control"
                value={formData.internal_marks}
                onChange={(e) => setFormData({ ...formData, internal_marks: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">External Examination (Max 70)</label>
              <input
                type="number"
                min="0"
                max="70"
                className="form-control"
                value={formData.external_marks}
                onChange={(e) => setFormData({ ...formData, external_marks: e.target.value })}
              />
            </div>
          </div>

          {/* Computed Score Preview Box */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginTop: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                {computedTotal} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>/ 100</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'var(--border-color)' }} />

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Computed Grade</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                {computedGrade}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
