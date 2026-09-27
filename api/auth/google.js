import { createOAuthState } from '../_lib/oauthState';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export default async function handler(req, res) {
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
