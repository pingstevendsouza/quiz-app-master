import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import App from './components/App';
import AirframeApp from './airframe/AirframeApp';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const LayoutPicker = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f7fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    gap: 24,
  }}>
    <div style={{ textAlign: 'center', marginBottom: 8 }}>
      <div style={{
        width: 56, height: 56, background: '#1b7fcc', borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, color: '#fff', margin: '0 auto 16px', fontWeight: 700,
      }}>SN</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#252631', margin: '0 0 6px' }}>
        ServiceNow Quiz
      </h1>
      <p style={{ color: '#74788d', fontSize: 14, margin: 0 }}>
        Choose your preferred layout to get started
      </p>
    </div>

    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to="/classic" style={{ textDecoration: 'none' }}>
        <div style={{
          background: '#fff', border: '1.5px solid #e4e9f0', borderRadius: 12,
          padding: '24px 32px', textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
          minWidth: 200,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1b7fcc'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,127,204,.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e4e9f0'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)'; }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎨</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#252631', marginBottom: 4 }}>Classic Layout</div>
          <div style={{ fontSize: 12, color: '#74788d' }}>Original Semantic UI design</div>
        </div>
      </Link>

      <Link to="/airframe" style={{ textDecoration: 'none' }}>
        <div style={{
          background: '#1b7fcc', border: '1.5px solid #1b7fcc', borderRadius: 12,
          padding: '24px 32px', textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.15s', boxShadow: '0 4px 16px rgba(27,127,204,.3)',
          minWidth: 200,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1568ab'; e.currentTarget.style.borderColor = '#1568ab'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1b7fcc'; e.currentTarget.style.borderColor = '#1b7fcc'; }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>✨</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>Airframe Layout</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Modern dashboard design</div>
        </div>
      </Link>
    </div>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPicker />} />
        <Route path="/classic/*" element={<App />} />
        <Route path="/airframe/*" element={<AirframeApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
