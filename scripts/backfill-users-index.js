// One-time backfill for the "users-index" sorted set that api/admin/users.js
// reads from to list every account.
//
// users-index is only ZADD'd going forward, at the moment a NEW user is
// created (signup, or first-ever OAuth sign-in) — see api/_lib/authRoutes.js
// and findOrCreateOAuthUser in api/_lib/users.js. Any account created before
// that code existed has no entry in users-index and would be invisible on
// the new admin Users page without this script.
//
// Scans every "user:<id>" record key directly (skipping the "user:byEmail:*"
// / "user:byGoogleSub:*" / "user:byLinkedinSub:*" lookup-index keys, which
// share the "user:" prefix but are not user records) and adds any missing
// member to users-index, scored by that user's own createdAt.
//
// Run locally with your own .env (never shares your Redis token with anyone
// — this only runs on your machine):
//   node scripts/backfill-users-index.js
//
// Safe to re-run: skips any user id already present in users-index.
require('dotenv').config();
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const isUserRecordKey = (key) => {
  const rest = key.slice('user:'.length);
  return rest.length > 0 && !rest.startsWith('by');
};

(async () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN in your .env — nothing to do.');
    process.exit(1);
  }

  const existingMembers = await redis.zrange('users-index', 0, -1);
  const existing = new Set(existingMembers || []);
  console.log(`users-index currently has ${existing.size} member(s).`);

  const userKeys = [];
  let cursor = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: 'user:*', count: 100 });
    cursor = Number(nextCursor);
    userKeys.push(...keys.filter(isUserRecordKey));
  } while (cursor !== 0);

  console.log(`Found ${userKeys.length} user record key(s).`);

  let added = 0;
  let skippedExisting = 0;
  let skippedBadRecord = 0;

  for (const key of userKeys) {
    const userId = key.slice('user:'.length);
    if (existing.has(userId)) {
      skippedExisting++;
      continue;
    }

    const raw = await redis.get(key);
    if (!raw) {
      skippedBadRecord++;
      continue;
    }
    const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const score = typeof user.createdAt === 'number' ? user.createdAt : Date.now();

    await redis.zadd('users-index', { score, member: userId });
    console.log(`  ${userId} (${user.email || 'no email'}, role: ${user.role || 'user'}): added to users-index.`);
    added++;
  }

  console.log(`\nDone. Added: ${added}, already indexed: ${skippedExisting}, unreadable records skipped: ${skippedBadRecord}.`);
})().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
