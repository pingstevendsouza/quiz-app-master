import React, { useState, useRef } from 'react';
import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import UploadPage from './pages/UploadPage';
import CreateExamPage from './pages/CreateExamPage';
import { shuffle } from '../utils';
import './styles/airframe.css';

const AirframeApp = () => {
  const timeOverHandlerRef = useRef(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [data, setData] = useState(null);
  const [countdownTime, setCountdownTime] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [timeTaken, setTimeTaken] = useState(null);

  const [promptEvent, setPromptEvent] = useState(null);
  const [appAccepted, setAppAccepted] = useState(false);

  const isAppInstalled =
    window.matchMedia('(display-mode: standalone)').matches || appAccepted;

  React.useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPromptEvent(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    promptEvent.userChoice.then((result) => {
      if (result.outcome === 'accepted') setAppAccepted(true);
    });
  };

  const startQuiz = (quizData, time) => {
    setLoading(true);
    setLoadingMessage({ title: 'Loading your quiz...', message: "It won't be long!" });
    setCountdownTime(time);
    setTimeout(() => {
      setData(quizData);
      setIsQuizStarted(true);
      setIsQuizCompleted(false);
      setResultData(null);
      setLoading(false);
      setActivePage('quiz-active');
    }, 800);
  };

  const endQuiz = (result) => {
    setLoading(true);
    setLoadingMessage({ title: 'Fetching your results...', message: 'Just a moment!' });
    setTimeout(() => {
      setIsQuizStarted(false);
      setIsQuizCompleted(true);
      setResultData(result);
      setLoading(false);
      setActivePage('results');
    }, 1200);
  };

  const replayQuiz = () => {
    setLoading(true);
    setLoadingMessage({ title: 'Getting ready for round two.', message: "It won't take long!" });
    const shuffledData = shuffle(data);
    shuffledData.forEach((el) => { el.options = shuffle(el.options); });
    setData(shuffledData);
    setTimeout(() => {
      setIsQuizStarted(true);
      setIsQuizCompleted(false);
      setResultData(null);
      setLoading(false);
      setActivePage('quiz-active');
    }, 800);
  };

  const resetQuiz = () => {
    setLoading(true);
    setLoadingMessage({ title: 'Loading the home screen.', message: 'Thank you for playing!' });
    setTimeout(() => {
      setData(null);
      setCountdownTime(null);
      setIsQuizStarted(false);
      setIsQuizCompleted(false);
      setResultData(null);
      setLoading(false);
      setActivePage('dashboard');
    }, 800);
  };

  const handleNavigate = (page) => {
    if (page === 'quiz-setup' || page === 'dashboard') {
      if (isQuizStarted || isQuizCompleted) {
        resetQuiz();
      } else {
        setActivePage('dashboard');
      }
      return;
    }
    setActivePage(page);
  };

  const timeOver = (elapsed) => {
    if (timeOverHandlerRef.current) {
      timeOverHandlerRef.current(elapsed);
    } else {
      endQuiz({
        totalQuestions: data.length,
        correctAnswers: 0,
        timeTaken: elapsed,
        questionsAndAnswers: [],
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="af-loader">
          <div className="af-loader__spinner" />
          <p className="af-loader__title">{loadingMessage?.title}</p>
          <p className="af-loader__message">{loadingMessage?.message}</p>
        </div>
      );
    }

    if (activePage === 'upload') {
      return <UploadPage />;
    }

    if (activePage === 'create-exam') {
      return <CreateExamPage />;
    }

    if (isQuizStarted && activePage === 'quiz-active' && data) {
      return (
        <QuizPage
          data={data}
          endQuiz={endQuiz}
          timeTaken={timeTaken}
          timeOverHandlerRef={timeOverHandlerRef}
        />
      );
    }

    if (isQuizCompleted && activePage === 'results' && resultData) {
      return (
        <ResultsPage
          {...resultData}
          replayQuiz={replayQuiz}
          resetQuiz={resetQuiz}
        />
      );
    }

    return <DashboardPage startQuiz={startQuiz} />;
  };

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={handleNavigate}
      countdownTime={isQuizStarted ? countdownTime : null}
      timeOver={timeOver}
      setTimeTaken={setTimeTaken}
      showInstall={!!promptEvent && !isAppInstalled}
      onInstallApp={installApp}
    >
      {renderContent()}
    </AppLayout>
  );
};

export default AirframeApp;
