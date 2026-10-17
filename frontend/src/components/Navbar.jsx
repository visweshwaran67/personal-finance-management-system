import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { getCurrentDateFormatted } from '../utils/date';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user } = useAuth();
  const currentDate = getCurrentDateFormatted();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="navbar-title">{title}</h1>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-date" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={15} color="var(--text-muted)" />
          <span>{currentDate}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
