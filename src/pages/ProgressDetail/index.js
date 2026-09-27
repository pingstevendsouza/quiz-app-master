import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import ResultsView from '../Results/ResultsView';
import { IconTrendingUp } from '../../icons';

// Historical drill-down for a single past quiz attempt, reached from My
// Progress (src/pages/Progress). Fetches the full stored result (including
// questionsAndAnswers) from api/results.js's ?id= mode — scoped server-side
// to the logged-in user, so this can never load someone else's result even
// by guessing a resultId — and renders it through the same shared
// ResultsView component the live /results screen uses.
const ProgressDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'notfound' | 'ready'
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setResult(null);

    (async () => {
      try {
        const response = await fetch(`/api/results?id=${encodeURIComponent(resultId)}`, {
          credentials: 'include',
        });
        if (cancelled) return;

        if (response.status === 404) {
          setStatus('notfound');
          return;
        }
        if (!response.ok) {
          setStatus('error');
          return;
        }

        const data = await response.json();
        setResult(data);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resultId]);

  if (status === 'loading') {
    return (
      <Card className={styles.stateCard}>
        Loading result...
      </Card>
    );
  }

  if (status === 'notfound' || status === 'error') {
    return (
      <Card className={styles.stateCard}>
        <div className={styles.errorTitle}>
          {status === 'notfound' ? 'Result not found' : 'Something went wrong'}
        </div>
        <div>
          {status === 'notfound'
            ? "This result no longer exists — it may have expired (results are kept for 15 days) or you don't have access to it."
            : 'Failed to load this result. Please try again.'}
        </div>
        <div className={styles.backLink}>
          <Button variant="secondary" icon={IconTrendingUp} onClick={() => navigate('/progress')}>
            Back to My Progress
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <ResultsView
      score={result.score}
      correctAnswers={result.correctAnswers}
      totalQuestions={result.totalQuestions}
      timeTaken={result.timeTaken}
      questionsAndAnswers={result.questionsAndAnswers || []}
      examLabel={result.examLabel}
      passed={Boolean(result.passed)}
      historical
    />
  );
};

export default ProgressDetail;
