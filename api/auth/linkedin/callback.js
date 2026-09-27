import { jwtVerify, createRemoteJWKSet } from 'jose';
import { verifyOAuthState, clearOAuthStateCookie } from '../../_lib/oauthState';
import { createSession } from '../../_lib/session';
import { findOrCreateOAuthUser } from '../../_lib/users';

const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_JWKS_URL = 'https://www.linkedin.com/oauth/openid/jwks';
const LINKEDIN_ISSUER = 'https://www.linkedin.com/oauth';

let jwks;
const getJwks = () => {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(LINKEDIN_JWKS_URL));
  }
  return jwks;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { code, state } = req.query;

  res.setHeader('Set-Cookie', clearOAuthStateCookie());

  if (!verifyOAuthState(req, state)) {
    return res.status(400).json({ error: 'Invalid or missing OAuth state.' });
  }
  if (!code) {
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

    const { payload } = await jwtVerify(tokens.id_token, getJwks(), {
      issuer: LINKEDIN_ISSUER,
      audience: process.env.LINKEDIN_CLIENT_ID,
    });
    const { sub, email, name } = payload;

    const user = await findOrCreateOAuthUser({
      sub,
      email,
      name,
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
