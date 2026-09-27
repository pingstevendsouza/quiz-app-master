// Single serverless function backing every /api/auth/* route. Originally
// implemented as a Vercel dynamic catch-all (api/auth/[...action].js), but
// that convention silently failed to route in this project's production
// deployment (confirmed live: requests fell through to the SPA's index.html
// instead of reaching the function, while every plain, non-dynamic api/*.js
// route worked correctly) — likely an interaction with this repo's existing
// vercel.json rewrites. A plain static file plus an explicit vercel.json
// rewrite (/api/auth/(.*) -> /api/auth-router?action=$1) sidesteps that
// entirely and is what's actually confirmed working. Every existing URL
// (/api/auth/signup, /api/auth/google/callback, etc.) stays identical from
// the frontend's point of view, so no frontend call site needed to change;
// this just keeps the deployment's function count at 6 instead of 13.
import * as routes from './_lib/authRoutes';

const ROUTES = {
  'signup': routes.signup,
  'login': routes.login,
  'logout': routes.logout,
  'session': routes.session,
  'google': routes.google,
  'google/callback': routes.googleCallback,
  'linkedin': routes.linkedin,
  'linkedin/callback': routes.linkedinCallback,
};

export default async function handler(req, res) {
  const segments = Array.isArray(req.query.action) ? req.query.action : [req.query.action].filter(Boolean);
  const route = segments.join('/');

  const fn = ROUTES[route];
  if (!fn) {
    return res.status(404).json({ error: 'Not found' });
  }
  return fn(req, res);
}
