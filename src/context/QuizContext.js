import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import he from 'he';
import { EXAMS } from '../constants';
import { shuffle, calculateScore } from '../utils';

// Hardcoded across both legacy apps (classic Stats.js, airframe ResultsPage.js) —
// there is no per-exam passing-score config anywhere in the original data model.
export const PASSING_SCORE = 60;

const QuizContext = createContext(null);

const DEFAULT_QUIZ_CONFIG = {
  exam: 'CSA',
  doShuffle: 'no',
  fromVal: 1,
  toVal: 60,
  showAnswers: false,
  countdownTime: 5400, // 1 hour 30 min, in seconds
};

// Mobile browsers frequently kill and reload a backgrounded tab/PWA instead
// of just pausing it — all in-memory state (including an in-progress quiz)
// is lost on that reload unless it's persisted somewhere. Snapshotting the
// session to localStorage, and rehydrating from it on mount, is what makes
// "minimize the app, reopen it" resume where it left off instead of
// bouncing back to the dashboard.
const SESSION_STORAGE_KEY = 'quizPrepSession';

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — the session
    // just won't survive a reload; nothing else depends on this succeeding.
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
};

// Exact per-question grading formula from the original Quiz/QuizPage
// components: the user's sorted selected answers (already he-decoded at
// selection time) are compared, as a JSON string, against the he-decoded,
// sorted correct_answers from the exam data.
const gradeQuestion = (question, selected) => {
  const sel = selected || [];
  const isCorrect =
    JSON.stringify([...sel].sort()) ===
    he.decode(JSON.stringify([...question.correct_answers].sort()));
  return isCorrect ? 1 : 0;
};

// Builds the full { totalQuestions, correctAnswers, timeTaken, questionsAndAnswers }
// result payload by grading every question against the user's latest selection.
// NOTE: the original apps computed/accumulated this incrementally as the user
// clicked "Next" (and un-did it on "Previous"). This app adds a question
// navigator that lets the user jump to any question out of order, which the
// incremental approach can't support correctly (jumping skips the Next/Prev
// bookkeeping). Computing the full result once, at submit/time-up time, from
// the final userSelectedAns array is behaviorally identical to the original
// for straight-through navigation, and is the only approach that stays
// correct when the user jumps around via the navigator.
const buildResult = (questions, userSelectedAns, timeTaken) => {
  let correctAnswers = 0;
  const questionsAndAnswers = questions.map((question, i) => {
    const selected = userSelectedAns[i] || [];
    const point = gradeQuestion(question, selected);
    correctAnswers += point;
    return {
      question: he.decode(question.question),
      user_answer: selected,
      correct_answer: question.correct_answers.map((a) => he.decode(a)),
      point,
    };
  });

  return {
    totalQuestions: questions.length,
    correctAnswers,
    timeTaken,
    questionsAndAnswers,
  };
};

