import React from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsView from './ResultsView';
import { useQuiz, PASSING_SCORE } from '../../context/QuizContext';
import { calculateScore } from '../../utils';

// Live, just-finished-quiz results screen. Reads useQuiz()'s resultData and
// passes it into the shared ResultsView (see ResultsView.js) — behavior here
// is unchanged from before ResultsView was extracted out of this file.
const Results = () => {
  const navigate = useNavigate();
  const { resultData, quizConfig, exams, replayQuiz, resetQuiz } = useQuiz();

  const { totalQuestions, correctAnswers, timeTaken, questionsAndAnswers } = resultData;
  const score = calculateScore(totalQuestions, correctAnswers);
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
    <ResultsView
      score={score}
      correctAnswers={correctAnswers}
      totalQuestions={totalQuestions}
      timeTaken={timeTaken}
      questionsAndAnswers={questionsAndAnswers}
      examLabel={examLabel}
      passed={isPassing}
      onPlayAgain={handlePlayAgain}
      onBackHome={handleBackHome}
    />
  );
};

export default Results;
