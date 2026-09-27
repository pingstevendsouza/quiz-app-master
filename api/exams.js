import { redis } from './_lib/redis';
import { requireAuth } from './_lib/session';

const EXAM_CODE_RE = /^[A-Z0-9_]{1,32}$/;

// Replaces the old upload-json "json"/"download" fetch used by the actual
// quiz-taking flow. Requires any logged-in user (not admin) — reading exam
// content is fine for any authenticated user, only writing it is admin-only
// (see api/admin/exams.js).
async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const examCode = String(req.query.exam || '').toUpperCase();
  if (!EXAM_CODE_RE.test(examCode)) {
    return res.status(400).json({ error: 'Invalid exam code.' });
  }

  try {
    const raw = await redis.get(`exam:${examCode}`);
    if (!raw) {
      // Mirrors the legacy trivia-API-style contract the frontend already
      // expects (QuizContext checks `response_code === 404`) rather than a
      // hard HTTP 404, so an unknown exam still surfaces the app's existing
      // friendly "not enough questions" message instead of a network error.
      return res.status(200).json({ response_code: 404, results: [] });
    }

    const results = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return res.status(200).json({ response_code: 1, results });
  } catch (err) {
    console.error('exams GET error:', err);
    return res.status(500).json({ error: 'Failed to load exam data.' });
  }
}

export default requireAuth(handler);
