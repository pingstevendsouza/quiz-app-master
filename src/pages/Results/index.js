import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import StatCard from '../../components/StatCard/StatCard';
import ShareButton from '../../components/ShareButton/ShareButton';
import { IconCheckCircle, IconXCircle, IconPlay, IconHome, IconBookOpen, IconClock } from '../../icons';
import { useQuiz, PASSING_SCORE } from '../../context/QuizContext';
import { calculateScore, calculateGrade, timeConverter } from '../../utils';

const Results = () => {
  const navigate = useNavigate();
  const { resultData, quizConfig, exams, replayQuiz, resetQuiz } = useQuiz();
  const [activeTab, setActiveTab] = useState('summary');

  const { totalQuestions, correctAnswers, timeTaken, questionsAndAnswers } = resultData;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const score = calculateScore(totalQuestions, correctAnswers);
  const { grade, remarks } = calculateGrade(score);
  const { hours, minutes, seconds } = timeConverter(timeTaken);
  const isPassing = score >= PASSING_SCORE;

  const examLabel = exams.find((e) => e.value === quizConfig.exam)?.text || quizConfig.exam;

  // replayQuiz() flips isQuizActive true; ResultsRoute (App.js) reacts to
  // that itself and redirects to /quiz, so nothing here needs to navigate.
  const handlePlayAgain = () => {
    replayQuiz();
  };

  const handleBackHome = () => {
    resetQuiz();
    navigate('/');
  };

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

        <div className={styles.headline}>Quiz complete!</div>
        <div className={styles.subtext}>
          You scored {score}% on the {examLabel} exam — {isPassing ? 'you passed. Congratulations!' : `you need ${PASSING_SCORE}% to pass. Keep practising!`}
        </div>

        <div className={styles.actions}>
          <Button variant="primary" icon={IconPlay} onClick={handlePlayAgain}>Play Again</Button>
          <Button variant="secondary" icon={IconHome} onClick={handleBackHome}>Back to Home</Button>
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
      </div>

      {activeTab === 'summary' && (
        <>
          <div className={styles.statsRow}>
            <StatCard label="Total" value={totalQuestions} icon={IconBookOpen} accentColor="#C96442" />
            <StatCard label="Correct" value={correctAnswers} icon={IconCheckCircle} accentColor="#6A8759" />
            <StatCard label="Incorrect" value={incorrectAnswers} icon={IconXCircle} accentColor="#BF4D43" />
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
            {questionsAndAnswers.map((item, i) => {
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

export default Results;
