import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchStudentById, updateDocumentStatus } from '../api';
import { 
  ArrowLeft, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  User, 
  Users, 
  GraduationCap, 
  Home, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText,
  Percent,
  Check,
  Building
} from 'lucide-react';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStudent();
  }, [id]);

  async function loadStudent() {
    try {
      setLoading(true);
      const data = await fetchStudentById(id);
      setStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDocStatus(docId, currentStatus) {
    const nextStatus = currentStatus === 'Verified' ? 'Pending' : currentStatus === 'Pending' ? 'Uploaded' : 'Verified';
    try {
      await updateDocumentStatus(docId, nextStatus);
      loadStudent();
    } catch (err) {
      alert('Failed to update document status');
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3>Student Not Found</h3>
        <Link to="/students" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Students Directory
        </Link>
      </div>
    );
  }

  const permanentAddress = student.addresses?.find(a => a.address_type === 'permanent') || {};
  const currentAddress = student.addresses?.find(a => a.address_type === 'current') || {};
  const family = student.family || {};
  const emergency = student.emergency || {};

  return (
    <div>
      {/* Back Button & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate('/students')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </button>

        <Link to={`/students/${student.id}/edit`} className="btn btn-primary btn-sm">
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Main Student Header Card */}
      <div className="glass-card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(24, 32, 52, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'white',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {student.first_name[0]}{student.last_name[0]}
          </div>

          {/* Quick Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>
                {student.first_name} {student.middle_name} {student.last_name}
              </h2>
              <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                {student.status}
              </span>
              <span className="badge badge-purple">
                CGPA: {student.cgpa || '0.00'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <div><strong>Roll No:</strong> <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>{student.roll_number}</span></div>
              <div><strong>Enrollment:</strong> <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{student.enrollment_number || 'N/A'}</span></div>
              <div><strong>Course:</strong> {student.course} ({student.branch || student.department})</div>
              <div><strong>Semester:</strong> {student.semester} (Sec {student.section || 'A'})</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Award size={16} />
          <span>Overview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <User size={16} />
          <span>Personal Info</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'family' ? 'active' : ''}`}
          onClick={() => setActiveTab('family')}
        >
          <Users size={16} />
          <span>Family & Parents</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
          onClick={() => setActiveTab('academic')}
        >
          <GraduationCap size={16} />
          <span>Academic History</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
          onClick={() => setActiveTab('address')}
        >
          <Home size={16} />
          <span>Addresses & Emergency</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Percent size={16} />
          <span>Attendance ({student.attendance?.length || 0})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'marks' ? 'active' : ''}`}
          onClick={() => setActiveTab('marks')}
        >
          <Award size={16} />
          <span>Marks & Grades ({student.marks?.length || 0})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          <span>Documents</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Quick Academic Snapshot */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={18} color="#6366f1" />
              <span>Academic Snapshot</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>College</span>
                <span style={{ fontWeight: 600 }}>Madhav Institute of Tech & Science (MITS)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Degree / Program</span>
                <span style={{ fontWeight: 600 }}>{student.course} in {student.branch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Academic Year / Batch</span>
                <span>{student.academic_year} • Batch {student.batch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Admission Type</span>
                <span>{student.admission_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Admission Date</span>
                <span>{student.admission_date || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cumulative GPA</span>
                <span style={{ fontWeight: 700, color: '#34d399', fontSize: '1.1rem' }}>{student.cgpa || '0.00'} / 10.0</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Parent Snapshot */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#06b6d4" />
              <span>Contact & Parent Summary</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Email</span>
                <span>{student.email || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Phone</span>
                <span>{student.phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Father's Name</span>
                <span style={{ fontWeight: 600 }}>{family.father_name || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Father's Phone</span>
                <span>{family.father_phone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mother's Name</span>
                <span style={{ fontWeight: 600 }}>{family.mother_name || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Emergency Contact</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{emergency.contact_name} ({emergency.relationship})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Personal Info */}
      {activeTab === 'personal' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: '#818cf8' }}>Personal Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div className="form-label">Full Name</div>
              <div style={{ fontWeight: 600 }}>{student.first_name} {student.middle_name} {student.last_name}</div>
            </div>
            <div>
              <div className="form-label">Date of Birth</div>
              <div>{student.date_of_birth || 'N/A'}</div>
            </div>
            <div>
              <div className="form-label">Gender</div>
              <div>{student.gender || 'N/A'}</div>
            </div>
            <div>
              <div className="form-label">Blood Group</div>
              <div><span className="badge badge-purple">{student.blood_group || 'O+'}</span></div>
            </div>
            <div>
              <div className="form-label">Category</div>
              <div>{student.category || 'General'}</div>
            </div>
            <div>
              <div className="form-label">Nationality</div>
              <div>{student.nationality || 'Indian'}</div>
            </div>
            <div>
              <div className="form-label">Student Mobile</div>
              <div>{student.phone || 'N/A'}</div>
            </div>
            <div>
              <div className="form-label">Institutional Email</div>
              <div>{student.email || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Family Information */}
      {activeTab === 'family' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Father Details */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#93c5fd' }}>
              Father's Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div className="form-label">Father's Full Name</div>
                <div style={{ fontWeight: 600 }}>{family.father_name || 'Not provided'}</div>
              </div>
              <div>
                <div className="form-label">Occupation</div>
                <div>{family.father_occupation || 'Not provided'}</div>
              </div>
              <div>
                <div className="form-label">Mobile Number</div>
                <div>{family.father_phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="form-label">Email Address</div>
                <div>{family.father_email || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Mother Details */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#f472b6' }}>
              Mother's Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div className="form-label">Mother's Full Name</div>
                <div style={{ fontWeight: 600 }}>{family.mother_name || 'Not provided'}</div>
              </div>
              <div>
                <div className="form-label">Occupation</div>
                <div>{family.mother_occupation || 'Not provided'}</div>
              </div>
              <div>
                <div className="form-label">Mobile Number</div>
                <div>{family.mother_phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="form-label">Email Address</div>
                <div>{family.mother_email || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Guardian & Income */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#34d399' }}>
              Guardian & Financial Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div className="form-label">Guardian's Name</div>
                <div>{family.guardian_name || 'Same as father'}</div>
              </div>
              <div>
                <div className="form-label">Relationship</div>
                <div>{family.guardian_relationship || 'Father'}</div>
              </div>
              <div>
                <div className="form-label">Guardian Phone</div>
                <div>{family.guardian_phone || family.father_phone || 'N/A'}</div>
              </div>
              <div>
                <div className="form-label">Annual Family Income</div>
                <div style={{ fontWeight: 600, color: '#fbbf24' }}>{family.annual_family_income || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Academic Records */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* College Enrollment */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#818cf8' }}>
              College & Degree Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div className="form-label">Enrollment Number</div>
                <div style={{ fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace' }}>{student.enrollment_number}</div>
              </div>
              <div>
                <div className="form-label">Roll Number</div>
                <div style={{ fontWeight: 600, color: '#93c5fd', fontFamily: 'monospace' }}>{student.roll_number}</div>
              </div>
              <div>
                <div className="form-label">Admission Number</div>
                <div>{student.admission_number || 'N/A'}</div>
              </div>
              <div>
                <div className="form-label">Program & Course</div>
                <div>{student.course} ({student.branch})</div>
              </div>
              <div>
                <div className="form-label">Department</div>
                <div>{student.department}</div>
              </div>
              <div>
                <div className="form-label">Current Semester</div>
                <div>Semester {student.semester} (Sec {student.section})</div>
              </div>
              <div>
                <div className="form-label">Batch & Academic Year</div>
                <div>{student.batch} • {student.academic_year}</div>
              </div>
              <div>
                <div className="form-label">Admission Date</div>
                <div>{student.admission_date || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Previous Education Details */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#34d399' }}>
              Prior Schooling & Entrance Exam
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div className="form-label">10th Standard School</div>
                <div>{student.tenth_school || 'N/A'} ({student.tenth_board})</div>
              </div>
              <div>
                <div className="form-label">10th Percentage</div>
                <div style={{ fontWeight: 600 }}>{student.tenth_percentage ? `${student.tenth_percentage}%` : 'N/A'}</div>
              </div>
              <div>
                <div className="form-label">12th Standard School</div>
                <div>{student.twelfth_school || 'N/A'} ({student.twelfth_board})</div>
              </div>
              <div>
                <div className="form-label">12th Percentage</div>
                <div style={{ fontWeight: 600 }}>{student.twelfth_percentage ? `${student.twelfth_percentage}%` : 'N/A'}</div>
              </div>
              <div>
                <div className="form-label">Entrance Examination</div>
                <div>{student.entrance_exam || 'JEE Main'}</div>
              </div>
              <div>
                <div className="form-label">Entrance Percentile</div>
                <div style={{ fontWeight: 700, color: '#38bdf8' }}>{student.entrance_percentile ? `${student.entrance_percentile} %ile` : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Address & Emergency */}
      {activeTab === 'address' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Permanent Address */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} />
              <span>Permanent Address</span>
            </h3>
            <div style={{ lineHeight: 1.7, fontSize: '0.925rem' }}>
              <p><strong>Address:</strong> {permanentAddress.address_line1 || 'Not recorded'}</p>
              {permanentAddress.address_line2 && <p>{permanentAddress.address_line2}</p>}
              <p><strong>City & District:</strong> {permanentAddress.city || '-'}, {permanentAddress.district || '-'}</p>
              <p><strong>State & PIN:</strong> {permanentAddress.state || '-'} - {permanentAddress.pincode || '-'}</p>
              <p><strong>Country:</strong> {permanentAddress.country || 'India'}</p>
            </div>
          </div>

          {/* Current / Hostel Address */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} />
              <span>Current / Campus Address</span>
            </h3>
            <div style={{ lineHeight: 1.7, fontSize: '0.925rem' }}>
              <p><strong>Address:</strong> {currentAddress.address_line1 || 'Same as permanent'}</p>
              {currentAddress.address_line2 && <p>{currentAddress.address_line2}</p>}
              <p><strong>City:</strong> {currentAddress.city || permanentAddress.city || '-'}</p>
              <p><strong>State & PIN:</strong> {currentAddress.state || permanentAddress.state || '-'} - {currentAddress.pincode || permanentAddress.pincode || '-'}</p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} />
              <span>Emergency Contact Person</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div>
                <div className="form-label">Contact Name</div>
                <div style={{ fontWeight: 600 }}>{emergency.contact_name || 'Father'}</div>
              </div>
              <div>
                <div className="form-label">Relationship</div>
                <div>{emergency.relationship || 'Father'}</div>
              </div>
              <div>
                <div className="form-label">Primary Phone</div>
                <div style={{ fontWeight: 600, color: '#f87171' }}>{emergency.phone || student.phone}</div>
              </div>
              <div>
                <div className="form-label">Alternate Phone</div>
                <div>{emergency.alternate_phone || '-'}</div>
              </div>
              <div>
                <div className="form-label">Email</div>
                <div>{emergency.email || '-'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Attendance */}
      {activeTab === 'attendance' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Subject-wise Attendance Tracking</h3>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Required: ≥ 75.0%</span>
          </div>

          {student.attendance?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No attendance records found for this student.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Subject Name</th>
                    <th>Attended Classes</th>
                    <th>Total Conducted</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {student.attendance?.map((att) => (
                    <tr key={att.id}>
                      <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{att.subject_code}</td>
                      <td style={{ fontWeight: 600 }}>{att.subject_name}</td>
                      <td>{att.attended_classes}</td>
                      <td>{att.total_classes}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(att.percentage, 100)}%`,
                              height: '100%',
                              background: att.percentage >= 75 ? '#10b981' : '#ef4444',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <span style={{ fontWeight: 600, minWidth: '45px' }}>{att.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${att.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                          {att.percentage >= 75 ? 'Satisfactory' : 'Low Attendance'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Marks & Grades */}
      {activeTab === 'marks' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Examination Gradebook & Marks</h3>
            <Link to="/marks" className="btn btn-secondary btn-sm">
              + Record Marks
            </Link>
          </div>

          {student.marks?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No examination marks recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject Name</th>
                    <th>Credits</th>
                    <th>Internal (30)</th>
                    <th>External (70)</th>
                    <th>Total (100)</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {student.marks?.map((mark) => (
                    <tr key={mark.id}>
                      <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{mark.subject_code}</td>
                      <td style={{ fontWeight: 600 }}>{mark.subject_name}</td>
                      <td>{mark.credits}</td>
                      <td>{mark.internal_marks}</td>
                      <td>{mark.external_marks}</td>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{mark.total_marks}</td>
                      <td>
                        <span className={`badge ${
                          mark.grade.startsWith('A') ? 'badge-success' :
                          mark.grade.startsWith('B') ? 'badge-info' : 'badge-warning'
                        }`}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Documents */}
      {activeTab === 'documents' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>College Document Verification Checklist</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any status badge to toggle verification</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {student.documents?.map((doc) => (
              <div
                key={doc.id}
                onClick={() => toggleDocStatus(doc.id, doc.status)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={20} color="#818cf8" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.document_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Updated: {doc.upload_date || 'Recent'}</div>
                  </div>
                </div>

                <span className={`badge ${
                  doc.status === 'Verified' ? 'badge-success' :
                  doc.status === 'Uploaded' ? 'badge-info' : 'badge-warning'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
