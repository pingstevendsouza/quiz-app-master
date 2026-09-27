import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import StatCard from '../../components/StatCard/StatCard';
import { IconFilePlus, IconCheckCircle, IconXCircle, IconUpload, IconChevronRight, IconChevronLeft } from '../../icons';
import { extractTextFromPDF } from '../../utils/pdfExtract';
import { useQuiz } from '../../context/QuizContext';

const NUM_OPTIONS = [10, 20, 30, 50].map((n) => ({ value: n, text: `${n} questions` }));

const CreateExam = () => {
  const { fetchExams } = useQuiz();

  const [examName, setExamName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [generatedResults, setGeneratedResults] = useState(null);
  const [removedIndices, setRemovedIndices] = useState(new Set());
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [saving, setSaving] = useState(false);

  const validateAndSetFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  // Exact PDF extraction + /api/create-exam call from CreateExam/index.js
  // and airframe/CreateExamPage.js.
  const handleGenerate = async () => {
    if (!examName.trim()) { setError('Please enter an exam name.'); return; }
    if (!selectedFile) { setError('Please upload a PDF file.'); return; }

    setError(null);
    setSuccessMsg(null);
    setGeneratedResults(null);
    setRemovedIndices(new Set());
    setLoading(true);

    try {
      const text = await extractTextFromPDF(selectedFile);
      if (!text) throw new Error('No text could be extracted. The PDF may be image-only (scanned).');
      const response = await fetch('/api/create-exam', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, examName: examName.trim(), numQuestions }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate exam.');
      }
      setGeneratedResults(data.results);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRemove = (idx) => {
    setRemovedIndices((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const keptQuestions = generatedResults
    ? generatedResults.filter((_, i) => !removedIndices.has(i))
    : [];

  // Exact save logic: upload the kept questions as the exam's JSON file,
  // then register the new exam name in the dynamic exams list.
  const handleSave = async () => {
    if (keptQuestions.length === 0) {
      setError('No questions to save. Keep at least one question.');
      return;
    }

    setSaving(true);
    setError(null);

    const examValue = examName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');

    try {
      const uploadRes = await fetch('/api/admin/exams', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examCode: examValue, examText: examName.trim(), questions: keptQuestions }),
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save exam data.');
      }

      setSuccessMsg(`Exam "${examName.trim()}" saved successfully with ${keptQuestions.length} questions! You can now find it in the quiz setup.`);
      setGeneratedResults(null);
      setExamName('');
      setSelectedFile(null);
      setRemovedIndices(new Set());
      // Refresh the shared exams list so the new exam shows up on the
      // Dashboard / Manage Exams pages without a full page reload.
      fetchExams();
    } catch (err) {
      setError(err.message || 'Failed to save exam.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const examValue = examName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const payload = { response_code: 1, results: keptQuestions };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examValue}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Exam with AI</h1>
        <p className={styles.subtitle}>Upload a PDF study guide and let AI generate quiz questions automatically.</p>
      </div>

      {successMsg && <div className={classNames(styles.message, styles.messageSuccess)}>{successMsg}</div>}
      {error && <div className={classNames(styles.message, styles.messageError)}>{error}</div>}

      {!generatedResults && (
        <Card className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>AI Exam Generator</div>
            <div className={styles.cardSubtitle}>Generates multiple-choice questions from your study material</div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.formGrid}>
              <div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="exam-name">Exam Name</label>
                  <input
                    id="exam-name"
                    className={styles.input}
                    type="text"
                    placeholder="e.g. MY_CERT or ServiceNow HRSD"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    disabled={loading}
                  />
                  <div className={styles.hint}>This becomes the exam key (e.g. MY_CERT.json)</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="num-questions">Number of Questions to Generate</label>
                  <Select
                    id="num-questions"
                    value={numQuestions}
                    onChange={(value) => setNumQuestions(value)}
                    options={NUM_OPTIONS}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Upload PDF Study Guide</label>
                  <div
                    className={classNames(styles.dropZone, { [styles.dropZoneActive]: dragActive })}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('create-exam-file-input').click()}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                      {dragActive ? 'Drop your PDF here!' : 'Drag & drop PDF here'}
                    </div>
                    <div>or click to browse</div>
                  </div>
                  <input
                    id="create-exam-file-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                  />
                  {selectedFile && (
                    <div className={styles.fileChip}>
                      <span style={{ fontWeight: 600 }}>{selectedFile.name}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.cardFooter}>
            <Button
              variant="primary"
              icon={IconFilePlus}
              onClick={handleGenerate}
              disabled={loading || !examName.trim() || !selectedFile}
            >
              {loading ? 'Generating...' : 'Generate Questions with AI'}
            </Button>
            {loading && <span className={styles.hint}>This may take 15-30 seconds depending on PDF size.</span>}
          </div>
        </Card>
      )}

      {generatedResults && (
        <>
          <div className={styles.statsRow}>
            <StatCard label="Generated" value={generatedResults.length} icon={IconFilePlus} accentColor="#C96442" />
            <StatCard label="Selected" value={keptQuestions.length} icon={IconCheckCircle} accentColor="#6A8759" />
            <StatCard label="Removed" value={removedIndices.size} icon={IconXCircle} accentColor="#BF4D43" />
          </div>

          <Card className={styles.card}>
            <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-16)' }}>
              <div>
                <div className={styles.cardTitle}>Review Generated Questions</div>
                <div className={styles.cardSubtitle}>Remove questions you don&rsquo;t want before saving</div>
              </div>
              <Button
                variant="secondary"
                icon={IconChevronLeft}
                onClick={() => { setGeneratedResults(null); setRemovedIndices(new Set()); }}
              >
                Back to Form
              </Button>
            </div>

            <div>
              {generatedResults.map((q, i) => {
                const removed = removedIndices.has(i);
                const expanded = expandedIdx === i;
                return (
                  <div key={i} className={classNames(styles.questionRow, { [styles.questionRowRemoved]: removed })}>
                    <div className={styles.questionRowHeader} onClick={() => setExpandedIdx(expanded ? null : i)}>
                      <span className={classNames(styles.questionIndex, { [styles.questionIndexRemoved]: removed })}>
                        {removed ? <IconXCircle size={14} /> : i + 1}
                      </span>
                      <span className={styles.questionText}>
                        {q.question.length > 120 ? `${q.question.slice(0, 120)}…` : q.question}
                      </span>
                      <span className={styles.difficultyBadge}>{q.difficulty || 'medium'}</span>
                      <Button
                        variant={removed ? 'secondary' : 'ghost'}
                        onClick={(e) => { e.stopPropagation(); toggleRemove(i); }}
                      >
                        {removed ? 'Restore' : 'Remove'}
                      </Button>
                      <span style={{ display: 'inline-flex', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                        <IconChevronRight size={16} />
                      </span>
                    </div>

                    {expanded && (
                      <div className={styles.questionDetail}>
                        <div style={{ marginBottom: 8, fontSize: 13 }}>{q.question}</div>
                        {q.correct_answers.map((a, ai) => (
                          <div className={styles.answerRow} key={`c-${ai}`}>
                            <IconCheckCircle size={14} color="var(--color-success)" />
                            <span>{a}</span>
                          </div>
                        ))}
                        {q.incorrect_answers.map((a, ai) => (
                          <div className={styles.answerRow} key={`w-${ai}`}>
                            <IconXCircle size={14} color="var(--color-danger)" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.cardFooter}>
              <Button variant="primary" icon={IconUpload} onClick={handleSave} disabled={saving || keptQuestions.length === 0}>
                {saving ? 'Saving...' : `Save Exam (${keptQuestions.length} questions)`}
              </Button>
              <Button variant="secondary" onClick={handleDownload} disabled={keptQuestions.length === 0}>
                Download JSON
              </Button>
              <Button variant="ghost" onClick={() => { setGeneratedResults(null); setRemovedIndices(new Set()); }}>
                Regenerate
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default CreateExam;
