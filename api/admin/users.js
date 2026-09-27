import { redis } from '../_lib/redis';
import { requireAdmin } from '../_lib/session';
import { publicUser } from '../_lib/users';

const ASSIGNABLE_ROLES = ['user', 'manager'];

// Strict admin-only endpoint (never reachable by a manager) for listing every
// account and changing a user's role between 'user'/'manager'. Promoting to
// full 'admin' is deliberately NOT exposed here — that stays a manual,
// out-of-band process.
async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Newest first.
      const userIds = await redis.zrange('users-index', 0, -1, { rev: true });
      if (!userIds || userIds.length === 0) {
        return res.status(200).json({ users: [] });
      }

      const keys = userIds.map((id) => `user:${id}`);
      const rawUsers = await redis.mget(...keys);

      const users = [];
      rawUsers.forEach((raw) => {
        if (!raw) return; // Stale index entry (user record somehow missing) — skip.
        const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
        users.push({ ...publicUser(user), createdAt: user.createdAt });
      });

      return res.status(200).json({ users });
    } catch (err) {
      console.error('admin/users GET error:', err);
      return res.status(500).json({ error: 'Failed to load users.' });
    }
  }

  if (req.method === 'POST') {
    const { userId, role } = req.body || {};

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required.' });
    }
    if (!ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({ error: "role must be 'user' or 'manager'." });
    }
    if (userId === req.session.userId) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }

    try {
      const raw = await redis.get(`user:${userId}`);
      if (!raw) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const updated = { ...user, role };
      await redis.set(`user:${userId}`, JSON.stringify(updated));

      return res.status(200).json({ success: true, user: publicUser(updated) });
    } catch (err) {
      console.error('admin/users POST error:', err);
      return res.status(500).json({ error: 'Failed to update user role.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

export default requireAdmin(handler);
