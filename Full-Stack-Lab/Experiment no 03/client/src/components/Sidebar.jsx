import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  BookOpen, 
  Award,
  CalendarCheck,
  Building2
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Students Directory', icon: Users },
    { to: '/students/new', label: 'Add Student', icon: UserPlus },
    { to: '/subjects', label: 'Courses & Subjects', icon: BookOpen },
    { to: '/marks', label: 'Marks & Grades', icon: Award }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GraduationCap size={24} />
        </div>
        <div className="brand-text">
          <h2>ACADEMIC PORTAL</h2>
          <p>MITS College ERP</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Building2 size={14} color="#6366f1" />
          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Dept of M&C</span>
        </div>
        <p>Full-Stack Academic Lab • v1.0</p>
      </div>
    </aside>
  );
}
