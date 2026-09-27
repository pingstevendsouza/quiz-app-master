import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import { IconBookOpen } from '../../icons';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    const result = await signup(email, password, name);
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
        <div className={styles.heading}>Create your account</div>
        <div className={styles.subtext}>Sign up to start practising for your ServiceNow exam.</div>

        {error && <div className={styles.fieldError} role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
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
            <label className={styles.label} htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
            <div className={styles.hint}>At least 8 characters.</div>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <div className={styles.oauthRow}>
          <a href="/api/auth/google" className={styles.oauthButton}>
            Continue with Google
          </a>
          <a href="/api/auth/linkedin" className={styles.oauthButton}>
            Continue with LinkedIn
          </a>
        </div>

        <div className={styles.footerText}>
          Already have an account? <Link to="/login" className={styles.footerLink}>Log in</Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
