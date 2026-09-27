// One-time seed/migration for exam question content into the validated
// "exam:{CODE}" Redis namespace that api/exams.js and api/admin/exams.js
// read from.
//
// Checked two possible sources, in order, for each exam code:
//   1. The old raw Redis key ("CSA.json", written by the now-deleted,
//      vulnerable api/upload-json.js) — kept as a fallback in case some
//      exams do have data there.
//   2. The static files shipped in this repo (public/exams/CSA.json etc.)
//      — confirmed to be the only place CSA/CAD/ITSM's actual content
//      currently exists; the old Redis keys turned out to be empty.
//
// Run locally with your own .env (never shares your Redis token with anyone
// — this only runs on your machine):
//   node scripts/migrate-exam-keys.js
//
// Safe to re-run: skips any exam that already has data under the new key.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KNOWN_EXAM_CODES = ['CSA', 'CAD', 'ITSM', 'IRM', 'VRM', 'VR', 'DF'];
const PUBLIC_EXAMS_DIR = path.join(__dirname, '..', 'public', 'exams');

const normalizeQuestions = (raw) => (Array.isArray(raw) ? raw : raw.results);

(async () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN in your .env — nothing to do.');
    process.exit(1);
  }

  const registryRaw = await redis.get('exams-list');
  const registry = registryRaw ? (typeof registryRaw === 'string' ? JSON.parse(registryRaw) : registryRaw) : [];
  const registryCodes = registry.map((e) => e.value).filter(Boolean);
  const allCodes = [...new Set([...KNOWN_EXAM_CODES, ...registryCodes])];
  console.log('Exam codes to check:', allCodes.join(', '));

  let seeded = 0;
  let skippedExisting = 0;
  let skippedNoData = 0;

  for (const code of allCodes) {
    const newKey = `exam:${code}`;
    const alreadyThere = await redis.get(newKey);
    if (alreadyThere) {
      console.log(`  ${code}: already has data at ${newKey} — skipping.`);
      skippedExisting++;
      continue;
    }

    // Source 1: old raw Redis key.
    const oldRaw = await redis.get(`${code}.json`);
    if (oldRaw) {
      const questions = normalizeQuestions(typeof oldRaw === 'string' ? JSON.parse(oldRaw) : oldRaw);
      if (Array.isArray(questions) && questions.length > 0) {
        await redis.set(newKey, JSON.stringify(questions));
        console.log(`  ${code}: migrated ${questions.length} questions from old Redis key "${code}.json" -> "${newKey}".`);
        seeded++;
        continue;
      }
    }

    // Source 2: static file shipped in this repo.
    const filePath = path.join(PUBLIC_EXAMS_DIR, `${code}.json`);
    if (fs.existsSync(filePath)) {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const questions = normalizeQuestions(fileData);
      if (Array.isArray(questions) && questions.length > 0) {
        await redis.set(newKey, JSON.stringify(questions));
        console.log(`  ${code}: seeded ${questions.length} questions from public/exams/${code}.json -> "${newKey}".`);
        seeded++;
        continue;
      }
    }

    console.log(`  ${code}: no data found in the old Redis key or public/exams/${code}.json — nothing to seed.`);
    skippedNoData++;
  }

  console.log(`\nDone. Seeded: ${seeded}, already present: ${skippedExisting}, no data found: ${skippedNoData}.`);
  if (skippedNoData > 0) {
    console.log(`Exams with no data anywhere I could check will keep showing "not enough questions" until you upload content for them via Manage Exams (as admin) or Create Exam.`);
  }
})().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
