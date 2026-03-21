import React from 'react';
import classNames from 'classnames';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', page: 'dashboard' },
  { id: 'quiz', label: 'Start Quiz', icon: '▶️', page: 'quiz-setup' },
  { id: 'create-exam', label: 'Create Exam', icon: '🧠', page: 'create-exam' },
  { id: 'upload', label: 'Manage Exams', icon: '📂', page: 'upload' },
];

const AppSidebar = ({ activePage, onNavigate, collapsed }) => {
  return (
    <aside className={classNames('af-sidebar', { 'af-sidebar--collapsed': collapsed })}>
      <div className="af-sidebar__brand">
        <div className="af-sidebar__brand-icon">SN</div>
        <span className="af-sidebar__brand-text">ServiceNow Quiz</span>
      </div>

      <div className="af-sidebar__section-title">Main Menu</div>
      <ul className="af-sidebar__menu">
        {NAV_ITEMS.map(item => (
          <li className="af-sidebar__menu-item" key={item.id}>
            <button
              className={classNames('af-sidebar__menu-link', {
                active: activePage === item.page,
              })}
              onClick={() => onNavigate(item.page)}
            >
              <span className="af-sidebar__menu-icon">{item.icon}</span>
              <span className="af-sidebar__menu-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="af-sidebar__section-title">Info</div>
      <ul className="af-sidebar__menu">
        <li className="af-sidebar__menu-item">
          <a
            className="af-sidebar__menu-link"
            href="https://docs.servicenow.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="af-sidebar__menu-icon">📖</span>
            <span className="af-sidebar__menu-label">SN Docs</span>
          </a>
        </li>
      </ul>
    </aside>
  );
};

export default AppSidebar;
