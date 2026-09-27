import { OAuth2Client } from 'google-auth-library';
import { verifyOAuthState, clearOAuthStateCookie } from '../../_lib/oauthState';
import { createSession } from '../../_lib/session';
import { findOrCreateOAuthUser } from '../../_lib/users';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { code, state } = req.query;

  // Always clear the short-lived state cookie regardless of outcome.
  res.setHeader('Set-Cookie', clearOAuthStateCookie());

  if (!verifyOAuthState(req, state)) {
    return res.status(400).json({ error: 'Invalid or missing OAuth state.' });
  }
  if (!code) {
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
    const { sub, email, name } = payload;

    const user = await findOrCreateOAuthUser({
      sub,
      email,
      name,
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
