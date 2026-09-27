import crypto from 'crypto';
import { redis } from './redis';

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const getUserById = async (userId) => {
  const raw = await redis.get(`user:${userId}`);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
};

export const getUserByEmail = async (normalizedEmail) => {
  const userId = await redis.get(`user:byEmail:${normalizedEmail}`);
  if (!userId) return null;
  return getUserById(userId);
};

const saveUser = (user) => redis.set(`user:${user.id}`, JSON.stringify(user));

// Field to stamp the OAuth-provider-reported profile picture onto, keyed by
// the same `subKind` used for the provider sub itself.
const pictureField = (subKind) => (subKind === 'googleSub' ? 'googlePicture' : 'linkedinPicture');

// Shared "find by provider sub -> find by email and link -> create new"
// resolution used by both the Google and LinkedIn OAuth callbacks. `subKind`
// is 'googleSub' or 'linkedinSub'; `subIndexPrefix` is the matching Redis
// index key prefix ('user:byGoogleSub:' / 'user:byLinkedinSub:'). `picture`
// is refreshed on every login (all three branches below), not just captured
// once at signup, so a provider-side avatar change is reflected here too.
export const findOrCreateOAuthUser = async ({ sub, email, name, picture, subKind, subIndexPrefix }) => {
  const field = pictureField(subKind);

  const existingUserId = await redis.get(`${subIndexPrefix}${sub}`);
  if (existingUserId) {
    const user = await getUserById(existingUserId);
    if (user) {
      const updated = { ...user, [field]: picture || null };
      await saveUser(updated);
      return updated;
    }
  }

  const normalizedEmail = normalizeEmail(email);
  const byEmail = normalizedEmail ? await getUserByEmail(normalizedEmail) : null;
  if (byEmail) {
    // Link this OAuth sub onto the existing (e.g. password-signup) account
    // rather than creating a duplicate.
    const updated = { ...byEmail, [subKind]: sub, [field]: picture || null };
    await saveUser(updated);
    await redis.set(`${subIndexPrefix}${sub}`, updated.id);
    return updated;
  }

  const userId = crypto.randomUUID();
  const createdAt = Date.now();
  const newUser = {
    id: userId,
    email: normalizedEmail,
    name: name || normalizedEmail || 'User',
    passwordHash: null,
    role: 'user',
    googleSub: subKind === 'googleSub' ? sub : null,
    linkedinSub: subKind === 'linkedinSub' ? sub : null,
    googlePicture: subKind === 'googleSub' ? (picture || null) : null,
    linkedinPicture: subKind === 'linkedinSub' ? (picture || null) : null,
    createdAt,
  };
  await saveUser(newUser);
  if (normalizedEmail) {
    await redis.set(`user:byEmail:${normalizedEmail}`, userId);
  }
  await redis.set(`${subIndexPrefix}${sub}`, userId);
  // Genuine new-user creation only — the found-by-sub and found-by-email
  // branches above must NOT re-index an already-indexed user.
  await redis.zadd('users-index', { score: createdAt, member: userId });
  return newUser;
};

export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  // LinkedIn wins if both providers are linked — explicit priority rule.
  picture: user.linkedinPicture || user.googlePicture || null,
});
