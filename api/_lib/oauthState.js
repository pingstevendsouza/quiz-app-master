import crypto from 'crypto';
import { parse, serialize } from 'cookie';

export const OAUTH_STATE_COOKIE = 'qp_oauth_state';
const STATE_TTL_SECONDS = 600; // 10 minutes

const isProduction = () =>
  process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

// Generates a random `state` value, stashes it in a short-lived httpOnly
// cookie, and returns both the value (to embed in the provider's authorize
// URL) and the Set-Cookie header string to attach to the redirect response.
export const createOAuthState = () => {
  const state = crypto.randomBytes(16).toString('hex');
  const cookie = serialize(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction(),
    maxAge: STATE_TTL_SECONDS,
  });
  return { state, cookie };
};

// Verifies the `state` query param from the provider's callback against the
// cookie set in createOAuthState — this is the CSRF protection for the
// OAuth flow itself (an attacker who tricks a victim into hitting our
// callback with an attacker-chosen code can't also forge the victim's
// cookie). Returns true/false; the caller is responsible for clearing the
// cookie regardless of the outcome.
export const verifyOAuthState = (req, queryState) => {
  const cookies = parse(req.headers.cookie || '');
  const cookieState = cookies[OAUTH_STATE_COOKIE];
  return Boolean(cookieState) && Boolean(queryState) && cookieState === queryState;
};

export const clearOAuthStateCookie = () =>
  serialize(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: isProduction(),
    maxAge: 0,
  });
