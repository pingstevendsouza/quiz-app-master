import { createOAuthState } from '../_lib/oauthState';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';

export default async function handler(req, res) {
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
