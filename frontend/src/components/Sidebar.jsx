import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LogOut, Wallet, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const usernameInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <Wallet size={19} />
            </div>
            <span>FinanceFlow</span>
            <span className="brand-tag">PRO</span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ display: isOpen ? 'flex' : 'none' }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Receipt size={18} />
            <span>Expenses</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar" title={user?.username || 'User'}>
              {usernameInitial}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.username || 'User'}</p>
              <span className="user-role-badge">{user?.role || 'USER'}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn" title="Sign out of your account">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
