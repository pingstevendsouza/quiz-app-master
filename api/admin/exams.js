import { redis } from '../_lib/redis';
import { requireManager } from '../_lib/session';

const EXAM_CODE_RE = /^[A-Z0-9_]{1,32}$/;
const REGISTRY_KEY = 'exams-list';

const readRegistry = async () => {
  const raw = await redis.get(REGISTRY_KEY);
  return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
};

const sanitizeExamCode = (value) => String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');

// Manager(+admin)-only endpoint that replaces the vulnerable, filename-driven
// api/upload-json.js for both directions of exam-content management:
//   GET  ?examCode=CODE  -> fetch the raw questions (Manage Exams "download")
//   POST {examCode, examText, questions} -> write + register (Manage Exams
//        "upload" and Create Exam "save", both funnel through here now)
// Both require a manager or admin session; regular quiz-taking reads go
// through the separate, any-authenticated-user api/exams.js instead.
async function handler(req, res) {
  if (req.method === 'GET') {
    const examCode = sanitizeExamCode(req.query.examCode);
    if (!EXAM_CODE_RE.test(examCode)) {
      return res.status(400).json({ error: 'Invalid exam code.' });
    }

    try {
      const raw = await redis.get(`exam:${examCode}`);
      if (!raw) {
        return res.status(404).json({ error: 'Exam not found.' });
      }
      const questions = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const registry = await readRegistry();
      const entry = registry.find((e) => e.value === examCode);

      return res.status(200).json({
        examCode,
        examText: entry?.text || examCode,
        content: { response_code: 1, results: questions },
      });
    } catch (err) {
      console.error('admin/exams GET error:', err);
      return res.status(500).json({ error: 'Failed to load exam data.' });
    }
  }

  if (req.method === 'POST') {
    const { examCode: rawExamCode, examText, questions } = req.body || {};
    const examCode = sanitizeExamCode(rawExamCode);

    if (!EXAM_CODE_RE.test(examCode)) {
      return res.status(400).json({ error: 'Invalid exam code.' });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'At least one question is required.' });
    }

    try {
      await redis.set(`exam:${examCode}`, JSON.stringify(questions));

      const registry = await readRegistry();
      const alreadyExists = registry.some((e) => e.value === examCode);
      const entry = { key: `${examCode}.json`, text: examText || examCode, value: examCode };
      if (!alreadyExists) {
        registry.push(entry);
        await redis.set(REGISTRY_KEY, JSON.stringify(registry));
      }

      return res.status(200).json({ success: true, entry });
    } catch (err) {
      console.error('admin/exams POST error:', err);
      return res.status(500).json({ error: 'Failed to save exam.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

export default requireManager(handler);
