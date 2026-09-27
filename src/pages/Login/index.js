import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { IconBookOpen } from '../../icons';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.ok) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.brandRow}>
        <IconBookOpen size={26} color="var(--color-primary)" />
        <span className={styles.brandText}>Quiz Prep</span>
      </div>

      <Card className={styles.card}>
        <div className={styles.heading}>Welcome back</div>
        <div className={styles.subtext}>Log in to continue your ServiceNow exam prep.</div>

        {error && <div className={styles.fieldError} role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <div className={styles.oauthRow}>
          {/* Plain full-page navigations, not React Router links — these
              need to hit the server redirect endpoint, not the SPA router. */}
          <a href="/api/auth/google" className={styles.oauthButton}>
            Continue with Google
          </a>
          <a href="/api/auth/linkedin" className={styles.oauthButton}>
            Continue with LinkedIn
          </a>
        </div>

        <div className={styles.footerText}>
          Don&rsquo;t have an account? <Link to="/signup" className={styles.footerLink}>Sign up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
