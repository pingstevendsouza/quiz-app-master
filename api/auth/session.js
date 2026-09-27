import { getSession } from '../_lib/session';
import { getUserById, publicUser } from '../_lib/users';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json(publicUser(user));
  } catch (err) {
    console.error('session check error:', err);
    return res.status(500).json({ error: 'Failed to check session.' });
  }
}
