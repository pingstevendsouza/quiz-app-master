import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

// Same provider shape as QuizContext: a single context object exposing
// state plus the actions that mutate it, backed by the /api/auth/* routes
// (cookie session — no token ever touches localStorage/JS-visible storage).
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True until the initial /api/auth/session check resolves — lets callers
  // (RequireAuth/RequireAdmin) avoid flashing a login redirect before we've
  // actually checked whether a session cookie is already valid.
  const [authLoading, setAuthLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshSession();
      setAuthLoading(false);
    })();
  }, [refreshSession]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.error || 'Failed to log in.' };
      }
      setUser(data);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (email, password, name) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.error || 'Failed to sign up.' };
      }
      setUser(data);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Something went wrong. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Best-effort — clear local state regardless.
    }
    setUser(null);
  }, []);

  const value = {
    user,
    authLoading,
    login,
    signup,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
