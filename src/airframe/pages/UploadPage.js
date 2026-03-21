import React, { useState } from 'react';
import { EXAMS } from '../../constants';

const UploadPage = () => {
  const [exam, setExam] = useState('CSA');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleDownload = async () => {
    setMessage(null);
    try {
      const response = await fetch('/api/upload-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `${exam}.json`, type: 'download' }),
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const content = JSON.parse(reader.result);
        const response = await fetch('/api/upload-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: selectedFile.name, content, type: 'upload' }),
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

  return (
    <>
      <div className="af-page-header">
        <h1 className="af-page-header__title">Manage Exam Files</h1>
        <p className="af-page-header__sub">Download existing exam JSON files or upload updated versions.</p>
      </div>

      {/* Exam Select + Download */}
      <div className="af-card af-mb-20">
        <div className="af-card__header">
          <div className="af-card__icon" style={{ background: '#e8f0fc' }}>📁</div>
          <div>
            <h3 className="af-card__title">Select Exam</h3>
            <p className="af-card__subtitle">Choose which exam file to manage</p>
          </div>
        </div>
        <div className="af-card__body">
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="af-form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label className="af-form-label">Exam</label>
              <select
                className="af-form-select"
                value={exam}
                onChange={(e) => { setExam(e.target.value); setSelectedFile(null); setMessage(null); }}
              >
                {EXAMS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.text}</option>
                ))}
              </select>
            </div>
            <button className="af-btn af-btn--outline" onClick={handleDownload} style={{ marginBottom: 0 }}>
              ⬇ Download {exam}.json
            </button>
          </div>
        </div>
      </div>

      {/* Upload Card */}
      <div className="af-card">
        <div className="af-card__header">
          <div className="af-card__icon" style={{ background: '#e8f5e9' }}>☁️</div>
          <div>
            <h3 className="af-card__title">Upload Updated File</h3>
            <p className="af-card__subtitle">
              File must be named <strong>{exam}.json</strong> and match the existing JSON structure.
            </p>
          </div>
        </div>
        <div className="af-card__body">
          {message && (
            <div
              className={`af-alert af-mb-16 ${
                message.type === 'success'
                  ? 'af-alert--info'
                  : message.type === 'info'
                  ? 'af-alert--info'
                  : 'af-alert--error'
              }`}
              style={message.type === 'success' ? { background: '#f0fdf4', borderColor: '#86efac', color: '#166534' } : {}}
            >
              <span>{message.type === 'success' ? '✅' : message.type === 'info' ? 'ℹ️' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Drop Zone */}
          <div
            className="af-upload-zone"
            style={dragActive ? { borderColor: 'var(--af-accent)', background: '#f0f4ff' } : {}}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('af-file-input').click()}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {dragActive ? '📂' : '☁️'}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--af-text-primary)' }}>
              {dragActive ? 'Drop your file here!' : 'Drag & drop your file here'}
            </div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>
              or click to browse files
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Accepted: <strong>{exam}.json</strong>
            </div>
          </div>

          <input
            id="af-file-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 12,
              padding: '10px 14px',
              background: '#f8faff',
              border: '1px solid var(--af-card-border)',
              borderRadius: 8,
              fontSize: 13,
            }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ fontWeight: 600, flex: 1 }}>{selectedFile.name}</span>
              <span style={{ color: 'var(--af-text-muted)' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--af-text-muted)', fontSize: 16 }}
                onClick={() => { setSelectedFile(null); setMessage(null); }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="af-card__footer">
          <button
            className="af-btn af-btn--primary"
            onClick={handleUpload}
            disabled={!selectedFile || processing}
          >
            {processing ? (
              <>
                <span style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Uploading...
              </>
            ) : (
              <>⬆ Upload File</>
            )}
          </button>
          <span className="af-text-muted" style={{ fontSize: 12 }}>
            Make sure the JSON structure matches the existing exam format.
          </span>
        </div>
      </div>
    </>
  );
};

export default UploadPage;
