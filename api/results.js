import crypto from 'crypto';
import { redis } from './_lib/redis';
import { requireAuth } from './_lib/session';

const RESULT_TTL_SECONDS = 1296000; // 15 days
const LIST_LIMIT = 50;

async function handler(req, res) {
  const { userId } = req.session;

  if (req.method === 'GET') {
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
      await redis.set(`result:${userId}:${resultId}`, JSON.stringify(result), { ex: RESULT_TTL_SECONDS });
      await redis.zadd(`results-index:${userId}`, { score: completedAt, member: resultId });
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
