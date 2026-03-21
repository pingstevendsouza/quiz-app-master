import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import he from 'he';
import { getLetter } from '../../utils';

const QuizPage = ({ data, endQuiz, timeTaken: elapsedTime, timeOverHandlerRef }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userSelectedAns, setUserSelectedAns] = useState([]);
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);

  const correctAnswersRef = useRef(0);
  const questionsAndAnswersRef = useRef([]);

  const currentQuestion = data[questionIndex];
  const isMultiple = currentQuestion.correct_answers.length > 1;
  const progress = Math.round(((questionIndex) / data.length) * 100);
  const selectedForCurrent = userSelectedAns[questionIndex] || [];

  useEffect(() => {
    correctAnswersRef.current = correctAnswers;
    questionsAndAnswersRef.current = questionsAndAnswers;
  });

  useEffect(() => {
    if (timeOverHandlerRef) {
      timeOverHandlerRef.current = (elapsed) => {
        endQuiz({
          totalQuestions: data.length,
          correctAnswers: correctAnswersRef.current,
          timeTaken: elapsed,
          questionsAndAnswers: questionsAndAnswersRef.current,
        });
      };
    }
    return () => {
      if (timeOverHandlerRef) timeOverHandlerRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (questionIndex > 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [questionIndex]);

  const toggleOption = (decodedOption) => {
    const updated = [...userSelectedAns];
    if (!updated[questionIndex]) updated[questionIndex] = [];

    if (isMultiple) {
      const idx = updated[questionIndex].indexOf(decodedOption);
      if (idx === -1) {
        updated[questionIndex] = [...updated[questionIndex], decodedOption];
      } else {
        updated[questionIndex] = updated[questionIndex].filter((o) => o !== decodedOption);
      }
    } else {
      updated[questionIndex] = [decodedOption];
    }
    setUserSelectedAns(updated);
  };

  const isSelected = (decodedOption) =>
    selectedForCurrent.includes(decodedOption);

  const handleNext = () => {
    const selected = userSelectedAns[questionIndex] || [];
    let point = 0;
    if (
      JSON.stringify([...selected].sort()) ===
      he.decode(JSON.stringify([...currentQuestion.correct_answers].sort()))
    ) {
      point = 1;
    }

    const qna = [...questionsAndAnswers, {
      question: he.decode(currentQuestion.question),
      user_answer: selected,
      correct_answer: currentQuestion.correct_answers.map((a) => he.decode(a)),
      point,
    }];

    if (questionIndex === data.length - 1) {
      return endQuiz({
        totalQuestions: data.length,
        correctAnswers: correctAnswers + point,
        timeTaken: elapsedTime || 0,
        questionsAndAnswers: qna,
      });
    }

    setCorrectAnswers(correctAnswers + point);
    setQuestionIndex(questionIndex + 1);
    setQuestionsAndAnswers(qna);
  };

  const handlePrev = () => {
    const prevQna = [...questionsAndAnswers];
    const removed = prevQna.pop();
    setCorrectAnswers(correctAnswers - (removed?.point || 0));
    setQuestionsAndAnswers(prevQna);
    setQuestionIndex(questionIndex - 1);
  };

  const isLastQuestion = questionIndex === data.length - 1;
  const canProceed = selectedForCurrent.length > 0;

  return (
    <>
      {/* Progress Header */}
      <div className="af-card af-mb-20">
        <div className="af-card__body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--af-text-muted)' }}>
              Question {questionIndex + 1} of {data.length}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--af-accent)' }}>
              {progress}% Complete
            </span>
          </div>
          <div className="af-progress">
            <div
              className="af-progress__bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="af-question-card">
        <div className="af-question-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="af-question-card__badge">
              Q{questionIndex + 1}
            </span>
            <span
              className={classNames('af-question-card__type-badge', {
                'af-question-card__type-badge--single': !isMultiple,
                'af-question-card__type-badge--multiple': isMultiple,
              })}
            >
              {isMultiple ? '☑ Multiple Choice' : '◉ Single Choice'}
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--af-text-muted)' }}>
            {data.length - questionIndex - 1} questions remaining
          </span>
        </div>

        <div className="af-question-card__body">
          {/* Question Text */}
          <div className="af-question-text">
            {he.decode(currentQuestion.question)}
          </div>

          {isMultiple && (
            <div className="af-alert af-alert--info af-mb-16" style={{ padding: '8px 14px' }}>
              <span style={{ fontSize: 13 }}>
                ℹ️ This question has <strong>multiple correct answers</strong>. Select all that apply.
              </span>
            </div>
          )}

          {/* Answer Options */}
          <ul className="af-options">
            {currentQuestion.options.map((option, i) => {
              const letter = getLetter(i);
              const decoded = he.decode(option);
              const selected = isSelected(decoded);

              return (
                <li key={decoded}>
                  <div
                    className={classNames('af-option', { 'af-option--selected': selected })}
                    onClick={() => toggleOption(decoded)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleOption(decoded)}
                  >
                    <span className="af-option__letter">{letter}</span>
                    <span className="af-option__text">{decoded}</span>
                    <span className={isMultiple ? 'af-option__checkbox' : 'af-option__check'} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer / Navigation */}
        <div className="af-card__footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {questionIndex > 0 && (
              <button className="af-btn af-btn--outline" onClick={handlePrev}>
                ← Previous
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!canProceed && (
              <span style={{ fontSize: 12, color: 'var(--af-text-muted)' }}>
                Select an answer to continue
              </span>
            )}
            <button
              className={classNames('af-btn', {
                'af-btn--success': isLastQuestion,
                'af-btn--primary': !isLastQuestion,
              })}
              onClick={handleNext}
              disabled={!canProceed}
            >
              {isLastQuestion ? '✔ Submit Quiz' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {/* Mini Question Map */}
      <div className="af-card af-mt-20">
        <div className="af-card__header">
          <h3 className="af-card__title" style={{ fontSize: 13 }}>Question Navigator</h3>
        </div>
        <div className="af-card__body" style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.map((_, i) => {
              const answered = userSelectedAns[i] && userSelectedAns[i].length > 0;
              const isCurrent = i === questionIndex;
              return (
                <button
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: isCurrent
                      ? '2px solid var(--af-accent)'
                      : '1px solid var(--af-card-border)',
                    background: isCurrent
                      ? 'var(--af-accent)'
                      : answered
                      ? '#e8f0fc'
                      : '#fff',
                    color: isCurrent ? '#fff' : answered ? 'var(--af-accent)' : 'var(--af-text-muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'default',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizPage;
