import { destroySession } from '../_lib/session';

export default async function handler(req, res) {
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
