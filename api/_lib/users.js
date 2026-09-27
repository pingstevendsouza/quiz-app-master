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

// Shared "find by provider sub -> find by email and link -> create new"
// resolution used by both the Google and LinkedIn OAuth callbacks. `subKind`
// is 'googleSub' or 'linkedinSub'; `subIndexPrefix` is the matching Redis
// index key prefix ('user:byGoogleSub:' / 'user:byLinkedinSub:').
export const findOrCreateOAuthUser = async ({ sub, email, name, subKind, subIndexPrefix }) => {
  const existingUserId = await redis.get(`${subIndexPrefix}${sub}`);
  if (existingUserId) {
    const user = await getUserById(existingUserId);
    if (user) return user;
  }

  const normalizedEmail = normalizeEmail(email);
  const byEmail = normalizedEmail ? await getUserByEmail(normalizedEmail) : null;
  if (byEmail) {
    // Link this OAuth sub onto the existing (e.g. password-signup) account
    // rather than creating a duplicate.
    const updated = { ...byEmail, [subKind]: sub };
    await saveUser(updated);
    await redis.set(`${subIndexPrefix}${sub}`, updated.id);
    return updated;
  }

  const userId = crypto.randomUUID();
  const newUser = {
    id: userId,
    email: normalizedEmail,
    name: name || normalizedEmail || 'User',
    passwordHash: null,
    role: 'user',
    googleSub: subKind === 'googleSub' ? sub : null,
    linkedinSub: subKind === 'linkedinSub' ? sub : null,
    createdAt: Date.now(),
  };
  await saveUser(newUser);
  if (normalizedEmail) {
    await redis.set(`user:byEmail:${normalizedEmail}`, userId);
  }
  await redis.set(`${subIndexPrefix}${sub}`, userId);
  return newUser;
};

export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});
