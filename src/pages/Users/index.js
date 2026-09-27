import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import Card from '../../components/Card/Card';
import Select from '../../components/Select/Select';
import { useAuth } from '../../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'user', text: 'User' },
  { value: 'manager', text: 'Manager' },
];

const roleBadgeClass = (role) => {
  if (role === 'admin') return styles.roleAdmin;
  if (role === 'manager') return styles.roleManager;
  return styles.roleUser;
};

// Strict admin-only page (see App.js's RequireAdmin on /users, and
// api/admin/users.js's requireAdmin) for listing every account and toggling
// a user's role between 'user'/'manager'. Promoting anyone to 'admin' is
// deliberately not offered here — the backend rejects it outright, so
// there's no path to it from this UI either.
const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load users.');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (targetUser, role) => {
    setError(null);
    setSavingId(targetUser.id);
    // Optimistic update, rolled back on failure.
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, role } : u)));

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, role }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update role.');
      }
    } catch (err) {
      setUsers(previous);
      setError(err.message || 'Failed to update role.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
        <p className={styles.subtitle}>View every account and manage manager access.</p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      {users === null && !error && (
        <Card className={styles.card}>
          <div className={styles.loadingState}>Loading users...</div>
        </Card>
      )}

      {users !== null && (
        <Card className={styles.card}>
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            const canEditRole = !isSelf && u.role !== 'admin';

            return (
              <div className={styles.row} key={u.id}>
                {u.picture ? (
                  <img src={u.picture} alt="" className={styles.avatar} referrerPolicy="no-referrer" />
                ) : (
                  <div className={styles.avatarFallback} aria-hidden="true">
                    {(u.name || '?').trim().charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={styles.userBody}>
                  <div className={styles.userName}>
                    {u.name}
                    {isSelf && <span className={styles.youBadge}>YOU</span>}
                  </div>
                  <div className={styles.userEmail}>{u.email}</div>
                </div>

                {canEditRole ? (
                  <Select
                    id={`user-role-${u.id}`}
                    className={styles.roleControl}
                    value={u.role}
                    onChange={(role) => handleRoleChange(u, role)}
                    options={ROLE_OPTIONS}
                    disabled={savingId === u.id}
                  />
                ) : (
                  <span className={classNames(styles.roleBadge, roleBadgeClass(u.role))}>
                    {u.role}
                  </span>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

export default Users;
