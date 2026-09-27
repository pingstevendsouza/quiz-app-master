import { redis } from './_lib/redis';

const REGISTRY_KEY = 'exams-list';

const STATIC_EXAMS = [
  { key: 'CSA.json', text: 'CSA', value: 'CSA' },
  { key: 'CAD.json', text: 'CAD', value: 'CAD' },
  { key: 'ITSM.json', text: 'CIS - ITSM', value: 'ITSM' },
  { key: 'IRM.json', text: 'CIS - IRM', value: 'IRM' },
  { key: 'VRM.json', text: 'CIS - VRM', value: 'VRM' },
  { key: 'VR.json', text: 'CIS - VR', value: 'VR' },
  { key: 'DF.json', text: 'CIS - DF', value: 'DF' },
];

// GET stays public/no-auth — it only exposes the exam registry (names),
// needed to populate the exam picker before login/before a user has picked
// an exam. Reading actual question content requires auth (see api/exams.js).
// The old POST here (register a new exam name, unauthenticated) has been
// removed entirely — registering exams is now admin-only, via
// api/admin/exams.js, so there's no longer a second, unauthenticated way in.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

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
