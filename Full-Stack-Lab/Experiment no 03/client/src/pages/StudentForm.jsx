import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createStudent, fetchStudentById, updateStudent } from '../api';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Users, 
  GraduationCap, 
  Home, 
  ShieldAlert,
  Check
} from 'lucide-react';

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: 'O+',
    category: 'General',
    nationality: 'Indian',
    email: '',
    phone: '',

    // Academic
    roll_number: '',
    enrollment_number: '',
    admission_number: '',
    course: 'B.Tech',
    branch: 'Mathematics & Computing',
    department: 'Mathematics & Computing',
    academic_year: '2026-27',
    semester: 1,
    section: 'A',
    batch: '2024-28',
    admission_date: '',
    admission_type: 'Regular',
    status: 'Active',
    tenth_school: '',
    tenth_board: 'CBSE',
    tenth_percentage: '',
    twelfth_school: '',
    twelfth_board: 'CBSE',
    twelfth_percentage: '',
    entrance_exam: 'JEE Main',
    entrance_percentile: '',
    cgpa: '',

    // Family
    family: {
      father_name: '',
      father_occupation: '',
      father_phone: '',
      father_email: '',
      mother_name: '',
      mother_occupation: '',
      mother_phone: '',
      mother_email: '',
      guardian_name: '',
      guardian_relationship: 'Father',
      guardian_phone: '',
      annual_family_income: ''
    },

    // Address
    permanent_address: {
      address_line1: '',
      address_line2: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    current_address: {
      address_line1: '',
      address_line2: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India'
    },

    // Emergency
    emergency: {
      contact_name: '',
      relationship: 'Father',
      phone: '',
      alternate_phone: '',
      email: ''
    }
  });

  useEffect(() => {
    if (isEdit) {
      loadStudentData();
    }
  }, [id]);

  async function loadStudentData() {
    try {
      setLoading(true);
      const data = await fetchStudentById(id);
      const perm = data.addresses?.find(a => a.address_type === 'permanent') || {};
      const curr = data.addresses?.find(a => a.address_type === 'current') || {};

      setFormData({
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || 'Male',
        blood_group: data.blood_group || 'O+',
        category: data.category || 'General',
        nationality: data.nationality || 'Indian',
        email: data.email || '',
        phone: data.phone || '',

        roll_number: data.roll_number || '',
        enrollment_number: data.enrollment_number || '',
        admission_number: data.admission_number || '',
        course: data.course || 'B.Tech',
        branch: data.branch || '',
        department: data.department || '',
        academic_year: data.academic_year || '2026-27',
        semester: data.semester || 1,
        section: data.section || 'A',
        batch: data.batch || '2024-28',
        admission_date: data.admission_date || '',
        admission_type: data.admission_type || 'Regular',
        status: data.status || 'Active',
        tenth_school: data.tenth_school || '',
        tenth_board: data.tenth_board || 'CBSE',
        tenth_percentage: data.tenth_percentage || '',
        twelfth_school: data.twelfth_school || '',
        twelfth_board: data.twelfth_board || 'CBSE',
        twelfth_percentage: data.twelfth_percentage || '',
        entrance_exam: data.entrance_exam || 'JEE Main',
        entrance_percentile: data.entrance_percentile || '',
        cgpa: data.cgpa || '',

        family: {
          father_name: data.family?.father_name || '',
          father_occupation: data.family?.father_occupation || '',
          father_phone: data.family?.father_phone || '',
          father_email: data.family?.father_email || '',
          mother_name: data.family?.mother_name || '',
          mother_occupation: data.family?.mother_occupation || '',
          mother_phone: data.family?.mother_phone || '',
          mother_email: data.family?.mother_email || '',
          guardian_name: data.family?.guardian_name || '',
          guardian_relationship: data.family?.guardian_relationship || 'Father',
          guardian_phone: data.family?.guardian_phone || '',
          annual_family_income: data.family?.annual_family_income || ''
        },

        permanent_address: {
          address_line1: perm.address_line1 || '',
          address_line2: perm.address_line2 || '',
          city: perm.city || '',
          district: perm.district || '',
          state: perm.state || '',
          pincode: perm.pincode || '',
          country: perm.country || 'India'
        },
        current_address: {
          address_line1: curr.address_line1 || '',
          address_line2: curr.address_line2 || '',
          city: curr.city || '',
          district: curr.district || '',
          state: curr.state || '',
          pincode: curr.pincode || '',
          country: curr.country || 'India'
        },

        emergency: {
          contact_name: data.emergency?.contact_name || '',
          relationship: data.emergency?.relationship || 'Father',
          phone: data.emergency?.phone || '',
          alternate_phone: data.emergency?.alternate_phone || '',
          email: data.emergency?.email || ''
        }
      });
    } catch (err) {
      alert('Failed to load student: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleNestedChange(section, field, value) {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  }

  function handleSameAddressToggle(checked) {
    setSameAsPermanent(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        current_address: { ...prev.permanent_address }
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.roll_number) {
      alert('First Name, Last Name and Roll Number are required.');
      return;
    }

    try {
      setSaving(true);
      if (isEdit) {
        await updateStudent(id, formData);
        navigate(`/students/${id}`);
      } else {
        const res = await createStudent(formData);
        navigate(`/students/${res.id}`);
      }
    } catch (err) {
      alert('Error saving student: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading form details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Cancel</span>
          </button>
          <h2 style={{ fontSize: '1.5rem' }}>
            {isEdit ? `Edit Student: ${formData.first_name} ${formData.last_name}` : 'New Student Admission Entry'}
          </h2>
        </div>

        <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save Student Record'}</span>
        </button>
      </div>

      {/* Navigation section pills */}
      <div className="tabs-header">
        <button
          type="button"
          className={`tab-btn ${activeSection === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveSection('personal')}
        >
          <User size={16} />
          <span>1. Personal Information</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeSection === 'family' ? 'active' : ''}`}
          onClick={() => setActiveSection('family')}
        >
          <Users size={16} />
          <span>2. Family & Parent Details</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeSection === 'academic' ? 'active' : ''}`}
          onClick={() => setActiveSection('academic')}
        >
          <GraduationCap size={16} />
          <span>3. Academic & Prior Education</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeSection === 'address' ? 'active' : ''}`}
          onClick={() => setActiveSection('address')}
        >
          <Home size={16} />
          <span>4. Address & Emergency Contact</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: Personal Information */}
        {activeSection === 'personal' && (
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#818cf8' }}>
              Student Identity & Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Middle Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-control"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Nationality</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Phone</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@mits.ac.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('family')}>
                Next: Family Info →
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: Family Information */}
        {activeSection === 'family' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Father Details */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#93c5fd' }}>
                Father's Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rajesh Gupta"
                    value={formData.family.father_name}
                    onChange={(e) => handleNestedChange('family', 'father_name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Occupation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Software Engineer / Business"
                    value={formData.family.father_occupation}
                    onChange={(e) => handleNestedChange('family', 'father_occupation', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91 98765 00000"
                    value={formData.family.father_phone}
                    onChange={(e) => handleNestedChange('family', 'father_phone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Father's Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.family.father_email}
                    onChange={(e) => handleNestedChange('family', 'father_email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Mother Details */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#f472b6' }}>
                Mother's Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Mother's Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sunita Gupta"
                    value={formData.family.mother_name}
                    onChange={(e) => handleNestedChange('family', 'mother_name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mother's Occupation</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Teacher / Homemaker"
                    value={formData.family.mother_occupation}
                    onChange={(e) => handleNestedChange('family', 'mother_occupation', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mother's Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="+91 98765 11111"
                    value={formData.family.mother_phone}
                    onChange={(e) => handleNestedChange('family', 'mother_phone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mother's Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.family.mother_email}
                    onChange={(e) => handleNestedChange('family', 'mother_email', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Guardian & Income */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#34d399' }}>
                Guardian & Family Income
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Guardian Name (if different)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.family.guardian_name}
                    onChange={(e) => handleNestedChange('family', 'guardian_name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guardian Relationship</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.family.guardian_relationship}
                    onChange={(e) => handleNestedChange('family', 'guardian_relationship', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Family Income</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ₹ 12,00,000"
                    value={formData.family.annual_family_income}
                    onChange={(e) => handleNestedChange('family', 'annual_family_income', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('personal')}>
                ← Back to Personal
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('academic')}>
                Next: Academic History →
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: Academic Information */}
        {activeSection === 'academic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#818cf8' }}>
                College Enrollment & Academic Record
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. 24MAC001"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Enrollment Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 0901MC241001"
                    value={formData.enrollment_number}
                    onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admission Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.admission_number}
                    onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course / Degree</label>
                  <select
                    className="form-control"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <select
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value, branch: e.target.value })}
                  >
                    <option value="Mathematics & Computing">Mathematics & Computing</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-control"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Batch</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Admission Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Graduated">Graduated</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="form-control"
                    placeholder="e.g. 8.42"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* School Education */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#34d399' }}>
                Previous Schooling & Entrance Exam
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">10th School Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.tenth_school}
                    onChange={(e) => setFormData({ ...formData, tenth_school: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">10th Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 91.5"
                    value={formData.tenth_percentage}
                    onChange={(e) => setFormData({ ...formData, tenth_percentage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">12th School Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.twelfth_school}
                    onChange={(e) => setFormData({ ...formData, twelfth_school: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">12th Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="e.g. 93.2"
                    value={formData.twelfth_percentage}
                    onChange={(e) => setFormData({ ...formData, twelfth_percentage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Entrance Exam</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.entrance_exam}
                    onChange={(e) => setFormData({ ...formData, entrance_exam: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Entrance Percentile</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="e.g. 98.4"
                    value={formData.entrance_percentile}
                    onChange={(e) => setFormData({ ...formData, entrance_percentile: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('family')}>
                ← Back to Family
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('address')}>
                Next: Addresses & Contact →
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: Address & Emergency Contact */}
        {activeSection === 'address' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Permanent Address */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#818cf8' }}>
                Permanent Residence Address
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="House / Flat No, Street"
                    value={formData.permanent_address.address_line1}
                    onChange={(e) => handleNestedChange('permanent_address', 'address_line1', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.permanent_address.city}
                    onChange={(e) => handleNestedChange('permanent_address', 'city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.permanent_address.district}
                    onChange={(e) => handleNestedChange('permanent_address', 'district', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.permanent_address.state}
                    onChange={(e) => handleNestedChange('permanent_address', 'state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.permanent_address.pincode}
                    onChange={(e) => handleNestedChange('permanent_address', 'pincode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Current Address */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#06b6d4' }}>Current / Campus Hostel Address</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={sameAsPermanent}
                    onChange={(e) => handleSameAddressToggle(e.target.checked)}
                  />
                  <span>Same as Permanent Address</span>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address Line 1</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={sameAsPermanent}
                    value={formData.current_address.address_line1}
                    onChange={(e) => handleNestedChange('current_address', 'address_line1', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={sameAsPermanent}
                    value={formData.current_address.city}
                    onChange={(e) => handleNestedChange('current_address', 'city', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={sameAsPermanent}
                    value={formData.current_address.state}
                    onChange={(e) => handleNestedChange('current_address', 'state', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    className="form-control"
                    disabled={sameAsPermanent}
                    value={formData.current_address.pincode}
                    onChange={(e) => handleNestedChange('current_address', 'pincode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#f87171' }}>
                Emergency Contact Person
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.emergency.contact_name}
                    onChange={(e) => handleNestedChange('emergency', 'contact_name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship with Student</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.emergency.relationship}
                    onChange={(e) => handleNestedChange('emergency', 'relationship', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.emergency.phone}
                    onChange={(e) => handleNestedChange('emergency', 'phone', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alternate Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.emergency.alternate_phone}
                    onChange={(e) => handleNestedChange('emergency', 'alternate_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setActiveSection('academic')}>
                ← Back to Academic
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Student Record'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
