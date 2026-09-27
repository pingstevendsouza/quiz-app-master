import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import { IconUpload } from '../../icons';
import { useQuiz } from '../../context/QuizContext';

const ManageExams = () => {
  const { exams } = useQuiz();
  const [exam, setExam] = useState('CSA');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Admin-only download, routed through api/admin/exams.js (GET) instead of
  // the removed api/upload-json.js — same downloaded file shape as before.
  const handleDownload = async () => {
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/exams?examCode=${encodeURIComponent(exam)}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.content, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exam}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setMessage({ type: 'success', text: `${exam}.json downloaded successfully.` });
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.error || 'Failed to download the file.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error downloading the file.' });
    }
  };

  // Exact validation logic: must be JSON and must match the selected exam's filename.
  const validateAndSetFile = (file) => {
    setMessage(null);
    if (!file || file.type !== 'application/json') {
      setMessage({ type: 'error', text: 'Please upload a valid JSON file.' });
      setSelectedFile(null);
      return;
    }
    if (file.name !== `${exam}.json`) {
      setMessage({
        type: 'error',
        text: `File name must match the selected exam: "${exam}.json". Got: "${file.name}"`,
      });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setMessage({ type: 'info', text: `"${file.name}" selected. Click Upload to proceed.` });
  };

  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  // Admin-only upload, routed through api/admin/exams.js (POST) instead of
  // the removed api/upload-json.js — the file itself keeps the same
  // { response_code, results } shape the download side already produces.
  const handleUpload = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const content = JSON.parse(reader.result);
        const examText = exams.find((e) => e.value === exam)?.text || exam;
        const response = await fetch('/api/admin/exams', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examCode: exam, examText, questions: content.results }),
        });
        if (response.ok) {
          setMessage({ type: 'success', text: `"${selectedFile.name}" uploaded successfully!` });
          setSelectedFile(null);
        } else {
          setMessage({ type: 'error', text: 'Failed to upload file.' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Error reading or uploading file.' });
      } finally {
        setProcessing(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  const messageClass = message?.type === 'success'
    ? styles.messageSuccess
    : message?.type === 'error'
      ? styles.messageError
      : styles.messageInfo;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Exams</h1>
        <p className={styles.subtitle}>Download existing exam JSON files or upload updated versions.</p>
      </div>

      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Select Exam</div>
          <div className={styles.cardSubtitle}>Choose which exam file to manage</div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="manage-exam-select">Exam</label>
              <Select
                id="manage-exam-select"
                value={exam}
                onChange={(value) => { setExam(value); setSelectedFile(null); setMessage(null); }}
                options={exams}
              />
            </div>
            <Button variant="secondary" icon={IconUpload} onClick={handleDownload}>
              Download {exam}.json
            </Button>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Upload Updated File</div>
          <div className={styles.cardSubtitle}>
            File must be named <strong>{exam}.json</strong> and match the existing JSON structure.
          </div>
        </div>
        <div className={styles.cardBody}>
          {message && <div className={classNames(styles.message, messageClass)}>{message.text}</div>}

          <div
            className={classNames(styles.dropZone, { [styles.dropZoneActive]: dragActive })}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('manage-exams-file-input').click()}
          >
            <div className={styles.dropZoneTitle}>
              {dragActive ? 'Drop your file here!' : 'Drag & drop your file here'}
            </div>
            <div>or click to browse files</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Accepted: <strong>{exam}.json</strong></div>
          </div>

          <input
            id="manage-exams-file-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div className={styles.fileChip}>
              <span>{selectedFile.name}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              <button
                type="button"
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                onClick={() => { setSelectedFile(null); setMessage(null); }}
              >
                Remove
              </button>
            </div>
          )}

          <Button variant="primary" onClick={handleUpload} disabled={!selectedFile || processing}>
            {processing ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ManageExams;
