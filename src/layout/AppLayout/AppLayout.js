import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AppLayout.module.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import { IconUpload, IconMenu, IconBookOpen } from '../../icons';

const AppLayout = ({ children }) => {
  // Relocated PWA "install app" prompt logic (originally in the classic
  // Header component / airframe AppNavbar). Kept as a small floating
  // action button so it doesn't interfere with the designed page layouts.
  const [promptEvent, setPromptEvent] = useState(null);
  const [appAccepted, setAppAccepted] = useState(false);

  // Mobile off-canvas nav: closed by default, opened via the sticky top
  // bar's hamburger button below 768px. Sidebar/backdrop below read this
  // and call the matching close handler.
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const isAppInstalled =
    window.matchMedia('(display-mode: standalone)').matches || appAccepted;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    promptEvent.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        setAppAccepted(true);
      }
    });
  };

  return (
    <div className={styles.layout}>
      <div className={styles.mobileTopBar}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Open navigation menu"
        >
          <IconMenu size={22} />
        </button>
        <Link to="/" className={styles.mobileBrand} onClick={() => setIsMobileNavOpen(false)}>
          <IconBookOpen size={20} color="var(--color-primary)" />
          <span className={styles.mobileBrandText}>Quiz Prep</span>
        </Link>
      </div>

      {isMobileNavOpen && (
        <div className={styles.backdrop} onClick={() => setIsMobileNavOpen(false)} />
      )}

      <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      <main className={styles.content}>{children}</main>
      {promptEvent && !isAppInstalled && (
        <Button
          variant="secondary"
          icon={IconUpload}
          onClick={installApp}
          className={styles.installButton}
        >
          Install App
        </Button>
      )}
    </div>
  );
};

export default AppLayout;
