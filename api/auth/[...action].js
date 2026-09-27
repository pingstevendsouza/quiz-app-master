// Single catch-all serverless function for every /api/auth/* route (Vercel's
// [...param] convention works for the api/ directory independent of any
// framework). Keeps every existing URL identical — /api/auth/signup,
// /api/auth/google/callback, etc. — so no frontend call site needs to
// change; only the number of deployed functions goes from 8 down to 1,
// which is what keeps this whole deployment under Vercel Hobby's
// 12-function cap.
import * as routes from '../_lib/authRoutes';

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
