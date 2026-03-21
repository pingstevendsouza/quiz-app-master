import React, { useState } from 'react';
import { extractTextFromPDF } from '../../utils/pdfExtract';
import classNames from 'classnames';

const NUM_OPTIONS = [10, 20, 30, 50];

const CreateExamPage = () => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, examName: examName.trim(), numQuestions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate exam.');
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

  const handleSave = async () => {
    if (keptQuestions.length === 0) { setError('No questions to save.'); return; }
    setSaving(true);
    setError(null);
    const examValue = examName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const filename = `${examValue}.json`;
    const payload = { response_code: 1, results: keptQuestions };
    try {
      const uploadRes = await fetch('/api/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: payload, type: 'upload' }),
      });
      if (!uploadRes.ok) throw new Error('Failed to save exam data.');
      await fetch('/api/list-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examName: examValue, examText: examName.trim() }),
      });
      setSuccessMsg(`Exam "${examName.trim()}" saved with ${keptQuestions.length} questions! It will appear in the quiz setup after a page refresh.`);
      setGeneratedResults(null);
      setExamName('');
      setSelectedFile(null);
      setRemovedIndices(new Set());
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
    <>
      <div className="af-page-header">
        <h1 className="af-page-header__title">Create Exam with AI</h1>
        <p className="af-page-header__sub">
          Upload a PDF study guide and let AI generate quiz questions automatically.
        </p>
      </div>

      {successMsg && (
        <div className="af-alert af-mb-20" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="af-alert af-alert--error af-mb-20">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {!generatedResults && (
        <div className="af-card">
          <div className="af-card__header">
            <div className="af-card__icon" style={{ background: '#e8f0fc' }}>🧠</div>
            <div>
              <h3 className="af-card__title">AI Exam Generator</h3>
              <p className="af-card__subtitle">Powered by Meta LLaMA via OpenRouter</p>
            </div>
          </div>
          <div className="af-card__body">
            <div className="af-grid af-grid--2">
              {/* Left column */}
              <div>
                <div className="af-form-group">
                  <label className="af-form-label">Exam Name <span style={{ color: 'var(--af-danger)' }}>*</span></label>
                  <input
                    className="af-form-input"
                    type="text"
                    placeholder="e.g. HRSD or ServiceNow HR Service Delivery"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    disabled={loading}
                  />
                  <div style={{ fontSize: 11, color: 'var(--af-text-muted)', marginTop: 4 }}>
                    This becomes the exam key (e.g. HRSD.json)
                  </div>
                </div>

                <div className="af-form-group">
                  <label className="af-form-label">Number of Questions</label>
                  <select
                    className="af-form-select"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    disabled={loading}
                  >
                    {NUM_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n} questions</option>
                    ))}
                  </select>
                </div>

                <div className="af-form-group">
                  <label className="af-form-label">Tips for better results</label>
                  <div style={{ background: '#f8faff', border: '1px solid var(--af-card-border)', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: 'var(--af-text-muted)', lineHeight: 1.8 }}>
                    <div>📄 Use text-based PDFs (not scanned images)</div>
                    <div>📏 Works with any number of pages</div>
                    <div>🎯 Study guides and documentation work great</div>
                    <div>⚡ Up to ~100,000 characters (~60-80 pages) used for generation</div>
                  </div>
                </div>
              </div>

              {/* Right column — PDF upload */}
              <div>
                <div className="af-form-group">
                  <label className="af-form-label">Upload PDF Study Guide <span style={{ color: 'var(--af-danger)' }}>*</span></label>
                  <div
                    className="af-upload-zone"
                    style={dragActive ? { borderColor: 'var(--af-accent)', background: '#f0f4ff' } : {}}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('ce-af-file-input').click()}
                  >
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{dragActive ? '📂' : '📄'}</div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--af-text-primary)', fontSize: 13 }}>
                      {dragActive ? 'Drop your PDF here!' : 'Drag & drop PDF here'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--af-text-muted)', marginBottom: 10 }}>
                      or click to browse
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Accepted: .pdf — Up to 50MB</div>
                  </div>
                  <input
                    id="ce-af-file-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => validateAndSetFile(e.target.files[0])}
                  />

                  {selectedFile && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginTop: 10,
                      padding: '10px 14px', background: '#f8faff',
                      border: '1px solid var(--af-card-border)', borderRadius: 8, fontSize: 13,
                    }}>
                      <span style={{ fontSize: 20 }}>📄</span>
                      <span style={{ fontWeight: 600, flex: 1 }}>{selectedFile.name}</span>
                      <span style={{ color: 'var(--af-text-muted)' }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--af-text-muted)', fontSize: 16 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      >✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="af-card__footer">
            <button
              className="af-btn af-btn--primary af-btn--lg"
              onClick={handleGenerate}
              disabled={loading || !examName.trim() || !selectedFile}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Generating questions…
                </>
              ) : (
                <>🧠 Generate Questions with AI</>
              )}
            </button>
            {loading && (
              <span className="af-text-muted" style={{ fontSize: 12 }}>
                This may take 15–30 seconds depending on PDF size…
              </span>
            )}
          </div>
        </div>
      )}

      {generatedResults && (
        <>
          {/* Summary card */}
          <div className="af-grid af-grid--4 af-mb-20">
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#e8f0fc' }}>📋</div>
              <div>
                <div className="af-stat-card__label">Generated</div>
                <div className="af-stat-card__value">{generatedResults.length}</div>
              </div>
            </div>
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#e8f5e9' }}>✅</div>
              <div>
                <div className="af-stat-card__label">Selected</div>
                <div className="af-stat-card__value" style={{ color: 'var(--af-success)' }}>{keptQuestions.length}</div>
              </div>
            </div>
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#fce4ec' }}>🗑️</div>
              <div>
                <div className="af-stat-card__label">Removed</div>
                <div className="af-stat-card__value" style={{ color: 'var(--af-danger)' }}>{removedIndices.size}</div>
              </div>
            </div>
            <div className="af-stat-card">
              <div className="af-stat-card__icon" style={{ background: '#fff3e0' }}>🎯</div>
              <div>
                <div className="af-stat-card__label">Exam</div>
                <div className="af-stat-card__value" style={{ fontSize: 14 }}>
                  {examName.slice(0, 10)}{examName.length > 10 ? '…' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Questions review card */}
          <div className="af-card af-mb-20">
            <div className="af-card__header">
              <div className="af-card__icon" style={{ background: '#e8f0fc' }}>📝</div>
              <div>
                <h3 className="af-card__title">Review Generated Questions</h3>
                <p className="af-card__subtitle">Remove questions you don't want before saving</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button
                  className="af-btn af-btn--outline"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => { setGeneratedResults(null); setRemovedIndices(new Set()); }}
                >
                  ← Back to Form
                </button>
              </div>
            </div>
            <div className="af-card__body" style={{ padding: 0 }}>
              {generatedResults.map((q, i) => {
                const removed = removedIndices.has(i);
                const expanded = expandedIdx === i;
                return (
                  <div
                    key={i}
                    style={{
                      borderBottom: '1px solid var(--af-card-border)',
                      opacity: removed ? 0.45 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 20px', cursor: 'pointer',
                      }}
                      onClick={() => setExpandedIdx(expanded ? null : i)}
                    >
                      <span style={{
                        minWidth: 28, height: 28, borderRadius: 6,
                        background: removed ? '#fce4ec' : 'var(--af-accent)',
                        color: removed ? 'var(--af-danger)' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {removed ? '✗' : i + 1}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--af-text-primary)' }}>
                        {q.question.length > 120 ? q.question.slice(0, 120) + '…' : q.question}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                        background: q.difficulty === 'hard' ? '#fce4ec' : q.difficulty === 'medium' ? '#fff3e0' : '#e8f5e9',
                        color: q.difficulty === 'hard' ? 'var(--af-danger)' : q.difficulty === 'medium' ? 'var(--af-warning)' : 'var(--af-success)',
                        textTransform: 'uppercase',
                      }}>
                        {q.difficulty || 'medium'}
                      </span>
                      <button
                        className={classNames('af-btn', removed ? 'af-btn--teal' : 'af-btn--outline')}
                        style={{ fontSize: 11, padding: '4px 10px', minWidth: 70 }}
                        onClick={(e) => { e.stopPropagation(); toggleRemove(i); }}
                      >
                        {removed ? '↩ Restore' : '🗑 Remove'}
                      </button>
                      <span style={{ fontSize: 16, color: 'var(--af-text-muted)' }}>{expanded ? '▲' : '▼'}</span>
                    </div>

                    {expanded && (
                      <div style={{ padding: '0 20px 16px 58px' }}>
                        <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--af-text-primary)', fontWeight: 500 }}>
                          {q.question}
                        </div>
                        <table className="af-table" style={{ fontSize: 12 }}>
                          <thead>
                            <tr>
                              <th>Answer</th>
                              <th style={{ width: 90 }}>Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.correct_answers.map((a, ai) => (
                              <tr key={`c-${ai}`} className="af-table__correct">
                                <td>{a}</td>
                                <td><span style={{ color: 'var(--af-success)', fontWeight: 700 }}>✓ Correct</span></td>
                              </tr>
                            ))}
                            {q.incorrect_answers.map((a, ai) => (
                              <tr key={`w-${ai}`}>
                                <td>{a}</td>
                                <td><span style={{ color: 'var(--af-danger)' }}>✗ Incorrect</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="af-card__footer" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="af-btn af-btn--primary"
                  onClick={handleSave}
                  disabled={saving || keptQuestions.length === 0}
                >
                  {saving ? (
                    <>
                      <span style={{
                        width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite', display: 'inline-block',
                      }} />
                      Saving…
                    </>
                  ) : (
                    <>💾 Save Exam ({keptQuestions.length} questions)</>
                  )}
                </button>
                <button
                  className="af-btn af-btn--outline"
                  onClick={handleDownload}
                  disabled={keptQuestions.length === 0}
                >
                  ⬇ Download JSON
                </button>
              </div>
              <button
                className="af-btn af-btn--outline"
                onClick={() => { setGeneratedResults(null); setRemovedIndices(new Set()); }}
              >
                🔄 Regenerate
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CreateExamPage;
