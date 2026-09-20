import React, { useEffect, useState } from 'react';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../api';
import Modal from '../components/Modal';
import { BookOpen, Plus, Edit3, Trash2, Layers } from 'lucide-react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    semester: 5,
    department: 'Mathematics & Computing'
  });

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      credits: 3,
      semester: 5,
      department: 'Mathematics & Computing'
    });
    setModalOpen(true);
  }

  function handleOpenEdit(subject) {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      semester: subject.semester,
      department: subject.department
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, formData);
      } else {
        await createSubject(formData);
      }
      setModalOpen(false);
      loadSubjects();
    } catch (err) {
      alert('Failed to save subject: ' + err.message);
    }
  }

  async function confirmDelete() {
    if (!subjectToDelete) return;
    try {
      await deleteSubject(subjectToDelete.id);
      setDeleteModalOpen(false);
      setSubjectToDelete(null);
      loadSubjects();
    } catch (err) {
      alert('Failed to delete subject: ' + err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Courses & Subjects Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage departmental course curriculum, credits, and semester distribution
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} />
          <span>Add Course / Subject</span>
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject / Course Name</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Department</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading curriculum catalog...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No subjects registered yet. Click "Add Course / Subject" to create one.
                  </td>
                </tr>
              ) : (
                subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#93c5fd', fontSize: '0.95rem' }}>
                        {sub.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.name}</div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{sub.credits} Credits</span>
                    </td>
                    <td>
                      <span className="badge badge-info">Sem {sub.semester}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{sub.department}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Subject"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => { setSubjectToDelete(sub); setDeleteModalOpen(true); }}
                          className="btn btn-danger btn-sm"
                          title="Delete Subject"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Add New Curriculum Subject'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Save Subject
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Subject Code *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. CS501"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Title / Course Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Machine Learning"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                className="form-control"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                className="form-control"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-control"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="Mathematics & Computing">Mathematics & Computing</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete Subject"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmDelete}>
              Delete Subject
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{subjectToDelete?.code} - {subjectToDelete?.name}</strong>?
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          This will also remove any related marks and attendance records tied to this course.
        </p>
      </Modal>
    </div>
  );
}
