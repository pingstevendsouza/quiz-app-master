import { Redis } from '@upstash/redis';

// Single shared Redis client for every API route. Credentials come from
// environment variables only — never hardcode them here (see the security
// writeup: api/list-exams.js and api/upload-json.js used to embed a live
// Upstash URL + token directly in source, which is exactly what this
// shared client exists to eliminate).
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
