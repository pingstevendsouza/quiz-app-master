import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import StatCard from '../../components/StatCard/StatCard';
import ShareButton from '../../components/ShareButton/ShareButton';
import { IconCheckCircle, IconXCircle, IconPlay, IconHome, IconBookOpen, IconClock, IconTrendingUp, IconX } from '../../icons';
import { PASSING_SCORE } from '../../context/QuizContext';
import { calculateGrade, timeConverter } from '../../utils';

// Presentational guts of the results screen, shared by:
//   - /results (live, just-finished quiz — reads useQuiz()'s resultData,
//     passes it in here unchanged in behavior)
//   - /progress/:resultId (historical drill-down — fetches a stored result
//     from the API and passes it in here)
// This component never reads useQuiz() itself so it works identically for
// both a live in-memory result and one loaded from Redis.
const ResultsView = ({
  score,
  correctAnswers,
  totalQuestions,
  timeTaken,
  questionsAndAnswers,
  examLabel,
  passed,
  onPlayAgain,
  onBackHome,
  historical = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  // Feature 3: drill down from the Correct/Incorrect stat cards into a
  // filtered Q&A review list. 'all' shows every row (the default, same as
  // before this feature existed).
  const [reviewFilter, setReviewFilter] = useState('all');

  const incorrectAnswers = totalQuestions - correctAnswers;
  const { grade, remarks } = calculateGrade(score);
  const { hours, minutes, seconds } = timeConverter(timeTaken);
  const isPassing = passed;

  const goToFilteredReview = (filter) => {
    setReviewFilter(filter);
    setActiveTab('review');
  };

  const filteredQuestionsAndAnswers = questionsAndAnswers
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => {
      if (reviewFilter === 'correct') return item.point === 1;
      if (reviewFilter === 'incorrect') return item.point !== 1;
      return true;
    });

  const filterPillText = reviewFilter === 'correct' ? 'Showing: Correct only' : reviewFilter === 'incorrect' ? 'Showing: Incorrect only' : null;

  return (
    <div className={styles.page}>
      <Card className={styles.heroCard}>
        <div
          className={classNames(styles.scoreCircle, isPassing ? styles.scoreCirclePass : styles.scoreCircleFail)}
        >
          <span className={styles.scoreValue} style={{ color: isPassing ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {score}%
          </span>
          <span className={styles.scoreLabel} style={{ color: isPassing ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {isPassing ? 'PASSED' : 'FAILED'}
          </span>
        </div>

        <div className={styles.headline}>{historical ? 'Quiz result' : 'Quiz complete!'}</div>
        <div className={styles.subtext}>
          You scored {score}% on the {examLabel} exam — {isPassing ? 'you passed. Congratulations!' : `you need ${PASSING_SCORE}% to pass. Keep practising!`}
        </div>

        <div className={styles.actions}>
          {historical ? (
            <Button variant="secondary" icon={IconTrendingUp} onClick={() => navigate('/progress')}>
              Back to My Progress
            </Button>
          ) : (
            <>
              <Button variant="primary" icon={IconPlay} onClick={onPlayAgain}>Play Again</Button>
              <Button variant="secondary" icon={IconHome} onClick={onBackHome}>Back to Home</Button>
            </>
          )}
          <ShareButton
            shareText={`I scored ${score}% (Grade ${grade}) on the ${examLabel} ServiceNow Quiz! ${isPassing ? 'I passed!' : 'Keep practising!'} Correct: ${correctAnswers}/${totalQuestions}`}
          />
        </div>
      </Card>

      <div className={styles.tabs}>
        <button
          type="button"
          className={classNames(styles.tab, { [styles.tabActive]: activeTab === 'summary' })}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          type="button"
          className={classNames(styles.tab, { [styles.tabActive]: activeTab === 'review' })}
          onClick={() => setActiveTab('review')}
        >
          Review Answers
        </button>
        {activeTab === 'review' && filterPillText && (
          <button type="button" className={styles.filterPill} onClick={() => setReviewFilter('all')}>
            {filterPillText}
            <IconX size={12} />
          </button>
        )}
      </div>

      {activeTab === 'summary' && (
        <>
          <div className={styles.statsRow}>
            <StatCard label="Total" value={totalQuestions} icon={IconBookOpen} accentColor="#C96442" />
            <StatCard
              label="Correct"
              value={correctAnswers}
              icon={IconCheckCircle}
              accentColor="#6A8759"
              onClick={() => goToFilteredReview('correct')}
              active={reviewFilter === 'correct'}
            />
            <StatCard
              label="Incorrect"
              value={incorrectAnswers}
              icon={IconXCircle}
              accentColor="#BF4D43"
              onClick={() => goToFilteredReview('incorrect')}
              active={reviewFilter === 'incorrect'}
            />
            <StatCard label="Time Taken" value={`${Number(hours)}h ${Number(minutes)}m ${Number(seconds)}s`} icon={IconClock} accentColor="#C1873D" />
          </div>
          <Card style={{ marginTop: 'var(--space-16)', padding: 'var(--space-16) var(--space-24)' }}>
            <strong>Grade: {grade}</strong> &mdash; {remarks}
          </Card>
        </>
      )}

      {activeTab === 'review' && (
        <Card>
          <div className={styles.reviewList}>
            {filteredQuestionsAndAnswers.length === 0 && (
              <div className={styles.reviewEmpty}>No questions match this filter.</div>
            )}
            {filteredQuestionsAndAnswers.map(({ item, i }) => {
              const isCorrect = item.point === 1;
              const userAnswerText = Array.isArray(item.user_answer)
                ? (item.user_answer.length ? item.user_answer.join(', ') : 'No answer')
                : item.user_answer;
              const correctAnswerText = Array.isArray(item.correct_answer)
                ? item.correct_answer.join(', ')
                : item.correct_answer;

              return (
                <div className={styles.reviewRow} key={i}>
                  <span className={classNames(styles.reviewIcon, isCorrect ? styles.reviewIconCorrect : styles.reviewIconWrong)}>
                    {isCorrect ? <IconCheckCircle size={18} /> : <IconXCircle size={18} />}
                  </span>
                  <div className={styles.reviewBody}>
                    <div className={styles.reviewQuestion}>{i + 1}. {item.question}</div>
                    <div className={styles.reviewAnswerRow}>
                      <span className={styles.reviewAnswerLabel}>Your answer:</span>
                      <span className={isCorrect ? styles.correctText : styles.wrongText}>{userAnswerText}</span>
                    </div>
                    {!isCorrect && (
                      <div className={styles.reviewAnswerRow}>
                        <span className={styles.reviewAnswerLabel}>Correct answer:</span>
                        <span className={styles.correctText}>{correctAnswerText}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultsView;
