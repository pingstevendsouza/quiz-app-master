import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layout/AppLayout/AppLayout';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import ManageExams from './pages/ManageExams';
import CreateExam from './pages/CreateExam';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Progress from './pages/Progress';

// Each guard renders nothing while the initial /api/auth/session check is
// in flight — avoids flashing a redirect for a user whose session cookie
// just hasn't been confirmed yet.
const RequireAuth = ({ children }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// /login and /signup are unauthenticated-only — an already-logged-in user
// has no reason to see them again.
const RequireGuest = ({ children }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
};

// /quiz has no meaning without an active quiz session — send the user back
// to the dashboard to start one instead of rendering a broken page.
// Finishing a quiz (submit or time-up) always flips `isQuizActive` false in
// the same state update that sets `resultData`, which unmounts <Quiz/> here
// immediately — before any navigate('/results') call inside Quiz itself gets
// a chance to run. Routing straight to /results when a result is already
// available (instead of always falling back to "/") avoids that race
// entirely rather than trying to out-time it.
const QuizRoute = () => {
  const { isQuizActive, resultData } = useQuiz();
  if (isQuizActive) return <Quiz />;
  return <Navigate to={resultData ? '/results' : '/'} replace />;
};

// /results has no meaning without a finished quiz's results in context.
// "Play Again" (Results) calls replayQuiz(), which sets isQuizActive true
// and resultData null in the same batch — checking isQuizActive first (and
// routing to /quiz instead of unconditionally falling back to "/") lets that
// transition happen by letting this guard react to committed state, instead
// of racing a navigate('/quiz') call against it the same way /quiz used to
// race navigate('/results') on submit.
const ResultsRoute = () => {
  const { isQuizActive, resultData } = useQuiz();
  if (isQuizActive) return <Navigate to="/quiz" replace />;
  return resultData ? <Results /> : <Navigate to="/" replace />;
};

const App = () => (
  <AuthProvider>
    <QuizProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route
          path="/signup"
          element={
            <RequireGuest>
              <Signup />
            </RequireGuest>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </RequireAuth>
          }
        />
        {/* No AppLayout for Quiz/Results — full-focus screens per the approved design. */}
        <Route
          path="/quiz"
          element={
            <RequireAuth>
              <QuizRoute />
            </RequireAuth>
          }
        />
        <Route
          path="/results"
          element={
            <RequireAuth>
              <ResultsRoute />
            </RequireAuth>
          }
        />
        <Route
          path="/progress"
          element={
            <RequireAuth>
              <AppLayout>
                <Progress />
              </AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/manage-exams"
          element={
            <RequireAdmin>
              <AppLayout>
                <ManageExams />
              </AppLayout>
            </RequireAdmin>
          }
        />
        <Route
          path="/create-exam"
          element={
            <RequireAdmin>
              <AppLayout>
                <CreateExam />
              </AppLayout>
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QuizProvider>
  </AuthProvider>
);

export default App;
