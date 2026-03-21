import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: "https://magical-dinosaur-77728.upstash.io",
  token: "ggAAAAAAAS-gAAIgcDKkzSxmCXPqURf-bVHsxC_CjWXH06U6TrODe2N8NtCrVQ",
});

const REGISTRY_KEY = 'exams-list';

const STATIC_EXAMS = [
  { key: 'CSA.json', text: 'CSA', value: 'CSA' },
  { key: 'CAD.json', text: 'CAD', value: 'CAD' },
  { key: 'ITSM.json', text: 'CIS - ITSM', value: 'ITSM' },
  { key: 'IRM.json', text: 'CIS - IRM', value: 'IRM' },
  { key: 'VRM.json', text: 'CIS - VRM', value: 'VRM' },
  { key: 'VR.json', text: 'CIS - VR', value: 'VR' },
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const raw = await redis.get(REGISTRY_KEY);
      const dynamic = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

      const staticValues = new Set(STATIC_EXAMS.map((e) => e.value));
      const newEntries = dynamic.filter((e) => !staticValues.has(e.value));
      const combined = [...STATIC_EXAMS, ...newEntries];

      return res.status(200).json({ exams: combined });
    } catch (err) {
      console.error('list-exams GET error:', err);
      return res.status(200).json({ exams: STATIC_EXAMS });
    }
  }

  if (req.method === 'POST') {
    const { examName, examText } = req.body;
    if (!examName) {
      return res.status(400).json({ error: 'examName is required.' });
    }

    const value = examName.toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
    const newEntry = {
      key: `${value}.json`,
      text: examText || examName,
      value,
    };

    try {
      const raw = await redis.get(REGISTRY_KEY);
      const list = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

      const alreadyExists = list.some((e) => e.value === value);
      if (!alreadyExists) {
        list.push(newEntry);
        await redis.set(REGISTRY_KEY, JSON.stringify(list));
      }

      return res.status(200).json({ success: true, entry: newEntry });
    } catch (err) {
      console.error('list-exams POST error:', err);
      return res.status(500).json({ error: 'Failed to register exam.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
