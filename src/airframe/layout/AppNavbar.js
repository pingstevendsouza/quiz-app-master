import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Swal from 'sweetalert2';
import { timeConverter } from '../../utils';

const PAGE_LABELS = {
  'dashboard': ['Dashboard'],
  'quiz-setup': ['Dashboard', 'Start Quiz'],
  'quiz-active': ['Dashboard', 'Quiz'],
  'results': ['Dashboard', 'Results'],
  'upload': ['Dashboard', 'Manage Exams'],
  'create-exam': ['Dashboard', 'Create Exam'],
};

const CountdownBadge = ({ countdownTime, timeOver, setTimeTaken }) => {
  const totalTime = countdownTime * 1000;
  const [timerTime, setTimerTime] = useState(totalTime);
  const { hours, minutes, seconds } = timeConverter(timerTime);
  const isUrgent = timerTime <= 60000;

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = timerTime - 1000;
      if (newTime >= 0) {
        setTimerTime(newTime);
      } else {
        clearInterval(timer);
        Swal.fire({
          icon: 'info',
          title: `Oops! Time's up.`,
          text: 'See how you did!',
          confirmButtonText: 'Check Results',
          timer: 5000,
          willClose: () => timeOver(totalTime - timerTime),
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      setTimeTaken(totalTime - timerTime + 1000);
    };
    // eslint-disable-next-line
  }, [timerTime]);

  return (
    <div className={classNames('af-navbar__timer', { 'af-navbar__timer--urgent': isUrgent })}>
      <span>⏱</span>
      <span>{hours}:{minutes}:{seconds}</span>
    </div>
  );
};

const AppNavbar = ({
  onToggleSidebar,
  activePage,
  countdownTime,
  timeOver,
  setTimeTaken,
  onInstallApp,
  showInstall,
}) => {
  const crumbs = PAGE_LABELS[activePage] || ['Dashboard'];

  return (
    <nav className="af-navbar">
      <button className="af-navbar__toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <span />
        <span />
        <span />
      </button>

      <div className="af-navbar__breadcrumb">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb}>
            {i > 0 && <span className="af-navbar__breadcrumb-sep">/</span>}
            <span className={classNames('af-navbar__breadcrumb-item', { active: i === crumbs.length - 1 })}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="af-navbar__right">
        {activePage === 'quiz-active' && countdownTime && (
          <CountdownBadge
            countdownTime={countdownTime}
            timeOver={timeOver}
            setTimeTaken={setTimeTaken}
          />
        )}

        {showInstall && (
          <button className="af-btn af-btn--outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={onInstallApp}>
            ⬇ Install App
          </button>
        )}

        <div className="af-navbar__badge" title="Notifications">🔔</div>
        <div className="af-navbar__avatar" title="User">U</div>
      </div>
    </nav>
  );
};

export { CountdownBadge };
export default AppNavbar;
