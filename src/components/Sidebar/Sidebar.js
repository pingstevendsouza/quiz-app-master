import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Sidebar.module.css';
import { IconBookOpen, IconFilePlus, IconSettings, IconX, IconTrendingUp, IconLogOut } from '../../icons';
import { useAuth } from '../../context/AuthContext';

// isOpen/onClose only matter below the 768px breakpoint, where Sidebar.module.css
// turns this into a fixed off-canvas drawer (see @media block there). Above
// 768px it renders exactly as before: a permanent left column, isOpen/onClose
// unused.
const Sidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClassName = ({ isActive }) =>
    classNames(styles.navItem, { [styles.navItemActive]: isActive });

  // Closes the mobile drawer (no-op on desktop, where onClose isn't passed
  // any meaningful handler beyond AppLayout's, which just resets state that
  // has no visible effect above 768px) whenever a nav item is clicked, so
  // navigating on mobile also dismisses the drawer.
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    handleNavClick();
    await logout();
    navigate('/login');
  };

  return (
    <aside className={classNames(styles.sidebar, { [styles.sidebarOpen]: isOpen })}>
      <div className={styles.brandRow}>
        <Link to="/" className={styles.brand} onClick={handleNavClick}>
          <IconBookOpen size={22} color="var(--color-primary)" />
          <span className={styles.brandText}>Quiz Prep</span>
        </Link>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <IconX size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/progress" className={navLinkClassName} onClick={handleNavClick}>
          <IconTrendingUp size={18} />
          <span>My Progress</span>
        </NavLink>
        {user?.role === 'admin' && (
          <>
            <NavLink to="/create-exam" className={navLinkClassName} onClick={handleNavClick}>
              <IconFilePlus size={18} />
              <span>Create Exam</span>
            </NavLink>
            <NavLink to="/manage-exams" className={navLinkClassName} onClick={handleNavClick}>
              <IconSettings size={18} />
              <span>Manage Exams</span>
            </NavLink>
          </>
        )}
      </nav>

      {user && (
        <div className={styles.userRow}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <IconLogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Sidebar;
