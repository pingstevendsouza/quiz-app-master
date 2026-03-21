import React, { useState } from 'react';
import classNames from 'classnames';
import { calculateScore, calculateGrade, timeConverter } from '../../utils';

const ResultsPage = ({
  totalQuestions,
  correctAnswers,
  timeTaken,
  questionsAndAnswers,
  replayQuiz,
  resetQuiz,
}) => {
  const [activeTab, setActiveTab] = useState('stats');

  const score = calculateScore(totalQuestions, correctAnswers);
  const { grade, remarks } = calculateGrade(score);
  const { hours, minutes, seconds } = timeConverter(timeTaken);
  const isPassing = score >= 60;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getProgressColor = (pct) => {
    if (pct >= 80) return 'af-progress__bar--success';
    if (pct >= 60) return '';
    if (pct >= 40) return 'af-progress__bar--warning';
    return 'af-progress__bar--danger';
  };

  return (
    <>
      <div className="af-page-header">
        <h1 className="af-page-header__title">Quiz Results</h1>
        <p className="af-page-header__sub">Here's how you performed on the exam.</p>
      </div>

      {/* Hero Result Card */}
      <div className="af-card af-mb-20">
        <div className="af-result-hero">
          <div className={classNames('af-result-score-circle', {
            'af-result-score-circle--pass': isPassing,
            'af-result-score-circle--fail': !isPassing,
          })}>
            <span className="af-result-score-value" style={{ color: isPassing ? 'var(--af-success)' : 'var(--af-danger)' }}>
              {score}%
            </span>
            <span className="af-result-score-label" style={{ color: isPassing ? 'var(--af-success)' : 'var(--af-danger)', fontSize: 11 }}>
              Score
            </span>
          </div>

          <div>
            <div className={classNames('af-result-grade-badge', {
              'af-result-grade-badge--pass': isPassing,
              'af-result-grade-badge--fail': !isPassing,
            })}>
              {isPassing ? '✅' : '❌'} Grade: {grade}
            </div>
          </div>

          <div className="af-result-remark">{remarks}</div>
          <div style={{ fontSize: 13, color: 'var(--af-text-muted)' }}>
            {isPassing ? 'Congratulations! You passed the exam.' : 'You need 60% to pass. Keep practising!'}
          </div>

          {/* Score Progress Bar */}
          <div style={{ maxWidth: 360, margin: '20px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--af-text-muted)', marginBottom: 6 }}>
              <span>Your Score</span>
              <span>Passing: 60%</span>
            </div>
            <div className="af-progress" style={{ height: 12 }}>
              <div
                className={classNames('af-progress__bar', getProgressColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
            {/* Passing threshold marker */}
            <div style={{ position: 'relative', height: 0 }}>
              <div style={{
                position: 'absolute',
                left: '60%',
                bottom: 0,
                transform: 'translateX(-50%)',
                width: 2,
                height: 18,
                background: '#94a3b8',
                marginTop: -12,
              }} />
            </div>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="af-card__body">
          <div className="af-grid af-grid--4">
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#e8f0fc' }}>📋</div>
              <div>
                <div className="af-stat-card__label">Total Questions</div>
                <div className="af-stat-card__value">{totalQuestions}</div>
              </div>
            </div>
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#e8f5e9' }}>✅</div>
              <div>
                <div className="af-stat-card__label">Correct</div>
                <div className="af-stat-card__value" style={{ color: 'var(--af-success)' }}>{correctAnswers}</div>
              </div>
            </div>
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#fce4ec' }}>❌</div>
              <div>
                <div className="af-stat-card__label">Incorrect</div>
                <div className="af-stat-card__value" style={{ color: 'var(--af-danger)' }}>{incorrectAnswers}</div>
              </div>
            </div>
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#fff3e0' }}>⏱</div>
              <div>
                <div className="af-stat-card__label">Time Taken</div>
                <div className="af-stat-card__value" style={{ fontSize: 16 }}>
                  {Number(hours)}h {Number(minutes)}m {Number(seconds)}s
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="af-card__footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="af-btn af-btn--primary" onClick={replayQuiz}>
              🔄 Play Again
            </button>
            <button className="af-btn af-btn--teal" onClick={resetQuiz}>
              🏠 Back to Home
            </button>
          </div>
          <button
            className="af-btn af-btn--outline"
            onClick={() => {
              const text = `I scored ${score}% (${grade}) on the ServiceNow Quiz! ${isPassing ? 'I passed! 🎉' : 'Keep practising!'} Correct: ${correctAnswers}/${totalQuestions}`;
              if (navigator.share) {
                navigator.share({ title: 'ServiceNow Quiz Result', text });
              } else {
                navigator.clipboard.writeText(text);
                alert('Result copied to clipboard!');
              }
            }}
          >
            📤 Share Result
          </button>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="af-card">
        <div className="af-card__header">
          <div className="af-card__icon" style={{ background: '#e8f0fc' }}>📝</div>
          <div>
            <h3 className="af-card__title">Detailed Review</h3>
            <p className="af-card__subtitle">Review your answers question by question</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px' }}>
          <div className="af-tabs">
            <button
              className={classNames('af-tab', { active: activeTab === 'stats' })}
              onClick={() => setActiveTab('stats')}
            >
              📊 Summary
            </button>
            <button
              className={classNames('af-tab', { active: activeTab === 'qna' })}
              onClick={() => setActiveTab('qna')}
            >
              🔍 Q&amp;A Review
            </button>
          </div>
        </div>

        {activeTab === 'stats' && (
          <div className="af-card__body">
            <div style={{ maxWidth: 480 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Correct Answers</span>
                  <span style={{ color: 'var(--af-success)', fontWeight: 700 }}>
                    {correctAnswers} / {totalQuestions}
                  </span>
                </div>
                <div className="af-progress">
                  <div
                    className="af-progress__bar af-progress__bar--success"
                    style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Incorrect Answers</span>
                  <span style={{ color: 'var(--af-danger)', fontWeight: 700 }}>
                    {incorrectAnswers} / {totalQuestions}
                  </span>
                </div>
                <div className="af-progress">
                  <div
                    className="af-progress__bar af-progress__bar--danger"
                    style={{ width: `${(incorrectAnswers / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              <div className="af-divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span className="af-text-muted">Final Score</span>
                  <strong>{score}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span className="af-text-muted">Passing Score</span>
                  <strong>60%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span className="af-text-muted">Grade</span>
                  <strong>{grade}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span className="af-text-muted">Result</span>
                  <strong style={{ color: isPassing ? 'var(--af-success)' : 'var(--af-danger)' }}>
                    {isPassing ? 'PASS ✅' : 'FAIL ❌'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span className="af-text-muted">Time Taken</span>
                  <strong>{Number(hours)}h {Number(minutes)}m {Number(seconds)}s</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qna' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="af-table">
              <thead>
                <tr>
                  <th style={{ width: 42 }}>#</th>
                  <th>Question</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {questionsAndAnswers.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--af-text-muted)' }}>{i + 1}</td>
                    <td style={{ maxWidth: 260 }}>{item.question}</td>
                    <td className={item.point === 1 ? 'af-table__correct' : 'af-table__wrong'}>
                      {Array.isArray(item.user_answer)
                        ? item.user_answer.join(', ')
                        : item.user_answer}
                    </td>
                    <td className="af-table__correct">
                      {Array.isArray(item.correct_answer)
                        ? item.correct_answer.join(', ')
                        : item.correct_answer}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={classNames('af-table__point-badge', {
                        'af-table__point-badge--1': item.point === 1,
                        'af-table__point-badge--0': item.point === 0,
                      })}>
                        {item.point === 1 ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ResultsPage;
