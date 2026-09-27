// All /api/auth/* route logic lives here as plain named functions, dispatched
// by the single api/auth/[...action].js catch-all serverless function.
// Consolidated into one function (rather than 8 separate files) to stay under
// Vercel Hobby's 12-serverless-function-per-deployment cap — this is a
// routing-layer change only, every handler body below is unchanged from its
// original standalone file.
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';
import { createSession, destroySession, getSession } from './session';
import { createOAuthState, verifyOAuthState, clearOAuthStateCookie } from './oauthState';
import { normalizeEmail, getUserById, getUserByEmail, findOrCreateOAuthUser, publicUser } from './users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 12;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '5 m'),
  prefix: 'ratelimit:login',
});

export async function signup(req, res) {
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
    const createdAt = Date.now();
    const user = {
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      passwordHash,
      role: 'user',
      googleSub: null,
      linkedinSub: null,
      googlePicture: null,
      linkedinPicture: null,
      createdAt,
    };

    await redis.set(`user:${userId}`, JSON.stringify(user));
    await redis.set(`user:byEmail:${normalizedEmail}`, userId);
    await redis.zadd('users-index', { score: createdAt, member: userId });

    await createSession(res, userId, user.role);
    return res.status(200).json(publicUser(user));
  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
}

export async function login(req, res) {
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

export async function logout(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    await destroySession(req, res);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ error: 'Failed to log out.' });
  }
}

export async function session(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const sess = await getSession(req);
    if (!sess) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await getUserById(sess.userId);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json(publicUser(user));
  } catch (err) {
    console.error('session check error:', err);
    return res.status(500).json({ error: 'Failed to check session.' });
  }
}

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function google(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { state, cookie } = createOAuthState();
  res.setHeader('Set-Cookie', cookie);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });

  res.writeHead(302, { Location: `${GOOGLE_AUTH_URL}?${params.toString()}` });
  return res.end();
}

export async function googleCallback(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { code, state } = req.query;

  // The state-clear cookie is only set on these early-exit paths, where it's
  // the sole Set-Cookie header on the response — confirmed working. On
  // success, createSession() below is the ONLY Set-Cookie call; letting the
  // oauth-state cookie simply expire via its own 10-minute Max-Age (rather
  // than also clearing it here) avoids ever merging two Set-Cookie values
  // into one array-valued header, which is what was actually breaking the
  // signed-in session on Vercel — the callback's own redirect always worked,
  // but the array-valued header wasn't reliably reaching the browser as two
  // separate cookies, so the session cookie silently never arrived.
  if (!verifyOAuthState(req, state)) {
    res.setHeader('Set-Cookie', clearOAuthStateCookie());
    return res.status(400).json({ error: 'Invalid or missing OAuth state.' });
  }
  if (!code) {
    res.setHeader('Set-Cookie', clearOAuthStateCookie());
    return res.status(400).json({ error: 'Missing authorization code.' });
  }

  try {
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Google token exchange failed:', errText);
      return res.status(502).json({ error: 'Failed to exchange authorization code.' });
    }

    const tokens = await tokenResponse.json();
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    const user = await findOrCreateOAuthUser({
      sub,
      email,
      name,
      picture,
      subKind: 'googleSub',
      subIndexPrefix: 'user:byGoogleSub:',
    });

    await createSession(res, user.id, user.role);

    const frontendUrl = process.env.FRONTEND_URL || '/';
    res.writeHead(302, { Location: frontendUrl });
    return res.end();
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.status(500).json({ error: 'Google sign-in failed.' });
  }
}

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_JWKS_URL = 'https://www.linkedin.com/oauth/openid/jwks';
const LINKEDIN_ISSUER = 'https://www.linkedin.com/oauth';

let linkedinJwks;
const getLinkedinJwks = () => {
  if (!linkedinJwks) {
    linkedinJwks = createRemoteJWKSet(new URL(LINKEDIN_JWKS_URL));
  }
  return linkedinJwks;
};

export async function linkedin(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { state, cookie } = createOAuthState();
  res.setHeader('Set-Cookie', cookie);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
    scope: 'openid profile email',
    state,
  });

  res.writeHead(302, { Location: `${LINKEDIN_AUTH_URL}?${params.toString()}` });
  return res.end();
}

export async function linkedinCallback(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { code, state } = req.query;

  // See the identical comment in googleCallback above — only setting the
  // state-clear cookie on these early-exit paths (never alongside
  // createSession's own Set-Cookie) avoids ever merging two Set-Cookie
  // values into one array-valued header.
  if (!verifyOAuthState(req, state)) {
    res.setHeader('Set-Cookie', clearOAuthStateCookie());
    return res.status(400).json({ error: 'Invalid or missing OAuth state.' });
  }
  if (!code) {
    res.setHeader('Set-Cookie', clearOAuthStateCookie());
    return res.status(400).json({ error: 'Missing authorization code.' });
  }

  try {
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', errText);
      return res.status(502).json({ error: 'Failed to exchange authorization code.' });
    }

    const tokens = await tokenResponse.json();

    const { payload } = await jwtVerify(tokens.id_token, getLinkedinJwks(), {
      issuer: LINKEDIN_ISSUER,
      audience: process.env.LINKEDIN_CLIENT_ID,
    });
    const { sub, email, name, picture } = payload;

    const user = await findOrCreateOAuthUser({
      sub,
      email,
      name,
      picture,
      subKind: 'linkedinSub',
      subIndexPrefix: 'user:byLinkedinSub:',
    });

    await createSession(res, user.id, user.role);

    const frontendUrl = process.env.FRONTEND_URL || '/';
    res.writeHead(302, { Location: frontendUrl });
    return res.end();
  } catch (err) {
    console.error('LinkedIn OAuth callback error:', err);
    return res.status(500).json({ error: 'LinkedIn sign-in failed.' });
  }
}
