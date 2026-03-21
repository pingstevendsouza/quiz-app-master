import React, { useState, useEffect } from 'react';
import {
  EXAMS,
  NUM_OF_QUESTIONS,
  COUNTDOWN_TIME,
  SHUFFLE,
} from '../../constants';
import { shuffle } from '../../utils';
import Offline from '../../components/Offline';

const DashboardPage = ({ startQuiz }) => {
  const [exam, setExam] = useState('CSA');
  const [dynamicExams, setDynamicExams] = useState(EXAMS);

  useEffect(() => {
    fetch('/api/list-exams')
      .then(r => r.json())
      .then(data => { if (data.exams) setDynamicExams(data.exams); })
      .catch(() => {});
  }, []);
  const [numOfQuestions, setNumOfQuestions] = useState(60);
  const [doShuffle, setShuffle] = useState('no');
  const [fromVal, setFromVal] = useState(1);
  const [toVal, setToVal] = useState(60);
  const [countdownTime, setCountdownTime] = useState({
    hours: 3600,
    minutes: 1800,
    seconds: 0,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  const allFieldsSelected =
    exam &&
    numOfQuestions &&
    doShuffle &&
    (countdownTime.hours || countdownTime.minutes || countdownTime.seconds);

  const preventNegative = (e) =>
    ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setCountdownTime((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const fetchData = async () => {
    if (error) setError(null);
    setProcessing(true);

    try {
      const response = await fetch('/api/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `${exam}.json`, type: 'json' }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam data. Please try again.');
      }

      const data = await response.json();
      const { response_code, results } = data;

      if (response_code === 404) {
        setProcessing(false);
        setError(
          "The API doesn't have enough questions for your query. Please change the settings and try again."
        );
        return;
      }

      results.forEach((element) => {
        const options = [
          ...new Set([...element.correct_answers, ...element.incorrect_answers]),
        ];
        element.options = shuffle(options);
      });

      let resultsMixed =
        doShuffle === 'yes'
          ? shuffle(results)
          : results.slice(fromVal - 1, toVal);
      if (doShuffle === 'yes') resultsMixed.length = numOfQuestions;

      setProcessing(false);
      startQuiz(
        resultsMixed,
        countdownTime.hours + countdownTime.minutes + countdownTime.seconds
      );
    } catch (err) {
      setProcessing(false);
      if (!navigator.onLine) {
        setOffline(true);
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  if (offline) return <Offline />;

  return (
    <>
      {/* Hero Banner */}
      <div className="af-hero-banner">
        <div className="af-hero-banner__title">🎓 ServiceNow Quiz</div>
        <div className="af-hero-banner__sub">
          Test your ServiceNow knowledge. Choose an exam, configure settings, and start!
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {dynamicExams.map((e) => (
            <span
              key={e.value}
              style={{
                background: exam === e.value ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 100,
                padding: '4px 14px',
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => setExam(e.value)}
            >
              {e.text}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="af-grid af-grid--4 af-mb-20">
        <div className="af-stat-card">
          <div className="af-stat-card__icon" style={{ background: '#e8f0fc' }}>📋</div>
          <div>
            <div className="af-stat-card__label">Selected Exam</div>
            <div className="af-stat-card__value" style={{ fontSize: 18 }}>{exam}</div>
          </div>
        </div>
        <div className="af-stat-card">
          <div className="af-stat-card__icon" style={{ background: '#e8f5e9' }}>❓</div>
          <div>
            <div className="af-stat-card__label">Questions</div>
            <div className="af-stat-card__value" style={{ fontSize: 18 }}>
              {doShuffle === 'yes' ? numOfQuestions : toVal - fromVal + 1}
            </div>
          </div>
        </div>
        <div className="af-stat-card">
          <div className="af-stat-card__icon" style={{ background: '#fff3e0' }}>⏱</div>
          <div>
            <div className="af-stat-card__label">Time Limit</div>
            <div className="af-stat-card__value" style={{ fontSize: 18 }}>
              {Math.floor((countdownTime.hours + countdownTime.minutes + countdownTime.seconds) / 60)}m
            </div>
          </div>
        </div>
        <div className="af-stat-card">
          <div className="af-stat-card__icon" style={{ background: '#fce4ec' }}>🎯</div>
          <div>
            <div className="af-stat-card__label">Passing Score</div>
            <div className="af-stat-card__value" style={{ fontSize: 18 }}>60%</div>
          </div>
        </div>
      </div>

      {/* Quiz Config Card */}
      <div className="af-card">
        <div className="af-card__header">
          <div className="af-card__icon" style={{ background: '#e8f0fc' }}>⚙️</div>
          <div>
            <h3 className="af-card__title">Quiz Configuration</h3>
            <p className="af-card__subtitle">Set up your exam parameters before starting</p>
          </div>
        </div>
        <div className="af-card__body">
          {error && (
            <div className="af-alert af-alert--error af-mb-16">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="af-grid af-grid--2">
            {/* Left Column */}
            <div>
              <div className="af-form-group">
                <label className="af-form-label">Select Exam</label>
                <select
                  className="af-form-select"
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  disabled={processing}
                >
                  {dynamicExams.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="af-form-group">
                <label className="af-form-label">Shuffle Questions?</label>
                <select
                  className="af-form-select"
                  value={doShuffle}
                  onChange={(e) => setShuffle(e.target.value)}
                  disabled={processing}
                >
                  {SHUFFLE.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              </div>

              {doShuffle === 'no' ? (
                <div className="af-input-group">
                  <div className="af-form-group">
                    <label className="af-form-label">From Question #</label>
                    <input
                      className="af-form-input"
                      type="number"
                      min="1"
                      value={fromVal}
                      onChange={(e) => setFromVal(Number(e.target.value))}
                      onKeyDown={preventNegative}
                      disabled={processing}
                    />
                  </div>
                  <div className="af-form-group">
                    <label className="af-form-label">To Question #</label>
                    <input
                      className="af-form-input"
                      type="number"
                      min="1"
                      value={toVal}
                      onChange={(e) => setToVal(Number(e.target.value))}
                      onKeyDown={preventNegative}
                      disabled={processing}
                    />
                  </div>
                </div>
              ) : (
                <div className="af-form-group">
                  <label className="af-form-label">Number of Questions</label>
                  <select
                    className="af-form-select"
                    value={numOfQuestions}
                    onChange={(e) => setNumOfQuestions(Number(e.target.value))}
                    disabled={processing}
                  >
                    {NUM_OF_QUESTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.text}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Column — Countdown */}
            <div>
              <div className="af-form-group">
                <label className="af-form-label">Countdown Hours</label>
                <select
                  className="af-form-select"
                  name="hours"
                  value={countdownTime.hours}
                  onChange={handleTimeChange}
                  disabled={processing}
                >
                  {COUNTDOWN_TIME.hours.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="af-form-group">
                <label className="af-form-label">Countdown Minutes</label>
                <select
                  className="af-form-select"
                  name="minutes"
                  value={countdownTime.minutes}
                  onChange={handleTimeChange}
                  disabled={processing}
                >
                  {COUNTDOWN_TIME.minutes.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="af-form-group">
                <label className="af-form-label">Countdown Seconds</label>
                <select
                  className="af-form-select"
                  name="seconds"
                  value={countdownTime.seconds}
                  onChange={handleTimeChange}
                  disabled={processing}
                >
                  {COUNTDOWN_TIME.seconds.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="af-card__footer">
          <button
            className="af-btn af-btn--primary af-btn--lg"
            onClick={fetchData}
            disabled={!allFieldsSelected || processing}
          >
            {processing ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Loading...
              </>
            ) : (
              <>▶ Start Quiz</>
            )}
          </button>
          <span className="af-text-muted" style={{ fontSize: 13 }}>
            Make sure all fields are filled before starting.
          </span>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
