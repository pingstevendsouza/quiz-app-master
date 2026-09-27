import crypto from 'crypto';
import { parse, serialize } from 'cookie';
import { redis } from './redis';
import { getUserById } from './users';

export const SESSION_COOKIE = 'qp_session';
const SESSION_TTL_SECONDS = 2592000; // 30 days

// Secure must stay off when testing over plain HTTP (e.g. `vercel dev` on
// localhost) — otherwise the browser silently drops the cookie and it looks
// like session persistence is broken when it's actually just this flag.
const isProduction = () =>
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

const sessionCookieOptions = (maxAge) => ({
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: isProduction(),
  maxAge,
});

export const createSession = async (res, userId, role) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  await redis.set(
    `session:${sessionId}`,
    JSON.stringify({ userId, role, createdAt: Date.now() }),
    { ex: SESSION_TTL_SECONDS }
  );

  const cookie = serialize(SESSION_COOKIE, sessionId, sessionCookieOptions(SESSION_TTL_SECONDS));
  appendSetCookie(res, cookie);
  return sessionId;
};

export const destroySession = async (req, res) => {
  const cookies = parse(req.headers.cookie || '');
  const sessionId = cookies[SESSION_COOKIE];
  if (sessionId) {
    await redis.del(`session:${sessionId}`);
  }
  const cookie = serialize(SESSION_COOKIE, '', sessionCookieOptions(0));
  appendSetCookie(res, cookie);
};

export const getSession = async (req) => {
  const cookies = parse(req.headers.cookie || '');
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;

  const raw = await redis.get(`session:${sessionId}`);
  if (!raw) return null;

  const session = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return { userId: session.userId, role: session.role, sessionId };
};

// Appends a Set-Cookie header without clobbering one that's already been
// set on this response (e.g. requireAuth doesn't set cookies, but future
// callers might set more than one in the same request).
function appendSetCookie(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookie);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookie]);
  } else {
    res.setHeader('Set-Cookie', [existing, cookie]);
  }
}

// Derives this deployment's own expected origin from the request's Host
// header (Vercel functions run behind TLS termination, so req itself never
// sees `https`, hence the env-based scheme check rather than req.protocol).
const expectedOrigin = (req) => {
  const scheme = isProduction() ? 'https' : 'http';
  return `${scheme}://${req.headers.host}`;
};

// CSRF defense-in-depth for cookie-authenticated mutations: a cross-site
// POST would carry the session cookie automatically (that's the whole CSRF
// problem), but it can't fake an Origin/Referer that matches our own host.
const verifyOrigin = (req) => {
  const method = (req.method || '').toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true;

  const origin = req.headers.origin || refererOrigin(req.headers.referer);
  if (!origin) return false;
  return origin === expectedOrigin(req);
};

function refererOrigin(referer) {
  if (!referer) return null;
  try {
    const url = new URL(referer);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export const requireAuth = (handler) => async (req, res) => {
  const session = await getSession(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!verifyOrigin(req)) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }
  req.session = session;
  return handler(req, res);
};

// Role is looked up fresh from the user record rather than trusted from the
// (potentially days-old) session cookie's cached role — otherwise an admin
// promoting/demoting someone wouldn't take effect until that user's next
// login, which would look like the promotion silently failed.
const currentRole = async (req) => {
  const user = await getUserById(req.session.userId);
  return user ? user.role : req.session.role;
};

export const requireAdmin = (handler) =>
  requireAuth(async (req, res) => {
    const role = await currentRole(req);
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.session.role = role;
    return handler(req, res);
  });

export const requireManager = (handler) =>
  requireAuth(async (req, res) => {
    const role = await currentRole(req);
    if (role !== 'manager' && role !== 'admin') {
      return res.status(403).json({ error: 'Manager access required' });
    }
    req.session.role = role;
    return handler(req, res);
  });
