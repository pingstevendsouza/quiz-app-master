import crypto from 'crypto';
import { redis } from './_lib/redis';
import { requireAuth } from './_lib/session';

const RESULT_TTL_SECONDS = 1296000; // 15 days
const LIST_LIMIT = 10;
const STORAGE_CAP = 10;

async function handler(req, res) {
  const { userId } = req.session;

  if (req.method === 'GET') {
    const { id } = req.query;

    // Single-result drill-down (Progress -> ProgressDetail): MUST be scoped
    // to the authenticated caller's own userId from the session, never a
    // client-supplied one, so a user can never fetch another user's result
    // by guessing/supplying a different resultId.
    if (id) {
      try {
        const raw = await redis.get(`result:${userId}:${id}`);
        if (!raw) {
          // Covers both "never existed" and "expired past its 15-day TTL".
          return res.status(404).json({ error: 'Result not found.' });
        }
        const result = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return res.status(200).json(result);
      } catch (err) {
        console.error('results GET (by id) error:', err);
        return res.status(500).json({ error: 'Failed to load result.' });
      }
    }

    try {
      const indexKey = `results-index:${userId}`;
      // Newest first.
      const resultIds = await redis.zrange(indexKey, 0, LIST_LIMIT - 1, { rev: true });

      if (!resultIds || resultIds.length === 0) {
        return res.status(200).json({ results: [] });
      }

      const keys = resultIds.map((id) => `result:${userId}:${id}`);
      const rawResults = await redis.mget(...keys);

      const summaries = [];
      const expiredIds = [];

      rawResults.forEach((raw, i) => {
        if (!raw) {
          // Redis TTL only expires whole keys, not individual sorted-set
          // members — self-clean the index as expired entries are found
          // rather than letting it accumulate stale members forever.
          expiredIds.push(resultIds[i]);
          return;
        }
        const result = typeof raw === 'string' ? JSON.parse(raw) : raw;
        summaries.push({
          resultId: resultIds[i],
          examLabel: result.examLabel,
          score: result.score,
          passed: result.passed,
          completedAt: result.completedAt,
          timeTaken: result.timeTaken,
        });
      });

      if (expiredIds.length > 0) {
        await redis.zrem(indexKey, ...expiredIds);
      }

      return res.status(200).json({ results: summaries });
    } catch (err) {
      console.error('results GET error:', err);
      return res.status(500).json({ error: 'Failed to load results.' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const resultId = crypto.randomUUID();
    const completedAt = body.completedAt || Date.now();

    const result = {
      resultId,
      examLabel: body.examLabel,
      exam: body.exam,
      score: body.score,
      totalQuestions: body.totalQuestions,
      correctAnswers: body.correctAnswers,
      incorrectAnswers: body.incorrectAnswers,
      timeTaken: body.timeTaken,
      passed: Boolean(body.passed),
      completedAt,
      questionsAndAnswers: body.questionsAndAnswers || [],
    };

    try {
      const indexKey = `results-index:${userId}`;
      await redis.set(`result:${userId}:${resultId}`, JSON.stringify(result), { ex: RESULT_TTL_SECONDS });
      await redis.zadd(indexKey, { score: completedAt, member: resultId });

      // Hard cap of STORAGE_CAP results per user: at most STORAGE_CAP ever
      // exist at a time, not just "at most STORAGE_CAP shown" — delete the
      // oldest entries beyond the most recent STORAGE_CAP, both their
      // result: key and their sorted-set membership.
      const allIds = await redis.zrange(indexKey, 0, -1); // oldest -> newest
      if (allIds.length > STORAGE_CAP) {
        const overflowIds = allIds.slice(0, allIds.length - STORAGE_CAP);
        await Promise.all(overflowIds.map((oldId) => redis.del(`result:${userId}:${oldId}`)));
        await redis.zrem(indexKey, ...overflowIds);
      }

      return res.status(200).json({ success: true, resultId });
    } catch (err) {
      console.error('results POST error:', err);
      return res.status(500).json({ error: 'Failed to save result.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

export default requireAuth(handler);
