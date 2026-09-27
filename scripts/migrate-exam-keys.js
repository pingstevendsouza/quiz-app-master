// One-time migration: copies exam question content from the OLD raw key
// format ("CSA.json", stored by the now-deleted, vulnerable
// api/upload-json.js) into the new, validated "exam:{CODE}" namespace that
// api/exams.js and api/admin/exams.js actually read from.
//
// Run locally with your own .env (never shares your Redis token with anyone
// — this only runs on your machine):
//   node scripts/migrate-exam-keys.js
//
// Safe to re-run: skips any exam that already has data under the new key.
require('dotenv').config();
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KNOWN_EXAM_CODES = ['CSA', 'CAD', 'ITSM', 'IRM', 'VRM', 'VR', 'DF'];

(async () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN in your .env — nothing to do.');
    process.exit(1);
  }

  console.log('Checking exams-list registry for any additional exam codes...');
  const registryRaw = await redis.get('exams-list');
  const registry = registryRaw ? (typeof registryRaw === 'string' ? JSON.parse(registryRaw) : registryRaw) : [];
  const registryCodes = registry.map((e) => e.value).filter(Boolean);
  const allCodes = [...new Set([...KNOWN_EXAM_CODES, ...registryCodes])];
  console.log('Exam codes to check:', allCodes.join(', '));

  let migrated = 0;
  let skippedExisting = 0;
  let skippedNoOldData = 0;

  for (const code of allCodes) {
    const newKey = `exam:${code}`;
    const alreadyThere = await redis.get(newKey);
    if (alreadyThere) {
      console.log(`  ${code}: already has data at ${newKey} — skipping.`);
      skippedExisting++;
      continue;
    }

    const oldKey = `${code}.json`;
    const oldRaw = await redis.get(oldKey);
    if (!oldRaw) {
      console.log(`  ${code}: no data found at old key "${oldKey}" — nothing to migrate.`);
      skippedNoOldData++;
      continue;
    }

    const oldData = typeof oldRaw === 'string' ? JSON.parse(oldRaw) : oldRaw;
    // The old format could be either a bare array of questions, or
    // { response_code, results }, depending on which old code path wrote it.
    const questions = Array.isArray(oldData) ? oldData : oldData.results;
    if (!Array.isArray(questions) || questions.length === 0) {
      console.log(`  ${code}: old data at "${oldKey}" wasn't a usable question array — skipping.`);
      continue;
    }

    await redis.set(newKey, JSON.stringify(questions));
    console.log(`  ${code}: migrated ${questions.length} questions from "${oldKey}" -> "${newKey}".`);
    migrated++;
  }

  console.log(`\nDone. Migrated: ${migrated}, already present: ${skippedExisting}, no old data found: ${skippedNoOldData}.`);
})().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
