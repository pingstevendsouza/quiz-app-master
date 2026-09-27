import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import Toggle from '../../components/Toggle/Toggle';
import StatCard from '../../components/StatCard/StatCard';
import OfflineBanner from '../../components/OfflineBanner/OfflineBanner';
import { IconBookOpen, IconTarget, IconClock, IconAward, IconPlay } from '../../icons';
import { useQuiz, PASSING_SCORE } from '../../context/QuizContext';
import { COUNTDOWN_DURATION } from '../../constants';

const preventNegativeValues = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

const Dashboard = () => {
  const navigate = useNavigate();
  const { exams, quizConfig, updateQuizConfig, startQuiz } = useQuiz();
  const { exam, doShuffle, fromVal, toVal, showAnswers, countdownTime } = quizConfig;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const totalSeconds = countdownTime;
  // fromVal/toVal can be '' momentarily while the user is editing (see the
  // input handlers below) — treat that as "not yet a valid range" rather
  // than coercing to 0, which is what caused the field to snap back to "0"
  // the instant it was cleared.
  const fromNum = fromVal === '' ? NaN : Number(fromVal);
  const toNum = toVal === '' ? NaN : Number(toVal);
  const validRange = !Number.isNaN(fromNum) && !Number.isNaN(toNum) && toNum >= fromNum;
  const allFieldsSelected = exam && doShuffle && validRange && totalSeconds > 0;

  const questionsCount = validRange ? toNum - fromNum + 1 : 0;
  const selectedExamLabel = exams.find((e) => e.value === exam)?.text || exam;

  const handleStartQuiz = async () => {
    setError(null);
    setProcessing(true);
    const result = await startQuiz();
    setProcessing(false);

    if (result.ok) {
      navigate('/quiz');
    } else if (result.offline) {
      setOffline(true);
    } else {
      setError(result.error);
    }
  };

  if (offline) return <OfflineBanner />;

  return (
    <div>
      <Card className={styles.welcomeCard}>
        <div className={styles.welcomeHeading}>Welcome back</div>
        <div className={styles.welcomeText}>
          Pick up where you left off, or configure a new practice exam below to sharpen your ServiceNow skills.
        </div>
      </Card>

      <div className={styles.statsRow}>
        <StatCard label="Selected Exam" value={selectedExamLabel} icon={IconBookOpen} accentColor="#C96442" />
        <StatCard label="Questions" value={questionsCount} icon={IconTarget} accentColor="#C1873D" />
        <StatCard label="Time Limit" value={`${Math.floor(totalSeconds / 60)}m`} icon={IconClock} accentColor="#6A8759" />
        <StatCard label="Passing Score" value={`${PASSING_SCORE}%`} icon={IconAward} accentColor="#BF4D43" />
      </div>

      <Card>
        <div className={styles.cardHeader}>
          <div className={styles.configHeading}>Exam Configuration</div>
          <div className={styles.configSubtitle}>Set up your exam parameters before starting</div>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="exam-select">Select Exam</label>
              <Select
                id="exam-select"
                value={exam}
                onChange={(value) => updateQuizConfig({ exam: value })}
                options={exams}
                disabled={processing}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="duration-select">Countdown Duration</label>
              <Select
                id="duration-select"
                value={countdownTime}
                onChange={(value) => updateQuizConfig({ countdownTime: value })}
                options={COUNTDOWN_DURATION}
                disabled={processing}
              />
            </div>

            <div className={styles.toggleRow}>
              <Toggle
                id="shuffle-toggle"
                checked={doShuffle === 'yes'}
                onChange={(checked) => updateQuizConfig({ doShuffle: checked ? 'yes' : 'no' })}
                label="Shuffle Questions?"
                disabled={processing}
              />
              <Toggle
                id="show-answers-toggle"
                checked={showAnswers}
                onChange={(checked) => updateQuizConfig({ showAnswers: checked })}
                label="Show Answers During Quiz"
                disabled={processing}
              />
            </div>

            <div>
              <div className={styles.inputRow}>
                <div className={styles.inlineField}>
                  <label className={styles.label} htmlFor="from-val">From Question #</label>
                  <input
                    id="from-val"
                    className={styles.numberInput}
                    type="number"
                    min="1"
                    value={fromVal}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateQuizConfig({ fromVal: raw === '' ? '' : Number(raw) });
                    }}
                    onKeyDown={preventNegativeValues}
                    disabled={processing}
                  />
                </div>
                <div className={styles.inlineField}>
                  <label className={styles.label} htmlFor="to-val">To Question #</label>
                  <input
                    id="to-val"
                    className={styles.numberInput}
                    type="number"
                    min="1"
                    value={toVal}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateQuizConfig({ toVal: raw === '' ? '' : Number(raw) });
                    }}
                    onKeyDown={preventNegativeValues}
                    disabled={processing}
                  />
                </div>
              </div>
              {!validRange && (
                <div className={styles.fieldError}>&quot;To&quot; must be greater than or equal to &quot;From&quot;.</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="primary" icon={IconPlay} onClick={handleStartQuiz} disabled={!allFieldsSelected || processing}>
            {processing ? 'Loading...' : 'Start Quiz'}
          </Button>
          <span className={styles.footerHint}>Make sure all fields are filled before starting.</span>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
