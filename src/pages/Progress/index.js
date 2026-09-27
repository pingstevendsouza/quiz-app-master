import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import { IconTrendingUp, IconCheckCircle, IconXCircle, IconClock } from '../../icons';
import { timeConverter } from '../../utils';

// "My Progress" — history of past quiz attempts, backed by the new
// audit-trail endpoint (api/results.js). Each attempt is also written with
// a 15-day Redis TTL, hence the note in the empty/footer state below.
const Progress = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/results', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to load your quiz history.');
        const data = await response.json();
        if (!cancelled) setResults(data.results || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load your quiz history.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (ts) => new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formatTime = (ms) => {
    const { hours, minutes, seconds } = timeConverter(ms);
    return `${Number(hours)}h ${Number(minutes)}m ${Number(seconds)}s`;
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Progress</h1>
        <p className={styles.subtitle}>A history of your past quiz attempts.</p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {results === null && !error && (
        <Card className={styles.card}>
          <div className={styles.loadingState}>Loading your history...</div>
        </Card>
      )}

      {results !== null && results.length === 0 && (
        <Card className={styles.card}>
          <div className={styles.emptyState}>
            <IconTrendingUp size={28} color="var(--color-text-muted)" />
            <div className={styles.emptyTitle}>No attempts yet</div>
            <div className={styles.emptyText}>Finish a quiz and it will show up here.</div>
          </div>
        </Card>
      )}

      {results !== null && results.length > 0 && (
        <Card className={styles.card}>
          <div className={styles.list}>
            {results.map((r) => (
              <div className={styles.row} key={r.resultId}>
                <span
                  className={classNames(styles.badge, r.passed ? styles.badgePass : styles.badgeFail)}
                >
                  {r.passed ? <IconCheckCircle size={14} /> : <IconXCircle size={14} />}
                  {r.passed ? 'PASSED' : 'FAILED'}
                </span>
                <div className={styles.rowBody}>
                  <div className={styles.examLabel}>{r.examLabel}</div>
                  <div className={styles.rowMeta}>
                    {formatDate(r.completedAt)}
                    <span className={styles.metaDot}>&middot;</span>
                    <IconClock size={13} />
                    {formatTime(r.timeTaken)}
                  </div>
                </div>
                <div className={styles.score}>{r.score}%</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className={styles.footerNote}>
        Your quiz history is automatically removed after 15 days.
      </div>
    </div>
  );
};

export default Progress;
