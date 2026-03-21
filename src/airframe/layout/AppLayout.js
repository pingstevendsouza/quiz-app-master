import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import AppSidebar from './AppSidebar';
import AppNavbar from './AppNavbar';

const AppLayout = ({
  children,
  activePage,
  onNavigate,
  countdownTime,
  timeOver,
  setTimeTaken,
  showInstall,
  onInstallApp,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  return (
    <div
      className={classNames('af-root af-layout', {
        'af-layout--sidebar-collapsed': !isMobile && collapsed,
        'af-layout--mobile-open': isMobile && mobileOpen,
      })}
    >
      {isMobile && mobileOpen && (
        <div className="af-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <AppSidebar
        activePage={activePage}
        onNavigate={(page) => {
          onNavigate(page);
          if (isMobile) setMobileOpen(false);
        }}
        collapsed={!isMobile && collapsed}
      />

      <div className="af-layout__wrap">
        <AppNavbar
          onToggleSidebar={handleToggleSidebar}
          activePage={activePage}
          countdownTime={countdownTime}
          timeOver={timeOver}
          setTimeTaken={setTimeTaken}
          showInstall={showInstall}
          onInstallApp={onInstallApp}
        />
        <main className="af-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
