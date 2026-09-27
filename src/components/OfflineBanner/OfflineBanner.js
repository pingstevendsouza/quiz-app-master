import React, { useEffect } from 'react';
import styles from './OfflineBanner.module.css';
import { IconXCircle } from '../../icons';

// Relocated from the old classic `Offline` component: shown whenever a
// network-dependent action detects the browser is offline. Automatically
// reloads the page once connectivity returns, exactly like the original.
const OfflineBanner = () => {
  useEffect(() => {
    const handleOnline = () => window.location.reload();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <IconXCircle size={28} />
        </div>
        <div className={styles.title}>Offline</div>
        <p>
          There is no Internet connection. We&rsquo;ll try to reload automatically once you&rsquo;re back online!
        </p>
      </div>
    </div>
  );
};

export default OfflineBanner;
