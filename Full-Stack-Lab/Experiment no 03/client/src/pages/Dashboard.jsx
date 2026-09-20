import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats } from '../api';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Award, 
  CalendarCheck, 
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await fetchStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{
          display: 'inline-block',
          width: '36px',
          height: '36px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem' }}>Loading Academic Dashboard...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
        <p>Failed to load dashboard data: {error}</p>
        <button className="btn btn-primary" onClick={loadStats} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>
            Welcome to Student Academic Portal 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            College Administration & Academic Performance Management System (B.Tech • MITS Gwalior)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/students/new" className="btn btn-primary">
            <UserPlus size={16} />
            <span>Add Student</span>
          </Link>
          <Link to="/marks" className="btn btn-secondary">
            <Award size={16} />
            <span>Record Marks</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Total Enrolled</p>
            <h3>{stats?.totalStudents || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Active Students</p>
            <h3>{stats?.activeStudents || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <UserCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Courses / Subjects</p>
            <h3>{stats?.totalSubjects || 0}</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <BookOpen size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Average CGPA</p>
            <h3>{stats?.avgCgpa || 0} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ 10</span></h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Award size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <p>Avg Attendance</p>
            <h3>{stats?.avgAttendance || 0}%</h3>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <CalendarCheck size={24} />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Department Distribution & Recent Students */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Department Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#6366f1" />
              <span>Department Distribution</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Active Enrollment</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.departmentStats?.map((dept, idx) => {
              const total = stats.totalStudents || 1;
              const percentage = Math.round((dept.count / total) * 100);
              return (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{dept.department}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{dept.count} Students ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: idx % 2 === 0 ? 'var(--primary-gradient)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Admissions */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#10b981" />
              <span>Recent Student Admissions</span>
            </h3>
            <Link to="/students" style={{ fontSize: '0.825rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>Dept</th>
                  <th>CGPA</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentStudents?.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Sem {s.semester}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#93c5fd' }}>{s.roll_number}</td>
                    <td>{s.department.split(' ')[0]}</td>
                    <td>
                      <span className="badge badge-success">{s.cgpa || 'N/A'}</span>
                    </td>
                    <td>
                      <Link to={`/students/${s.id}`} className="btn btn-secondary btn-sm">
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
