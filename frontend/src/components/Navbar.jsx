import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { getCurrentDateFormatted } from '../utils/date';

export const Navbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
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
        <div className="navbar-date-badge" title="Current session date">
          <Calendar size={14} color="var(--primary)" />
          <span>{currentDate}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
