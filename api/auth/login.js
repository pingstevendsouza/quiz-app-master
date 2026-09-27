import bcrypt from 'bcryptjs';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '../_lib/redis';
import { createSession } from '../_lib/session';
import { normalizeEmail, getUserByEmail, publicUser } from '../_lib/users';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  prefix: 'ratelimit:login',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: INVALID_CREDENTIALS_MESSAGE });
  }

  const normalizedEmail = normalizeEmail(email);

  try {
    const { success } = await ratelimit.limit(normalizedEmail);
    if (!success) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
    }

    const user = await getUserByEmail(normalizedEmail);

    // Same generic message whether the account doesn't exist, is OAuth-only
    // (no password set), or the password is simply wrong — never reveal
    // which case it was.
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: INVALID_CREDENTIALS_MESSAGE });
    }

    const matches = await bcrypt.compare(String(password), user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: INVALID_CREDENTIALS_MESSAGE });
    }

    await createSession(res, user.id, user.role);
    return res.status(200).json(publicUser(user));
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Failed to log in.' });
  }
}