export const QuizProvider = ({ children }) => {
  const savedSession = loadSession();

  const [exams, setExams] = useState(EXAMS);
  const [quizConfig, setQuizConfigState] = useState(savedSession?.quizConfig ?? DEFAULT_QUIZ_CONFIG);

  const [questions, setQuestions] = useState(savedSession?.questions ?? null);
  const [countdownSeconds, setCountdownSeconds] = useState(savedSession?.countdownSeconds ?? null);
  const [questionIndex, setQuestionIndex] = useState(savedSession?.questionIndex ?? 0);
  const [userSelectedAns, setUserSelectedAns] = useState(savedSession?.userSelectedAns ?? []);
  // Absolute timestamp (ms) the current attempt started at, rather than a
  // duration ticking down in local component state — that's what lets the
  // remaining time be recomputed correctly from real elapsed wall-clock
  // time after a reload, instead of resetting to the full duration.
  const [quizStartedAt, setQuizStartedAt] = useState(savedSession?.quizStartedAt ?? null);

  const [isQuizActive, setIsQuizActive] = useState(savedSession?.isQuizActive ?? false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(savedSession?.isQuizCompleted ?? false);
  const [resultData, setResultData] = useState(savedSession?.resultData ?? null);

  useEffect(() => {
    if (!isQuizActive && !isQuizCompleted) {
      clearSession();
      return;
    }
    saveSession({
      quizConfig,
      questions,
      countdownSeconds,
      questionIndex,
      userSelectedAns,
      quizStartedAt,
      isQuizActive,
      isQuizCompleted,
      resultData,
    });
  }, [quizConfig, questions, countdownSeconds, questionIndex, userSelectedAns, quizStartedAt, isQuizActive, isQuizCompleted, resultData]);

  const fetchExams = useCallback(() => {
    return fetch('/api/list-exams')
      .then((r) => r.json())
      .then((data) => {
        if (data.exams) setExams(data.exams);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQuizConfig = useCallback((patch) => {
    setQuizConfigState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Fetch + shuffle/slice logic adapted from Main/index.js and
  // airframe/DashboardPage.js's fetchData. The originals treated "shuffle"
  // and "from/to range" as mutually exclusive: shuffle=yes drew numOfQuestions
  // random questions from the *entire* bank, silently ignoring fromVal/toVal.
  // Shuffle now always applies within the selected range instead, so it
  // shuffles the order of exactly the questions the user asked for.
  const startQuiz = useCallback(async () => {
    const { exam, doShuffle, fromVal, toVal, countdownTime } = quizConfig;

    try {
      const response = await fetch(`/api/exams?exam=${encodeURIComponent(exam)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam data. Please try again.');
      }

      const data = await response.json();
      const { response_code, results } = data;

      if (response_code === 404) {
        return {
          ok: false,
          error:
            "The API doesn't have enough questions for your query. Please change the number of questions or the question range and try again.",
        };
      }

      results.forEach((element) => {
        const options = [...new Set([...element.correct_answers, ...element.incorrect_answers])];
        element.options = shuffle(options);
      });

      const ranged = results.slice(fromVal - 1, toVal);
      if (ranged.length === 0) {
        return {
          ok: false,
          error: 'The selected question range is empty. Please adjust "From"/"To" and try again.',
        };
      }
      const resultsMixed = doShuffle === 'yes' ? shuffle(ranged) : ranged;

      setQuestions(resultsMixed);
      setCountdownSeconds(countdownTime);
      setQuestionIndex(0);
      setUserSelectedAns([]);
      setQuizStartedAt(Date.now());
      setResultData(null);
      setIsQuizCompleted(false);
      setIsQuizActive(true);

      return { ok: true };
    } catch (err) {
      if (!navigator.onLine) {
        return { ok: false, offline: true };
      }
      return { ok: false, error: err.message || 'Something went wrong. Please try again.' };
    }
  }, [quizConfig]);

  const toggleOption = useCallback(
    (decodedOption) => {
      setUserSelectedAns((prev) => {
        const updated = [...prev];
        const current = updated[questionIndex] || [];
        const isMultiple = questions[questionIndex].correct_answers.length > 1;

        if (isMultiple) {
          const idx = current.indexOf(decodedOption);
          updated[questionIndex] = idx === -1 ? [...current, decodedOption] : current.filter((o) => o !== decodedOption);
        } else {
          updated[questionIndex] = [decodedOption];
        }

        return updated;
      });
    },
    [questionIndex, questions]
  );

  // elapsedMs is computed from the absolute quizStartedAt timestamp by the
  // caller (real wall-clock time), not accumulated from a ticking timer —
  // that stays correct even across a background-triggered reload.
  const finalizeQuiz = useCallback(
    (elapsedMs) => {
      const result = buildResult(questions, userSelectedAns, elapsedMs);
      setResultData(result);
      setIsQuizActive(false);
      setIsQuizCompleted(true);

      // Fire-and-forget audit-trail write for the new "My Progress" history
      // page — doesn't block rendering the Results page, but a failure is
      // logged rather than silently swallowed.
      const score = calculateScore(result.totalQuestions, result.correctAnswers);
      const examLabel = exams.find((e) => e.value === quizConfig.exam)?.text || quizConfig.exam;
      fetch('/api/results', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: quizConfig.exam,
          examLabel,
          score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          incorrectAnswers: result.totalQuestions - result.correctAnswers,
          timeTaken: elapsedMs,
          passed: score >= PASSING_SCORE,
          completedAt: Date.now(),
          questionsAndAnswers: result.questionsAndAnswers,
        }),
      }).catch((err) => console.warn('Failed to record quiz result:', err));
    },
    [questions, userSelectedAns, exams, quizConfig]
  );

  // Advances to the next question, or finalizes the quiz (grading every
  // question) when called from the last question — mirrors the original
  // handleNext's dual role of "Next" / "Submit".
  const goNext = useCallback(() => {
    if (questionIndex === questions.length - 1) {
      finalizeQuiz(quizStartedAt ? Date.now() - quizStartedAt : 0);
      return 'submitted';
    }
    setQuestionIndex((i) => i + 1);
    return 'next';
  }, [questionIndex, questions, finalizeQuiz, quizStartedAt]);

  const goPrev = useCallback(() => {
    setQuestionIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToQuestion = useCallback(
    (index) => {
      if (!questions) return;
      if (index < 0 || index >= questions.length) return;
      setQuestionIndex(index);
    },
    [questions]
  );

  // Same reshuffle behavior as the original replayQuiz: reshuffle question
  // order and each question's option order, keep the same countdown length.
  const replayQuiz = useCallback(() => {
    setQuestions((prev) => {
      const shuffled = shuffle(prev);
      shuffled.forEach((q) => {
        q.options = shuffle(q.options);
      });
      return shuffled;
    });
    setQuestionIndex(0);
    setUserSelectedAns([]);
    setQuizStartedAt(Date.now());
    setResultData(null);
    setIsQuizCompleted(false);
    setIsQuizActive(true);
  }, []);

  const resetQuiz = useCallback(() => {
    setQuestions(null);
    setCountdownSeconds(null);
    setQuestionIndex(0);
    setUserSelectedAns([]);
    setQuizStartedAt(null);
    setIsQuizActive(false);
    setIsQuizCompleted(false);
    setResultData(null);
  }, []);

  const value = {
    exams,
    fetchExams,
    quizConfig,
    updateQuizConfig,
    questions,
    countdownSeconds,
    questionIndex,
    userSelectedAns,
    quizStartedAt,
    isQuizActive,
    isQuizCompleted,
    resultData,
    startQuiz,
    toggleOption,
    goNext,
    goPrev,
    goToQuestion,
    finalizeQuiz,
    replayQuiz,
    resetQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return ctx;
};
