import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { redis } from '../_lib/redis';
import { createSession } from '../_lib/session';
import { normalizeEmail, getUserByEmail, publicUser } from '../_lib/users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 12;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, password, name } = req.body || {};

  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  const trimmedName = String(name || '').trim().slice(0, 100);
  if (!trimmedName) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      passwordHash,
      role: 'user',
      googleSub: null,
      linkedinSub: null,
      createdAt: Date.now(),
    };

    await redis.set(`user:${userId}`, JSON.stringify(user));
    await redis.set(`user:byEmail:${normalizedEmail}`, userId);

    await createSession(res, userId, user.role);
    return res.status(200).json(publicUser(user));
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
}
