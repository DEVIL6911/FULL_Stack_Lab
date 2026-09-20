import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ShieldCheck, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Academic Dashboard';
    if (pathname === '/students') return 'Student Records & Directory';
    if (pathname === '/students/new') return 'New Student Admission';
    if (pathname.startsWith('/students/') && pathname.endsWith('/edit')) return 'Edit Student Profile';
    if (pathname.startsWith('/students/')) return 'Student Profile & Details';
    if (pathname === '/subjects') return 'Curriculum & Subjects Catalog';
    if (pathname === '/marks') return 'Examination Marks & Gradebook';
    return 'Student Academic Portal';
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="topbar-actions">
        <div className="topbar-badge">
          <span className="status-dot"></span>
          <span>Fast SQLite DB Connected</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.35rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            AD
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Academic Admin</span>
        </div>
      </div>
    </header>
  );
}
